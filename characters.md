# Main Party & Key Characters

## Overview
All **four main party members** fight together simultaneously on the battlefield (4-hero active party, no benching, no front/back row restrictions—aggro and positioning are controlled actively via skills and taunts). Each character represents one of the continent's great magical traditions and features a **2-branch *World of Warcraft*-style Class Talent Tree** alongside their personal **Glyph Tablet**.

| Character | Title | Territory | Class | Signature Weapon | Talent Spec A | Talent Spec B |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kaelen Vance** | *The Faultline Mason* | The Obsidian Reign | Runic Mason | Heavy Chisel-Maul & Heart-Shard Gauntlet | **Wardstone Bulwark** *(Tank)* | **Faultbreaker** *(Bruiser)* |
| **Sura** | *The Sun-Scale Valkyrie* | The Mythic Dawn | Sky-Lancer | Bronze Great-Spear & Sun-Javelins | **Tempest Dragoon** *(Burst DPS)* | **Sun-Scale Huntress** *(Bleed/Haste)* |
| **Vesper** | *The Star-Bound Mystic* | The Astral Wastes | Astral Weaver | Floating Astral Orbs & Star-Charts | **Loomkeeper** *(Healer/Shields)* | **Astrolabe Savant** *(Timeline Control)* |
| **Cassian Thorne** | *The Defector Scribe* | The Obsidian Reign | Inkwright | Aether-Quill, Grimoire & Rapier-Stylus | **Edict Inquisitor** *(Arcane Burst/CC)* | **Blood-Scribe** *(DoTs/Life-Tap)* |

### Ensemble, Not Four Solos
The fixed four-hero party is a deliberate answer to the "ensemble" fantasy: because every hero is always present, the game invests in **cross-party banter** instead of a bench. Each hero's arc includes scripted party reactions—Vesper quietly correcting Cassian's Imperial diction, Sura baiting Kaelen about masonry, Cassian needling Vesper's fractured memory—so the cast feels like a group rather than four parallel stories ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1edumg2/after_trying_sea_of_stars_i_thought_jrpgs_were/)). Optional camp **Skit** scenes unlock as pairs accumulate shared battles, and key story beats always give every hero a line.

> [ADR-0002](./docs/adr/0002-fixed-four-hero-party.md) records why the roster is fixed at four rather than expandable.

---

## 1. Kaelen Vance — *The Faultline Mason*

* **Territory of Origin:** The Obsidian Reign (Oakhaven Quarry)
* **Class:** Runic Mason
* **Signature Weapon:** **Heavy Chisel-Maul & The Heart-Shard Gauntlet** — Wields a massive two-handed stone-splitting maul counterbalanced by the glowing Heart-Shard fused to his left mason gauntlet.

### Combat Profile & Specs
* **Primary Stats:** Highest **Vitality (`VIT`)** and **Grit (`GRT`)**.
* **Domain Resonance (Obsidian Reign):** *Forgeborn Calibration* — Attacks restore 10% `INS` and chip +1 bonus Stability.
* **Unique Command — `Chisel`:** Strikes an enemy to crack 1 Stability segment and generate Taunt/Threat; if the target is already **Shattered**, extracts a temporary Rune Barrier for the party and charges the **Domain Gauge** by +20%.
* **Talent Tree Branches:**
  * 🛡️ **Spec A: Wardstone Bulwark (Protection / Tank):** Unlocks active Taunts, party-wide basalt barriers, damage interception (*Guard*), and counter-slams whenever Kaelen takes a hit.
  * 🔨 **Spec B: Faultbreaker (Arms / Heavy Bruiser):** Focuses on crushing two-handed maul slams, AoE shockwaves that crack Stability across all foes, and massive execution multipliers against **Shattered** targets.

