# Act I ("The Quarry Fall") Zone Flow, Pacing & Encounter Spine

Type: grilling
Label: wayfinder:grilling
Status: resolved
Blocked by: 02, 04

## Question

With [Multi-Domain Local Wardstone Attunement & Environmental State Machine](./02-wardstone-multi-domain-puzzles.md) and [Three-Act World Phase State Machine, Story Flags & Dialogue Scripting](./04-world-phase-and-narrative-state.md) settled, how should the existing single-screen `QuarryMap` vertical slice be restructured into the canonical Act I ("The Quarry Fall") experience with Kaelen and Sura?

Specifically, we need to decide:
1. **Act I Zone Breakdown**: How is Act I divided across Oakhaven Masons' Guild, The Cratered Quarry (Master Orin's petrification, Sura's recruitment, Crystal-Gorged Basilisk), and The Kingsroad Pass (first Titan Waygate, Wardstone bridge puzzles, Inquisitor Vane & Ironclad Hound-Pack border blockade) leading to The Grand Archive?
2. **Two-Hero Act I Combat & Puzzle Tuning**: Since Vesper and Cassian now join at The Grand Archive in Act II instead of inside the Act I quarry, how are Act I's Wardstone puzzles, field encounters, and boss fights (Crystal-Gorged Basilisk and Inquisitor Vane) balanced and gated for a 2-hero party (Kaelen + Sura)?

## Answer

Decided 2026-11-18 by Claude; the user delegated the calls. *(judgment)* marks a call the design docs don't settle. Beats, scenes, triggers and layers are as defined in [#04](./04-world-phase-and-narrative-state.md); Domain rules are as defined in [#02](./02-wardstone-multi-domain-puzzles.md).

### 1. Act I Zone breakdown

Act I runs Oakhaven → Cratered Quarry → Oakhaven → Kingsroad Pass → Grand Archive. Each step is closed by one beat, so the spine reads straight off the beat list.

**Oakhaven** (`oakhaven_town`, town, no enemies)
- Opening as built in #2: Kaelen wakes in the Masons' Guild loft; Orin has gone ahead to the quarry.
- Houses the Masons' Guild forge, the first Blacksmith Forge (`locations-and-dungeons.md`).
- Exit north to the quarry is open from the start.
- Exit east to the Kingsroad is held by a guild guard NPC (layer `until: 'quarry_cleared'`). Talking to him plays a short scene, so the gate is never a silent wall.
- Layer `after: 'shard_fell'`: townsfolk lines change, and Inquisitor scouts are visible on the edge of town as atmosphere, not encounters. *(judgment)*

**The Cratered Quarry** (`cratered_quarry`, Dungeon 1)
1. Upper rim, at the boundary stone with Orin: the **Shardfall** scene adds `shard_fell` and `orin_petrified`. The `look`-driven shardfall in `main.ts` becomes this scene.
2. Mid quarry: Inquisitor scouts corner Sura (her wyvern was clipped by Pillar debris, as in the current `recruit_sura` lines). A scripted two-hero battle runs inside the **Sura joins** scene, which adds `sura_joined` and unlocks `DAWN`.
3. Lower tunnels, the teaching puzzle: one Wardstone supporting `OBSIDIAN` (cools a lava channel) and `DAWN` (vine bridge over a chasm). The player needs both, one after the other, which teaches that a stone holds one Domain at a time. The room is encounter-free.
4. A mason's rest camp just before the boss arena: full restore, no fast travel. This meets the "retry point before every boss" rule.
5. **Crystal-Gorged Basilisk** (new encounter) in the crystallized half of the quarry. The victory scene returns to Orin's crystal. Sura and Kaelen realise only the Grand Archive can unseal him without killing him, and learn of the four Great Shards. The scene adds `quarry_cleared`.

- The quarry's patrols stay: Shard-Bitten Kobold, Obsidian Recon Pack, Fractured Ward-Golem. **Remove** `ws_astral` and `fe_boss_vane` from the quarry.
- The relic chest stays.
- `QUARRY_WAYGATE_ID` moves to the Kingsroad (below). The quarry's rest point is the camp.

