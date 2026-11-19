# World & Narrative Spec

Status: locked for the core world systems. Built from the six resolved tickets in `issues/`. Each section is a summary; the linked ticket holds the detail and the reasoning, and wins if the two ever disagree. Open areas are listed at the end and are not part of this lock.

Vocabulary follows `CONTEXT.md`: Realm vs Domain, Zone, Story Beat, Scene, World Phase, Vaelora Map. Related ADRs: [0001](../../docs/adr/0001-interconnected-zones-without-overworld.md) (no walkable overworld), [0002](../../docs/adr/0002-fixed-four-hero-party.md) (fixed four), [0004](../../docs/adr/0004-story-beats-derive-world-phase.md) (beats).

## 1. Zones and transitions ([#01](issues/01-zone-graph-and-transitions.md))

- Zones are per-location scrolling tile grids of 38×28 to 64×48 tiles.
- The canonical graph:
  - **Frontier:** Oakhaven ↔ Cratered Quarry, and Oakhaven ↔ Kingsroad Pass ↔ Grand Archive.
  - **Each Realm:** Grand Archive ↔ Regional Hub ↔ Warzone Approach ↔ Vault.
  - **Act III:** Coalition War Camp ↔ Spire of the First Word.
- Step-on `EXIT` strips with a 250ms fade.
- Each Zone declares its `RealmId`, `BiomePaletteId`, `ZoneAudioProfileId` and `defaultBattleDomain`.
- **What persists in `WorldMemory`:**
  - Chests, bosses and Waygates are remembered permanently.
  - Each Wardstone's Domain is remembered until changed.
  - Non-boss enemies respawn on a Waygate rest or a change of Realm branch.

## 2. Story state ([#04](issues/04-world-phase-and-narrative-state.md))

- **Story Beats:**
  - `WorldMemory.beats: Set<StoryBeat>`, where `StoryBeat` is a closed string-literal union.
  - Beats are only ever added.
  - They are the only record of story progress: recruitment, the shardfall, recovered Great Shards, faction changes and one-time scenes.
- **World Phase is derived, never stored:**
  - `seraphine_betrayal` present → Act III.
  - `vault_race_begun` present → Act II.
  - Otherwise Act I.
- **Read helpers:** `hasJoined(world, hero)`, `shardFused(world)` and `unlockedDomains(world)`. `Hero.recruited`, `Hero.presentation` and `DialogueLine.look` are removed.
- **Scenes** are `async (s: Scene) => void`, using `say`, `addBeat`, `has`, `fade`/`flash`, `wait` and `battle`. Only Scenes add beats. Plain `DIALOGUES` arrays stay for lines with no logic. No saving mid-scene.
- **Triggers** are declared in Zone data: `on: talk | interact | enter | step`, with optional `after`/`until` beat conditions. The first match runs its Scene, and a one-time Scene is gated by the beat it adds.
- **Zone layers:** an ordered list on each Zone, each with an `after`/`until` condition. A layer can add or remove NPCs, enemies, exits and triggers, redirect an exit, and swap the palette or audio. The Zone ID never changes.
- **No dialogue choices for now.**

## 3. Wardstones ([#02](issues/02-wardstone-multi-domain-puzzles.md))

- **Which Domains Kaelen can channel** are the native Domains of the party members who have joined:
  - `OBSIDIAN` from the shardfall (Kaelen).
  - `DAWN` when Sura joins (Act I).
  - `ASTRAL` when Vesper joins (start of Act II).
  - Battle Domain Shifts are limited to the same set.
- **Effects:**
  - A stone declares `effects` per supported Domain, as tile overrides.
  - A stone holds one active Domain or `NONE`, and switching swaps its overrides.
  - Switching is free and unlimited.
  - `requiredRealm` is removed.
- **Authoring rules:**
  - Two stones may not paint the same tile.
  - A switch must never strand the party; if it would put an impassable tile under them, they move to the nearest walkable tile.
  - Puzzle rooms are encounter-free.
- **UX:**
  - The picker at the stone lists its supported Domains plus Release.
  - Locked Domains show a hint.
  - Hovering an option shows a ghost preview of the tiles it will change.
  - The stone glows in its active Domain's colour, and the interaction prompt names the active Domain.

