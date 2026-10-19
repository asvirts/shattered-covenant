# Graphics, Art Direction & UI Presentation

## 1. Core Visual Philosophy: "Hi-Bit" Pixel Art + Dynamic 2D Lighting

***Shattered Covenant*** pairs golden-age 16/32-bit pixel art craftsmanship (inspired by *Sea of Stars*, *Chained Echoes*, and *Suikoden II*) with bold *World of Warcraft* high-fantasy silhouettes and modern 2D lighting pipelines.

### Rendering & Shader Pipeline
* **Base Resolution & Pixel Grid:** Crisp integer-scaled pixel art (targeting a base internal viewport of `640×360` upscaled cleanly to `1080p`/`4K`) so pixels never shimmer or warp.
* **Dynamic 2D Point Lights & Normal-Mapped Tiles:**
  * Dungeon tiles, Wardstones, and boss sprites include subtle 2D normal/specular maps so **Kaelen's Heart-Shard Gauntlet**, **Vesper's Astral Orbs**, and molten **Obsidian** lava rivers cast real-time warm or cool rim-lighting onto nearby sprites.
* **Bloom & Particle Shaders:**
  * Selective emissive bloom on carved runes, spell impacts, and Ley-Line surges without washing out the crisp underlying pixel art.

---

## 2. Character & Enemy Sprite Specifications

### Heroic Proportions (`32×48` to `48×64` Base Canvas)
* Rather than chibi 2-head-tall sprites, playable characters use **Heroic 3.5-to-4-head-tall proportions**, consistent across both field exploration and combat.
* **Warcraft-Inspired Silhouette Readability:**
  * **Kaelen Vance:** Broad-shouldered mason silhouette; heavy leather-and-basalt apron, oversized glowing **Heart-Shard Gauntlet** on his left arm, and two-handed **Chisel-Maul** resting on his shoulder.
  * **Sura:** Tall, athletic Valkyrie silhouette; golden sun-scale shoulder guards, flowing crimson-and-emerald plume, and long **Great-Spear** held diagonally.
  * **Vesper:** Ethereal floating posture (feet hover slightly above the ground); body of glowing cyan/violet starlight wrapped in trailing runic cloth bindings, orbited by **Floating Astral Orbs**.
  * **Cassian Thorne:** Sharp, aristocratic silhouette; high-collared dark Imperial Inquisitor longcoat with brass trim, levitating **Grimoire Cylinder** at his hip, and glowing **Aether-Quill**.

### Visibly Evolving Signature Weapons (5 Tiers per Hero)
* Characters keep their iconic core outfit throughout the campaign (keeping animation production clean and cohesive), while their **Signature Weapon Sprite** is drawn on a modular layer that visibly evolves across all **5 Forging Tiers**:
  * *Tier 1 (Act I):* Weathered iron, bronze, and pale quartz.
  * *Tier 2 (Frontier Forge):* Runed basalt, etched amber, and refracted glass.
  * *Tier 3 (Titan Vault Forge):* Molten dark-iron, wyvern-fang gold, and pulsing starlight.
  * *Tier 4 (Tri-Realm Masterwork):* Tri-color ley-line channels coursing down the weapon shaft.
  * *Tier 5 (Act III Ultimate):* Radiant **Unwritten Covenant** weapons with custom idle particle trails.

### Enemy & Boss Sprite Scale
* **Standard Monsters:** `32×48` up to `64×64` pixels (e.g., Ironclad Hounds, Dawn Sun-Stalkers, Astral Wraiths).
* **Dungeon Mid-Bosses:** `96×96` pixels.
* **Titan Vault Guardians & Act Bosses:** Massive `160×160` to `240×200` multi-part pixel sprites (e.g., *Ignis-Prime*'s four independent molten arms and crackable core, or *High Archon Seraphine*'s towering Covenant Avatar).

---

## 3. World Map & Zone Presentation

### Full-Scale Explorable Zones (Towns, Wild Routes & Titan Vaults)
* **Top-Down 3/4 Orthographic Perspective** with rich multi-tiered verticality (cliffs, rope bridges, crane elevators, magma viaducts).
* **Visual Wardstone Transformations:** When Kaelen attunes a local **Wardstone** with his gauntlet, a sweeping rune-wave shader ripples across the screen as animated pixel tiles update in real time:
  * **Dawn Attunement:** Giant flowering sun-vines burst out of cliff walls to form bridges.
  * **Obsidian Attunement:** Glowing lava falls cool and darken into stepped basalt paths.
  * **Astral Attunement:** Sunken crystal platforms ignite with cyan starlight and levitate into place.

