# Shattered Covenant

**Shattered Covenant** is a classic turn-based fantasy JRPG set on the continent of **Vaelora**, where the shattering of the **Edict Pillar** has plunged three neighboring superpowers—**The Mythic Dawn**, **The Obsidian Reign**, and **The Astral Wastes**—into a race to claim its Four Great Shards and rewrite the magical laws of the world.

This repository contains the playable **Act I Vertical Slice Prototype** (*The Cratered Quarry* & interconnected Zones) alongside the complete game design and domain documentation.

---

## Key Features

- **Interconnected 2D Tile-Grid Zones**: Explore **The Cratered Quarry** in **The Frontier** and traverse border exits into neighboring Zones with biome-specific palettes and procedural ambient audio.
- **Local Wardstone Attunement**: Channel **Dawn**, **Obsidian**, or **Astral** Domains through Kaelen's **Heart-Shard Gauntlet** into Local Wardstones to dynamically transform terrain—growing sun-vine bridges across chasms or cooling molten lava into walkable basalt platforms.
- **Field Encounters & Ambush System**: Spot roaming enemies on the map and land a **Field Ambush Swing** (`F` / `Shift`) to enter battle with bonus initiative and Ley-Line charge.
- **CTB Timeline Combat**: Turn-based tactical battles driven by a visible Conditional Turn-Based (CTB) Timeline, multi-target selection, and Dual Techs.
- **Stability & Shattered Stagger System**: Chip away at enemy **Stability** segments using weakness hits, critical strikes, and Binds. Emptying Stability triggers **Shattered**, cancelling enemy telegraphed actions, knocking them back on the timeline, and multiplying incoming damage.
- **Ley-Line Gauge & Domain Shifts (*Strike the Stone*)**: Build Ley-Line charges during combat and trigger free-action **Domain Shifts** (`DAWN`, `OBSIDIAN`, `ASTRAL`) to rewrite battlefield rules on the fly.
- **Ailments & Body-Part Binds**: Layer status **Ailments** (Poison, Bleed, Burn, Silence, Blind, Slow, Stun, Weaken) and targeted **Binds** (`Head`, `Arm`, `Leg`) that seal specific enemy capabilities.
- **Deep Party Customization**:
  - **4 Fixed Heroes**: Kaelen Vance (*Runic Mason*), Sura (*Sun-Scale Valkyrie*), Vesper (*Star-Bound Mystic*), and Cassian Thorne (*Imperial Inkwright*).
  - **2-Spec Talent Trees**: Unlock passive stat bonuses and active combat skills, with free respecs at **Titan Waygates**.
  - **Glyph Tablet & Realm Synergies**: Socket Runic Glyphs across domains (`DAWN`, `OBSIDIAN`, `ASTRAL`) to activate adjacency synergies (*Solar Forge*, *Star-Fell Meteor*, *Celestial Horizon*) and Dual Techs.
  - **Evolving Signature Weapons**: Reforge and upgrade each hero's signature weapon using **Heart-Ore**.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended) or [Bun](https://bun.sh/)

### Installation

```bash
npm install
```

### Running the Dev Server

Start the Vite development server:

```bash
npm run dev
```

Alternatively, a lightweight zero-dependency Node/TypeScript live-reload server is included:

```bash
node dev-server.mjs
```

Then open `http://localhost:5173` in your browser.

### Building & Typechecking

```bash
# Typecheck with TypeScript
npm run typecheck

# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Controls

| Context | Input | Action |
| :--- | :--- | :--- |
| **Exploration** | `WASD` / `Arrow Keys` | Move party across the Zone |
| **Exploration** | `F` / `Shift` | Field Ambush Swing (pre-emptive strike on nearby enemies) |
| **Exploration** | `Space` / `Enter` / Click | Interact with Local Wardstones, Titan Waygates, chests, or NPCs |
| **Menus** | `C` / `Tab` / `M` | Open / close Party, Talent Trees, Glyph Tablet & Weapon Forge |
| **Menus** | `Esc` | Close active modal |
| **Dialogue & Battle** | `Space` / `Enter` / Click | Advance dialogue / confirm battle results |

---

## Project Structure

```text
.
├── index.html                      # Main application shell, HUD, and modal layouts
├── dev-server.mjs                  # Standalone Node + TypeScript live-reload dev server
├── src/
│   ├── main.ts                     # Game loop, input handling, UI state, and stat calculation
│   ├── types.ts                    # Core TypeScript interfaces and domain types
│   ├── data.ts                     # Heroes, enemies, skills, talents, glyphs, dual techs, dialogue
│   ├── zones.ts                    # Zone definitions, biome palettes, exits, and WorldMemory
│   ├── map.ts                      # 2D tile map rendering, collision, Wardstones, and field enemies
│   ├── battle.ts                   # CTB combat engine, Stability/Shattered, Domains, Ailments/Binds
│   ├── sprites.ts                  # Procedural & sprite-sheet rendering for characters and enemies
│   ├── pixel-art.ts                # Low-level pixel art drawing helpers
│   ├── assets.ts                   # Image asset loader for portraits and sprites
│   ├── audio.ts                    # Web Audio API retro synth SFX and ambient zone audio
│   └── style.css                   # UI styling, realm frames, and animations
├── public/assets/                  # Character and enemy sprite/portrait assets
└── docs/
    ├── adr/                        # Architecture & Design Decision Records
    └── agents/                     # Agent workflow conventions (domain, issue tracker, triage)
```

---

## Design & Domain Documentation

- **[`CONTEXT.md`](./CONTEXT.md)** — Canonical Ubiquitous Language and terminology for Vaelora, exploration, and combat.
- **[`world.md`](./world.md)** — High concept, the Three Realms, core exploration mechanics, and the 3-Act narrative arc.
- **[`characters.md`](./characters.md)** — Hero profiles, narrative arcs, class mechanics, and major antagonists.
- **[`combat.md`](./combat.md)** — CTB timeline math, Ley-Line Gauge, Domain Shifts, Stability/Shattered, Ailments, and Binds.
- **[`progression-and-items.md`](./progression-and-items.md)** — Attributes, 2-spec talent trees, evolving weapons, and the Glyph Tablet system.
- **[`locations-and-dungeons.md`](./locations-and-dungeons.md)** — World topology, Regional Hubs, Warzone Approaches, and the Four Titan Vaults.
- **[`graphics-and-art-direction.md`](./graphics-and-art-direction.md)** — 16:9 HD pixel art direction, Realm color palettes, and UI materials.
- **[`qol-and-ux.md`](./qol-and-ux.md)** — Pacing, field UX, accessibility, and modern JRPG quality-of-life standards.
- **[`docs/adr/`](./docs/adr/)** — Architecture Decision Records:
  - [`0001-interconnected-zones-without-overworld.md`](./docs/adr/0001-interconnected-zones-without-overworld.md)
  - [`0002-fixed-four-hero-party.md`](./docs/adr/0002-fixed-four-hero-party.md)
  - [`0003-player-fair-status-agents.md`](./docs/adr/0003-player-fair-status-agents.md)
