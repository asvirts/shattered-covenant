# Three-Act World Phase State Machine, Story Flags & Dialogue Scripting

Type: grilling
Label: wayfinder:grilling
Status: open
Blocked by: 01

## Question

Building on [Zone Graph Topology, Multi-Map Data Model & Border Transitions](./01-zone-graph-and-transitions.md), how should the game represent and transition across the three global World Phases (`ACT_I_QUARRY_FALL`, `ACT_II_VAULT_RACE`, `ACT_III_UNWRITTEN_COVENANT`), quest flags, and narrative cutscenes?

Specifically, we need to decide:
1. **World Phase & Story Flag Model**: What data structure tracks the active `WorldPhase`, which of the Four Great Shards have been recovered, regional faction statuses, and cutscene/dialogue completion flags?
2. **Zone Mutations Across World Phases**: How does a Zone swap or mutate its NPCs, enemies, exits, and visual atmosphere when the World Phase advances—most critically when High Archon Seraphine Thorne betrays the party at the end of Act II, transforming The Grand Archive into The Spire of the First Word and establishing the Tri-Realm Coalition War Camp on the crater rim?
3. **Cutscene & Dialogue Trigger Architecture**: Beyond simple one-off `DIALOGUES` arrays in `src/data.ts`, how should branching/conditional dialogues, multi-step scripted cutscenes (such as the opening Ley-Line Cataclysm and the Act II Midpoint Twist), and party recruitment events be authored and triggered?
