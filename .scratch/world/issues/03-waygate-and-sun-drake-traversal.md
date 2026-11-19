# Titan Waygate Network & Tamed Sun-Drake Sky-Map Selector

Type: prototype
Label: wayfinder:prototype
Status: resolved
Blocked by: 01

## Question

Once the Zone graph in [Zone Graph Topology, Multi-Map Data Model & Border Transitions](./01-zone-graph-and-transitions.md) is defined, how should the player interact with discovered Titan Waygates and the Act II Tamed Sun-Drake sky-map selector to traverse Vaelora without a separate playable continental overworld grid?

Specifically, we need to prototype and decide:
1. **Titan Waygate Interaction Menu**: When Kaelen re-inscribes and interacts with a Titan Waygate, how should the UI combine full party restoration, free Talent respecs, and cross-region fast travel to other discovered Waygates?
2. **Tamed Sun-Drake Elevated Sky-Map Selector**: Once the party earns their Tamed Sun-Drakes in The Mythic Dawn during Act II, how is the sky-map travel selector invoked (from exterior Zones, roosts, or HUD), how does it visually represent Vaelora's three Realms, mountain ridges, and central sea, and how does it distinguish standard Waygate destinations from Sun-Drake-only high-altitude dungeons, hidden Titan sanctuaries, and The Sunken Reliquary?

## Answer

Decided 2026-11-18 by Claude; the user delegated the calls. *(judgment)* marks a call the design docs don't settle.

**This was resolved as a design decision, not a built prototype.** At implementation time, build the Vaelora Map screen first with placeholder art and pins, and play it before wiring real destinations. If it feels wrong in hand, reopen §2.

### 1. Titan Waygate interaction

- **First touch re-inscribes.** A short rune animation plays, the Waygate is added to `WorldMemory.discoveredWaygateIds`, and the game autosaves (`qol-and-ux.md`).
- **Every touch rests.** HP and INS restore, non-boss field enemies respawn (the rule from [#01](./01-zone-graph-and-transitions.md) §3), and the game autosaves. Resting is automatic, not a menu choice, so touching a Waygate is always one button. *(judgment)*
- A small menu then opens:
  - **Travel**: opens the Vaelora Map (§2) in Waygate view. Pick a discovered Waygate. The same 250ms fade as border exits plays, and the party arrives at that Waygate's spawn anchor. Travel is free.
  - **Respec Talents**: opens the Talent tab in respec mode. All points are refunded, and a one-screen summary shows what changed before closing (`qol-and-ux.md`).
  - **Leave**.
- The Grand Archive's **Central Waygate Plaza** is an ordinary Waygate. It reaches every discovered Waygate, like any other one.
- Current code: the quarry Waygate's rest logic (`src/main.ts` ~420–430) becomes this flow, and the Waygate moves to the Kingsroad Pass per [#05](./05-act-one-progression-and-zones.md).

### 2. The Vaelora Map and Sun-Drake travel

**One screen, two views.** A single illustrated, non-walkable **Vaelora Map** serves both kinds of travel, so ADR-0001 holds: there is no second movement or collision scale. The map shows:
- the three Realms in their palettes: Dawn emerald/amber, Obsidian basalt/magma, Astral white sand/violet
- the mountain ridges between them
- the central sea
- the Grand Archive crater

**Waygate view** (from a Waygate) shows only discovered Waygate pins.

**Sky view** (Sun-Drakes):
- **Earned** at the Sun-Scale Hold Wyvern Roosts by a scene that adds the beat `sun_drakes_tamed`.
- **How to call:**
  - From any Zone marked `openSky: true` (towns, Warzone Approaches, other exteriors), press a HUD key (*Call the Sun-Drakes*), shown only after `sun_drakes_tamed`.
  - Roost NPCs in each Regional Hub offer the same.
  - Not available inside dungeons or interiors; the player walks out first. *(judgment)*
- **Pins:**
  - **Waygate pins** (arch icon): every discovered Waygate. Sky view is a superset of Waygate view.
  - **Sky-only pins** (wing icon): high-altitude dungeons, hidden Titan sanctuaries, The Sunken Reliquary. Only Sun-Drakes reach them.
  - Hidden sanctuaries show from the start of sky travel as unnamed glints. Visiting one names it. Nothing is hidden behind an off-screen hint, in line with `research.md` on guide-dependent content. *(judgment)*
  - **The Sunken Reliquary** shows as a locked pin from `vault_race_begun` ("needs Sun-Drakes"), so the goal is visible before it is reachable.
  - **Act III:** the Spire of the First Word and the Coalition War Camp pins appear `after: 'seraphine_betrayal'`. The Grand Archive pin is replaced, matching #01's exit redirects. The sky gets the Edict overcast palette.
- **Arriving:** pick a pin, a short drake-flight transition plays (clouds parting, about 1s), then the destination Zone's landing spawn anchor. *(judgment)*
- **Data:** `SkyDestination { id, zoneId, spawnId, kind: 'WAYGATE' | 'SKY_ONLY', mapX, mapY, after?: StoryBeat, until?: StoryBeat }`. Waygate pins come from `discoveredWaygateIds`. Sky-only pins are a static list filtered by beats.

### Doc fix made while resolving

`graphics-and-art-direction.md` §3 still described a "Classic Traversable Continental Overworld Map" with free flight, which contradicts ADR-0001. I rewrote that section to describe the Vaelora Map selector above. `CONTEXT.md` gains **Vaelora Map**.
