# Combat System, Stats & Battle Mechanics

## 1. Core Combat Structure

* **Active Party Size:** All **4 Party Members** (**Kaelen**, **Sura**, **Vesper**, **Cassian**) fight together simultaneously once recruited. Nobody sits on the bench.
* **Positioning & Threat (No Row System):** There are no restrictive Front/Back rows. Instead, enemy targeting uses a transparent **Threat / Aggro & Telegraph System** (inspired by *World of Warcraft* dungeon combat fused with classic turn-based JRPGs):
  * Kaelen's **Runic Mason** abilities generate high Threat, Taunt dangerous single-target strikes, and project directional or party-wide barriers.
  * Bosses display **Telegraphed Intent Lines** on the timeline (e.g., *Targeting Highest Threat*, *Targeting Lowest HP*, or *Charging Arena Cleave*), allowing the party to respond with Taunts, `Sky-Leap` dodges, `Redact` interrupts, or Astral shields.
  * **Intent rules** ([brief #05](./.scratch/combat-brief/issues/05-threat-and-intent.md)):
    * Every enemy, bosses included, always shows its **next** intent as a move name plus one of six lines:
      * *Targeting Highest Threat*.
      * *Targeting Lowest HP*, by % of max HP.
      * *Targeting* a named hero, rolled when the intent is revealed.
      * *Targeting All*.
      * *Charging* a move, which winds up this turn and releases next turn.
      * *Fortifying*, which targets itself or another enemy.
    * The target is shown by name and updates live as Threat, HP and Taunts change. It locks when the enemy's turn starts. Shattered or an interrupt cancels a Charge.
    * **Taunt** redirects every single-target line, Charge releases included. It never redirects *Targeting All* or *Fortifying*.
    * Airborne or untargetable heroes are skipped.
    * Each hero's Threat starts at its `THR` stat each battle. By default, each action adds +10, and each of Kaelen's Mason skills adds +30.
* **Dungeon Encounters & Ambush Strikes:**
  * **Visible Field Enemies:** Monsters patrol visibly in dungeons and overworld zones (no blind random encounters).
  * **Field Ambush (Mason Strike):** Striking an enemy on the field before contact initiates battle with **1 Stability segment already cracked** on all enemies and **+15% Heart-Shard Gauge** charge.
  * **Post-Battle Recovery:** After each normal battle, party members automatically recover **25% of their max `INS` (Mana)**. Full HP and `INS` restoration occurs at **Titan Waygates**, Camps, and Towns—encouraging players to actively cast Glyph and Class skills in every fight while still valuing dungeon checkpoints.

### No "Spam Attack" Trap: The Attack Economy
Because normal battles restore only **25% `INS`**, the party can never trivially hoard mana and mash the basic attack through the whole game ([r/JRPG](https://www.reddit.com/r/JRPG/comments/10k2oss/chained_echoes_refilling_my_hpmp_was_great_at/)). To keep every turn a real decision:
* **Every basic attack is a `Chisel` that builds something:** A standard attack generates **+8% Heart-Shard Gauge** and restores **+5% `INS`**, so attacking is never a dead turn—it is the engine that funds the next cast.
* **`Defend` is a real, character-specific action, not a wasted turn:**
  * **Kaelen — Brace:** Raises a Basalt Guard, generating +150% Threat and chipping the attacker's Stability on contact.
  * **Sura — Wind-Read:** Banks a *Counter-Fang* that lashes any enemy who strikes her this round.
  * **Vesper — Starlight Reserve:** Pre-loads a small Starlight Shield and refunds `INS` at the start of their next turn.
  * **Cassian — Re-Ink:** Converts the turn into raw `INS` recovery (more than attacking) and pre-applies *Crimson Ink* to his next spell.
* **Resource pressure exists to make skills feel earned, not to force basic attacks.** `INS` scarcity makes Domain Shifts and big casts matter; it is never tuned so that ~90% of the game is confirm-mashing ([r/gamedesign](https://www.reddit.com/r/gamedesign/comments/1s9e2pz/what_makes_a_turnbased_combat_system_actually_fun/)).

---

## 2. The "Chisel & Shift" Timeline (CTB)

Combat runs on a visible **Conditional Turn-Based (CTB) Timeline Bar** at the top of the screen:
* **Global Timeline Tick:** The bar runs on one shared clock. One tick is 10 units of each unit's turn counter. A unit's base turn interval is `1000 / TMP` units, which is `100 / TMP` ticks: TMP 25 acts every 4 ticks. The clock only advances between turns. It never runs while a menu is open.
* Every ally and enemy portrait slides along the **Timeline Bar** toward the `ACT` threshold based on their **Tempo (`TMP`)** and the **Recovery Delay** of their previous action. Recovery = the Tempo interval + the action's class delay ([brief #09](./.scratch/combat-brief/issues/09-recovery-delay-and-shatter-knockback.md)):
  * **Fast Actions (Quick Strikes, Items, Swift Casts):** `+0` ticks.
  * **Heavy Actions (Maul Slams, Ultimate Edicts, Dual Techs):** `+3` ticks. A skill is Heavy if it is a Dual Tech or its base cost is 20+ `INS`, unless the skill states otherwise. An enemy's Charge release is Heavy.
  * **Free Actions (Striking the Heart-Shard for a Domain Shift):** `0` recovery delay. It happens immediately on the active character's turn, before they select their main skill, and does not end the turn. One per turn.
  * On equal counters, heroes act before enemies.
* **Ley-Line Surge Slots:** Specific slots on the CTB bar periodically glow with ley-line surges. Using **Vesper's** timeline manipulation skills or **Astral Glyphs** (`Haste`, `Slow`, `Swap`) lets you push allies into buff slots or knock enemies into hazard slots. Every 4th turn of the battle is a surge slot, and the effects cycle in this order ([briefs #06](./.scratch/combat-brief/issues/06-ley-line-surge-catalog.md), [#10](./.scratch/combat-brief/issues/10-surge-and-domain-placement.md)):
  1. `+30% Crit`: +30 crit chance on the hero's main action.
  2. `Zero INS Cost`: the hero's main action costs 0 `INS`.
  3. `Volatile Shock`: a hazard. The actor loses 10% of max HP, and an enemy also loses 1 Stability. It can't KO.
  4. `Ley Surge`: +10% Heart-Shard Gauge.

  Buff slots help heroes only. Volatile Shock hits whoever lands on it.

### The Stability & "Shattered" Stagger Mechanic
* Underneath every enemy's HP bar is a **Stability Meter** shown as carved stone runes (e.g., `[ ❖ ❖ ❖ ❖ ]`).
* **Chipping Stability:** Hitting an enemy's Domain weakness, landing critical hits, landing a **Bind**, or using Kaelen's Mason skills chips away Stability segments ([brief #03](./.scratch/combat-brief/issues/03-weakness-break-vitality.md)):
  * **Weakness:** Astral beats Obsidian, Obsidian beats Dawn, and Dawn beats Astral. Each is weak to the domain before it in that chain, matched against the enemy's domain affinity. A weakness hit adds no damage. Its payoff is Stability and gauge.
  * **Amount per hit:**
    * When one of the triggers above applies, the hit removes the skill's Break Power.
    * A weakness hit also adds the weapon's Break Power.
    * A physical crit adds +1.
    * Obsidian Reign adds +1 to every hit, even one with no trigger.
    * A hit with no trigger chips nothing.
* **Shattered State:** Reducing Stability to `0` triggers **Shattered**:
  1. Cancels any skill or boss attack the enemy was charging.
  2. Knocks the enemy's turn portrait back **4 ticks** on the CTB Timeline. Astral Wastes does not scale this.
  3. Multiplies all damage dealt to that enemy by **$1.5\times$** until their next turn begins (when their Stability refills).

---

## 3. Character & Enemy Stats

| Stat | Abbr. | Governs | Primary Scaling Users |
| :--- | :--- | :--- | :--- |
| **Vitality** | `VIT` | Maximum HP (1 `VIT` = 1 max HP; heroes have no stagger meter) | **Kaelen** (Tank / Bruiser) |
| **Inscription** | `INS` | Maximum Mana ("Ink" / "Runic Charge") for casting skills | **Cassian**, **Vesper** |
| **Might** | `MGT` | Physical attack power (Mauls, Spears, Physical Strikes) | **Kaelen**, **Sura** |
| **Resonance** | `RES` | Magical power of Dawn, Obsidian, and Astral spells & heals | **Cassian**, **Vesper** |
| **Grit** | `GRT` | Physical Defense against melee and kinetic attacks | **Kaelen**, **Sura** |
| **Warding** | `WRD` | Magical Defense against elemental, arcane, and curse damage | **Vesper**, **Cassian** |
| **Tempo** | `TMP` | Turn recovery speed on the CTB timeline, Evasion & `CRIT%` | **Sura**, **Vesper** |

### Secondary Combat Attributes
* **Critical Rate (`CRIT%`):** Base $5\% + (\text{TMP} \times 0.1\%)$, plus crit bonuses from weapons, talents, Glyphs and Trinkets. The same base applies to enemies. Critical hits deal $1.5\times$ damage and chip **+1 bonus Stability** on physical/kinetic attacks ([brief #04](./.scratch/combat-brief/issues/04-crit-and-evasion.md)).
* **Evasion:** $\text{TMP} \times 0.2\%$ chance to evade a single-target physical attack, for heroes and enemies alike. Spells, hybrid attacks and multi-target attacks always land. `GRT`/`WRD` reduce damage, never hit chance. A miss deals no damage, chips no Stability, and is logged as **MISS**. Shattered or Leg-Bound targets cannot evade.
* **Break Power (`BRK`):** Rating on weapons and skills determining how many Stability segments an attack removes when hitting a weakness. The skill's rating applies whenever its hit chips. The weapon's rating applies only on a weakness hit.
* **Threat (`THR`):** Hidden aggro weight modified by Kaelen's **Wardstone Bulwark** stance and taunt skills. It sets a hero's starting Threat each battle. Intent lines show which hero it currently points at.

---

## 4. The Ley-Line Domain Shift ("Strike the Stone")

In the top corner of the combat UI sits the **Heart-Shard Gauge** ($0\%$ to $100\%$, segmented into **3 Charges**).

### Charging the Heart-Shard
Rules are from [brief #02](./.scratch/combat-brief/issues/02-heart-shard-gauge.md).

* **Any Attack / Skill / Heal:** $+5\%$ Gauge, once per hero main action. This includes Defend and items. A basic attack gives $+8\%$ instead, per the Attack Economy. Enemy actions and free actions give nothing.
* **Weakness Hit / Critical Hit:** $+10\%$ Gauge, once per action.
* **Shattering an Enemy:** $+25\%$ Gauge, per enemy Shattered.
* **Party Taking Damage:** $+3\%$ to $+8\%$ Gauge, per hero hit: $+3\%$, plus $1\%$ per full $10\%$ of that hero's max HP the hit dealt (counted before shields). A miss gives nothing.

### Striking the Stone (Flooding the Battlefield)
Battles begin in a neutral state (or the dungeon's ambient biome). Only Domains the party has unlocked can be struck: a Domain unlocks when a hero native to it joins (Kaelen brings Obsidian, Sura Dawn, Vesper Astral), so Act I has Obsidian and Dawn only ([world #02](./.scratch/world/issues/02-wardstone-multi-domain-puzzles.md)). A locked Domain's button is shown locked. Once at least **1 Charge ($33\%$)** is filled, any character on their turn can use a **Free Action** to **Strike the Heart-Shard**, flooding the battlefield with one of the three primal magical domains:
* **1 Charge:** Shifts the battlefield domain for **4 Global Timeline Ticks**.
* **3 Charges (Overdrive Domain):** Shifts the domain for **8 Global Timeline Ticks** and unleashes an immediate AoE **Domain Burst** upon activation.
  * The burst is a hit from the striker on every enemy at $2.0\times$ their higher of `MGT`/`RES`. It is resolved under the new domain, removes **2 Stability**, and cannot crit or miss.
* With a full gauge, the player chooses between a 1-Charge shift and Overdrive.
* The striking hero's action that turn happens inside the new domain.
* Ticks are counted on the shared clock. A turn that starts exactly as the last tick runs out is still inside. A new Strike replaces the active domain and restarts its ticks.
* When the ticks run out, the battlefield returns to the ambient domain ([brief #10](./.scratch/combat-brief/issues/10-surge-and-domain-placement.md)).

| Active Ley-Line Domain | Arena Visual & Audio Shift | Global Domain Rule (Friend & Foe) | Party Resonance Passive |
| :--- | :--- | :--- | :--- |
| 🔴 **Mythic Dawn** *(Domain of the Wilds)* | Giant sun-vines & golden pollen erupt across the floor; tribal drums & woodwinds swell. | **Primal Surge:** All physical & elemental damage increases by **+25%**, `GRT`/`WRD` drop by **-15%**, and HP Regen/Bleed effects tick twice as hard. | **Sura** gains *Apex Predator* (`Sky-Leap` dives resolve instantly with 0 turn delay). |
| 🟡 **Obsidian Reign** *(Domain of the Forge)* | Volcanic blackrock & molten brass fissures crack the ground; heavy anvil & cello rhythms kick in. | **Forge Overclock:** Attacks chip **+1 extra Stability**, `CRIT%` increases by **+20%**, and Barrier/Shield values are increased by **+30%**. | **Kaelen & Cassian** gain *Forgeborn Calibration* (attacks restore 10% `INS` and deal +15% bonus damage to armored/shielded foes). |
| 🔵 **Astral Wastes** *(Domain of the Stars)* | Starlight & cyan crystal monoliths rise from white sand; ethereal synth & harp reverb takes over. | **Arcane Convergence:** All skill `INS` costs are **halved**, cooldowns tick down twice as fast, and CTB Turn-Delay/Haste effects are **+50% stronger**. | **Vesper** gains *Zero-Point Conduit* (single-target heals and shields splash to all allies at 50% potency). |

#### Domain rule details ([brief #07](./.scratch/combat-brief/issues/07-fuzzy-domain-rules.md))
* **Mythic Dawn:** The +25% damage and the -15% `GRT`/`WRD` apply to heroes and enemies alike.
* **Obsidian Reign:** The `CRIT%` bonus is +20 crit chance, for heroes and enemies. Crit damage stays $1.5\times$. The +30% applies to every shield or barrier granted while Obsidian is active. Existing shields are not rescaled.
* **Astral Wastes:** Haste's `TMP` bonus is also +50% stronger.
* **Apex Predator:** In Dawn, `Sky-Leap` has no airborne wait. It lands the turn it is used, so it can't be used to dodge.
* **Forgeborn Calibration:** In Obsidian, each attack restores 10% of the attacker's max `INS` once per action. Its +15% damage applies to enemies with an active shield, or with `GRT` higher than `WRD` (armored).
* **Zero-Point Conduit:** In Astral, a heal or shield from a Vesper skill that targets one ally or Vesper also applies at 50% to every other ally.

### Boss Domain Puzzles
Every major boss has a **Native Domain Affinity** that empowers them until overwritten ([brief #08](./.scratch/combat-brief/issues/08-native-domain-affinity.md)):
* A boss battle starts with the boss's native domain active as the ambient domain. It has no tick limit, and party shifts return to it when they expire.
* While its native domain is active, the boss is **Empowered**: it deals +20% damage, and each hit chips 1 less Stability from it (minimum 0).
* Empowerment ends whenever any other domain is active.
* Penalties beyond losing empowerment belong to each boss's script.
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
