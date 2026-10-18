# Combat System, Stats & Battle Mechanics

## 1. Core Combat Structure

* **Active Party Size:** All **4 Party Members** (**Kaelen**, **Sura**, **Vesper**, **Cassian**) fight together simultaneously once recruited. Nobody sits on the bench.
* **Positioning & Threat (No Row System):** There are no restrictive Front/Back rows. Instead, enemy targeting uses a transparent **Threat / Aggro & Telegraph System** (inspired by *World of Warcraft* dungeon combat fused with classic turn-based JRPGs):
  * Kaelen's **Runic Mason** abilities generate high Threat, Taunt dangerous single-target strikes, and project directional or party-wide barriers.
  * Bosses display **Telegraphed Intent Lines** on the timeline (e.g., *Targeting Highest Threat*, *Targeting Lowest HP*, or *Charging Arena Cleave*), allowing the party to respond with Taunts, `Sky-Leap` dodges, `Redact` interrupts, or Astral shields.
* **Dungeon Encounters & Ambush Strikes:**
  * **Visible Field Enemies:** Monsters patrol visibly in dungeons and overworld zones (no blind random encounters).
  * **Field Ambush (Mason Strike):** Striking an enemy on the field before contact initiates battle with **1 Stability segment already cracked** on all enemies and **+15% Domain Gauge** charge.
  * **Post-Battle Recovery:** After each normal battle, party members automatically recover **25% of their max `INS` (Mana)**. Full HP and `INS` restoration occurs at **Titan Waygates**, Camps, and Towns—encouraging players to actively cast Glyph and Class skills in every fight while still valuing dungeon checkpoints.

---

## 2. The "Chisel & Shift" Timeline (CTB)

Combat runs on a visible **Conditional Turn-Based (CTB) Timeline Bar** at the top of the screen:
* Every ally and enemy portrait slides along the **Timeline Bar** toward the `ACT` threshold based on their **Tempo (`TMP`)** and the **Recovery Delay** of their previous action:
  * **Fast Actions (Quick Strikes, Items, Swift Casts):** Low recovery delay.
  * **Heavy Actions (Maul Slams, Ultimate Edicts, Dual Techs):** High recovery delay.
  * **Free Actions (Striking the Heart-Shard for a Domain Shift):** `0` recovery delay; happens immediately on the active character's turn before they select their main skill.
* **Ley-Line Surge Slots:** Specific slots on the CTB bar periodically glow with ley-line surges (e.g., `+30% Crit`, `Zero INS Cost`, or `Volatile Shock`). Using **Vesper's** timeline manipulation skills or **Astral Glyphs** (`Haste`, `Slow`, `Swap`) lets you push allies into buff slots or knock enemies into hazard slots.

### The Stability & "Shattered" Stagger Mechanic
* Underneath every enemy's HP bar is a **Stability Meter** shown as carved stone runes (e.g., `[ ❖ ❖ ❖ ❖ ]`).
* **Chipping Stability:** Hitting an enemy's Domain/Elemental weakness, landing critical hits, or using Kaelen's Mason skills chips away Stability segments.
* **Shattered State:** Reducing Stability to `0` triggers **Shattered**:
  1. Cancels any skill or boss attack the enemy was charging.
  2. Knocks the enemy's turn portrait back on the CTB Timeline.
  3. Multiplies all damage dealt to that enemy by **$1.5\times$** until their next turn begins (when their Stability refills).

---

## 3. Character & Enemy Stats

| Stat | Abbr. | Governs | Primary Scaling Users |
| :--- | :--- | :--- | :--- |
| **Vitality** | `VIT` | Maximum HP & physical stagger resistance | **Kaelen** (Tank / Bruiser) |
| **Inscription** | `INS` | Maximum Mana ("Ink" / "Runic Charge") for casting skills | **Cassian**, **Vesper** |
| **Might** | `MGT` | Physical attack power (Mauls, Spears, Physical Strikes) | **Kaelen**, **Sura** |
| **Resonance** | `RES` | Magical power of Dawn, Obsidian, and Astral spells & heals | **Cassian**, **Vesper** |
| **Grit** | `GRT` | Physical Defense against melee and kinetic attacks | **Kaelen**, **Sura** |
| **Warding** | `WRD` | Magical Defense against elemental, arcane, and curse damage | **Vesper**, **Cassian** |
| **Tempo** | `TMP` | Turn recovery speed on the CTB timeline, Evasion & `CRIT%` | **Sura**, **Vesper** |

