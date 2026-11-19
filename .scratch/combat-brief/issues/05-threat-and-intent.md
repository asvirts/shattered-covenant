# Lock threat and telegraphed intent

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

What intent lines exist, when does the party see them, and how does Threat change the target?

`combat.md` rejects a row system. Enemy targeting is a threat and telegraph system. Kaelen's Runic Mason abilities generate high Threat, taunt a dangerous single-target strike, and project barriers. Bosses show telegraphed intent on the timeline, with examples such as Targeting Highest Threat, Targeting Lowest HP, and Charging Arena Cleave, so the party can answer with a taunt, a Sky-Leap dodge, a Redact interrupt, or an Astral shield.

The engine stores `thr` and never reads it. `executeEnemyTurn` picks a hero with a Taunt status, or a random living hero if nobody is taunting. `intentText` is a flavor name on the enemy template (`Pickaxe Frenzy`, `Magma Core Overload`, and the others). The log prints it as the blow lands, not as a forecast.

Decide:

- The closed vocabulary of intent lines, using the doc's examples as the starting set, not as a finished list.
- When an intent becomes visible relative to the enemy's turn, so a response is possible before the hit.
- How Threat changes the pick for an intent that names a target rule, and what a taunt overrides. Numeric per-skill Threat weights may stay unresolved. If they do, say so, and they remain in the map's Not yet specified.

Do not design boss scripts, including Malakor. Do not redesign Sky-Leap, Redact, or shield skills. Name them only as the responses an intent must leave room for. Individual skill behavior stays in `characters.md`.

## Answer

### Closed intent vocabulary

Every enemy action is shown as **move name + intent line**. The move name is the existing `intentText`, such as "Pickaxe Frenzy". There are six lines:

| Line (id) | Shown as | Target rule | Taunt redirects? |
| :--- | :--- | :--- | :--- |
| `HIGHEST_THREAT` | Targeting Highest Threat | The living, targetable hero with the highest current Threat. Ties go to party order. | Yes |
| `LOWEST_HP` | Targeting Lowest HP | The living, targetable hero with the lowest **current HP as a % of max**. Ties go to higher Threat. *(judgment: a percentage reads the way players read HP bars)* | Yes |
| `RANDOM` | Targeting *Name* | A hero rolled **when the intent is revealed**, then shown by name and fixed | Yes |
| `ALL_HEROES` | Targeting All | Every living, targetable hero | No |
| `CHARGING` | Charging *Move* | Spends this turn winding up (`enemy.channeling = true`). The release on its next turn uses one of the four target lines above, shown in the forecast as "Charging Arena Cleave → All". | When the release is single-target, yes |
| `FORTIFY` | Fortifying | Targets itself or another enemy (buff, heal or shield). No hero is targeted. | No |

- The list is closed. Adding a line means reopening this decision.
- Hard Mode's "focus the healer" is built from these lines (for example, `LOWEST_HP`) or by boss scripts. It is not a seventh line.

### When an intent is visible

- Every enemy, not only bosses, always shows its **next** intent. It is picked at battle start and again right after each of its turns. *(judgment: the doc says bosses, but §6 says rules are always visible, and this costs the engine nothing extra)*
- The intent sits on the enemy's next portrait on the CTB bar and over the enemy sprite. The engine's current behavior, printing `intentText` only as the blow lands, goes away.
- The line's target rule is evaluated **live** and the HUD shows who it currently points at by name. It locks when the enemy's turn starts. So raising Kaelen's Threat, a Taunt, or healing the lowest-HP hero all visibly move the arrow before the hit.
- A `CHARGING` move gives at least one full enemy interval to answer. Shattered cancels the charge (the engine already clears `channeling`), the release is lost, and a new intent is picked. Interrupt skills like Redact cancel a charge the same way. That skill's behavior stays in `characters.md`.
- Untargetable heroes (Sky-Leap airborne) are skipped. A single-target line picks the next hero by the same rule. `ALL_HEROES` hits everyone else.

### Threat

- Each hero has a **current Threat** that starts at `stats.thr` every battle. `thr` is read for the first time.
- *(judgment, default weights)* Every hero main action adds +10 Threat. A Mason skill (Kaelen is the owner or the Dual Tech partner) adds +30 instead. Per-skill overrides, and talent effects like Brace's +150%, are **not yet specified** and stay on the map.
- Threat doesn't decay within a battle. A KO'd hero can't be targeted, and a revived hero restarts at `stats.thr`.
- **Taunt** (an active `TAUNT` status) overrides every single-target line, `CHARGING` releases included. If several heroes are taunting, the most recent Taunt wins. Taunt never affects `ALL_HEROES` or `FORTIFY`.

### Engine delta

- `executeEnemyTurn` picks the taunter or a random living hero. Under this answer, today's templates each become one move with line `RANDOM`, which keeps current behavior but makes it visible. Boss intent lists are boss-script content.
- Noticed: base `thr` is Kaelen 60, Sura 90, Vesper 65, Cassian 80. The tank starts as the lowest-threat hero. That's tuning, not a rule, but with the default weights Sura draws `HIGHEST_THREAT` attacks until Kaelen has acted twice.