## 4. Act I spine ([#05](issues/05-act-one-progression-and-zones.md))

**Oakhaven**
- The Kingsroad exit is held by a guard `until: quarry_cleared`.

**Quarry**
1. Shardfall scene (`shard_fell`, `orin_petrified`).
2. Sura joins in a scripted battle (`sura_joined`).
3. Obsidian/Dawn teaching stone.
4. Rest camp.
5. Crystal-Gorged Basilisk, then the Orin's-crystal scene (`quarry_cleared`).

**Kingsroad Pass**
1. First Titan Waygate.
2. Two-stone bridge puzzle.
3. Ironclad Hound-Pack patrols.
4. Waygate before the gate.
5. Inquisitor Vane & Ironclad Hound-Pack (`vane_blockade_broken`).

**Grand Archive**
- First entry plays the Archive Council scene: Vesper and Cassian join (`vault_race_begun`) and Act II begins.

**Balance**
- Joiners arrive at the party's level, with talent points equal to `level − 1`, and with Tier 2 weapons.
- Normal Act I field groups have at most 2 enemies.
- Fight-length targets: normal fights 2–4 rounds, the Basilisk about 8–10, Vane about 12–14.
- No Act I content needs `ASTRAL`.

**Code moves**
- Remove the Act I Cassian/Vesper recruit scenes, `ws_astral`, and Vane from the quarry.
- Rewrite the two-hero boss dialogue.

## 5. Travel ([#03](issues/03-waygate-and-sun-drake-traversal.md))

**Titan Waygates**
- The first touch re-inscribes the Waygate and autosaves.
- Every touch rests: restore, respawn and autosave.
- Then a menu: Travel / Respec Talents / Leave.

**Vaelora Map**
- One illustrated, non-walkable screen.
- **Waygate view:** discovered Waygates only.
- **Sky view:**
  - Unlocked by `sun_drakes_tamed`.
  - Called from `openSky` Zones or Roost NPCs.
  - Adds sky-only pins: high-altitude dungeons, sanctuaries shown as always-visible glints, and the Sunken Reliquary, which shows locked from the start of Act II.
- **Act III:** Spire and War Camp pins replace the Archive.
- **Data:** `SkyDestination { id, zoneId, spawnId, kind, mapX, mapY, after?, until? }`.

## 6. Weapons ([#06](issues/06-tri-realm-weapon-forging-quests.md))

- **Tier 2:** at the Oakhaven Guild forge, with Heart-Ore and the Basilisk Core.
- **Tier 3:** at each Vault's Titan Forge, with Heart-Ore and that Vault's Core, for the heroes native to that Realm: Kaelen and Cassian at Obsidian, Sura at Dawn, Vesper at Astral.
- **Tier 4:**
  - Each hero's frame is in a Sun-Drake sanctuary (`frame_<hero>_found`).
  - The three steps are temper at Cinderhold, infuse at Sun-Scale Hold and etch at the Star-Bound Conclave. They can be done in any order, and each needs a Realm material and Heart-Ore.
  - Tier 4 is optional power.
- **Tier 5:** awakens in the scene that closes each hero's Act III arc. It needs Tier 4, and is never missable: if the forging is unfinished, the weapon awakens later at the War Camp forge.
- Key items are not used up. Heart-Ore costs are placeholders until a balance pass.

## 7. Save data (follows from the above)

Not a ticket yet, but the decisions above fix its shape: `beats`, `openedChestIds`, `defeatedBossIds`, `defeatedFieldEnemyIds`, `wardstoneAttunement`, `discoveredWaygateIds`, the current Zone and position, party levels, talents, gear, weapon tiers and Heart-Ore. All of these are plain sets, records or numbers. Autosave points are in `qol-and-ux.md`. Saves happen between Scenes only.

## Not in this lock

These are carried on [map.md](map.md) under "Not yet specified":
- Act II Regional Hub and Approach breakdowns.
- Act III Coalition rally questlines, including where Vesper's and Cassian's Tier 5 beats sit.
- The full hidden-sanctuary list beyond the four frame sanctuaries.
- Save/load UX.
