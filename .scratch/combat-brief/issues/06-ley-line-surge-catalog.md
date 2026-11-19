# Lock the ley-line surge catalog

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

What is the closed list of ley-line surge effects?

`combat.md` says specific slots on the conditional turn-based bar glow with ley-line surges, and gives examples: +30% crit, zero Inscription cost, and Volatile Shock. It does not say those examples are exhaustive, and it does not define Volatile Shock.

The engine's `getSurgeForStep` rotates three effects every 7 steps: +15% damage (`DMG_BOOST`), zero Inscription (`ZERO_MANA`), and +25 gauge (`LEY_SURGE`). The HUD copies those three. None of them is +30% crit or Volatile Shock.

Decide the closed catalog of surge effects and what each one does to the action that lands on it. The doc's examples are in scope. The engine's three effects are candidates, not winners, because the doc did not state those numbers.

Do not decide where the slots sit on the bar, or how often they appear. That is Place surges and domain duration on the clock, which waits on this catalog and on Define the global timeline tick.

## Answer

**The catalog is closed at four effects: three buff surges and one hazard surge.**

| Id | Name | Kind | Effect on the turn that lands on the slot |
| :--- | :--- | :--- | :--- |
| `KEEN` | +30% Crit | Buff | +30 to crit chance ([04](04-crit-and-evasion.md)) for every hit of the hero's main action |
| `ZERO_INS` | Zero INS Cost | Buff | The hero's main action costs 0 INS. A basic attack still restores INS. |
| `LEY_SURGE` | Ley Surge | Buff | +10% Heart-Shard Gauge (30 points), granted when the hero's turn starts *(judgment: the engine gives +25 points)* |
| `VOLATILE_SHOCK` | Volatile Shock | Hazard | When the turn starts, after Stability refill and ailment ticks: the actor loses 10% of max HP (shields absorb as normal). If the actor is an enemy, it also loses 1 Stability, which can Shatter it. Volatile Shock can't drop anyone below 1 HP. |

- **Buff surges help heroes only.** An enemy landing on a buff slot gets nothing, and the slot is spent. **The hazard hits whoever lands on it**, hero or enemy. This is the doc's "push allies into buff slots, knock enemies into hazard slots": the player wants allies on buffs and enemies on the hazard, and must also keep allies off the hazard. *(judgment)*
- Volatile Shock damage to a hero counts for the taking-damage gauge gain ([02](02-heart-shard-gauge.md)). A Shatter it causes counts for +25% gauge and applies the knockback ([09](09-recovery-delay-and-shatter-knockback.md)).
- A buff applies to the main action. A free action (Strike the Stone) on that turn neither uses nor wastes it. A buff that doesn't fit the action (Keen on a heal) does nothing.
- Volatile Shock's definition is new; the doc names it without saying what it does. Making it the hazard is a *(judgment)*. 10% of max HP scales across the game, and the 1 HP floor keeps a slot from KO'ing anyone outright.

### Dropped

- The engine's `DMG_BOOST` (+15% damage) is not in the catalog. The doc never names it, it overlaps Keen and Mythic Dawn, and four effects are easier to learn.

### Engine delta

- `SurgeBonusType` becomes `'NONE' | 'KEEN' | 'ZERO_INS' | 'LEY_SURGE' | 'VOLATILE_SHOCK'`.
- The HUD badges and timeline pips change to match. [10](10-surge-and-domain-placement.md) sets where and how often slots appear.
