# Three-Act World Phase State Machine, Story Flags & Dialogue Scripting

Type: grilling
Label: wayfinder:grilling
Status: resolved
Blocked by: 01

## Question

Building on [Zone Graph Topology, Multi-Map Data Model & Border Transitions](./01-zone-graph-and-transitions.md), how should the game represent and transition across the three global World Phases (`ACT_I_QUARRY_FALL`, `ACT_II_VAULT_RACE`, `ACT_III_UNWRITTEN_COVENANT`), quest flags, and narrative cutscenes?

Specifically, we need to decide:
1. **World Phase & Story Flag Model**: What data structure tracks the active `WorldPhase`, which of the Four Great Shards have been recovered, regional faction statuses, and cutscene/dialogue completion flags?
2. **Zone Mutations Across World Phases**: How does a Zone swap or mutate its NPCs, enemies, exits, and visual atmosphere when the World Phase advances—most critically when High Archon Seraphine Thorne betrays the party at the end of Act II, transforming The Grand Archive into The Spire of the First Word and establishing the Tri-Realm Coalition War Camp on the crater rim?
3. **Cutscene & Dialogue Trigger Architecture**: Beyond simple one-off `DIALOGUES` arrays in `src/data.ts`, how should branching/conditional dialogues, multi-step scripted cutscenes (such as the opening Ley-Line Cataclysm and the Act II Midpoint Twist), and party recruitment events be authored and triggered?

## Answer

Decided 2026-11-18 in a grilling session with the user (6 questions, one at a time). Items marked *(default)* were not asked; they follow from the answers and can be reopened.

### 1. Story progress: Story Beats, World Phase derived

- `WorldMemory` (`src/zones.ts`) gains `beats = new Set<StoryBeat>()`. This replaces the `storyFlags` name in [#01](./01-zone-graph-and-transitions.md) §3.
- `StoryBeat` is a closed string-literal union in `src/types.ts`, e.g. `'shard_fell' | 'orin_petrified' | 'sura_joined' | 'vault_race_begun' | 'shard_ziggurat_recovered' | 'seraphine_betrayal' | …`. A misspelled beat is a compile error.
- Beats are only ever added, never removed.
- The **World Phase** is never stored. `worldPhase(world)` derives it:
  - `seraphine_betrayal` present → `ACT_III_UNWRITTEN_COVENANT`
  - `vault_race_begun` present → `ACT_II_VAULT_RACE`
  - otherwise → `ACT_I_QUARRY_FALL`
- *(default)* `vault_race_begun` is added at the end of the Grand Archive arrival scene, when Vesper and Cassian join and Seraphine gives the mission. `seraphine_betrayal` is added at the end of the Midpoint Twist scene.
- Recovered Great Shards, recruitments, faction changes (e.g. a Realm leader joining the Tri-Realm Coalition) and "this one-time scene has played" are all beats. There is no separate shard set, faction table or seen-scene list.
- The existing field memory (`openedChestIds`, `defeatedBossIds`, `defeatedFieldEnemyIds`, `wardstoneAttunement`, `discoveredWaygateIds`) stays as it is. It is world memory, not story.

### 2. Recruitment and the Heart-Shard move into beats

- Remove `Hero.recruited` and `Hero.presentation` (and the `HeroPresentation` type's use on `Hero`).
- Add read helpers over beats, e.g. `hasJoined(world, heroId)` (Kaelen always true; others via `<hero>_joined`) and `shardFused(world)` (`shard_fell`). Switch the ~30 existing reads in `main.ts`, `map.ts`, `battle.ts` and `sprites.ts` to them.
- `DialogueLine.look` goes away. The scene adds `shard_fell` between lines instead (see §4).

### 3. Zone changes: beat-gated layers

- `ZoneDefinition` keeps its base definition and gains an ordered `layers` list.
- Each layer has a condition and a set of changes. *(default)* Conditions are `after` (every listed beat present) and `until` (the listed beat absent); both optional.
- A layer can add or remove NPCs, field enemies, exits and triggers, redirect an exit to a different target, and swap `biomePalette` / `audioProfile`.
- On Zone load, every layer whose condition holds is applied on top of the base, in list order.
- The Zone ID never changes, so Wardstone, chest and enemy memory carries across layers.
- The big Act III swap stays as decided in #01: `coalition_war_camp` and `spire_of_the_first_word` are their own Zones, reached by layers that redirect exits once `seraphine_betrayal` is present.
- *(default)* Zones from earlier Acts stay reachable in later Acts, in line with the no-missable-content rule in `locations-and-dungeons.md`.

### 4. Scenes are async TypeScript functions

- A **Scene** is `async (s: Scene) => void`. The `Scene` helper offers at least `say(lines)`, `addBeat(beat)`, `has(beat)`, `fade`/`flash`, `wait(ms)` and `battle(encounter)` (resolves with the outcome). More helpers are added as scenes need them.
- Plain conversations stay as `DIALOGUES` line arrays in `src/data.ts`; scenes play them with `say`.
- Branching and ordering are ordinary code: `if (s.has('orin_petrified')) …`.
- *(default)* Only scenes add beats. Nothing else writes to `world.beats`, so every story change has one place to look.
- *(default)* Saving mid-scene is not supported. Saves happen between scenes (save format is still "Not yet specified" on the map).
- The existing completion callbacks (`recruit_sura` etc.) and the `look`-driven shardfall become scenes.

### 5. Triggers are declared in Zone data

- A Zone's base definition and its layers carry `triggers`: `{ on: 'talk' | 'interact' | 'enter' | 'step', target (npc id / interactable id / tile area), after?, until?, scene }`.
- When an event fires, the first trigger whose conditions hold runs its scene.
- A one-time scene is gated with `until: '<beat the scene adds>'`, so "already played" is saved with the rest of the beats.
- This replaces the if-chains in `main.ts` that pick dialogue by what the player is standing next to.

### 6. No dialogue choices for now

- Scenes are linear. Variety comes from beats, not player picks. This keeps the beat list closed and nothing missable.
- A `choose` helper can be added to `Scene` later without changing anything above.

### Recorded in

- [ADR-0004](../../../docs/adr/0004-story-beats-derive-world-phase.md)
- `CONTEXT.md`: **Story Beat**, **Scene**; **World Phase** entry updated.

### Noticed while resolving (for #05)

- The current build recruits Cassian and Vesper in Act I at Wardstones (`src/main.ts` ~365–415). `world.md` has them join at the Grand Archive at the start of Act II. That is #05's call, but under this answer it becomes moving two triggers and their scenes, not untangling callbacks.