**The Kingsroad Pass** (`kingsroad_pass`, Dungeon 2)
1. The first dormant **Titan Waygate**, about a third of the way in. Re-inscribing it is the first fast-travel point. It is world memory (`discoveredWaygateIds`), not a beat.
2. A two-stone bridge puzzle: stone A (`OBSIDIAN` / `DAWN`) and stone B (`DAWN` only). Crossing needs A on Obsidian and B on Dawn, in that order. This is the Act's "Wardstone Attunement bridge puzzle" (`locations-and-dungeons.md`), encounter-free.
3. Patrols of the Ironclad Hound-Pack, visible and avoidable.
4. A second Waygate, or the first one if the layout is short, placed immediately before the border gate.
5. **Inquisitor Vane & the Ironclad Hound-Pack** at the border gate. This replaces today's Vane + Runebound Siege-Golem pairing so it matches the docs; the Siege-Golem is retired for reuse later. *(judgment)* The victory scene adds `vane_blockade_broken`.

- The exit east to `grand_archive` is closed by a layer `until: 'vane_blockade_broken'`.

**Grand Archive arrival** (`grand_archive`, first entry)
- An `enter` trigger plays the **Archive Council** scene: Seraphine gives the mission, and Vesper and Cassian join. It adds `vesper_joined`, `cassian_joined` and `vault_race_begun`.
- That beat ends Act I. `worldPhase()` now returns `ACT_II_VAULT_RACE`.

**Content to move or rewrite**
- `recruit_cassian`, `recruit_vesper` and the Obsidian/Astral Wardstone gating in the quarry (`src/main.ts` ~365–415, `src/map.ts` ~370–415, ~830–840) are removed. Their dialogue is reworked into the Archive Council scene. Cassian's "I refuse the order" defection line fits there.
- `boss_intro` and `boss_victory` name all four heroes and "the united power of Dawn, Obsidian, and Astral". Rewrite them for two heroes and two Domains.
- `objective` text in `main.ts` (~615–640) is derived from the beats instead of `recruited` checks.

**Backtracking:** All three Act I Zones stay reachable in later Acts through the Kingsroad Waygate, under the no-missable-content rule. *(judgment)* Optional Astral-only Wardstones may appear in Act I Zones as visible, locked teasers. They must never gate required progress, and their rewards wait for an Act II return.

### 2. Two-hero Act I balance

- **Party:** Kaelen alone until `sura_joined`, then Kaelen + Sura. `battle.ts` already fields only joined heroes. The one Act I Dual Tech is Kaelen + Sura (`DUAL_TECHS[0]`, partner `sura`), and it must be reachable by the Basilisk.
- **Joining level:** a hero who joins comes in at the party's current level, with talent points equal to `level − 1`. Sura joins at Kaelen's level; Vesper and Cassian join at the Kaelen + Sura average. Nobody needs grinding to catch up (spirit of ADR-0002). *(judgment)*
- **Encounter size:** normal Act I field groups have at most 2 enemies, or 3 if the third is a kobold-tier add. Solo-Kaelen fights before Sura joins are a single enemy. *(judgment)*
- **Fight length targets** *(judgment)*:
  - Normal fights: 2–4 party rounds.
  - Basilisk: about 8–10 party rounds.
  - Vane & Hound-Pack: about 12–14 party rounds.
  - Tune enemy HP and Stability to these numbers, not the reverse.
- **Level targets** *(judgment)*:
  - Basilisk at about level 3–4.
  - Vane at about level 5–6, reached by fighting the visible patrols once without extra grinding.
  - EXP stays 100 per level for now.
- **Sustain without a healer** (Vesper is the healer and joins in Act II):
  - Oakhaven sells or gives restoratives.
  - Kaelen's barriers carry defence.
  - Dawn's doubled HP regeneration is the in-battle answer.
  - A rest point sits before each boss.
  - No Act I fight may require healing above what those give.
- **Domains in Act I** are `OBSIDIAN` and `DAWN` only (#02).
  - No required puzzle and no boss mechanic in Act I may need `ASTRAL`.
  - Both bosses must offer an answer through at least one of the two unlocked Domains, using the native-affinity rule the combat brief settles (combat-brief #08).
  - The Basilisk is the Domain-Shift teaching fight: one Domain clearly helps, and the other is neutral, never punishing. *(judgment)*
