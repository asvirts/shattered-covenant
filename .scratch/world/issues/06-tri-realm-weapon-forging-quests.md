# Master Forges & Tri-Realm Weapon Forging Quest Mechanics

Type: grilling
Label: wayfinder:grilling
Status: resolved
Blocked by: 03, 04

## Question

With [Titan Waygate Network & Tamed Sun-Drake Sky-Map Selector](./03-waygate-and-sun-drake-traversal.md) and [Three-Act World Phase State Machine, Story Flags & Dialogue Scripting](./04-world-phase-and-narrative-state.md) settled, how should the 5-tier weapon evolution system integrate with regional Master Forges and the signature Tri-Realm Weapon Forging sidequests across Vaelora?

Specifically, we need to decide:
1. **Regional Master Forges & Tiers 1–3**: Which regional hubs house Master Forges (e.g., Oakhaven Masons' Guild, The Grand Archive / Coalition War Camp, Cinderhold, Sun-Scale Hold, Star-Bound Conclave), and what combination of Heart-Ore and boss cores unlocks Weapon Tiers 2 and 3?
2. **Tier 4 Tri-Realm Forging Rituals**: Where are the dormant Tier 4 weapon frames discovered for Kaelen, Sura, Vesper, and Cassian, and how does the player execute the 3-step Tri-Realm Forging ritual (tempering in The Obsidian Reign, infusing with living amber in The Mythic Dawn, and etching star-runes in The Astral Wastes) in the world and UI?
3. **Tier 5 Act III Ultimate Awakenings**: How does each hero's Tier 5 ultimate weapon awakening tie into their personal Act III Coalition rally arc?

## Answer

Decided 2026-11-18 by Claude; the user delegated the calls. *(judgment)* marks a call the design docs don't settle.

**Core rule:** each tier is gated by **where** you forge and **what key item** you bring. Heart-Ore stays the currency. Today's costs (`idx × 2` Heart-Ore, `src/main.ts` ~1066) stay as placeholders until a balance pass. Key items are not used up. Forging progress that is story or sidequest progress is recorded as Story Beats added by forge Scenes ([#04](./04-world-phase-and-narrative-state.md)).

### 1. Master Forges and Tiers 1–3

| Tier | Where | Needs | Who |
| :--- | :--- | :--- | :--- |
| 1 | — | Starting weapon | All |
| 2 | **Oakhaven Masons' Guild forge** (the first Blacksmith Forge) | Heart-Ore + **Basilisk Core** (Crystal-Gorged Basilisk drop, [#05](./05-act-one-progression-and-zones.md)) | Kaelen, Sura |
| 3 | The **Titan Forge** at the heart of each of the first three Titan Vaults, reachable after its boss | Heart-Ore + that Vault's **Vault Core** | Heroes native to that Vault's Realm |

- This matches both existing docs. `progression-and-items.md` has Kaelen's Tier 2 "Forged in Oakhaven" and Tier 3 "Forged in the Halls of the First Anvil". `graphics-and-art-direction.md` has Tier 2 as the "Frontier Forge" and Tier 3 as the "Titan Vault Forge".
- **Tier 3 by Realm** *(judgment)*:
  - Halls of the First Anvil (Obsidian): Kaelen and Cassian.
  - Sun-Root Ziggurat (Dawn): Sura.
  - Star-Glass Nexus (Astral): Vesper.
  - So each Vault, in whatever order it is done, is the power spike for its own heroes. A Titan Forge stays usable after the Vault is cleared; the Waygate brings the party back.
- **Vesper and Cassian join with Tier 2 weapons** at the Archive Council, in line with [#05](./05-act-one-progression-and-zones.md)'s joining-level rule, so no hero starts behind. *(judgment)*
- **Regional Hub Master Forges** (Sun-Scale Hold, Cinderhold, Star-Bound Conclave) sell and upgrade armor and host the Tri-Realm Forging steps (§2). The Grand Archive has no forge; it is a library. In Act III the **Coalition War Camp** gets a forge, where the hub facilities relocate.
- The current quarry "Master Anvil" in code becomes the Oakhaven Guild forge.

### 2. Tier 4: Tri-Realm Forging

- **Frames:** each hero's dormant Tier 4 frame lies in one hidden Titan sanctuary reachable only by Sun-Drake ([#03](./03-waygate-and-sun-drake-traversal.md)). That gives four sanctuaries their headline reward, and partly settles the map's "Hidden Titan Sanctuaries" fog. Finding one plays a short scene and adds `frame_<hero>_found`. *(judgment)*
- **The three steps**, each at a Regional Hub Master Forge, each a short scene that adds a beat:
  - **Temper** at Cinderhold (`frame_<hero>_tempered`)
  - **Infuse with living amber** at Sun-Scale Hold (`frame_<hero>_infused`)
  - **Etch star-runes** at the Star-Bound Conclave (`frame_<hero>_etched`)
- Each step needs one Realm material gathered on that Realm's Warzone Approach (e.g. magma-glass, living amber, star-salt), plus Heart-Ore. That makes it a short trip, not just a menu purchase. *(judgment)*
- **Steps can be done in any order.** `world.md` lists them in one order; that is the canonical telling, not a lock. *(judgment)*
- When all three beats are present for a hero, their weapon becomes Tier 4.
- **UI:** the Forge tab's Tier 4 row shows the frame (found or not) and three step marks (hollow or filled), each labelled with its forge's location.
- **Availability:** from `sun_drakes_tamed` (Act II), and still open in Act III.
- **Tier 4 is optional power.** Act III and the Spire are balanced for Tier 3. *(judgment)*

### 3. Tier 5: Act III awakenings

- A hero's weapon awakens to Tier 5 in the scene that closes their personal Act III arc (`characters.md`):
  - Kaelen: refusing Seraphine's bargain.
  - Sura: defeating Raksha and claiming the Dawn's banner.
  - Vesper: their Act III turning point.
  - Cassian: breaking his mother's Edict Seals.
- No Heart-Ore is needed. *(judgment)*
- **Tier 5 needs that hero's Tier 4.** If the Tri-Realm Forging isn't finished when the arc scene plays, the scene still plays. The weapon awakens later, when the forging is finished at the Coalition War Camp forge, so nothing is missable. *(judgment)*
- **Open, moved to the map's fog:** Vesper's only Act III beat in `characters.md` is the finale choice. Cassian's sits inside the Spire. Their arc-closing beats get defined with the Act III Coalition rally questlines (already "Not yet specified" on the map).
