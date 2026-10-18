# Zone Graph Topology, Multi-Map Data Model & Border Transitions

Type: grilling
Label: wayfinder:grilling
Status: resolved
Blocked by: none

## Question

How should the single-screen `QuarryMap` class in `src/map.ts` be generalized into a multi-Zone architecture capable of representing all interconnected Zones across Vaelora?

Specifically, we need to decide:
1. **Zone Dimensions & Camera Viewport**: Do all Zones remain fixed single-screen 38×28 tile canvases (`TILE_SIZE = 24`), or should the engine support larger scrolling tile grids with a camera viewport following Kaelen?
2. **Zone Graph & Border Transitions**: What is the complete canonical graph of local Zones across the Frontier Borderlands, The Grand Archive, and the three Realms, and how do directional border exits and named spawn anchors link them?
3. **Zone Lifecycle & Persistence**: When transitioning between Zones, what state persists permanently (chests, defeated bosses, discovered Waygates, story triggers) vs. resets on Zone re-entry or Waygate rest (patrolling field enemies, temporary puzzle states)?
4. **Biome Visual & Audio Palettes**: How does each Zone declare its Realm aesthetic palette and ambient music/SFX profile (Dawn emerald/amber, Obsidian basalt/magma, Astral white sand/violet neon, Grand Archive marble/obsidian)?

## Answer

### 1. Zone Dimensions & Clamped Camera Viewport
- Generalize `QuarryMap` into a data-driven `ZoneMap` engine where each `ZoneDefinition` specifies its own `cols` and `rows` (with `TILE_SIZE = 24`).
- **Minimum dimensions**: `38×28` tiles (`912×672` px, matching the single-screen viewport for compact towns, interiors, and sanctuaries).
- **Scrolling dimensions**: Up to `~64×48` tiles for major Regional Hubs, canyon passes, Warzone Approaches, and Titan Vaults, using the existing clamped camera viewport (`camX`, `camY`) and visible tile-range culling in `src/map.ts`.

### 2. Canonical Zone Graph & Border Transitions
- **Act I — The Frontier Borderlands (3 Zones)**:
  - `oakhaven_town` (**Oakhaven**) ↔ `cratered_quarry` (**The Cratered Quarry**)
  - `oakhaven_town` (**Oakhaven**) ↔ `kingsroad_pass` (**The Kingsroad Pass**) ↔ `grand_archive` (**The Grand Archive**)
- **Central Hub & Act III Transformation**:
  - `grand_archive` (**The Grand Archive**) serves as the central hub in Act I/II with physical border exits to `kingsroad_pass` and all three Regional Hubs (`sun_scale_hold`, `cinderhold`, `star_bound_conclave`).
  - In `ACT_III_UNWRITTEN_COVENANT`, the hub shifts to `coalition_war_camp` (**Tri-Realm Coalition War Camp**) on the crater rim, which connects directly to the endgame dungeon `spire_of_the_first_word` (**The Spire of the First Word**).
- **Act II — Three Superpower Realm Branches (`[Regional Hub] ↔ [Warzone Approach] ↔ [Titan Vault]`)**:
  - *The Mythic Dawn*: `sun_scale_hold` (**Sun-Scale Hold**) ↔ `dawn_canopy_approach` (**Emerald Canopy Causeway**) ↔ `sun_root_ziggurat` (**The Sun-Root Ziggurat**, Vault I)
  - *The Obsidian Reign*: `cinderhold` (**Cinderhold**) ↔ `obsidian_foundry_approach` (**Blackrock Magma Viaduct**) ↔ `halls_of_first_anvil` (**Halls of the First Anvil**, Vault II)
  - *The Astral Wastes*: `star_bound_conclave` (**The Star-Bound Conclave**) ↔ `astral_dunes_approach` (**Shattered Star-Dunes**) ↔ `star_glass_nexus` (**The Star-Glass Nexus**, Vault III)
- **Sky-Map-Only Zones (Reachable via Tamed Sun-Drakes)**:
  - `sunken_reliquary` (**The Sunken Reliquary**, Vault IV in *The Contested Tri-Border Maelstrom*)
  - High-altitude **Titan Sanctuaries** (to be detailed when the sky-map ticket resolves).
- **Border Exit & Spawn Anchor Mechanics**:
  - Border exits are 2–4 tile wide `EXIT` strips rendered with directional chevron markers at Zone boundaries.
  - Stepping onto an `EXIT` strip triggers a 250ms fade transition to `(targetZoneId, targetSpawnId)`, spawning Kaelen `1.5 * TILE_SIZE` inward from the destination exit strip along its inward normal so he does not immediately re-trigger the transition.

### 3. Zone Lifecycle & State Persistence
- **Permanently Persisted**:
  - Opened Relic Chests (`openedChestIds`)
  - Defeated Bosses and Mid-Bosses (`defeatedBossIds`, where `isBoss: true`)
  - Re-inscribed / Discovered Titan Waygates (`discoveredWaygateIds`)
  - Global narrative progression and one-time encounter/recruitment flags (`storyFlags`)
- **Persisted per-Zone Until Changed**:
  - Each Local Wardstone's active `DomainType` (`attunedBy: 'NONE' | 'DAWN' | 'OBSIDIAN' | 'ASTRAL'`) persists across Zone transitions so unlocked bridges and shortcuts stay open when backtracking.
- **Respawn on Titan Waygate Rest or Realm Change**:
  - Standard patrolling field enemies (`isBoss: false`) stay defeated while moving between adjacent Zones within the same Realm branch, and respawn only when resting at a **Titan Waygate** or when leaving for a different Realm branch.

### 4. Biome Visual & Audio Palettes + Domain vs. Realm Types
- Introduce a distinct `RealmId` type (`'FRONTIER' | 'GRAND_ARCHIVE' | 'MYTHIC_DAWN' | 'OBSIDIAN_REIGN' | 'ASTRAL_WASTES' | 'TRI_BORDER_MAELSTROM'`) in `src/types.ts` alongside `DomainType` (`'NONE' | 'DAWN' | 'OBSIDIAN' | 'ASTRAL'`), aligning code types with `CONTEXT.md`.
- Each `ZoneDefinition` declaratively specifies:
  - `realm: RealmId` (geopolitical territory shown in HUD/map banners)
  - `biomePalette: BiomePaletteId` (config driving `WALL`/`FLOOR`/`STAIRS`/hazard tile colors, ambient rim-lighting tint, and drifting field particles)
  - `defaultBattleDomain: DomainType` (initial battlefield ley-line state before a hero Strikes the Stone)
  - `audioProfile: ZoneAudioProfileId` (procedural WebAudio ambient motif/drone and environment SFX profile in `src/audio.ts`)
