# Close the fuzzy domain rules

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

Which domain-table cells did the engine guess, and what are the three resonance passives and the Domain Burst in rules the engine can apply?

These cells are already numeric. Do not reopen them. Record the engine delta and leave the doc's number in place:

- Mythic Dawn: physical and elemental damage +25%, Grit and Warding −15%, regen and bleed tick twice. The engine applies +25% to hero damage, +15% to enemy damage, and the defense cut only on the defense stat that matches the hero's damage type. Regen and bleed already tick twice while Dawn is active, so that part of the cell matches.
- Astral Wastes: skill Inscription costs halved, cooldowns tick down twice as fast, and turn-delay and haste effects are +50% stronger. The engine roughly matches this (`getEffectiveInsCost`, cooldown step 2, and ×1.5 on `ctbAdvance` and `ctbDelay`).

Decide the cells the doc leaves fuzzy or the engine implemented as a guess:

- Obsidian Reign says `CRIT%` increases by +20%. The engine treats that as crit damage (1.7× instead of 1.5×) and the battle log calls it +20% crit damage. Lock whether +20% is crit chance or crit damage.
- Obsidian Reign says barrier and shield values increase by +30%. The engine applies that only to Bastion Decree (46 instead of 35). Lock which effects count as a barrier or a shield.
- Domain Burst: the doc says an overdrive shift unleashes an immediate area burst and gives no magnitude. The engine deals 65 damage and 2 Stability to every living enemy. Lock the burst's magnitude.
- Resonance passives, which are absent from the engine. Hook each one to an existing skill. Do not redesign the skill.
  - Sura's Apex Predator: Sky-Leap dives resolve instantly with 0 turn delay while Mythic Dawn is active.
  - Kaelen and Cassian's Forgeborn Calibration: attacks restore 10% Inscription and deal +15% damage to armored or shielded foes while Obsidian Reign is active. Define what counts as armored or shielded.
  - Vesper's Zero-Point Conduit: single-target heals and shields splash to all allies at 50% potency while Astral Wastes is active.

How many ticks a shift lasts is not this ticket. Place surges and domain duration on the clock owns the count, once Define the global timeline tick has named the unit. The doc's 4 and 8 stand.

## Answer

### Obsidian Reign

- **`CRIT%` +20% is crit chance:** +20 percentage points added to the formula in [04](04-crit-and-evasion.md). `combat.md` defines `CRIT%` as the critical rate. Crit damage stays 1.5× in every domain. The rule is friend and foe, so enemy crit chance also gains +20.
- **Barrier and shield +30%:** every grant of `shieldHp` made while Obsidian Reign is active is multiplied by 1.3 and rounded. That covers Bastion Decree, Stone-Ward Aegis, Astral Halo, Orin's Plumb-Line, Defend shields, and any enemy shield. Shields that already exist aren't rescaled when the domain starts or ends. Taunt is not a shield.
- The +1 Stability is locked on [03](03-weakness-break-vitality.md): every damaging hit on an enemy.

### Domain Burst (Overdrive only)

- On activation, the striker makes one hit on every living enemy, resolved **inside the new domain**: `powerMultiplier: 2.0`, using the striker's higher of MGT or RES, against GRT if MGT is used and WRD if RES is used. It goes through the normal damage formula, so Dawn's +25% and Shattered's 1.5× apply.
- Each enemy also loses **2 Stability**, plus Obsidian Reign's +1 when the new domain is Obsidian. The burst is a fixed chip, so the weakness and Break Power terms don't apply.
- The burst can't crit and can't be evaded. It is not a weakness hit. Shatters it causes give their normal gauge and knockback.
- *(judgment)* The burst scales with whoever strikes, instead of the engine's flat 65, so it stays meaningful past Act I and makes who strikes a real choice. A base-stat Sura deals about 75 to a kobold, comparable to today's 65.

### Resonance passives

- **Apex Predator (Sura, Mythic Dawn).** Sky-Leap (`sura_sky_dive`) has no airborne delay: the slam lands on the turn it is chosen, and its recovery follows its normal class ([09](09-recovery-delay-and-shatter-knockback.md)). The trade-off is that an instant dive also means no airborne dodge. "0 turn delay" refers to the airborne wait described in `characters.md`, not to recovery. *(judgment: a zero-recovery reading would let Sura chain dives in one turn)* **No effect in today's engine**, because `sura_sky_dive` has no airborne phase yet. The HUD should still show the passive as active.
- **Forgeborn Calibration (Kaelen and Cassian, Obsidian Reign).** Each damaging main action restores 10% of the attacker's max INS once (not per target) and deals +15% damage to each target that is armored or shielded.
  - **Shielded:** `shieldHp > 0` at the moment of the hit.
  - **Armored:** `grt > wrd` on the enemy. *(judgment)* This is derived from existing stats, so no tags are needed. Today the Recon Hound, Ward-Golem and Siege-Golem are armored. The Kobold and Inquisitor Vane are not.
- **Zero-Point Conduit (Vesper, Astral Wastes).** When a Vesper skill with target `ALLY_SINGLE` or `SELF` heals or grants `shieldHp`, every other living ally also receives 50% of that heal and shield, rounded. Statuses, ctb advances and other riders don't splash. *(judgment: SELF counts as single-target)* **No effect in today's engine**, because Vesper's two heals are both `ALLY_ALL`.

### Recorded deltas (cells that were already numeric)

- **Mythic Dawn.** The engine gives enemies +15% damage. The doc says +25%, friend and foe. The engine cuts GRT and WRD by 15% only on enemies. The doc cuts them on heroes too. "Physical and elemental damage" covers every damage type the engine has (`PHYSICAL`, `MAGICAL`, `HYBRID`), because the engine has no arcane or curse tag. Regen and Bleed already match.
- **Astral Wastes.** Halved costs, double cooldown steps, and ×1.5 on `ctbAdvance` and `ctbDelay` match. Two gaps: "Haste +50% stronger" means Haste's TMP bonus becomes +45% instead of +30%, and the Star-Glass Pendulum's 10-unit advance should also be ×1.5. Shattered knockback and the ambush delay are not turn-delay effects and are not scaled.
- **Obsidian Reign.** The engine applies 1.7× crit damage and boosts only Bastion Decree. Both are replaced above. Cassian's Redact `domainBonusText` ("+20% Crit DMG") needs its text fixed.
