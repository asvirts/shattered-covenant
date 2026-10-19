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

### No "Spam Attack" Trap: The Attack Economy
Because normal battles restore only **25% `INS`**, the party can never trivially hoard mana and mash the basic attack through the whole game ([r/JRPG](https://www.reddit.com/r/JRPG/comments/10k2oss/chained_echoes_refilling_my_hpmp_was_great_at/)). To keep every turn a real decision:
* **Every basic attack is a `Chisel` that builds something:** A standard attack generates **+8% Domain Gauge** and restores **+5% `INS`**, so attacking is never a dead turn—it is the engine that funds the next cast.
* **`Defend` is a real, character-specific action, not a wasted turn:**
  * **Kaelen — Brace:** Raises a Basalt Guard, generating +150% Threat and chipping the attacker's Stability on contact.
  * **Sura — Wind-Read:** Banks a *Counter-Fang* that lashes any enemy who strikes her this round.
  * **Vesper — Starlight Reserve:** Pre-loads a small Starlight Shield and refunds `INS` at the start of her next turn.
  * **Cassian — Re-Ink:** Converts the turn into raw `INS` recovery (more than attacking) and pre-applies *Crimson Ink* to his next spell.
* **Resource pressure exists to make skills feel earned, not to force basic attacks.** `INS` scarcity makes Domain Shifts and big casts matter; it is never tuned so that ~90% of the game is confirm-mashing ([r/gamedesign](https://www.reddit.com/r/gamedesign/comments/1s9e2pz/what_makes_a_turnbased_combat_system_actually_fun/)).

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
* **Chipping Stability:** Hitting an enemy's Domain/Elemental weakness, landing critical hits, landing a **Bind**, or using Kaelen's Mason skills chips away Stability segments.
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

---

## 5. Ailments & Binds: Player-Fair Status Agents

Status effects are a first-class combat pillar—and they are **never wasted knowledge**. The system has two layers, inspired by *Etrian Odyssey* and *Chained Echoes* ([r/JRPG](https://www.reddit.com/r/JRPG/comments/13m93jw/status_effects_yay_or_nay_and_which_jrpg_games/)).

### Layer 1 — Ailments (standard statuses)
| Ailment | Effect |
| :--- | :--- |
| **Poison / Bleed / Burn** | Damage over time, ticking at the start of the target's turn; stacks have separate caps per source. |
| **Silence** | Blocks spellcasting and channeled/Edict abilities. |
| **Blind** | Sharply reduces the target's physical accuracy. |
| **Slow** | Reduces `TMP`, pushing the target further back on the CTB bar after each action. |
| **Stun** | Skips the target's next turn; the hardest status to land and the shortest-lived. |
| **Weaken / Vulnerable** | Reduces the target's outgoing damage / increases damage taken by a fixed % (targetable via `Redact`). |

### Layer 2 — Binds (body-part locks)
Binds shut down a *specific* enemy capability rather than its whole turn, and are the party's primary tool for disarming a boss's worst telegraphed move:
* **Head Bind:** Seals spellcasting, breath attacks, and roar/channeled abilities.
* **Arm Bind:** Disables physical strikes and weapon skills (often a boss's single-target execute).
* **Leg Bind:** Halts charge-up and movement-based moves, prevents evasion, and shoves the target back on the CTB bar.
* Landing a Bind also chips **Stability** directly, so a well-aimed Bind both disables a mechanic and feeds the **Shattered** burst window.

### The Fairness Rules (non-negotiable)
1. **No blanket boss immunity.** Every enemy—including every boss—carries numbered per-ailment resistances, shown in its **Enemy Codex** entry and previewed on the skill's target line as an infliction % ([r/JRPG](https://www.reddit.com/r/JRPG/comments/13m93jw/status_effects_yay_or_nay_and_which_jrpg_games/)).
2. **Deterministic first application.** The first successful attempt to land a *new* ailment on a boss always resolves at 100% (per *Chained Echoes*), so a status build always does something on the turn it is set up.
3. **Stacking resistance, not walls.** Each subsequent re-application in the same fight adds **+1 turn of resistance** for that ailment, displayed as a small counter—preventing stunlock cheese without ever making the spell worthless.
4. **Boss durations are capped and legible.** Ailments and Binds last 1–2 turns on bosses, with a visible timer on the portrait.
5. **Statuses are investments with payoff.** Combo skills consume an active status for burst (a Faultbreaker strike that detonates an active **Bleed**, or an Edict that consumes **Corrosive Ink** stacks), so applying them is action-economy, not busywork ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).
6. **Symmetry.** Buffs and debuffs apply to enemies and the party alike; bosses use the same ailment toolbox the player does.
7. **Honest feedback.** The battle log distinguishes **MISS** (RNG) from **IMMUNE** (true resistance) so players learn the rules instead of guessing ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).

---

## 6. Difficulty & Encounter Philosophy

Difficulty is expressed through **enemy tactics and mechanics**, never through inflated HP bars that turn bosses into 40-minute attrition stalls ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).

* **Hard Mode changes behavior, not sponges:** enemies gain smarter target priority (focusing the healer, punishing unbuffed states), new phase mechanics, extra telegraphs, and soft turn caps / enrage timers that reward aggressive synergy.
* **Rules are always visible:** a boss's Telegraphed Intent lines, Domain affinity, and ailment resistances are all readable before you commit a turn.
* **Party wipes, not protagonist-kills:** the party loses only when **all four heroes** are down. There is no instant game over if Kaelen falls while Vesper still holds a revival item ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).
* **Accessibility first:** timing- and speed-based pressure can always be relaxed via the toggles in [`qol-and-ux.md`](./qol-and-ux.md) (Wait mode, auto-timing, Turbo). Turn-based players are never forced into reflex checks ([r/gamedesign](https://www.reddit.com/r/gamedesign/comments/1s9e2pz/what_makes_a_turnbased_combat_system_actually_fun/)).

> Design rationale for this section is drawn from player interviews in [`research.md`](./research.md).
