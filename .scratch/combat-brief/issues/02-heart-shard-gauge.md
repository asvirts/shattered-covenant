# Lock the Heart-Shard Gauge selectors

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

Which name is canonical, Heart-Shard Gauge or Ley-Line Gauge, and which selectors fill the gaps in the charging rules?

`combat.md` calls the meter the Heart-Shard Gauge, 0% to 100%, in 3 charges. The engine field is `leyLineGauge`, scaled 0–300, and the battle HUD labels it a Ley-Line Gauge while printing the raw value as a percent. One charge in the engine is 100 points.

The doc's stated gains stand. Do not relitigate them:

- Any attack, skill, or heal: +5%
- Weakness hit or critical hit: +10%
- Shattering an enemy: +25%
- Field ambush: +15% (the engine adds 45)

The engine's gains are different and lose where the doc has a number: +14 for a basic action, +22 for a skill, +35 for a dual tech, +30 on shatter, and +12 when a hero takes damage. The engine's +25 gauge on a surge slot is not one of those gains. It is a catalog candidate on Lock the ley-line surge catalog.

Decide the three selectors the doc leaves open:

- What picks the amount inside the +3% to +8% band when the party takes damage?
- Which actions count as "any attack / skill / heal"? Enemy actions and zero-cost basics are the cases to settle.
- When the gauge holds 3 charges, must they be spent as one overdrive shift, or can the actor spend a single charge instead?

Record the name as the glossary term if this is the first time it is resolved. Do not redesign surge effects. Those belong to Lock the ley-line surge catalog. Do not define weakness. That belongs to Define weakness, Break Power, and Vitality. The +10% on a weakness hit stands once that ticket says what a weakness hit is.
