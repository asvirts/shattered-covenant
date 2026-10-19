import {
  DomainType,
  Enemy,
  Hero,
  HeroId,
  Skill,
  SurgeBonusType,
  TimelineEntry,
} from './types';
import { DUAL_TECHS, createEnemyFromTemplate } from './data';
import { sound } from './audio';
import {
  BattleVfxEffect,
  drawBattleStage,
  drawBattleVfx,
  drawEnemySprite,
  drawHeroSprite,
} from './sprites';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  timer: number;
  maxTimer: number;
  big?: boolean;
}

export class BattleEngine {
  public active = false;
  public transitionTimer = 0; // 0.5s Rune-Shatter Transition
  public heroes: Hero[] = [];
  public enemies: Enemy[] = [];
  public activeDomain: DomainType = 'NONE';
  public domainTurnsRemaining = 0;
  public leyLineGauge = 50; // 0 to 300 (100 = 1 Charge, 300 = 3 Charges)
  public currentUnitId: string | null = null;
  public currentSurgeBonus: SurgeBonusType = 'NONE';
  public turnCounter = 0;
  public selectedTargetIndex = 0;
  public battleLog: string[] = [];
  public floatingTexts: FloatingText[] = [];
  public vfxEffects: BattleVfxEffect[] = [];
  public waitingForPlayer = false;
  public victoryState: 'NONE' | 'WON' | 'LOST' = 'NONE';
  public isBossBattle = false;
  public ambushTriggered = false;
  public lastRewardSummary = '';

  private nextFloatId = 1;

  public spawnVfx(
    type: BattleVfxEffect['type'],
    x: number,
    y: number,
    color: string,
    duration = 0.42
  ): void {
    this.vfxEffects.push({
      id: this.nextFloatId++,
      type,
      x,
      y,
      color,
      timer: duration,
      maxTimer: duration,
    });
  }

  public startBattle(
    partyHeroes: Hero[],
    enemyTemplateIds: string[],
    ambush: boolean,
    isBoss = false
  ): void {
    this.active = true;
    this.transitionTimer = 0.55;
    this.heroes = partyHeroes.filter((h) => h.recruited);
    this.enemies = enemyTemplateIds.map((tpl, idx) =>
      createEnemyFromTemplate(
        tpl,
        enemyTemplateIds.length > 1 && !isBoss ? ` ${String.fromCharCode(65 + idx)}` : ''
      )
    );
    this.activeDomain = 'NONE';
    this.domainTurnsRemaining = 0;
    this.turnCounter = 0;
    this.selectedTargetIndex = 0;
    this.waitingForPlayer = false;
    this.victoryState = 'NONE';
    this.isBossBattle = isBoss;
    this.ambushTriggered = ambush;
    this.floatingTexts = [];
    this.battleLog = [];

    sound.playRuneShatter();

    // Initialize CTB values & Capstone passives
    for (const h of this.heroes) {
      h.statuses = [];
      h.shieldHp = 0;
      h.animState = 'IDLE';
      h.ctbValue = Math.max(12, Math.round(110 - h.stats.tmp * 2.1));
      for (const s of h.skills) {
        s.currentCooldown = 0;
      }
      // Check Kaelen's Unbreakable Bastion capstone
      if (h.id === 'kaelen' && h.talents.some((t) => t.id === 'kaelen_t3_bulwark' && t.unlocked)) {
        h.shieldHp = 35;
      }
    }

    for (const e of this.enemies) {
      e.ctbValue = Math.max(25, Math.round(120 - e.tmp * 2.0));
      if (ambush) {
        e.stability = Math.max(0, e.stability - 1);
        e.ctbValue += 18;
        if (e.stability === 0) {
          e.shattered = true;
        }
      }
    }

    if (ambush) {
      this.leyLineGauge = Math.min(300, this.leyLineGauge + 45);
      this.log('FIELD AMBUSH! Enemy Stability cracked (-1) & +45% Ley-Line Gauge!');
    } else {
      this.log('Encounter started! Break enemy Stability pips to trigger SHATTERED (1.5x DMG)!');
    }

    this.advanceToNextTurn();
  }