### Personal Narrative Arc
* **Act I:** Driven by duty and guilt to save his mentor, **Master Orin**, who shoved Kaelen out of the way when the Heart-Shard fell into Oakhaven's quarry and was petrified inside volatile rune-crystal.
* **Act II:** Discovers as they unseal the Four Titan Vaults that the imperial Wardstones he spent his life maintaining were secretly designed to siphon ley-line vitality away from the borderlands.
* **Act III:** Offered a bargain by High Archon Seraphine to restore Master Orin immediately in exchange for surrendering the Heart-Shard, Kaelen hears Orin's resonant pulse inside the crystal urging him to refuse—realizing a true mason builds shelters to protect the living, not monuments to enslave them.

---

## 2. Sura of the Sun-Scales — *The Sun-Scale Valkyrie*

* **Territory of Origin:** The Mythic Dawn (The Sun-Root Canopy)
* **Class:** Sky-Lancer
* **Signature Weapon:** **Sun-Forged Great-Spear & Atlatl Javelins** — Tipped with living wyvern fangs and golden amber resonators.

### Combat Profile & Specs
* **Primary Stats:** High **Might (`MGT`)** and **Tempo (`TMP`)**.
* **Domain Resonance (Mythic Dawn):** *Apex Predator* — Her aerial `Sky-Leap` dives resolve instantly with 0 turn delay.
* **Unique Command — `Sky-Leap`:** Vaults high above the arena onto a chosen slot of the CTB Timeline, becoming untargetable by ground attacks before slamming down for high physical/solar damage.
* **Talent Tree Branches:**
  * ⚡ **Spec A: Tempest Dragoon (Aerial Burst / Single-Target Striker):** Empowers `Sky-Leap` with armor-piercing solar dives, guaranteed critical strikes against airborne or large Titan/Beast targets, and chain-jumps on kill.
  * 🩸 **Spec B: Sun-Scale Huntress (Savagery / Bleeds & Pack Haste):** Grounded multi-hit spear flurries, stacking *Rending Bleed* and *Sunfire* DoTs, and war-cries that accelerate the entire party's `TMP`.

### Personal Narrative Arc
* **Act I:** An elite outrider bound by a sacred blood-oath to the Dawn's **Warlord Raksha**, sent across the border into Oakhaven to seize the fallen Heart-Shard. Forced to team up with Kaelen when Imperial Inquisitors ambush them both.
* **Act II:** At the **Sun-Root Ziggurat**, Sura discovers that Warlord Raksha intends to use the Dawn's Great Shard not to defend their forest, but to unleash a primal solar cataclysm that would burn every town in the Obsidian Reign (including innocent border folk like Oakhaven) to ash.
* **Act III:** Sura breaks her sacred blood-oath, defeats her former mentor Raksha in single combat to claim the Dawn's banner, and rallies the Sun-Scale Wyvern riders to join the Tri-Realm Coalition.

---

## 3. Vesper — *The Star-Bound Mystic*

* **Territory of Origin:** The Astral Wastes (The Grand Archive / Star-Glass Spires)
* **Class:** Astral Weaver
* **Signature Weapon:** **Floating Astral Orbs & Runic Star-Charts** — Orbs of refracted starlight and levitating celestial scrolls that orbit Vesper's hands.

### Combat Profile & Specs
* **Primary Stats:** Highest **Tempo (`TMP`)** and **Warding (`WRD`)**.
* **Domain Resonance (Astral Wastes):** *Zero-Point Conduit* — Single-target heals and shielding spells automatically splash to all allies at 50% potency.
* **Unique Command — `Echo Cast`:** Records the last spell or skill cast by an ally and replays it at 60% potency for half `INS` cost.
* **Talent Tree Branches:**
  * ✨ **Spec A: Loomkeeper (Healer / Starlight Shields & Restoration):** Specializes in direct starlight healing, damage-absorbing *Astral Wraps* (shields that prevent stagger), and party-wide debuff cleansing.
  * ⏳ **Spec B: Astrolabe Savant (Tactician / Timeline & Ley-Line Control):** Manipulates the CTB Timeline bar (pulling allies forward, shoving enemies into hazard slots, swapping turn order) and extends **Ley-Line Domain Shift** durations.

