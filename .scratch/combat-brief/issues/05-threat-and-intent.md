# Lock threat and telegraphed intent

Labels: wayfinder:grilling
Type: grilling
Status: open
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