  public log(msg: string): void {
    this.battleLog.unshift(msg);
    if (this.battleLog.length > 6) {
      this.battleLog.pop();
    }
  }

  public spawnFloat(text: string, x: number, y: number, color: string, big = false): void {
    this.floatingTexts.push({
      id: this.nextFloatId++,
      text,
      x,
      y,
      color,
      timer: big ? 1.35 : 1.0,
      maxTimer: big ? 1.35 : 1.0,
      big,
    });
  }

  public getSurgeForStep(stepIndex: number): SurgeBonusType {
    const slot = (this.turnCounter + stepIndex) % 7;
    if (slot === 2) return 'DMG_BOOST';
    if (slot === 4) return 'ZERO_MANA';
    if (slot === 6) return 'LEY_SURGE';
    return 'NONE';
  }

  public getTimelinePreview(count = 8): TimelineEntry[] {
    const simUnits = [
      ...this.heroes
        .filter((h) => h.stats.hp > 0)
        .map((h) => ({
          unitId: h.id,
          isHero: true,
          name: h.name.split(' ')[0],
          realm: h.realm,
          ctb: h.ctbValue,
          tmp: h.stats.tmp,
          shattered: false,
        })),
      ...this.enemies
        .filter((e) => e.hp > 0)
        .map((e) => ({
          unitId: e.id,
          isHero: false,
          name: e.name,
          realm: e.realm,
          ctb: e.ctbValue,
          tmp: e.tmp,
          shattered: e.shattered,
        })),
    ];

    if (simUnits.length === 0) return [];

    const result: TimelineEntry[] = [];
    for (let i = 0; i < count; i++) {
      simUnits.sort((a, b) => a.ctb - b.ctb);
      const next = simUnits[0];
      const ticks = Math.max(0, Math.round(next.ctb));
      for (const u of simUnits) {
        u.ctb = Math.max(0, u.ctb - ticks);
      }
      result.push({
        unitId: next.unitId,
        isHero: next.isHero,
        name: next.name,
        realm: next.realm,
        ticksUntilTurn: ticks,
        surgeBonus: this.getSurgeForStep(i),
        shattered: next.shattered,
      });
      next.ctb = Math.max(20, Math.round(1000 / Math.max(10, next.tmp)));
    }
    return result;
  }

  public advanceToNextTurn(): void {
    // Check win/loss
    if (this.enemies.every((e) => e.hp <= 0)) {
      this.handleVictory();
      return;
    }
    if (this.heroes.every((h) => h.stats.hp <= 0)) {
      this.victoryState = 'LOST';
      this.waitingForPlayer = false;
      this.log('Party fallen... Restoring at the last Wardstone!');
      return;
    }

    // Ensure selectedTargetIndex points to a living enemy
    if (!this.enemies[this.selectedTargetIndex] || this.enemies[this.selectedTargetIndex].hp <= 0) {
      this.selectedTargetIndex = Math.max(
        0,
        this.enemies.findIndex((e) => e.hp > 0)
      );
    }

    const livingHeroes = this.heroes.filter((h) => h.stats.hp > 0);
    const livingEnemies = this.enemies.filter((e) => e.hp > 0);
    const allUnits = [
      ...livingHeroes.map((h) => ({ id: h.id, isHero: true, ctb: h.ctbValue })),
      ...livingEnemies.map((e) => ({ id: e.id, isHero: false, ctb: e.ctbValue })),
    ];

    allUnits.sort((a, b) => a.ctb - b.ctb);
    const next = allUnits[0];
    const delta = Math.max(0, next.ctb);

    for (const h of livingHeroes) h.ctbValue = Math.max(0, h.ctbValue - delta);
    for (const e of livingEnemies) e.ctbValue = Math.max(0, e.ctbValue - delta);

    this.currentUnitId = next.id;
    this.currentSurgeBonus = this.getSurgeForStep(0);
    this.turnCounter++;

    if (this.currentSurgeBonus === 'LEY_SURGE') {
      this.leyLineGauge = Math.min(300, this.leyLineGauge + 25);
    }

    // Tick active Domain duration
    if (this.activeDomain !== 'NONE') {
      this.domainTurnsRemaining--;
      if (this.domainTurnsRemaining <= 0) {
        this.log(`The ${this.activeDomain} Domain Shift fades back to neutral stone.`);
        this.activeDomain = 'NONE';
      }
    }

    if (next.isHero) {
      const hero = this.heroes.find((h) => h.id === next.id)!;
      this.processTurnStartStatusesHero(hero);
      if (hero.stats.hp <= 0) {
        this.advanceToNextTurn();
        return;
      }
      this.waitingForPlayer = true;
    } else {
      this.waitingForPlayer = false;
      const enemy = this.enemies.find((e) => e.id === next.id)!;
      this.processTurnStartStatusesEnemy(enemy);
      if (enemy.hp <= 0) {
        this.advanceToNextTurn();
        return;
      }
      setTimeout(() => {
        if (this.active && this.victoryState === 'NONE') {
          this.executeEnemyTurn(enemy);
        }
      }, 550);
    }
  }

