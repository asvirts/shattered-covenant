# Zone Graph Topology, Multi-Map Data Model & Border Transitions

Type: grilling
Label: wayfinder:grilling
Status: open

## Question

How should the single-screen `QuarryMap` class in `src/map.ts` be generalized into a multi-Zone architecture capable of representing all interconnected Zones across Vaelora?

Specifically, we need to decide:
1. **Zone Dimensions & Camera Viewport**: Do all Zones remain fixed single-screen 38×28 tile canvases (`TILE_SIZE = 24`), or should the engine support larger scrolling tile grids with a camera viewport following Kaelen?
2. **Zone Graph & Border Transitions**: What is the complete canonical graph of local Zones across the Frontier Borderlands, The Grand Archive, and the three Realms, and how do directional border exits and named spawn anchors link them?
3. **Zone Lifecycle & Persistence**: When transitioning between Zones, what state persists permanently (chests, defeated bosses, discovered Waygates, story triggers) vs. resets on Zone re-entry or Waygate rest (patrolling field enemies, temporary puzzle states)?
4. **Biome Visual & Audio Palettes**: How does each Zone declare its Realm aesthetic palette and ambient music/SFX profile (Dawn emerald/amber, Obsidian basalt/magma, Astral white sand/violet neon, Grand Archive marble/obsidian)?
