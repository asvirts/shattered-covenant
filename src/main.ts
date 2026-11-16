import {
  ALL_GLYPHS,
  DIALOGUES,
  DUAL_TECHS,
  STARTER_TRINKETS,
  createInitialHeroes,
  grantHeartShardKit,
} from './data';
import { sound } from './audio';
import { BattleEngine } from './battle';
import { ZoneMap } from './map';
import { drawPortrait } from './sprites';
import { DialogueLine, Hero, HeroId, ZoneId } from './types';
import {
  getZone,
  QUARRY_CHEST_ID,
  QUARRY_WAYGATE_ID,
  REALM_LABEL,
  WorldMemory,
  ZoneExit,
} from './zones';

class ShatteredCovenantGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private heroes: Record<HeroId, Hero>;
  private world = new WorldMemory();
  private map: ZoneMap;
  private battle: BattleEngine;
  private zoneTransition: {
    elapsed: number;
    phase: 'out' | 'in';
    targetZoneId: ZoneId;
    targetExitId: string;
  } | null = null;
  private readonly zoneFadeHalf = 0.125;

  public heartOre = 0;
  private shardEventQueued = false;
  private keys = new Set<string>();
  private lastTime = performance.now();

  // Dialogue state
  private activeDialogue: DialogueLine[] | null = null;
  private dialogueIndex = 0;
  private onDialogueComplete: (() => void) | null = null;

  // Party Menu state
  private partyMenuOpen = false;
  private selectedMenuHeroId: HeroId = 'kaelen';
  private selectedSubtab: 'talents' | 'glyphs' | 'weapons' = 'talents';

  // Active encounter field enemy reference
  private activeFieldEnemyId: string | null = null;
  // Command buttons stay in the DOM until this changes. Rebuilding them every
  // frame removes the element between mousedown and mouseup, so the click never lands.
  private commandPanelSignature = '';

  /** Initializes the game, opens the guild-loft wake dialogue, and starts the animation loop. */
  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.heroes = createInitialHeroes();
    this.map = new ZoneMap(getZone('oakhaven_town'), this.world);
    this.battle = new BattleEngine();
    sound.playZoneAmbient(this.map.definition.audioProfile);

    this.recomputeAllHeroStats();
    this.bindInputEvents();
    this.bindUIButtons();
    this.updateExploreHUD();

    // Wake in Oakhaven. The quarry cataclysm plays only after he walks up to it.
    this.startDialogue(DIALOGUES.wake);

    requestAnimationFrame((t) => this.loop(t));
  }

  private recomputeAllHeroStats(): void {
    (Object.keys(this.heroes) as HeroId[]).forEach((id) => {
      this.recomputeHeroStats(this.heroes[id]);
    });
  }

  public recomputeHeroStats(hero: Hero): void {
    const prevHpRatio = hero.stats.maxHp > 0 ? hero.stats.hp / hero.stats.maxHp : 1;
    const prevInsRatio = hero.stats.maxIns > 0 ? hero.stats.ins / hero.stats.maxIns : 1;

    const next = { ...hero.baseStats };

    // 1. Weapon Tier Bonuses
    const wTier = hero.weaponTiers[hero.weaponTierIndex] || hero.weaponTiers[0];
    next.mgt += wTier.mgtBonus;
    next.res += wTier.resBonus;
    next.crit += wTier.critBonus;

    // 2. Talent Bonuses & Unlocked Skills
    for (const t of hero.talents) {
      if (t.unlocked) {
        if (t.statBonuses) {
          if (t.statBonuses.maxHp) next.maxHp += t.statBonuses.maxHp;
          if (t.statBonuses.maxIns) next.maxIns += t.statBonuses.maxIns;
          if (t.statBonuses.mgt) next.mgt += t.statBonuses.mgt;
          if (t.statBonuses.res) next.res += t.statBonuses.res;
          if (t.statBonuses.grt) next.grt += t.statBonuses.grt;
          if (t.statBonuses.wrd) next.wrd += t.statBonuses.wrd;
          if (t.statBonuses.tmp) next.tmp += t.statBonuses.tmp;
          if (t.statBonuses.crit) next.crit += t.statBonuses.crit;
        }
        if (t.unlocksSkill && !hero.skills.some((s) => s.id === t.unlocksSkill!.id)) {
          hero.skills.push({ ...t.unlocksSkill });
        }
      } else if (t.unlocksSkill) {
        hero.skills = hero.skills.filter((s) => s.id !== t.unlocksSkill!.id);
      }
    }

    // 3. Trinket Bonuses
    for (const tr of hero.trinkets) {
      if (tr.statBonuses.maxHp) next.maxHp += tr.statBonuses.maxHp;
      if (tr.statBonuses.maxIns) next.maxIns += tr.statBonuses.maxIns;
      if (tr.statBonuses.mgt) next.mgt += tr.statBonuses.mgt;
      if (tr.statBonuses.res) next.res += tr.statBonuses.res;
      if (tr.statBonuses.grt) next.grt += tr.statBonuses.grt;
      if (tr.statBonuses.wrd) next.wrd += tr.statBonuses.wrd;
      if (tr.statBonuses.tmp) next.tmp += tr.statBonuses.tmp;
      if (tr.statBonuses.crit) next.crit += tr.statBonuses.crit;
    }

    // 4. Glyph Socket Bonuses + Adjacency Synergies
    const realms = new Set<string>();
    for (const g of hero.glyphSockets) {
      if (!g) continue;
      realms.add(g.realm);
      if (g.statBonuses.maxHp) next.maxHp += g.statBonuses.maxHp;
      if (g.statBonuses.maxIns) next.maxIns += g.statBonuses.maxIns;
      if (g.statBonuses.mgt) next.mgt += g.statBonuses.mgt;
      if (g.statBonuses.res) next.res += g.statBonuses.res;
      if (g.statBonuses.grt) next.grt += g.statBonuses.grt;
      if (g.statBonuses.wrd) next.wrd += g.statBonuses.wrd;
      if (g.statBonuses.tmp) next.tmp += g.statBonuses.tmp;
      if (g.statBonuses.crit) next.crit += g.statBonuses.crit;
    }

    // Adjacency Synergy Bonuses (per progression-and-items.md)
    if (realms.has('DAWN') && realms.has('OBSIDIAN')) {
      // Solar Forge Synergy
      next.mgt += 4;
      next.grt += 3;
    }
    if (realms.has('OBSIDIAN') && realms.has('ASTRAL')) {
      // Star-Fell Meteor Synergy
      next.res += 4;
      next.crit += 6;
    }
    if (realms.has('DAWN') && realms.has('ASTRAL')) {
      // Celestial Horizon Synergy
      next.tmp += 3;
      next.maxIns += 10;
    }

    next.hp = Math.max(1, Math.round(next.maxHp * prevHpRatio));
    next.ins = Math.max(0, Math.round(next.maxIns * prevInsRatio));
    hero.stats = next;
  }

  private bindInputEvents(): void {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keys.add(key);
      sound.unlock();

      if (this.activeDialogue) {
        if (key === ' ' || key === 'enter') {
          e.preventDefault();
          this.advanceDialogue();
        }
        return;
      }

      if (key === 'c' || key === 'tab' || key === 'm') {
        if (!this.battle.active) {
          e.preventDefault();
          this.togglePartyModal();
        }
        return;
      }

      if (key === 'escape' && this.partyMenuOpen) {
        this.togglePartyModal(false);
        return;
      }

      if (this.partyMenuOpen) return;

      if (this.battle.active) {
        if (this.battle.victoryState !== 'NONE' && (key === ' ' || key === 'enter')) {
          e.preventDefault();
          this.finishBattle();
        }
        return;
      }

      // Field Ambush Swing (F or Shift)
      if (key === 'f' || key === 'shift') {
        e.preventDefault();
        this.performFieldSwing();
      } else if (key === ' ' || key === 'enter' || key === 'e') {
        e.preventDefault();
        this.triggerNearestInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Canvas click support (click enemies in battle or click to interact on field)
    this.canvas.addEventListener('click', (e) => {
      sound.unlock();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = 640 / rect.width;
      const scaleY = 360 / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      if (this.battle.active && this.battle.waitingForPlayer) {
        this.battle.enemies.forEach((enemy, idx) => {
          if (enemy.hp <= 0) return;
          const pos = this.battle.getEnemyScreenPos(idx);
          if (Math.hypot(cx - pos.x, cy - (pos.y - 20)) < 32) {
            this.battle.selectedTargetIndex = idx;
            sound.playMenuTick();
            this.renderBattleHUD();
          }
        });
      }
    });
  }

  private bindUIButtons(): void {
    document.getElementById('btn-open-party')!.addEventListener('click', () => {
      if (!this.battle.active) {
        this.togglePartyModal();
      }
    });

    document.getElementById('btn-close-party')!.addEventListener('click', () => {
      this.togglePartyModal(false);
    });

    const muteBtn = document.getElementById('btn-mute')!;
    muteBtn.addEventListener('click', () => {
      sound.setMuted(!sound.muted);
      muteBtn.textContent = sound.muted ? 'SFX: OFF' : 'SFX: ON';
    });

    document.getElementById('btn-interact-prompt')!.addEventListener('click', () => {
      this.triggerNearestInteraction();
    });

    document.getElementById('btn-dialogue-next')!.addEventListener('click', () => {
      this.advanceDialogue();
    });

    document.getElementById('btn-battle-continue')!.addEventListener('click', () => {
      this.finishBattle();
    });

    // Domain Shift Free-Action Buttons
    document.getElementById('btn-domain-dawn')!.addEventListener('click', () => {
      if (this.battle.triggerDomainShift('DAWN')) {
        this.syncDomainShellTheme();
        this.renderBattleHUD();
      }
    });
    document.getElementById('btn-domain-obsidian')!.addEventListener('click', () => {
      if (this.battle.triggerDomainShift('OBSIDIAN')) {
        this.syncDomainShellTheme();
        this.renderBattleHUD();
      }
    });
    document.getElementById('btn-domain-astral')!.addEventListener('click', () => {
      if (this.battle.triggerDomainShift('ASTRAL')) {
        this.syncDomainShellTheme();
        this.renderBattleHUD();
      }
    });

    // Party Modal Subtabs
    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as 'talents' | 'glyphs' | 'weapons';
        this.selectedSubtab = tab;
        sound.playMenuTick();
        this.renderPartyModal();
      });
    });

    document.getElementById('btn-respec-talents')!.addEventListener('click', () => {
      const hero = this.heroes[this.selectedMenuHeroId];
      let refunded = 0;
      for (const t of hero.talents) {
        if (t.unlocked) {
          t.unlocked = false;
          refunded++;
        }
      }
      if (refunded > 0) {
        hero.talentPoints += refunded;
        this.recomputeHeroStats(hero);
        sound.playWardstoneAttune();
        this.renderPartyModal();
        this.updateExploreHUD();
      }
    });
  }

  private performFieldSwing(): void {
    if (this.map.swingTimer > 0) return;
    this.map.swingTimer = 0.25;
    this.heroes.kaelen.animState = 'ATTACK';
    this.heroes.kaelen.animTimer = 0.25;
    sound.playSwing();

    const reachX = this.map.playerX + (this.map.playerFacing === 'RIGHT' ? 22 : -22);
    const reachY = this.map.playerY;

    for (const fe of this.map.fieldEnemies) {
      if (fe.defeated) continue;
      const dist = Math.hypot(reachX - fe.x, reachY - fe.y);
      if (dist < 38) {
        sound.playAmbushHit();
        if (fe.isBoss) {
          this.startDialogue(DIALOGUES.boss_intro, () => {
            this.enterBattleWithFieldEnemy(fe.id, true);
          });
        } else {
          this.enterBattleWithFieldEnemy(fe.id, true);
        }
        return;
      }
    }
  }

  /** Handles the nearest village or quarry interaction, including recruitment and chest rewards. */
  private triggerNearestInteraction(): void {
    const trig = this.map.getNearestTrigger(this.heroes);
    if (!trig) return;

    sound.playMenuConfirm();

    if (trig.type === 'PALLET') {
      this.startDialogue(DIALOGUES.pallet);
    } else if (trig.type === 'VILLAGE_SIGN') {
      this.startDialogue(DIALOGUES.village_sign);
    } else if (trig.type === 'VILLAGE_NPC') {
      this.startDialogue(DIALOGUES.bram);
    } else if (trig.type === 'NPC_ORIN') {
      this.startDialogue(DIALOGUES.inspect_orin);
    } else if (trig.type === 'WARDSTONE') {
      const ws = this.map.wardstones.find((w) => w.id === trig.id)!;
      if (ws.requiredRealm === 'OBSIDIAN' && !this.heroes.cassian.recruited) {
        this.startDialogue([
          {
            speaker: 'Kaelen Vance',
            title: 'The Faultline Mason',
            portraitId: 'kaelen',
            expression: 'NEUTRAL',
            text: 'This Obsidian Wardstone is sealed with an Inquisitorial cipher. That Scribe by the magma fissure might know how to unlock it!',
          },
        ]);
        return;
      }
      if (ws.requiredRealm === 'ASTRAL' && !this.heroes.vesper.recruited) {
        this.startDialogue([
          {
            speaker: 'Kaelen Vance',
            title: 'The Faultline Mason',
            portraitId: 'kaelen',
            expression: 'NEUTRAL',
            text: 'This monolith hums with Astral starlight. Let’s speak with the hooded mystic by the Waygate first.',
          },
        ]);
        return;
      }

      this.map.attuneWardstone(ws.id);
      this.world.wardstoneAttunement[ws.id] = ws.attunedBy;
      sound.playWardstoneAttune();
      const dlgKey =
        ws.id === 'ws_dawn'
          ? 'wardstone_dawn'
          : ws.id === 'ws_obsidian'
          ? 'wardstone_obsidian'
          : 'wardstone_astral';
      this.startDialogue(DIALOGUES[dlgKey]);
      this.updateExploreHUD();
    } else if (trig.type === 'RECRUIT_SURA') {
      this.startDialogue(DIALOGUES.recruit_sura, () => {
        this.heroes.sura.recruited = true;
        sound.playRecruitFanfare();
        this.updateExploreHUD();
      });
    } else if (trig.type === 'RECRUIT_CASSIAN') {
      this.startDialogue(DIALOGUES.recruit_cassian, () => {
        this.heroes.cassian.recruited = true;
        sound.playRecruitFanfare();
        this.updateExploreHUD();
      });
    } else if (trig.type === 'RECRUIT_VESPER') {
      this.startDialogue(DIALOGUES.recruit_vesper, () => {
        this.heroes.vesper.recruited = true;
        sound.playRecruitFanfare();
        this.updateExploreHUD();
      });
    } else if (trig.type === 'WAYGATE') {
      (Object.keys(this.heroes) as HeroId[]).forEach((id) => {
        const h = this.heroes[id];
        h.stats.hp = h.stats.maxHp;
        h.stats.ins = h.stats.maxIns;
      });
      sound.playHeal();
      this.world.discoveredWaygateIds.add(QUARRY_WAYGATE_ID);
      this.world.respawnAllNonBosses();
      this.map.refreshFieldEnemyDefeat(this.world);
      this.startDialogue(DIALOGUES.waygate_rest);
      this.updateExploreHUD();
    } else if (trig.type === 'ANVIL') {
      this.selectedSubtab = 'weapons';
      this.togglePartyModal(true);
    } else if (trig.type === 'CHEST') {
      this.map.relicChestOpened = true;
      this.world.openedChestIds.add(QUARRY_CHEST_ID);
      this.heartOre += 5;
      (Object.keys(this.heroes) as HeroId[]).forEach((id) => {
        this.heroes[id].talentPoints += 1;
      });
      const keepsake = STARTER_TRINKETS.kaelen[0];
      if (keepsake && !this.heroes.kaelen.trinkets.some((t) => t.id === keepsake.id)) {
        this.heroes.kaelen.trinkets.push({ ...keepsake });
        this.recomputeHeroStats(this.heroes.kaelen);
      }
      sound.playRecruitFanfare();
      this.startDialogue([
        {
          speaker: 'Titan Relic Cache',
          title: 'Ancient Quarry Vault',
          portraitId: 'stone',
          expression: 'WARM',
          text: 'Discovered +5 Quarry Heart-Ore (use at the Master Anvil to evolve your party’s weapons!), +1 Talent Point for every party member, and Master Orin’s Plumb-Line — a keepsake, not a starting weapon.',
        },
      ]);
      this.updateExploreHUD();
    }
  }

  public startDialogue(lines: DialogueLine[], onComplete?: () => void): void {
    this.activeDialogue = lines;
    this.dialogueIndex = 0;
    this.onDialogueComplete = onComplete || null;
    document.getElementById('dialogue-modal')!.classList.remove('hidden');
    this.renderCurrentDialogueLine();
  }

  /** Selects Kaelen’s portrait from his weapon tier and Heart-Shard presentation. */
  private kaelenPortraitVariant(): 'humble' | 'shard' | 'heroic' {
    const kaelen = this.heroes.kaelen;
    if (kaelen.weaponTierIndex >= 1) return 'heroic';
    if (kaelen.presentation === 'SHARD') return 'shard';
    return 'humble';
  }

  /**
   * Applies the current dialogue line’s presentation changes and renders its portrait and text.
   * A SHARD look also applies shardfall to the map and grants Kaelen's shard skills,
   * regardless of the line's speaker. A HUMBLE look cannot undo shard progression.
   */
  private renderCurrentDialogueLine(): void {
    if (!this.activeDialogue) return;
    const line = this.activeDialogue[this.dialogueIndex];
    if (line.look === 'SHARD') {
      this.map.applyShardfall();
      grantHeartShardKit(this.heroes.kaelen);
    } else if (
      line.look === 'HUMBLE' &&
      this.heroes.kaelen.presentation !== 'SHARD' &&
      this.heroes.kaelen.weaponTierIndex < 1
    ) {
      this.heroes.kaelen.presentation = 'HUMBLE';
    }
    const pCanvas = document.getElementById('dialogue-portrait') as HTMLCanvasElement;
    const variant = line.portraitId === 'kaelen' ? this.kaelenPortraitVariant() : 'heroic';
    drawPortrait(pCanvas, line.portraitId, line.expression || 'NEUTRAL', performance.now(), variant);

    document.getElementById('dialogue-speaker')!.textContent = line.speaker;
    document.getElementById('dialogue-title')!.textContent = line.title || '';
    document.getElementById('dialogue-text')!.textContent = line.text;
    document.getElementById('dialogue-step-indicator')!.textContent = `${this.dialogueIndex + 1} / ${this.activeDialogue.length}`;
  }

  /** Advances the dialogue; on its final line, closes it, refreshes the HUD, and invokes its completion callback. */
  private advanceDialogue(): void {
    if (!this.activeDialogue) return;
    sound.playMenuTick();
    this.dialogueIndex++;
    if (this.dialogueIndex >= this.activeDialogue.length) {
      this.activeDialogue = null;
      document.getElementById('dialogue-modal')!.classList.add('hidden');
      this.updateExploreHUD();
      if (this.onDialogueComplete) {
        const cb = this.onDialogueComplete;
        this.onDialogueComplete = null;
        cb();
      }
    } else {
      this.renderCurrentDialogueLine();
    }
  }

  private enterBattleWithFieldEnemy(fieldEnemyId: string, ambush: boolean): void {
    const fe = this.map.fieldEnemies.find((f) => f.id === fieldEnemyId);
    if (!fe) return;

    this.activeFieldEnemyId = fe.id;
    const partyList = (['kaelen', 'sura', 'vesper', 'cassian'] as HeroId[]).map(
      (id) => this.heroes[id]
    );

    document.getElementById('explore-hud')!.classList.add('hidden');
    document.getElementById('battle-hud')!.classList.remove('hidden');
    document.getElementById('battle-result-modal')!.classList.add('hidden');

    this.commandPanelSignature = '';
    this.battle.startBattle(partyList, fe.encounterIds, ambush, Boolean(fe.isBoss));
    this.syncDomainShellTheme();
    this.renderBattleHUD();
  }

  /** Applies battle rewards or defeat recovery, then restores exploration and any victory dialogue. */
  private finishBattle(): void {
    sound.playMenuConfirm();
    const won = this.battle.victoryState === 'WON';
    const wasBoss = this.battle.isBossBattle;

    if (won && this.activeFieldEnemyId) {
      const fe = this.map.fieldEnemies.find((f) => f.id === this.activeFieldEnemyId);
      if (fe) {
        fe.defeated = true;
        if (fe.isBoss) this.world.defeatedBossIds.add(fe.id);
        else this.world.defeatedFieldEnemyIds.add(fe.id);
      }
      const oreGain = this.battle.enemies.reduce((acc, e) => acc + e.oreReward, 0);
      this.heartOre += oreGain;
    } else if (!won) {
      // Restore party at Waygate on defeat
      (Object.keys(this.heroes) as HeroId[]).forEach((id) => {
        const h = this.heroes[id];
        h.stats.hp = h.stats.maxHp;
        h.stats.ins = h.stats.maxIns;
      });
      if (this.heroes.kaelen.presentation === 'HUMBLE') {
        this.snapshotZone();
        const home = getZone('oakhaven_town');
        this.map.load(home, this.world, { start: true });
        sound.playZoneAmbient(home.audioProfile);
      } else if (this.map.definition.id !== 'cratered_quarry') {
        this.snapshotZone();
        const quarry = getZone('cratered_quarry');
        this.map.load(quarry, this.world, { start: true });
        sound.playZoneAmbient(quarry.audioProfile);
      } else {
        this.map.playerX = 9 * 24;
        this.map.playerY = 22 * 24;
      }
    }

    this.battle.active = false;
    this.battle.activeDomain = 'NONE';
    this.commandPanelSignature = '';
    this.syncDomainShellTheme();

    document.getElementById('battle-hud')!.classList.add('hidden');
    document.getElementById('explore-hud')!.classList.remove('hidden');
    this.updateExploreHUD();

    if (won && wasBoss) {
      this.startDialogue(DIALOGUES.boss_victory);
    }
  }

  private syncDomainShellTheme(): void {
    const shell = document.getElementById('app-shell')!;
    shell.className = `domain-${this.battle.activeDomain.toLowerCase()}`;
  }

  /** Refreshes Heart-Ore, the current zone, the progression objective, and the party strip. */
  public updateExploreHUD(): void {
    document.getElementById('ore-count')!.textContent = String(this.heartOre);

    const def = this.map.definition;
    const realmLabel = REALM_LABEL[def.realm];
    const placeLabel =
      def.id === 'oakhaven_town'
        ? 'Oakhaven — Frontier Hamlet'
        : def.name === realmLabel
          ? def.name
          : `${def.name} — ${realmLabel}`;
    document.getElementById('zone-subtitle')!.textContent = placeLabel;

    const objEl = document.getElementById('objective-banner')!;
    if (this.heroes.kaelen.presentation === 'HUMBLE') {
      objEl.textContent = 'Objective: Walk north through Oakhaven and find Master Orin at the quarry';
      this.renderPartyStrip();
      return;
    }
    if (def.id !== 'cratered_quarry') {
      objEl.textContent = placeLabel;
    } else {
      const wsDawn = this.map.wardstones.find((w) => w.id === 'ws_dawn')!;
      const wsObsidian = this.map.wardstones.find((w) => w.id === 'ws_obsidian')!;
      const boss = this.map.fieldEnemies.find((f) => f.isBoss)!;

      if (wsDawn.attunedBy === 'NONE') {
        objEl.textContent = 'Objective: Attune the Dawn Wardstone east of the crater [Space]';
      } else if (!this.heroes.sura.recruited) {
        objEl.textContent = 'Objective: Cross the Sun-Vine Bridge & recruit Sura of the Sun-Scales';
      } else if (!this.heroes.cassian.recruited) {
        objEl.textContent = 'Objective: Ascend the northeast ramp & speak to Cassian Thorne by the magma river';
      } else if (wsObsidian.attunedBy === 'NONE') {
        objEl.textContent = 'Objective: Attune the Obsidian Wardstone beside Cassian to cool the magma river';
      } else if (!this.heroes.vesper.recruited) {
        objEl.textContent = 'Objective: Cross the Blackrock Causeway & recruit Vesper by the Titan Waygate';
      } else if (!boss.defeated) {
        objEl.textContent = 'Objective: Storm the North Crater Summit & defeat Inquisitor Vane!';
      } else {
        objEl.textContent = 'Act I Slice Complete! Explore, reforge weapons at the Anvil, or test Talents!';
      }
    }

    this.renderPartyStrip();
  }

  /** Rebuilds clickable status cards for recruited heroes with HP, INS, and available Talent points. */
  private renderPartyStrip(): void {
    // Render Mini Party Strip
    const strip = document.getElementById('party-mini-strip')!;
    strip.innerHTML = '';
    (['kaelen', 'sura', 'vesper', 'cassian'] as HeroId[]).forEach((id) => {
      const h = this.heroes[id];
      if (!h.recruited) return;

      const card = document.createElement('div');
      card.className = 'mini-hero-card';
      card.title = `Click to open ${h.name}'s Talent Tree & Equipment`;
      const hpPct = Math.round((h.stats.hp / h.stats.maxHp) * 100);
      const insPct = Math.round((h.stats.ins / h.stats.maxIns) * 100);

      card.innerHTML = `
        <div class="mini-hero-name">${h.name.split(' ')[0]} <span style="color:#a8a29e;font-weight:400">Lv.${h.level}</span>${
          h.talentPoints > 0 ? ` <span style="color:#fde047">[+${h.talentPoints}★]</span>` : ''
        }</div>
        <div class="mini-bar-row">
          <span>HP</span>
          <div class="mini-bar-track"><div class="mini-bar-fill hp" style="width:${hpPct}%"></div></div>
          <span>${h.stats.hp}</span>
        </div>
        <div class="mini-bar-row">
          <span>INS</span>
          <div class="mini-bar-track"><div class="mini-bar-fill ins" style="width:${insPct}%"></div></div>
          <span>${h.stats.ins}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectedMenuHeroId = id;
        this.togglePartyModal(true);
      });
      strip.appendChild(card);
    });
  }

  private commandPanelKey(activeHero: Hero | null): string {
    const skills = activeHero ? this.battle.getAvailableSkillsForHero(activeHero) : [];
    const skillState = skills
      .map((sk) => `${sk.id}:${sk.currentCooldown ?? 0}:${this.battle.getEffectiveInsCost(sk)}`)
      .join(',');
    return [
      this.battle.waitingForPlayer ? '1' : '0',
      this.battle.currentUnitId ?? '',
      String(this.battle.selectedTargetIndex),
      activeHero ? `${activeHero.id}:${activeHero.stats.ins}` : '',
      skillState,
      this.battle.activeDomain,
      this.battle.currentSurgeBonus,
      this.battle.victoryState,
    ].join('|');
  }

  private renderCommandPanel(activeHero: Hero | null): void {
    const key = this.commandPanelKey(activeHero);
    if (key === this.commandPanelSignature) return;
    this.commandPanelSignature = key;

    const heroNameEl = document.getElementById('active-hero-name')!;
    const surgeBadge = document.getElementById('active-surge-badge')!;
    const targetBtns = document.getElementById('target-buttons')!;
    const skillGrid = document.getElementById('skill-buttons')!;

    targetBtns.innerHTML = '';
    this.battle.enemies.forEach((enemy, idx) => {
      if (enemy.hp <= 0) return;
      const btn = document.createElement('button');
      btn.className = `target-btn ${this.battle.selectedTargetIndex === idx ? 'selected' : ''}`;
      btn.textContent = `${enemy.name} [HP ${enemy.hp}/${enemy.maxHp} | Shield ${enemy.stability}]`;
      btn.addEventListener('click', () => {
        this.battle.selectedTargetIndex = idx;
        sound.playMenuTick();
        this.renderBattleHUD();
      });
      targetBtns.appendChild(btn);
    });

    skillGrid.innerHTML = '';
    if (activeHero) {
      heroNameEl.textContent = `${activeHero.name} — Select Action`;
      if (this.battle.currentSurgeBonus !== 'NONE') {
        surgeBadge.classList.remove('hidden');
        surgeBadge.textContent =
          this.battle.currentSurgeBonus === 'DMG_BOOST'
            ? 'SURGE: +15% DMG'
            : this.battle.currentSurgeBonus === 'ZERO_MANA'
            ? 'SURGE: 0 INS COST'
            : 'SURGE: +25% GAUGE';
      } else {
        surgeBadge.classList.add('hidden');
      }

      const skills = this.battle.getAvailableSkillsForHero(activeHero);
      for (const sk of skills) {
        const effCost = this.battle.getEffectiveInsCost(sk);
        const onCd = Boolean(sk.currentCooldown && sk.currentCooldown > 0);
        const canAfford = activeHero.stats.ins >= effCost && !onCd;

        const btn = document.createElement('button');
        btn.className = `skill-btn ${sk.isDualTech ? 'dual-tech' : ''}`;
        btn.disabled = !canAfford;
        btn.title = `${sk.description}${sk.domainBonusText ? ' | ' + sk.domainBonusText : ''}`;
        btn.innerHTML = `
          <span>${sk.isDualTech ? '★ ' : ''}${sk.name}${onCd ? ` (CD:${sk.currentCooldown})` : ''}</span>
          <span class="skill-cost">${effCost === 0 ? '0 INS' : `${effCost} INS`} | -${sk.stabilityBreak}🛡</span>
        `;
        btn.addEventListener('click', () => {
          this.battle.useHeroSkill(sk);
          this.renderBattleHUD();
        });
        skillGrid.appendChild(btn);
      }
    } else {
      heroNameEl.textContent =
        this.battle.victoryState !== 'NONE' ? 'Battle Complete' : 'Enemy Turn in Progress...';
      surgeBadge.classList.add('hidden');
    }
  }

  private renderBattleHUD(): void {
    if (!this.battle.active) return;

    // 1. CTB Timeline Track
    const track = document.getElementById('ctb-track')!;
    track.innerHTML = '';
    const preview = this.battle.getTimelinePreview(7);
    preview.forEach((slot, idx) => {
      const div = document.createElement('div');
      div.className = `ctb-slot ${slot.isHero ? 'hero' : 'enemy'} ${idx === 0 ? 'active-turn' : ''}`;
      let surgeLabel = '';
      if (slot.surgeBonus === 'DMG_BOOST') surgeLabel = '<span class="surge-pip" title="Ley-Line Surge: +15% Damage on this turn">+15% DMG</span>';
      if (slot.surgeBonus === 'ZERO_MANA') surgeLabel = '<span class="surge-pip" title="Ley-Line Surge: 0 INS Cost on this turn">0 INS</span>';
      if (slot.surgeBonus === 'LEY_SURGE') surgeLabel = '<span class="surge-pip" title="Ley-Line Surge: +25% Ley-Line Gauge">+25% GAUGE</span>';

      div.innerHTML = `<span>${idx + 1}. ${slot.name}${slot.shattered ? ' (SHATTERED)' : ''}</span>${surgeLabel}`;
      track.appendChild(div);
    });

    // Active Domain Pill
    const domPill = document.getElementById('domain-active-pill')!;
    if (this.battle.activeDomain !== 'NONE') {
      domPill.classList.remove('hidden');
      domPill.textContent = `${this.battle.activeDomain} DOMAIN (${this.battle.domainTurnsRemaining}t)`;
    } else {
      domPill.classList.add('hidden');
    }

    // 2. Ley-Line Gauge & Domain Buttons
    const charges = Math.floor(this.battle.leyLineGauge / 100);
    document.getElementById('leyline-value')!.textContent = `${this.battle.leyLineGauge}% (${charges} Charge${charges === 1 ? '' : 's'})`;
    document.getElementById('leyline-bar-fill')!.style.width = `${Math.min(100, (this.battle.leyLineGauge / 300) * 100)}%`;

    const canShift = this.battle.waitingForPlayer && this.battle.leyLineGauge >= 100;
    (document.getElementById('btn-domain-dawn') as HTMLButtonElement).disabled = !canShift;
    (document.getElementById('btn-domain-obsidian') as HTMLButtonElement).disabled = !canShift;
    (document.getElementById('btn-domain-astral') as HTMLButtonElement).disabled = !canShift;

    // 3. Battle Log Banner
    document.getElementById('battle-log-banner')!.textContent =
      this.battle.battleLog[0] || 'Awaiting orders...';

    // 4. Active Hero Commands & Targets
    const activeHero = this.battle.getActiveHero();
    this.renderCommandPanel(activeHero);

    // 5. Party Status Cards
    const partyCards = document.getElementById('battle-party-cards')!;
    partyCards.innerHTML = '';
    for (const h of this.battle.heroes) {
      const isAct = activeHero?.id === h.id;
      const card = document.createElement('div');
      card.className = `battle-hero-card ${isAct ? 'active' : ''}`;
      const hpPct = Math.round((h.stats.hp / h.stats.maxHp) * 100);
      const insPct = Math.round((h.stats.ins / h.stats.maxIns) * 100);
      const statusHtml = [
        ...(h.shieldHp > 0 ? [`<span class="status-pill">Shield ${h.shieldHp}</span>`] : []),
        ...h.statuses.map((s) => `<span class="status-pill">${s.name} (${s.duration})</span>`),
      ].join('');

      card.innerHTML = `
        <div class="battle-hero-top">
          <span>${h.name.split(' ')[0]}</span>
          <span style="color:#a8a29e">${h.className}</span>
        </div>
        <div class="mini-bar-row">
          <span>HP</span>
          <div class="mini-bar-track"><div class="mini-bar-fill hp" style="width:${hpPct}%"></div></div>
          <span>${h.stats.hp}/${h.stats.maxHp}</span>
        </div>
        <div class="mini-bar-row">
          <span>INS</span>
          <div class="mini-bar-track"><div class="mini-bar-fill ins" style="width:${insPct}%"></div></div>
          <span>${h.stats.ins}/${h.stats.maxIns}</span>
        </div>
        <div class="status-pills">${statusHtml}</div>
      `;
      partyCards.appendChild(card);
    }

    // 6. Victory / Defeat Modal
    const resModal = document.getElementById('battle-result-modal')!;
    if (this.battle.victoryState !== 'NONE') {
      resModal.classList.remove('hidden');
      document.getElementById('battle-result-title')!.textContent =
        this.battle.victoryState === 'WON' ? 'VICTORY!' : 'PARTY FALLEN';
      document.getElementById('battle-result-summary')!.textContent =
        this.battle.victoryState === 'WON'
          ? this.battle.lastRewardSummary
          : 'The Heart-Shard recalls your party to Oakhaven’s Wardstone...';
    } else {
      resModal.classList.add('hidden');
    }
  }

  public togglePartyModal(forceState?: boolean): void {
    this.partyMenuOpen = forceState !== undefined ? forceState : !this.partyMenuOpen;
    sound.playMenuConfirm();
    const modal = document.getElementById('party-modal')!;
    if (this.partyMenuOpen) {
      modal.classList.remove('hidden');
      this.renderPartyModal();
    } else {
      modal.classList.add('hidden');
      this.updateExploreHUD();
    }
  }

  /** Renders the selected hero’s portrait, stats, and active talents, glyphs, or weapons tab. */
  private renderPartyModal(): void {
    const hero = this.heroes[this.selectedMenuHeroId];

    // 1. Hero Tabs
    const tabsEl = document.getElementById('party-hero-tabs')!;
    tabsEl.innerHTML = '';
    (['kaelen', 'sura', 'vesper', 'cassian'] as HeroId[]).forEach((id) => {
      const h = this.heroes[id];
      const btn = document.createElement('button');
      btn.className = `hero-tab-btn ${this.selectedMenuHeroId === id ? 'active' : ''}`;
      btn.disabled = !h.recruited;
      btn.textContent = h.recruited ? `${h.name.split(' ')[0]} (Lv.${h.level})` : `${h.name.split(' ')[0]} (Locked)`;
      btn.addEventListener('click', () => {
        this.selectedMenuHeroId = id;
        sound.playMenuTick();
        this.renderPartyModal();
      });
      tabsEl.appendChild(btn);
    });

    // Sync subtab button active states
    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      const t = (btn as HTMLElement).dataset.tab;
      btn.classList.toggle('active', t === this.selectedSubtab);
    });

    // 2. Left Column Summary & Portrait
    drawPortrait(
      document.getElementById('menu-portrait') as HTMLCanvasElement,
      hero.id,
      'DETERMINED',
      performance.now(),
      hero.id === 'kaelen' ? this.kaelenPortraitVariant() : 'heroic'
    );
    document.getElementById('menu-hero-name')!.textContent = hero.name;
    document.getElementById('menu-hero-class')!.textContent = `${hero.className} • ${hero.epithet}`;
    document.getElementById('menu-hero-level')!.textContent = `Lv. ${hero.level} | Unspent Talent Pts: ${hero.talentPoints}`;

    const statsGrid = document.getElementById('menu-stats-grid')!;
    const st = hero.stats;
    statsGrid.innerHTML = `
      <div class="stat-box" title="Vitality / Maximum Health"><span>VIT (HP)</span><strong>${st.hp}/${st.maxHp}</strong></div>
      <div class="stat-box" title="Inscription / Runic Mana Pool"><span>INS (Mana)</span><strong>${st.ins}/${st.maxIns}</strong></div>
      <div class="stat-box" title="Might / Physical Attack Power"><span>MGT</span><strong>${st.mgt}</strong></div>
      <div class="stat-box" title="Resonance / Magic & Healing Power"><span>RES</span><strong>${st.res}</strong></div>
      <div class="stat-box" title="Grit / Physical Armor Defense"><span>GRT</span><strong>${st.grt}</strong></div>
      <div class="stat-box" title="Warding / Magical Resistance"><span>WRD</span><strong>${st.wrd}</strong></div>
      <div class="stat-box" title="Tempo / Action Speed on CTB Timeline"><span>TMP</span><strong>${st.tmp}</strong></div>
      <div class="stat-box" title="Critical Hit Chance"><span>CRIT%</span><strong>${st.crit}%</strong></div>
    `;

    // 3. Right Content Area
    const content = document.getElementById('party-tab-content')!;
    content.innerHTML = '';

    if (this.selectedSubtab === 'talents') {
      const branches = [0, 1].map((bIdx) =>
        hero.talents.filter((t) => t.branchIndex === bIdx).sort((a, b) => a.tier - b.tier)
      );

      const grid = document.createElement('div');
      grid.className = 'talent-branches-grid';

      branches.forEach((nodes) => {
        const col = document.createElement('div');
        col.className = 'talent-branch-col';
        col.innerHTML = `<div class="talent-branch-title">${nodes[0]?.branchName || 'Specialization'}</div>`;

        nodes.forEach((node) => {
          const prevTierUnlocked =
            node.tier === 1 ||
            nodes.some((n) => n.tier === node.tier - 1 && n.unlocked);
          const canUnlock = !node.unlocked && hero.talentPoints > 0 && prevTierUnlocked;

          const card = document.createElement('div');
          card.className = `talent-node-card ${node.unlocked ? 'unlocked' : ''}`;
          card.innerHTML = `
            <div class="talent-node-header">
              <span>Tier ${node.tier}: ${node.name}</span>
              <span>${node.unlocked ? '✓ UNLOCKED' : `Cost: 1 Pt`}</span>
            </div>
            <div class="talent-node-desc">${node.description}</div>
          `;

          if (!node.unlocked) {
            const btn = document.createElement('button');
            btn.className = 'basalt-btn primary-gold';
            btn.disabled = !canUnlock;
            btn.textContent = canUnlock
              ? 'Learn Talent (1 Pt)'
              : !prevTierUnlocked
              ? `Requires Tier ${node.tier - 1}`
              : 'Need Talent Point';
            btn.addEventListener('click', () => {
              hero.talentPoints -= 1;
              node.unlocked = true;
              this.recomputeHeroStats(hero);
              sound.playRecruitFanfare();
              this.renderPartyModal();
            });
            card.appendChild(btn);
          }

          col.appendChild(card);
        });

        grid.appendChild(col);
      });

      content.appendChild(grid);
    } else if (this.selectedSubtab === 'glyphs') {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <h4 style="margin:0 0 8px;color:#fbbf24">Socketed Covenant Glyphs &amp; Adjacency Synergies</h4>
        <p style="margin:0 0 10px;font-size:11.5px;color:#a8a29e">
          Slotting Dawn + Obsidian activates <strong>[Solar Forge]</strong> (+4 MGT, +3 GRT). Slotting Obsidian + Astral activates <strong>[Star-Fell Meteor]</strong> (+4 RES, +6% CRIT). Slotting Dawn + Astral activates <strong>[Celestial Horizon]</strong> (+3 TMP, +10 INS).
        </p>
      `;

      const gGrid = document.createElement('div');
      gGrid.className = 'glyph-grid';

      ALL_GLYPHS.forEach((glyph) => {
        const isEquipped = hero.glyphSockets.some((g) => g?.id === glyph.id);
        const card = document.createElement('div');
        card.className = `glyph-card`;
        card.style.borderColor = isEquipped ? '#10b981' : '#52525b';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;font-weight:700;color:#fde68a;margin-bottom:4px">
            <span>${glyph.name}</span>
            <span>[${glyph.realm}]</span>
          </div>
          <div style="color:#d6d3d1;margin-bottom:6px">${glyph.description}</div>
        `;
        const btn = document.createElement('button');
        btn.className = 'basalt-btn';
        btn.textContent = isEquipped ? 'Socketed ✓ (Click to Unsocket)' : 'Socket Glyph';
        btn.addEventListener('click', () => {
          if (isEquipped) {
            const idx = hero.glyphSockets.findIndex((g) => g?.id === glyph.id);
            if (idx >= 0) hero.glyphSockets[idx] = null;
          } else {
            const emptyIdx = hero.glyphSockets.findIndex((g) => g === null);
            if (emptyIdx >= 0) {
              hero.glyphSockets[emptyIdx] = glyph;
            } else {
              hero.glyphSockets[0] = glyph;
            }
          }
          this.recomputeHeroStats(hero);
          sound.playMenuConfirm();
          this.renderPartyModal();
        });
        card.appendChild(btn);
        gGrid.appendChild(card);
      });

      wrap.appendChild(gGrid);

      // Show Resonance Link Dual Techs for this hero
      const dualBox = document.createElement('div');
      dualBox.style.marginTop = '12px';
      dualBox.innerHTML = `<h4 style="margin:0 0 6px;color:#c084fc">Resonance Links (Dual Techs)</h4>`;
      DUAL_TECHS.filter((dt) => dt.ownerId === hero.id || dt.partnerId === hero.id).forEach((dt) => {
        const item = document.createElement('div');
        item.className = 'glyph-card';
        item.style.marginBottom = '6px';
        item.innerHTML = `<strong>★ ${dt.name} (${dt.costIns} INS)</strong>: ${dt.description}`;
        dualBox.appendChild(item);
      });
      wrap.appendChild(dualBox);

      content.appendChild(wrap);
    } else {
      // Weapons & Trinkets Subtab
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <h4 style="margin:0 0 8px;color:#fbbf24">5-Tier Evolving Signature Weapon — Available Heart-Ore: ${this.heartOre}</h4>
        <p style="margin:0 0 10px;font-size:11.5px;color:#a8a29e">
          Reforging a weapon immediately evolves its stats AND updates the character’s in-hand weapon sprite and runic glow!
        </p>
      `;

      const wList = document.createElement('div');
      wList.className = 'weapon-tier-list';

      hero.weaponTiers.forEach((wt, idx) => {
        const isCurrent = hero.weaponTierIndex === idx;
        const isUnlocked = idx <= hero.weaponTierIndex;
        const isNext = idx === hero.weaponTierIndex + 1;
        const oreCost = idx * 2;

        const card = document.createElement('div');
        card.className = `weapon-card ${isCurrent ? 'active-tier' : ''}`;
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;font-weight:700;color:#fde68a;margin-bottom:3px">
            <span>Tier ${wt.tier}: ${wt.name}</span>
            <span style="color:${wt.visualColor}">●</span>
          </div>
          <div style="font-size:10.5px;color:#38bdf8;margin-bottom:4px">${wt.title}</div>
          <div style="color:#d6d3d1;margin-bottom:6px">${wt.passiveText}</div>
        `;

        if (isCurrent) {
          const badge = document.createElement('span');
          badge.style.color = '#10b981';
          badge.style.fontWeight = '700';
          badge.textContent = '✓ Currently Equipped';
          card.appendChild(badge);
        } else if (isNext) {
          const btn = document.createElement('button');
          btn.className = 'basalt-btn primary-gold';
          btn.disabled = this.heartOre < oreCost;
          btn.textContent = `Reforge Weapon (${oreCost} Heart-Ore)`;
          btn.addEventListener('click', () => {
            if (this.heartOre >= oreCost) {
              this.heartOre -= oreCost;
              hero.weaponTierIndex = idx;
              this.recomputeHeroStats(hero);
              sound.playWardstoneAttune();
              this.renderPartyModal();
              this.updateExploreHUD();
            }
          });
          card.appendChild(btn);
        } else if (isUnlocked) {
          const badge = document.createElement('span');
          badge.style.color = '#a8a29e';
          badge.textContent = 'Surpassed';
          card.appendChild(badge);
        }

        wList.appendChild(card);
      });

      wrap.appendChild(wList);
      content.appendChild(wrap);
    }
  }

  private snapshotZone(): void {
    if (this.map.relicChestOpened) this.world.openedChestIds.add(QUARRY_CHEST_ID);
    for (const ws of this.map.wardstones) {
      this.world.wardstoneAttunement[ws.id] = ws.attunedBy;
    }
    for (const fe of this.map.fieldEnemies) {
      if (fe.isBoss) {
        if (fe.defeated) this.world.defeatedBossIds.add(fe.id);
        else this.world.defeatedBossIds.delete(fe.id);
      } else if (fe.defeated) {
        this.world.defeatedFieldEnemyIds.add(fe.id);
      } else {
        this.world.defeatedFieldEnemyIds.delete(fe.id);
      }
    }
  }

  private beginZoneTransition(exit: ZoneExit): void {
    if (this.zoneTransition) return;
    document.getElementById('btn-interact-prompt')!.classList.add('hidden');
    this.zoneTransition = {
      elapsed: 0,
      phase: 'out',
      targetZoneId: exit.targetZoneId,
      targetExitId: exit.targetExitId,
    };
  }

  private updateZoneTransition(dt: number): void {
    if (!this.zoneTransition) return;
    this.zoneTransition.elapsed += dt;
    if (this.zoneTransition.phase === 'out' && this.zoneTransition.elapsed >= this.zoneFadeHalf) {
      const fromRealm = this.map.definition.realm;
      this.snapshotZone();
      const target = getZone(this.zoneTransition.targetZoneId);
      if (target.realm !== fromRealm) this.world.respawnNonBossesInRealm(fromRealm);
      this.map.load(target, this.world, { exitId: this.zoneTransition.targetExitId });
      sound.playZoneAmbient(target.audioProfile);
      this.zoneTransition.phase = 'in';
      this.zoneTransition.elapsed = 0;
      this.updateExploreHUD();
    } else if (this.zoneTransition.phase === 'in' && this.zoneTransition.elapsed >= this.zoneFadeHalf) {
      this.zoneTransition = null;
    }
  }

  private drawZoneFade(): void {
    if (!this.zoneTransition) return;
    const alpha =
      this.zoneTransition.phase === 'out'
        ? Math.min(1, this.zoneTransition.elapsed / this.zoneFadeHalf)
        : Math.max(0, 1 - this.zoneTransition.elapsed / this.zoneFadeHalf);
    this.ctx.fillStyle = `rgba(5, 4, 8, ${alpha})`;
    this.ctx.fillRect(0, 0, 640, 360);
  }

  /**
   * Updates exploration movement and encounters, triggering shardfall dialogue on quarry arrival.
   * dt is elapsed time in seconds. Does nothing during dialogue, party menus,
   * battle, or zone transitions.
   */
  private updateExploration(dt: number): void {
    if (this.activeDialogue || this.partyMenuOpen || this.battle.active || this.zoneTransition) return;

    if (this.map.swingTimer > 0) {
      this.map.swingTimer = Math.max(0, this.map.swingTimer - dt);
    }
    if (this.heroes.kaelen.animTimer > 0) {
      this.heroes.kaelen.animTimer = Math.max(0, this.heroes.kaelen.animTimer - dt);
      if (this.heroes.kaelen.animTimer === 0) this.heroes.kaelen.animState = 'IDLE';
    }

    let dx = 0;
    let dy = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      dx -= 1;
      this.map.playerFacing = 'LEFT';
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      dx += 1;
      this.map.playerFacing = 'RIGHT';
    }

    this.map.isPlayerMoving = dx !== 0 || dy !== 0;

    if (this.map.isPlayerMoving) {
      const len = Math.hypot(dx, dy);
      const speed = 108;
      const nx = this.map.playerX + (dx / len) * speed * dt;
      const ny = this.map.playerY + (dy / len) * speed * dt;

      if (this.map.isWalkablePixel(nx, this.map.playerY)) {
        this.map.playerX = nx;
      }
      if (this.map.isWalkablePixel(this.map.playerX, ny)) {
        this.map.playerY = ny;
      }

      if (Math.random() < 0.35) {
        this.map.dustParticles.push({
          x: this.map.playerX + (Math.random() * 8 - 4),
          y: this.map.playerY + 2,
          timer: 0.35,
        });
      }
    }

    for (const dp of this.map.dustParticles) {
      dp.timer -= dt;
    }
    this.map.dustParticles = this.map.dustParticles.filter((d) => d.timer > 0);

    if (
      this.map.definition.id === 'cratered_quarry' &&
      this.heroes.kaelen.presentation === 'HUMBLE' &&
      !this.shardEventQueued
    ) {
      const col = this.map.playerX / 24;
      const row = this.map.playerY / 24;
      if (row < 22.4 && row > 18 && col > 4 && col < 14) {
        this.shardEventQueued = true;
        this.startDialogue(DIALOGUES.intro);
        this.updateExploreHUD();
        return;
      }
    }

    // Update roaming field enemies & check direct contact
    for (const fe of this.map.fieldEnemies) {
      if (fe.defeated) continue;
      if (fe.patrolRadius > 0) {
        const patrolSpeed = 24;
        if (fe.dir === 'RIGHT') {
          fe.x += patrolSpeed * dt;
          if (fe.x > fe.homeX + fe.patrolRadius) fe.dir = 'LEFT';
        } else {
          fe.x -= patrolSpeed * dt;
          if (fe.x < fe.homeX - fe.patrolRadius) fe.dir = 'RIGHT';
        }
      }

      const dist = Math.hypot(this.map.playerX - fe.x, this.map.playerY - fe.y);
      if (dist < 18) {
        if (fe.isBoss) {
          this.startDialogue(DIALOGUES.boss_intro, () => {
            this.enterBattleWithFieldEnemy(fe.id, false);
          });
        } else {
          this.enterBattleWithFieldEnemy(fe.id, false);
        }
        return;
      }
    }

    const exit = this.map.exitUnderPlayer();
    if (exit) {
      this.beginZoneTransition(exit);
      return;
    }

    // Update interaction prompt button visibility
    const promptBtn = document.getElementById('btn-interact-prompt')!;
    const trig = this.map.getNearestTrigger(this.heroes);
    if (trig) {
      promptBtn.classList.remove('hidden');
      promptBtn.textContent = trig.promptText;
    } else {
      promptBtn.classList.add('hidden');
    }
  }

  /** Advances and renders the active game mode, refreshes its HUD, and schedules the next frame. */
  private loop(now: number): void {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.ctx.imageSmoothingEnabled = false;

    if (this.battle.active) {
      this.battle.update(dt);
      this.battle.render(this.ctx, 640, 360, now);
      this.renderBattleHUD();
    } else {
      this.updateZoneTransition(dt);
      this.updateExploration(dt);
      this.map.render(this.ctx, 640, 360, this.heroes, now);
      this.drawZoneFade();
    }

    // Animate active 96x96 Bust Portraits at 60fps
    if (this.activeDialogue) {
      const line = this.activeDialogue[this.dialogueIndex];
      if (line) {
        const variant = line.portraitId === 'kaelen' ? this.kaelenPortraitVariant() : 'heroic';
        drawPortrait(
          document.getElementById('dialogue-portrait') as HTMLCanvasElement,
          line.portraitId,
          line.expression || 'NEUTRAL',
          now,
          variant
        );
      }
    } else if (this.partyMenuOpen) {
      const menuHero = this.heroes[this.selectedMenuHeroId];
      drawPortrait(
        document.getElementById('menu-portrait') as HTMLCanvasElement,
        this.selectedMenuHeroId,
        'DETERMINED',
        now,
        menuHero.id === 'kaelen' ? this.kaelenPortraitVariant() : 'heroic'
      );
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ShatteredCovenantGame();
});
