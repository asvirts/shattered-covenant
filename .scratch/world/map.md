# World & Narrative Architecture Plan (world.md)

Label: wayfinder:map

## Destination

Produce a locked, decision-complete specification (`.scratch/world/spec.md`) and updated domain documentation (`CONTEXT.md` and `docs/adr/`) covering the multi-Zone world architecture, core exploration mechanics (Local Wardstones, Titan Waygates, Tamed Sun-Drakes, Tri-Realm Forging), and 3-Act narrative progression defined in `world.md`, ready to decompose into implementation tickets via `/to-tickets`.

## Notes

- **Domain & Vocabulary**: Consult `CONTEXT.md` and `docs/adr/0001-interconnected-zones-without-overworld.md` before every session. Maintain the strict distinction between a geopolitical **Realm** (*The Mythic Dawn*, *The Obsidian Reign*, *The Astral Wastes*) and a magical **Domain** (`DAWN`, `OBSIDIAN`, `ASTRAL`).
- **Skills to Consult**: Always consult `grilling` and `domain-modeling` when resolving `grilling` tickets (and `prototype` when resolving `prototype` tickets).
- **Standing Preferences**:
  - Ask questions **1 at a time** using the `ask_question` tool.
  - World topology uses interconnected local tile **Zones** (border exits + **Titan Waygates** + elevated **Sun-Drake** sky-map selector), not a zoomed-out walkable continental overworld ([ADR-0001](../../docs/adr/0001-interconnected-zones-without-overworld.md)).
  - Follow `world.md`'s canonical progression: Act I features Kaelen + Sura; Vesper + Cassian join at **The Grand Archive** at the start of Act II.
  - **Local Wardstones** are multi-state conduits that Kaelen can switch between any unlocked Domain (`DAWN`, `OBSIDIAN`, `ASTRAL`).
  - Act II's first three regional Titan Vaults can be tackled in flexible order from **The Grand Archive**; earning **Tamed Sun-Drakes** in **The Mythic Dawn** gates high-altitude sanctuaries and Vault IV (*The Sunken Reliquary*).
  - Weapon progression spans Tiers 1–3 at regional Master Forges, Tier 4 via the 3-step **Tri-Realm Forging** sidequest across all three Realms, and Tier 5 via Act III personal Coalition awakenings.
  - Global world state progresses through three **World Phases** (`ACT_I_QUARRY_FALL`, `ACT_II_VAULT_RACE`, `ACT_III_UNWRITTEN_COVENANT`); in Act III, **The Grand Archive** transforms into **The Spire of the First Word** and central hub facilities relocate to the **Tri-Realm Coalition War Camp** on the crater rim.

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

## Not yet specified

- **Act II Regional Hub & Approach Zone Breakdown**: The exact local Zone graph, NPC rosters, and faction warzone triggers for *The Mythic Dawn* (*Sun-Scale Hold* & Wyvern Roosts), *The Obsidian Reign* (*Cinderhold* & Magma Foundries), *The Astral Wastes* (*Star-Bound Conclave*), and the *Contested Tri-Border Maelstrom* approach once the core Zone graph and World Phase models are settled.
- **Act III Coalition Rally Questlines & Spire Ascent Gates**: The specific regional objectives to unite the fractured leaders of the Dawn, Reign, and Wastes into the **Tri-Realm Coalition**, how coalition armies mechanically/visually hold the base of **The Spire of the First Word**, and the finale sequence where Kaelen shatters the Edict Pillar and frees Master Orin.
- **Hidden Titan Sanctuaries & Optional Sky-Map Destinations**: The count, locations, and reward structure (Glyphs, WoW-style Trinkets, dormant weapon frames) of high-altitude Titan sanctuaries reachable only via **Tamed Sun-Drakes**.
- **World State Persistence & Save Schema**: How active Zone, player coordinates, Wardstone Domain states, discovered Titan Waygates, World Phase, and story flags are serialized for save/load.

## Out of scope

- **Room-by-room dungeon floor layouts and boss combat scripts**: Detailed internal dungeon room layouts and boss AI/CTB mechanics belong to `locations-and-dungeons.md` and `combat.md`.
- **Playable 2D Continental Overworld Grid**: Ruled out by [ADR-0001](../../docs/adr/0001-interconnected-zones-without-overworld.md) in favor of interconnected local Zones linked by border exits, Titan Waygates, and an elevated Sun-Drake sky-map selector.