### Secondary Combat Attributes
* **Critical Rate (`CRIT%`):** Base $5\% + (\text{TMP} \times 0.1\%)$. Critical hits deal $1.5\times$ damage and chip **+1 bonus Stability** on physical/kinetic attacks.
* **Break Power (`BRK`):** Rating on weapons and skills determining how many Stability segments an attack removes when hitting a weakness.
* **Threat (`THR`):** Hidden aggro weight modified by Kaelen's **Wardstone Bulwark** stance and taunt skills.

---

## 4. The Ley-Line Domain Shift ("Strike the Stone")

In the top corner of the combat UI sits the **Heart-Shard Gauge** ($0\%$ to $100\%$, segmented into **3 Charges**).

### Charging the Heart-Shard
* **Any Attack / Skill / Heal:** $+5\%$ Gauge
* **Weakness Hit / Critical Hit:** $+10\%$ Gauge
* **Shattering an Enemy:** $+25\%$ Gauge
* **Party Taking Damage:** $+3\%$ to $+8\%$ Gauge

### Striking the Stone (Flooding the Battlefield)
Battles begin in a neutral state (or the dungeon's ambient biome). Once at least **1 Charge ($33\%$)** is filled, any character on their turn can use a **Free Action** to **Strike the Heart-Shard**, flooding the battlefield with one of the three primal magical domains:
* **1 Charge:** Shifts the battlefield domain for **4 Global Timeline Ticks**.
* **3 Charges (Overdrive Domain):** Shifts the domain for **8 Global Timeline Ticks** and unleashes an immediate AoE **Domain Burst** upon activation.

| Active Ley-Line Domain | Arena Visual & Audio Shift | Global Domain Rule (Friend & Foe) | Party Resonance Passive |
| :--- | :--- | :--- | :--- |
| 🔴 **Mythic Dawn** *(Domain of the Wilds)* | Giant sun-vines & golden pollen erupt across the floor; tribal drums & woodwinds swell. | **Primal Surge:** All physical & elemental damage increases by **+25%**, `GRT`/`WRD` drop by **-15%**, and HP Regen/Bleed effects tick twice as hard. | **Sura** gains *Apex Predator* (`Sky-Leap` dives resolve instantly with 0 turn delay). |
| 🟡 **Obsidian Reign** *(Domain of the Forge)* | Volcanic blackrock & molten brass fissures crack the ground; heavy anvil & cello rhythms kick in. | **Forge Overclock:** Attacks chip **+1 extra Stability**, `CRIT%` increases by **+20%**, and Barrier/Shield values are increased by **+30%**. | **Kaelen & Cassian** gain *Forgeborn Calibration* (attacks restore 10% `INS` and deal +15% bonus damage to armored/shielded foes). |
| 🔵 **Astral Wastes** *(Domain of the Stars)* | Starlight & cyan crystal monoliths rise from white sand; ethereal synth & harp reverb takes over. | **Arcane Convergence:** All skill `INS` costs are **halved**, cooldowns tick down twice as fast, and CTB Turn-Delay/Haste effects are **+50% stronger**. | **Vesper** gains *Zero-Point Conduit* (single-target heals and shields splash to all allies at 50% potency). |

### Boss Domain Puzzles
Every major boss has a **Native Domain Affinity** that empowers them until overwritten:
* *Example:* **Forge-Lord Malakor's Magma Colossus** superheats its armor while in the **Obsidian Reign** domain. Striking the Heart-Shard to shift the arena into **The Astral Wastes** flash-cools its molten plates with starlight frost (exposing its Stability core), while shifting into **The Mythic Dawn** entangles its legs in sun-roots so it cannot charge its arena cleave.
