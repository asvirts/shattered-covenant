# Combat brief

Labels: wayfinder:map

## Destination

A locked combat brief. When this map has no open tickets, every ambiguous rule in `combat.md` has been decided against the current battle engine, and a later session can change `src/battle.ts` without reopening design.

## Notes

Reconcile `combat.md` with the battle engine in `src/battle.ts`, `src/types.ts`, `src/main.ts`, and `src/data.ts`. The destination is the brief, not the build. Implementation is a handoff after the map is empty.

Sessions that resolve a ticket use the grilling and domain-modeling skills. `CONTEXT.md` now exists; proposed combat glossary terms from this map are listed in the resolving session's report, not written into `CONTEXT.md` directly.

Standing rules:

- Where `combat.md` states a number, the doc wins. Record the engine delta on the ticket. Do not open a new ticket to relitigate it.
- Where the doc is silent, the engine stands. No ticket. That includes the damage formula in `useHeroSkill`, shield absorption, and the undocumented revive of KO'd allies at 25% HP.
- A ticket exists only where the doc names a rule the engine cannot apply without a choice.
- Character kits, items, dungeon layouts, boss scripts, and arena art stay out of scope. A ticket may name an existing skill a combat rule hooks. It may not redesign that skill.

Do not reopen. The doc already states these, or the engine already matches them:

- All four recruited heroes fight. There is no row system.
- Field ambush cracks 1 Stability segment and adds 15% gauge. The engine adds 45.
- After a normal battle, each hero recovers 25% of max Inscription.
- Titan Waygates restore full HP and Inscription.
- Strike the Stone is a free action and does not end the turn.
- Shattered cancels a channel, grants 1.5× damage, and refills when that enemy's next turn starts. Knockback distance is still open; it lives on Assign recovery delay and Shattered knockback.

## Decisions so far

- [Define the global timeline tick](issues/01-global-timeline-tick.md): 1 tick = 10 `ctbValue` units on the existing shared CTB clock (time, not actor turns); turn interval stays `1000/TMP`; clock only moves in `advanceToNextTurn`.
- [Lock the Heart-Shard Gauge selectors](issues/02-heart-shard-gauge.md): Heart-Shard Gauge is canonical; 0–300 internal, 3 pts = 1%; basic +8%, other hero main actions +5% once per action; damage gain `min(8, 3 + floor(10×dmg/maxHp))`% per hero hit, pre-shield; enemy actions give no action gain; at 3 charges the player picks 1-charge or Overdrive; one Strike per turn.
- [Define weakness, Break Power, and Vitality](issues/03-weakness-break-vitality.md): weakness cycle Astral → Obsidian → Dawn → Astral against the enemy's domain affinity; a hit chips only on weakness/crit/Mason skill/Bind, plus Obsidian's flat +1 on every hit; gear `brk` adds only on weakness; no weakness damage bonus; Vitality = `maxHp`, no hero stagger.
- [Lock crit chance and Tempo evasion](issues/04-crit-and-evasion.md): crit = `5 + 0.1×TMP + gear bonus` (stored base crit retired), enemies crit too; evasion = `0.2×TMP`%, single-target physical only, both sides; MISS chips nothing.
- [Lock threat and telegraphed intent](issues/05-threat-and-intent.md): six intent lines (Highest Threat, Lowest HP %, Random-named-at-reveal, All, Charging, Fortify); every enemy always shows its next intent with a live-resolved named target, locked at turn start; Threat starts at `thr`, +10 per action, +30 Mason (default); Taunt overrides single-target lines.
- [Lock the ley-line surge catalog](issues/06-ley-line-surge-catalog.md): closed at Keen (+30 crit), Zero INS, Ley Surge (+10% gauge), Volatile Shock (hazard: 10% max HP, −1 Stability on enemies, no KO); buffs help heroes only, the hazard hits anyone; `DMG_BOOST` dropped.
- [Close the fuzzy domain rules](issues/07-fuzzy-domain-rules.md): Obsidian +20 is crit chance; +30% applies to every `shieldHp` grant; Domain Burst = striker hit at power 2.0 (best of MGT/RES) + 2 Stability, no crit/miss; Apex Predator removes Sky-Leap's airborne delay; Forgeborn armored = `grt > wrd`; Zero-Point splashes ALLY_SINGLE/SELF heals and shields; Dawn/Astral engine deltas recorded.
- [Define native domain affinity](issues/08-native-domain-affinity.md): boss battles start in the boss's native domain as an untimed ambient domain, and shifts revert to it; empowered = −1 Stability chip per hit and +20% damage; ends under any other domain; penalties stay boss-script content.
- [Assign recovery delay and Shattered knockback](issues/09-recovery-delay-and-shatter-knockback.md): recovery = tempo interval + class delay; Free 0 (turn continues), Fast +0, Heavy +3 ticks; Heavy derived from dual tech or base cost ≥ 20 with optional `Skill.recovery` override; knockback +4 ticks; ties go to heroes.
- [Place surges and domain duration on the clock](issues/10-surge-and-domain-placement.md): surge slot on every 4th battle turn number, cycling Keen → Zero INS → Volatile Shock → Ley Surge; domain budget 40/80 units drained by each step's delta, ends when below 0, then reverts to ambient; a new Strike resets it; engine off-by-one noted.

- From the world map, [world #02](../world/issues/02-wardstone-multi-domain-puzzles.md): only Domains the party has unlocked can be struck (Act I: Obsidian and Dawn). [World #05](../world/issues/05-act-one-progression-and-zones.md) sets Act I enemy affinities so both heroes have weakness targets; the Basilisk is native Astral.

## Not yet specified

- ~~Any elemental type beyond Dawn, Obsidian, and Astral~~: not needed. [03](issues/03-weakness-break-vitality.md) settled weakness as domain against domain affinity.
- Per-skill Threat weights, and talent multipliers like Brace's +150%. [05](issues/05-threat-and-intent.md) locked the model with default weights (+10 per action, +30 per Mason skill).
- Slow's TMP multiplier. Haste, Slow and Swap are otherwise defined on the clock in [01](issues/01-global-timeline-tick.md).
- Blind's miss-chance number and the Stability chip a Bind lands. These belong to the Ailment design; [03](issues/03-weakness-break-vitality.md) and [04](issues/04-crit-and-evasion.md) only name where they plug in.

## Out of scope

- Implementing the brief. The map ends when the rules are decided.
- Skill, talent, weapon, glyph, and trinket design in `characters.md` and `progression-and-items.md`.
- Dungeon layout, patrols, camps, and towns in `locations-and-dungeons.md`. The full-restore rule is in scope. Building those places is not.
- Individual boss scripts, including Malakor's puzzle. Define native domain affinity locks the rule only.
- Arena art, music, and VFX in `graphics-and-art-direction.md`.
