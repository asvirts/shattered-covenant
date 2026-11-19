# Lock the Heart-Shard Gauge selectors

Labels: wayfinder:grilling
Type: grilling
Status: resolved
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

## Answer

**Heart-Shard Gauge is the canonical name.** Avoid "Ley-Line Gauge" and "Domain Gauge". At implementation, rename `leyLineGauge` to `heartShardGauge` and change the HUD label.

### Scale

- Keep the integer field at 0–300, with 100 per charge. 3 points = 1% of the gauge in `combat.md`. The doc's +5% is 15 points.
- The HUD shows `round(points / 3)%` and `floor(points / 100)` charges. Today it prints the raw value as a percent, which overstates the gauge by 3×.
- The gauge caps at 300. Anything over that is lost.

### Gains (doc numbers, in points)

| Event | Gain | Counted |
| :--- | :--- | :--- |
| Basic attack (a hero's 0-INS strike, the `Chisel`) | +8% (24) | Once per action. This is the "Attack Economy" number in `combat.md` §1. It replaces the +5% for that action. |
| Any other hero main action: skill, heal, buff, Dual Tech, Defend, item | +5% (15) | Once per action, however many targets it has |
| Weakness hit or critical hit | +10% (30) | Once per action if at least one target took a weakness hit or a crit. Both together still give +10% once. |
| Shattering an enemy | +25% (75) | Per enemy Shattered |
| Party taking damage | +3% to +8% (9–24) | Per hero, per damage instance (see below) |
| Field ambush | +15% (45) | Once at battle start. The engine already matches. |

- **Damage selector.** Gain = `min(8, 3 + floor(10 × damage / target.maxHp))`%, times 3 for points. That's +3%, plus 1% for each full 10% of the hero's max HP the hit dealt, up to +8%. `damage` is measured **before** shields absorb it, so a shielded party isn't starved of gauge. *(judgment)* It counts enemy attacks, ailment ticks and Volatile Shock ([06](06-ley-line-surge-catalog.md)). An evaded hit ([04](04-crit-and-evasion.md)) deals no damage and gives nothing.
- **Which actions count.** Only hero main actions give action gains. Enemy actions never do; the party gains only through the taking-damage row. Zero-cost basics count, at +8%. Defend and items count at +5%, so no hero turn is dead. *(judgment: the doc lists "attack / skill / heal" only)*. A free action (Strike the Stone) gives nothing.
- Kaelen's Heart-Shard Overdrive capstone (×1.5 on his gains) is talent content and stands.

### Spending charges

- With 1 or 2 charges, a Strike spends 1 charge for a 4-tick shift. There is no 2-charge tier.
- With 3 charges (300), the player chooses either a 1-charge shift, which keeps 2 charges, or Overdrive, which spends all 3 for an 8-tick shift plus the Domain Burst. *(judgment: the engine forces Overdrive at 300)*
- At most one Strike per turn. *(judgment: the engine allows several in one turn)*
- Striking during an active domain replaces it. [10](10-surge-and-domain-placement.md) has the clock rule.

### Engine delta

- The engine's gains, +14 basic, +22 skill, +35 Dual Tech, +30 shatter and +12 when a hero takes damage, are all replaced by the table above.
- `triggerDomainShift` forces Overdrive whenever the gauge is at 300. It becomes a choice.
- Noticed, not decided here: `combat.md` §1 says a basic attack restores +5% INS. The engine restores a flat +9. The doc's number stands under the map's standing rules. The gauge starts at 50 and carries between battles; the doc is silent on that, so the engine stands.