### Personal Narrative Arc
* **Act II (Introduction):** Once a brilliant mortal scholar at the Grand Archive, Vesper's physical body was transmuted into living starlight wrapped in runic cloth bindings (like *Warcraft*'s Ethereals) during the shattering of the Edict Pillar—leaving them with fractured memories of the disaster.
* **Midpoint Twist:** When all Four Great Shards resonate together at the end of Act II, the mental seal on Vesper's bindings breaks: Vesper was the sole eyewitness who walked in on **High Archon Seraphine** sabotaging the Edict Pillar, and Seraphine blasted Vesper with raw astral energy to silence them rather than kill them.
* **Act III:** Though offered the chance to use the reassembled Pillar to restore their flesh-and-blood mortal body, Vesper chooses to stay an Ethereal Star-Bound Mystic and pours their starlight into Kaelen's gauntlet to shatter the Pillar forever.

---

## 4. Cassian Thorne — *The Defector Scribe*

* **Territory of Origin:** The Obsidian Reign (The Grand Archive / Imperial Capital)
* **Class:** Inkwright
* **Signature Weapon:** **Aether-Quill, Grimoire Cylinder & Rapier-Stylus** — Engraves glowing runes of law and blood-ink in mid-air that detonate on impact.

### Combat Profile & Specs
* **Primary Stats:** Highest **Inscription (`INS`)** and **Resonance (`RES`)**. Starts with +1 extra unlocked socket on his **Glyph Tablet**.
* **Domain Resonance (Obsidian Reign):** *Forgeborn Calibration* — Attacks restore 10% `INS` and chip +1 bonus Stability.
* **Unique Command — `Redact`:** Strips one active buff from an enemy and converts it into a stack of **Royal Ink**, increasing the damage or Stability break of Cassian's next spell by +30%.
* **Talent Tree Branches:**
  * 📜 **Spec A: Edict Inquisitor (Arcane Burst & Crowd Control):** High-damage Imperial rune-blasts, silencing enemy casters, locking enemy turn portraits in place, and amplifying **Glyph Synergy Combos**.
  * 🖋️ **Spec B: Blood-Scribe (Affliction / Cursed DoTs & Life-Tap):** Uses forbidden blood-ink to stack multi-turn corruption DoTs, drain enemy vitality to heal the party, and burn his own HP to instantly refill his `INS` mana pool.

### Personal Narrative Arc
* **Act II (Introduction):** A sharp-tongued former Inquisitor of the High Scribes who defected after uncovering sealed Titan tablets proving the High Scribes were manipulating the three realms into war.
* **Midpoint Twist:** High Archon Seraphine Thorne is Cassian's estranged mother—and she knowingly allowed him to escape with the Titan translations because she knew his conscience would drive him to help Kaelen unlock the Four Titan Vaults for her.
* **Act III:** Steps out of his family's shadow by rejecting the Thorne bloodline's stolen authority, mastering *Unwritten Magic* to break his mother's Edict Seals at the Spire of the First Word.

---

## Key Antagonists & Supporting Cast

* **Master Orin:** Kaelen's gruff, big-hearted mentor in Oakhaven's Masons' Guild. Petrified in volatile rune-crystal during the opening quarry impact.
* **Warlord Raksha of the Sun-Scales (Mythic Dawn Antagonist):** Sura's former commander; a fierce, zealous Dawn warlord who seeks the Great Shards to burn the Obsidian Reign's cities off the map.
* **Forge-Lord Malakor (Obsidian Reign Antagonist):** Commander of the Imperial Dread-Legions at the Halls of the First Anvil, seeking to bind the Great Shards into an unstoppable colossus army.
* **Nexus-Prince Xylar (Astral Wastes Antagonist):** Leader of the rogue Astral Conclave at the Star-Glass Nexus, obsessed with ascending into pure arcane energy regardless of the cost to the mortal world.
* **High Archon Seraphine Thorne (Main Antagonist):** Supreme ruler of the Grand Archive and Cassian's mother. Secretly orchestrated the shattering of the Edict Pillar to bypass its ancient Titan locks and carve a New Covenant under her absolute rule.