  private processTurnStartStatusesHero(hero: Hero): void {
    // Decrement skill cooldowns (2x faster in ASTRAL domain!)
    const cdStep = this.activeDomain === 'ASTRAL' ? 2 : 1;
    for (const sk of hero.skills) {
      if (sk.currentCooldown && sk.currentCooldown > 0) {
        sk.currentCooldown = Math.max(0, sk.currentCooldown - cdStep);
      }
    }

    const pos = this.getHeroScreenPos(this.heroes.indexOf(hero));
    for (const st of hero.statuses) {
      if (st.type === 'REGEN') {
        const healAmt = this.activeDomain === 'DAWN' ? st.value * 2 : st.value;
        hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + healAmt);
        this.spawnFloat(`+${healAmt}`, pos.x, pos.y - 28, '#34d399');
      }
      st.duration--;
    }
    hero.statuses = hero.statuses.filter((s) => s.duration > 0);
  }

  private processTurnStartStatusesEnemy(enemy: Enemy): void {
    const idx = this.enemies.indexOf(enemy);
    const pos = this.getEnemyScreenPos(idx);

    // If enemy was SHATTERED, they recover their Stability pips at the start of their turn
    if (enemy.shattered) {
      enemy.shattered = false;
      enemy.stability = enemy.maxStability;
      this.spawnFloat('STABILITY RESTORED', pos.x, pos.y - 36, '#9ca3af');
    }

    for (const st of enemy.statuses) {
      if (st.type === 'BLEED' || st.type === 'CURSED_INK') {
        let dotDmg = st.value;
        if (st.type === 'BLEED' && this.activeDomain === 'DAWN') dotDmg *= 2;
        if (st.type === 'CURSED_INK' && this.activeDomain !== 'NONE') {
          const cassian = this.heroes.find((h) => h.id === 'cassian');
          if (cassian?.talents.some((t) => t.id === 'cassian_t3_blood' && t.unlocked)) {
            dotDmg = Math.round(dotDmg * 1.8);
          }
          if (cassian) {
            cassian.stats.ins = Math.min(cassian.stats.maxIns, cassian.stats.ins + 4);
          }
        }
        enemy.hp = Math.max(0, enemy.hp - dotDmg);
        this.spawnFloat(`-${dotDmg} ${st.name}`, pos.x, pos.y - 30, '#f43f5e');
      }
      st.duration--;
    }
    enemy.statuses = enemy.statuses.filter((s) => s.duration > 0);
  }

  public getActiveHero(): Hero | null {
    if (!this.waitingForPlayer || !this.currentUnitId) return null;
    return this.heroes.find((h) => h.id === this.currentUnitId) || null;
  }

  public getAvailableSkillsForHero(hero: Hero): Skill[] {
    const list = [...hero.skills];
    for (const dt of DUAL_TECHS) {
      if (dt.ownerId === hero.id || dt.partnerId === hero.id) {
        const partnerId = dt.ownerId === hero.id ? dt.partnerId! : dt.ownerId;
        const partner = this.heroes.find((h) => h.id === partnerId && h.recruited && h.stats.hp > 0);
        if (partner) {
          list.push(dt);
        }
      }
    }
    return list;
  }

  public getEffectiveInsCost(skill: Skill): number {
    if (this.currentSurgeBonus === 'ZERO_MANA') return 0;
    if (this.activeDomain === 'ASTRAL') return Math.floor(skill.costIns * 0.5);
    return skill.costIns;
  }

  public triggerDomainShift(domain: 'DAWN' | 'OBSIDIAN' | 'ASTRAL'): boolean {
    if (!this.waitingForPlayer || this.leyLineGauge < 100) return false;

    const overdrive = this.leyLineGauge >= 300;
    this.leyLineGauge = overdrive ? 0 : this.leyLineGauge - 100;
    this.activeDomain = domain;
    this.domainTurnsRemaining = overdrive ? 8 : 5;

    sound.playDomainShift(domain);
    this.spawnFloat(
      overdrive ? `OVERDRIVE: ${domain} DOMAIN!` : `DOMAIN SHIFT: ${domain}!`,
      320,
      95,
      domain === 'DAWN' ? '#fde047' : domain === 'OBSIDIAN' ? '#f43f5e' : '#c084fc',
      true
    );

    if (overdrive) {
      // Overdrive Ultimate Effect across all enemies!
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (e.hp <= 0) continue;
        const pos = this.getEnemyScreenPos(i);
        const burstDmg = 65;
        e.hp = Math.max(0, e.hp - burstDmg);
        this.damageStability(e, 2, pos.x, pos.y);
        this.spawnFloat(`-${burstDmg} OVERDRIVE!`, pos.x, pos.y - 24, '#fde047', true);
      }
      this.log(`3-CHARGE OVERDRIVE! ${domain} floods the battlefield and shatters enemy lines!`);
    } else {
      const desc =
        domain === 'DAWN'
          ? '+25% All Damage & 2x Regen/Bleed'
          : domain === 'OBSIDIAN'
          ? '+1 Stability Break, +20% Crit DMG & +30% Shields'
          : 'Half INS Costs, 2x Cooldown Speed & +50% Timeline Control';
      this.log(`STRIKE THE STONE! [${domain} DOMAIN] active (${desc})!`);
    }

    if (this.enemies.every((e) => e.hp <= 0)) {
      this.handleVictory();
    }
    return true;
  }

  public useHeroSkill(skill: Skill): void {
    const hero = this.getActiveHero();
    if (!hero) return;

    const cost = this.getEffectiveInsCost(skill);
    if (hero.stats.ins < cost) {
      sound.playMenuTick();
      return;
    }
    if (skill.currentCooldown && skill.currentCooldown > 0) {
      sound.playMenuTick();
      return;
    }

    this.waitingForPlayer = false;
    hero.stats.ins = Math.max(0, hero.stats.ins - cost);
    if (skill.cooldown > 0) {
      skill.currentCooldown = skill.cooldown;
    }

    // Basic 0-cost strike restores INS
    if (skill.costIns === 0) {
      hero.stats.ins = Math.min(hero.stats.maxIns, hero.stats.ins + 9);
    }

    // Gain Ley-Line Gauge
    let gaugeGain = skill.isDualTech ? 35 : skill.costIns > 0 ? 22 : 14;
    if (hero.id === 'kaelen' && hero.talents.some((t) => t.id === 'kaelen_t3_breaker' && t.unlocked)) {
      gaugeGain = Math.round(gaugeGain * 1.5);
    }
    this.leyLineGauge = Math.min(300, this.leyLineGauge + gaugeGain);

    hero.animState = skill.damageType === 'PHYSICAL' ? 'ATTACK' : 'CAST';
    hero.animTimer = 0.35;

    const heroIdx = this.heroes.indexOf(hero);
    const heroPos = this.getHeroScreenPos(heroIdx);

    if (skill.damageType === 'HEAL' || skill.damageType === 'BUFF') {
      sound.playHeal();
      const targets = skill.target === 'ALLY_ALL' ? this.heroes.filter((h) => h.stats.hp > 0) : [hero];

      for (const ally of targets) {
        const allyPos = this.getHeroScreenPos(this.heroes.indexOf(ally));
        this.spawnVfx('HEAL_WAVE', allyPos.x, allyPos.y, '#34d399', 0.48);
        if (skill.damageType === 'HEAL') {
          const healAmount = Math.round(hero.stats.res * skill.powerMultiplier + 18);
          ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + healAmount);
          this.spawnFloat(`+${healAmount} HP`, allyPos.x, allyPos.y - 24, '#34d399', true);

          if (skill.id === 'vesper_astral_halo') {
            ally.shieldHp += 30;
            this.spawnFloat('+30 SHIELD', allyPos.x, allyPos.y - 38, '#38bdf8');
          }
          // Vesper's Star-Glass Pendulum trinket advances healed allies
          if (hero.id === 'vesper') {
            ally.ctbValue = Math.max(0, ally.ctbValue - 10);
          }
        }

        if (skill.id === 'kaelen_bastion_decree') {
          const shieldAmt = this.activeDomain === 'OBSIDIAN' ? 46 : 35;
          ally.shieldHp += shieldAmt;
          this.spawnFloat(`+${shieldAmt} WARD`, allyPos.x, allyPos.y - 24, '#fbbf24');
        }

        if (skill.ctbAdvance) {
          const adv = this.activeDomain === 'ASTRAL' ? Math.round(skill.ctbAdvance * 1.5) : skill.ctbAdvance;
          ally.ctbValue = Math.max(0, ally.ctbValue - adv);
          this.spawnFloat(`+${adv} TEMPO`, allyPos.x, allyPos.y - 24, '#fde047');
        }

        if (skill.statusApplied && !skill.statusApplied.toSelf) {
          ally.statuses.push({ ...skill.statusApplied });
        }
      }

      if (skill.statusApplied && skill.statusApplied.toSelf) {
        hero.statuses.push({ ...skill.statusApplied });
        this.spawnFloat(skill.statusApplied.name.toUpperCase(), heroPos.x, heroPos.y - 36, '#fbbf24');
      }

      this.log(`${hero.name} uses [${skill.name}]!`);
    } else {
      // Offensive Skill
      if (skill.damageType === 'PHYSICAL') {
        sound.playPhysicalHit(skill.stabilityBreak >= 2);
      } else {
        sound.playMagicCast(skill.domainAffinity);
      }

      const targets =
        skill.target === 'ENEMY_ALL'
          ? this.enemies.filter((e) => e.hp > 0)
          : [this.enemies[this.selectedTargetIndex] || this.enemies.find((e) => e.hp > 0)!].filter(Boolean);

      for (const enemy of targets) {
        const eIdx = this.enemies.indexOf(enemy);
        const ePos = this.getEnemyScreenPos(eIdx);
        enemy.animState = 'HIT';
        enemy.animTimer = 0.38;

        const vfxType =
          skill.ownerId === 'kaelen'
            ? 'SEISMIC'
            : skill.ownerId === 'sura'
            ? 'SPEAR_DIVE'
            : skill.ownerId === 'vesper'
            ? 'ASTRAL_NOVA'
            : 'INK_BLOT';
        const vfxColor =
          skill.domainAffinity === 'DAWN'
            ? '#34d399'
            : skill.domainAffinity === 'OBSIDIAN'
            ? '#f97316'
            : '#a855f7';
        this.spawnVfx(vfxType, ePos.x, ePos.y, vfxColor, 0.45);

        // Calculate Base Power
        const statVal =
          skill.damageType === 'PHYSICAL'
            ? hero.stats.mgt
            : skill.damageType === 'MAGICAL'
            ? hero.stats.res
            : Math.round((hero.stats.mgt + hero.stats.res) * 0.62);

        const defVal = skill.damageType === 'PHYSICAL' ? enemy.grt : enemy.wrd;
        const effectiveDef = this.activeDomain === 'DAWN' ? Math.round(defVal * 0.85) : defVal;

        let dmg = Math.max(8, Math.round(statVal * skill.powerMultiplier * 1.45 - effectiveDef * 0.45));

        // Surge Slot +15% DMG
        if (this.currentSurgeBonus === 'DMG_BOOST') {
          dmg = Math.round(dmg * 1.15);
        }
        // Dawn Domain +25% DMG
        if (this.activeDomain === 'DAWN') {
          dmg = Math.round(dmg * 1.25);
        }
        // Shattered Target takes 1.5x Damage!
        if (enemy.shattered) {
          dmg = Math.round(dmg * 1.5);
          if (skill.id === 'kaelen_shatter_blow') {
            dmg = Math.round(dmg * 1.35);
          }
        }
        // Vulnerable status
        if (enemy.statuses.some((s) => s.type === 'VULNERABLE')) {
          dmg = Math.round(dmg * 1.2);
        }

        // Critical Hit check
        let isCrit = Math.random() * 100 < hero.stats.crit;
        if (skill.id === 'sura_sky_dive' && this.activeDomain === 'DAWN' && enemy.shattered) {
          isCrit = true;
        }
        if (isCrit) {
          const critMult = this.activeDomain === 'OBSIDIAN' ? 1.7 : 1.5;
          dmg = Math.round(dmg * critMult);
        }

        // Stability Break calculation
        let brkAmt = skill.stabilityBreak;
        if (
          this.activeDomain === 'OBSIDIAN' &&
          (skill.damageType === 'PHYSICAL' || skill.domainAffinity === 'OBSIDIAN')
        ) {
          brkAmt += 1;
        }

        this.damageStability(enemy, brkAmt, ePos.x, ePos.y);

        enemy.hp = Math.max(0, enemy.hp - dmg);
        this.spawnFloat(
          isCrit ? `${dmg} CRIT!` : `${dmg}`,
          ePos.x,
          ePos.y - 22,
          isCrit ? '#fde047' : enemy.shattered ? '#fb923c' : '#f8fafc',
          isCrit || enemy.shattered
        );

        if (skill.ctbDelay) {
          const delayAmt =
            this.activeDomain === 'ASTRAL' ? Math.round(skill.ctbDelay * 1.5) : skill.ctbDelay;
          enemy.ctbValue += delayAmt;
          this.spawnFloat(`+${delayAmt} DELAY`, ePos.x, ePos.y - 38, '#a855f7');
        }

        if (skill.statusApplied && !skill.statusApplied.toSelf) {
          enemy.statuses.push({ ...skill.statusApplied });
          this.spawnFloat(skill.statusApplied.name, ePos.x, ePos.y - 48, '#f43f5e');
        }
      }

      // Secondary effects on specific offensive skills
      if (skill.id === 'kaelen_aegis_pulse') {
        hero.shieldHp += 55;
        hero.statuses.push({ type: 'TAUNT', name: 'Taunt', duration: 3, value: 150 });
        this.spawnFloat('+55 SHIELD & TAUNT', heroPos.x, heroPos.y - 28, '#fbbf24');
      } else if (skill.id === 'cassian_sanguine_harvest' || skill.id === 'dual_solar_eclipse') {
        for (const ally of this.heroes.filter((h) => h.stats.hp > 0)) {
          const heal = 28;
          ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + heal);
          const aPos = this.getHeroScreenPos(this.heroes.indexOf(ally));
          this.spawnFloat(`+${heal} HP`, aPos.x, aPos.y - 24, '#34d399');
        }
      }

      this.log(`${hero.name} unleashes [${skill.name}]!`);
    }

    // Set Hero's next CTB turn interval
    const hasHaste = hero.statuses.some((s) => s.type === 'HASTE');
    const effectiveTmp = hasHaste ? Math.round(hero.stats.tmp * 1.3) : hero.stats.tmp;
    hero.ctbValue = Math.max(22, Math.round(1000 / Math.max(10, effectiveTmp)));

    setTimeout(() => {
      if (this.active) {
        this.advanceToNextTurn();
      }
    }, 480);
  }

  /** Reduces enemy Stability and applies shatter rewards, including shielding an equipped, living Kaelen. */
  private damageStability(enemy: Enemy, brkAmt: number, x: number, y: number): void {
    if (enemy.shattered || brkAmt <= 0 || enemy.stability <= 0) return;

    enemy.stability = Math.max(0, enemy.stability - brkAmt);
    if (enemy.stability === 0) {
      enemy.shattered = true;
      enemy.channeling = false;
      enemy.ctbValue += 35; // Push enemy back on the CTB timeline!
      this.leyLineGauge = Math.min(300, this.leyLineGauge + 30);
      sound.playStabilityBreak();
      this.spawnFloat('SHATTERED! (1.5x DMG)', x, y - 42, '#fde047', true);
      this.log(`${enemy.name}'s Stability is SHATTERED! Delayed on timeline & takes 1.5x damage!`);

      // Master Orin's Plumb-Line is a later keepsake, not part of the opening kit.
      const kaelen = this.heroes.find((h) => h.id === 'kaelen' && h.stats.hp > 0);
      if (kaelen?.trinkets.some((t) => t.id === 'trinket_orin_chisel')) {
        kaelen.shieldHp += 25;
      }
    }
  }

  private executeEnemyTurn(enemy: Enemy): void {
    enemy.animState = 'ATTACK';
    enemy.animTimer = 0.35;

    const livingHeroes = this.heroes.filter((h) => h.stats.hp > 0);
    if (livingHeroes.length === 0) {
      this.advanceToNextTurn();
      return;
    }

    // Choose target weighted by Threat / Taunt
    const taunter = livingHeroes.find((h) => h.statuses.some((s) => s.type === 'TAUNT'));
    const target =
      taunter ||
      livingHeroes[Math.floor(Math.random() * livingHeroes.length)];

    const hIdx = this.heroes.indexOf(target);
    const hPos = this.getHeroScreenPos(hIdx);
    this.spawnVfx('SLASH', hPos.x, hPos.y, '#ef4444', 0.4);

    sound.playPhysicalHit(Boolean(enemy.isBoss));

    let rawDmg = Math.max(
      9,
      Math.round(enemy.mgt * 1.15 - target.stats.grt * 0.45)
    );
    if (this.activeDomain === 'DAWN') {
      rawDmg = Math.round(rawDmg * 1.15);
    }

    if (target.shieldHp > 0) {
      const absorbed = Math.min(target.shieldHp, rawDmg);
      target.shieldHp -= absorbed;
      rawDmg -= absorbed;
      if (absorbed > 0) {
        this.spawnFloat(`-${absorbed} SHIELD`, hPos.x, hPos.y - 36, '#fbbf24');
      }
    }

    if (rawDmg > 0) {
      target.stats.hp = Math.max(0, target.stats.hp - rawDmg);
      target.animState = 'HIT';
      target.animTimer = 0.3;
      this.spawnFloat(`-${rawDmg}`, hPos.x, hPos.y - 20, '#ef4444', true);
    }

    // Taking damage charges the party's Ley-Line Gauge slightly
    this.leyLineGauge = Math.min(300, this.leyLineGauge + 12);

    this.log(`${enemy.name} uses [${enemy.intentText}] on ${target.name}!`);
    enemy.ctbValue = Math.max(28, Math.round(1000 / Math.max(10, enemy.tmp)));

    setTimeout(() => {
      if (this.active) {
        this.advanceToNextTurn();
      }
    }, 480);
  }

  private handleVictory(): void {
    this.victoryState = 'WON';
    this.waitingForPlayer = false;
    sound.playVictory();

    const totalExp = this.enemies.reduce((acc, e) => acc + e.expReward, 0);
    const totalOre = this.enemies.reduce((acc, e) => acc + e.oreReward, 0);

    // Restore 25% of max INS after every battle (per combat.md!) and revive any KO'd ally at 25% HP
    for (const h of this.heroes) {
      if (h.stats.hp <= 0) {
        h.stats.hp = Math.round(h.stats.maxHp * 0.25);
      }
      const insRestore = Math.round(h.stats.maxIns * 0.25);
      h.stats.ins = Math.min(h.stats.maxIns, h.stats.ins + insRestore);
      h.exp += totalExp;
      if (h.exp >= 100) {
        h.exp -= 100;
        h.level += 1;
        h.talentPoints += 1;
        h.baseStats.maxHp += 18;
        h.stats.maxHp += 18;
        h.stats.hp = h.stats.maxHp;
        h.baseStats.mgt += 3;
        h.stats.mgt += 3;
        h.baseStats.res += 3;
        h.stats.res += 3;
      }
    }

    this.lastRewardSummary = `Victory! +${totalExp} EXP | +${totalOre} Quarry Heart-Ore | +25% INS Restored`;
    this.log(this.lastRewardSummary);
  }

  public getHeroScreenPos(index: number): { x: number; y: number } {
    const positions = [
      { x: 165, y: 225 },
      { x: 115, y: 255 },
      { x: 75, y: 215 },
      { x: 130, y: 295 },
    ];
    return positions[index] || { x: 120, y: 240 };
  }

  public getEnemyScreenPos(index: number): { x: number; y: number } {
    const positions = [
      { x: 455, y: 235 },
      { x: 525, y: 275 },
      { x: 485, y: 200 },
    ];
    return positions[index] || { x: 470, y: 240 };
  }

  public update(dt: number): void {
    if (!this.active) return;
    if (this.transitionTimer > 0) {
      this.transitionTimer = Math.max(0, this.transitionTimer - dt);
    }

    for (const h of this.heroes) {
      if (h.animTimer > 0) {
        h.animTimer = Math.max(0, h.animTimer - dt);
        if (h.animTimer === 0) h.animState = 'IDLE';
      }
    }

    for (const e of this.enemies) {
      if (e.animTimer > 0) {
        e.animTimer = Math.max(0, e.animTimer - dt);
        if (e.animTimer === 0) e.animState = 'IDLE';
      }
    }

    for (const ft of this.floatingTexts) {
      ft.timer -= dt;
      ft.y -= dt * 22;
    }
    this.floatingTexts = this.floatingTexts.filter((f) => f.timer > 0);

    for (const fx of this.vfxEffects) {
      fx.timer -= dt;
    }
    this.vfxEffects = this.vfxEffects.filter((f) => f.timer > 0);
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
    drawBattleStage(ctx, width, height, this.activeDomain, time);

    // Draw Active Turn Highlight Ring under current unit
    const activeHero = this.getActiveHero();
    if (activeHero) {
      const idx = this.heroes.indexOf(activeHero);
      const pos = this.getHeroScreenPos(idx);
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 2, 18, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Target Reticle under selected enemy
    const targetEnemy = this.enemies[this.selectedTargetIndex];
    if (targetEnemy && targetEnemy.hp > 0) {
      const ePos = this.getEnemyScreenPos(this.selectedTargetIndex);
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(ePos.x, ePos.y + 3, 20, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Party Heroes
    this.heroes.forEach((hero, idx) => {
      if (hero.stats.hp <= 0) return;
      const pos = this.getHeroScreenPos(idx);
      drawHeroSprite(ctx, hero, pos.x, pos.y, time, 'RIGHT', 1.15);
    });

    // Draw Enemies + Overhead HP & Stability Pips
    this.enemies.forEach((enemy, idx) => {
      if (enemy.hp <= 0) return;
      const pos = this.getEnemyScreenPos(idx);
      drawEnemySprite(ctx, enemy, pos.x, pos.y, time);

      // Overhead Name, HP Bar, and Stability Shield Pips
      const barW = 64;
      const bx = Math.round(pos.x - barW / 2);
      const by = Math.round(pos.y - (enemy.isBoss ? 68 : 50));

      ctx.fillStyle = 'rgba(9, 10, 15, 0.85)';
      ctx.fillRect(bx - 2, by - 2, barW + 4, 16);

      // HP Fill
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bx, by, Math.round(barW * hpRatio), 5);

      // Stability Shield Pips
      const pipW = Math.floor((barW - (enemy.maxStability - 1) * 2) / enemy.maxStability);
      for (let p = 0; p < enemy.maxStability; p++) {
        ctx.fillStyle = enemy.shattered
          ? '#451a03'
          : p < enemy.stability
          ? '#fbbf24'
          : '#3f3f46';
        ctx.fillRect(bx + p * (pipW + 2), by + 7, pipW, 5);
      }
    });

    // Draw Animated Skill & Attack VFX
    drawBattleVfx(ctx, this.vfxEffects);

    // Draw Floating Combat Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = ft.big ? 'bold 13px monospace' : 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
      ctx.restore();
    }

    // 0.5s Rune-Shatter Screen Transition Overlay
    if (this.transitionTimer > 0) {
      const ratio = this.transitionTimer / 0.55;
      ctx.save();
      ctx.fillStyle = `rgba(251, 191, 36, ${ratio * 0.65})`;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(320, 180);
        ctx.lineTo((i * 110) % width, (i % 2) * height);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