### Classic Traversable Continental Overworld Map
* Exiting a town or dungeon transitions to a **Classic Miniature Overworld Map** of **Vaelora**:
  * Shows the distinct biome borders between the emerald canopies of **The Mythic Dawn**, the volcanic obsidian peaks of **The Obsidian Reign**, the white-sand crystal badlands of **The Astral Wastes**, and the central crater of **The Grand Archive**.
  * In Act II, boarding your tamed **Sun-Drakes** lifts the party into the overworld sky layer—complete with parallax cloud shadows—allowing free flight over mountain ranges and the central sea to discover hidden Titan shrines and optional superboss lairs.

---

## 4. Battle Screen Staging & Domain Shift Visuals

### Snappy Encounter Transition
* Touching an enemy (or landing a **Field Ambush Strike** with Kaelen's maul) triggers a snappy **0.5-second crystalline rune-shatter transition** into a dedicated **Battle Stage**.
* **Battle Layout:**
  * **Left Side:** All **4 Party Members** arranged in a clean staggered diagonal formation with unobstructed sightlines for animations and protective barriers.
  * **Right Side:** Enemy formation or colossal Titan boss sprite.

### Combat Readability & Speed
* **Input queueing:** While the previous character's animation plays, the player can already queue the next hero's command; the cursor never waits for a spell to finish.
* **Turbo:** A built-in **2× / 4×** battle-speed toggle is available from the pause menu and persists across sessions ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Skip what you've seen:** spell animations are skippable after their first viewing, and enemy death dissolves never block input.
* **Transitions:** the 0.5-second rune-shatter transition doubles as the loading veil—no camera pans or 10-second battle-intro swirls ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).

### "Strike the Stone" — Full Arena Transformation
When a party member activates a **Ley-Line Domain Shift**, they strike the Heart-Shard, sending a shockwave across the screen that shatters the Battle Stage background and floor into the chosen domain:

| Active Domain | Background & Floor Transformation | Lighting & Particle Pass |
| :--- | :--- | :--- |
| 🔴 **The Mythic Dawn** | Giant roots and glowing sun-blossoms burst through the arena floor; golden canopy shafts fill the backdrop. | Warm amber sunbeams from upper-left; drifting golden pollen and emerald leaf particles. |
| 🟡 **The Obsidian Reign** | Jagged blackrock pillars and brass forge-grates lock into the ground; rivers of magma glow beneath the cracks. | High-contrast crimson/orange under-lighting; rising embers, heat-haze distortion, and sparks. |
| 🔵 **The Astral Wastes** | The floor dissolves into white star-sand and floating cyan crystal shards against a deep nebula void. | Cool cyan/violet rim-lighting; zero-gravity floating dust motes and aurora ribbons. |

---

## 5. Portraits, UI & Combat Telegraphs

### Expressive Hi-Bit Pixel Portraits
* Dialogue boxes, the **CTB Timeline Bar**, and the menu use **hand-pixelated bust portraits** (`96×96` pixels) to keep the visual aesthetic 100% unified with the sprite work.
* Each main character has **6–8 expression variants** (Neutral, Determined, Fierce/Shouting, Wounded, Smirking, Shocked, Somber).

### Carved Basalt & Brass UI Frames
* Menus and HUD elements are styled after **chiselled dark stone framed in weathered brass**—reinforcing the masonry and Covenant Stone motif.
* **Reactive Domain Trim:** In combat, the carved rune channels running along the border of the CTB Timeline Bar and Character Status Cards dynamically change color to match the active **Ley-Line Domain** (**Amber-Gold** for Dawn, **Molten Crimson** for Obsidian, **Cyan Starlight** for Astral).
* **Readable Combat Telegraphs:**
  * **Enemy Stability Meter:** Displayed directly beneath each enemy as physical stone rune-blocks (`[ ❖ ❖ ❖ ❖ ]`) that visibly crack and shatter into dust when broken.
  * **Threat & Intent Lines:** Curved pixel-shader arc lines briefly pulse between an enemy's portrait and their intended target (or across the whole party for AoE cleaves) when hovered or when a boss begins charging an attack.

### Menus, Logs & Recaps
* **Transparent tooltips:** every skill, Glyph, and stat exposes exact multipliers, damage type, infliction %, and a plain-language explanation—viewable before committing a turn ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Dialogue log:** a scrollable backlog of recent dialogue, reachable from the pause menu.
* **Story So Far:** on load, a one-screen journal recap of the current objective and recent beats.
* **Pause-first cutscenes:** Start pauses rather than skips; skipping requires a second confirm.
* **Face-button command mapping:** the four main battle command categories map to the controller's face buttons for instant, eyes-free input flow ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).

> The full accessibility and quality-of-life baseline lives in [`qol-and-ux.md`](./qol-and-ux.md).
