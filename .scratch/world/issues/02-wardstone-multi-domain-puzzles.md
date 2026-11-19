# Multi-Domain Local Wardstone Attunement & Environmental State Machine

Type: grilling
Label: wayfinder:grilling
Status: resolved
Blocked by: 01

## Question

Building on [Zone Graph Topology, Multi-Map Data Model & Border Transitions](./01-zone-graph-and-transitions.md), how should Local Wardstones evolve from a single hardcoded `requiredRealm` into multi-Domain conduits that Kaelen can switch between `DAWN`, `OBSIDIAN`, and `ASTRAL` via the Heart-Shard Gauntlet?

Specifically, we need to decide:
1. **Domain Unlock Progression on the Field**: When and how does Kaelen's Heart-Shard Gauntlet unlock the ability to channel each Domain (`DAWN`, `OBSIDIAN`, `ASTRAL`) into Local Wardstones across Act I and Act II (versus battle Domain Shifts)?
2. **Multi-Domain Environmental Transformations**: How does a Local Wardstone define its tile and obstacle mutations per Domain (e.g., Dawn sun-vine bridges vs. Obsidian petrified thorn-walls or cooled basalt causeways vs. Astral levitating ruins and low-gravity currents), and what happens to previously transformed tiles when the player switches a Wardstone to a different Domain?
3. **Field Interaction UX**: When interacting with a Local Wardstone, how does the player select or cycle which Domain to channel, and how is a Wardstone's currently active Domain communicated visually on the map and HUD?

## Answer

Decided 2026-11-18 by Claude; the user delegated the calls. *(judgment)* marks a call the design docs don't settle, so it can be reopened.

### 1. Which Domains Kaelen can channel: the party's Domains

- A Domain is channelable once a party member whose native Domain it is has joined. Kaelen counts once the Heart-Shard has fused (`shard_fell`). *(judgment)*
  - `OBSIDIAN`: Kaelen, from the shardfall. (Cassian's native Domain is also `OBSIDIAN`.)
  - `DAWN`: when Sura joins (`sura_joined`), in the Cratered Quarry.
  - `ASTRAL`: when Vesper joins at the Grand Archive (start of Act II, `vault_race_begun`).
- This needs no new state. It is a helper over beats, `unlockedDomains(world)`, built on `hasJoined` and `shardFused` from [#04](./04-world-phase-and-narrative-state.md).
- Why:
  - It matches the Oakhaven start (#2): the shard is a key, and Kaelen earns its power by gaining allies.
  - It keeps the Frontier (between the Reign and the Dawn) an Obsidian + Dawn region in Act I.
  - All three Domains are in hand at the start of Act II, which the flexible Vault order needs: each Vault's puzzles in `locations-and-dungeons.md` mix two Domains.
- **Battle Domain Shifts use the same unlocked set.** A Strike-the-Stone button for a Domain not yet unlocked is shown locked. Field and battle stay one rule. *(judgment)*
- Drop `Wardstone.requiredRealm`. Today's gating of the Obsidian and Astral stones on Cassian and Vesper being recruited (`src/main.ts`, `src/map.ts`) goes away with it.

### 2. How a Wardstone transforms terrain: one active Domain, swapping overrides

- Each Wardstone declares `effects: Partial<Record<'DAWN' | 'OBSIDIAN' | 'ASTRAL', TileOverride[]>>`. A `TileOverride` is a rect painted with a tile type, e.g. Dawn → `VINE_BRIDGE` over a chasm, Obsidian → `BASALT_BRIDGE` over lava.
- A stone only offers the Domains it has effects for. A stone can support one, two or all three.
- **A Wardstone holds exactly one active Domain, or `NONE`.** Switching restores the base tiles under the old Domain's overrides, then paints the new Domain's. Effects never stack on one stone. That exclusivity is the puzzle: a bridge or a cooled lava path, not both. *(judgment)*
- Switching is free and unlimited, with no gauge cost, so any puzzle can be reset by walking back to the stone.
- Effects other than terrain (forge-elevators, levitating ruins, low-gravity currents) are new tile types with field behaviour, e.g. an `ASTRAL_CURRENT` tile that carries the player. They are added when the first Zone needs them, not up front. *(judgment)*
- The active Domain persists per stone in `WorldMemory.wardstoneAttunement`, as decided in [#01](./01-zone-graph-and-transitions.md) §3. It is field memory, not a Story Beat.
- **Authoring rules** (checked at Zone load in dev builds):
  - Two stones in a Zone may not paint the same tile.
  - A stone must be reachable from every side of anything its effects open or close, so no switch can strand the party.
  - If a switch would put an impassable tile under the party, the party is moved to the nearest walkable tile.
- The existing rule stays: puzzle rooms are encounter-free (`locations-and-dungeons.md`).

### 3. Field UX: pick a Domain at the stone, preview before committing

- Interacting with a Wardstone opens a small picker. It lists the stone's supported Domains plus **Release** (back to `NONE`).
  - Domains not yet unlocked show as locked with a one-line hint, e.g. "This stone answers to starlight."
  - The active Domain is highlighted.
- Moving the cursor over an option shows a ghost overlay of the tiles it will change, before the player confirms. That lets players think a puzzle through without trial and error (`qol-and-ux.md`). *(judgment)*
- Confirming plays the rune-wave from `graphics-and-art-direction.md`, repaints the tiles, and plays the attune sound.
- The stone's sprite glows in its active Domain's colour. It uses the colours the battle code already uses: Dawn `#fde047`, Obsidian `#f43f5e`, Astral `#c084fc`. An unattuned stone stays grey.
- The interaction prompt names the active Domain ("Wardstone: Dawn"). There is no separate HUD element.
- The per-stone dialogue lines (`wardstone_dawn` etc.) become optional flavour on the stone's first attunement, played by a Scene.

### Consequences for other tickets

- **#05 (Act I flow):** Act I needs at least one Kingsroad Pass puzzle that uses both `OBSIDIAN` and `DAWN`, and none may need `ASTRAL`. The quarry's current Astral stone (`ws_astral`) has to move to a later Zone or become an Obsidian/Dawn stone.
- **Combat brief:** it gains one rule from here: Domain Shift options are limited to `unlockedDomains(world)`.
