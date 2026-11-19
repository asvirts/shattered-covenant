# Place surges and domain duration on the clock

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 01, 06

## Question

Where do ley-line surge slots sit on the timeline, and how are a domain shift's 4 and 8 ticks counted on that same clock?

This ticket waits on Define the global timeline tick and on Lock the ley-line surge catalog. The catalog says what a slot does. The tick says what a tick is. This ticket places the slots and applies the durations.

`combat.md` says specific slots on the bar periodically glow, and that one charge lasts 4 global timeline ticks while an overdrive shift lasts 8. The engine does neither. `getSurgeForStep` attaches an effect to every 7th preview step, not to a position on a shared bar. `domainTurnsRemaining` counts actor turns: 5 for a normal shift, 8 for overdrive.

Decide:

- How often a surge slot appears, and whether it occupies a fixed position on the bar or rides an upcoming turn.
- Confirm that one charge lasts 4 ticks and three charges last 8, counted in the unit Define the global timeline tick locked. Those numbers stand. The open choice is how the clock consumes them.

Do not reopen the surge effect list or the Domain Burst's magnitude. Those are Lock the ley-line surge catalog and Close the fuzzy domain rules.

## Answer

### Surge slots sit on turn numbers

- Number every turn of the battle 1, 2, 3, … in the order turns start, hero or enemy. A turn whose actor dies to an ailment tick before acting still uses its number. Free actions don't use a number.
- **Every 4th turn (n = 4, 8, 12, …) is a surge slot.** The effect cycles in a fixed order: `KEEN → ZERO_INS → VOLATILE_SHOCK → LEY_SURGE` ([06](06-ley-line-surge-catalog.md)). Slot k = n / 4 gets `catalog[(k − 1) % 4]`. *(judgment: cadence and order)*
- A slot is a fixed position in turn order. It belongs to no actor and sits at no clock time. Whoever's turn comes up as turn n gets it. Haste, Slow, delays, advances and Swap change **who** lands on n, which is how the player pushes allies into buff slots and enemies into the hazard.
- The 7-entry timeline preview always shows at least one slot, because any 7 consecutive numbers include a multiple of 4.
- In a typical fight (7 units, about 28 turns) that is about 7 slots, including about 2 hazards. Compared with the engine's 3 slots in every 7 turns, a slot now stands out as an event.

### Domain duration on the clock

- On a Strike, set `domainUnitsRemaining = ticks × 10`: **40 for one charge, 80 for Overdrive**. Vesper's Extended Convergence adds +2 ticks (+20 units). The doc's 4 and 8 stand.
- The striking hero's main action that same turn happens inside the new domain.
- Each `advanceToNextTurn` subtracts that step's `delta` from `domainUnitsRemaining` **before** the next actor's turn starts. If the result is **below 0**, the shift ends and the battlefield goes back to the ambient domain ([08](08-native-domain-affinity.md)) before that actor acts. A turn that starts exactly on the boundary (0 remaining) is still inside.
- A Strike during an active shift replaces it and resets the budget. Durations don't stack.
- The HUD shows `ceil(domainUnitsRemaining / 10)` ticks. The timeline preview tints every entry whose cumulative `ticksUntilTurn` is ≤ the remaining units, so the player can see exactly which portraits act inside the domain.
- Cooldowns and statuses still count actor turns. Only the domain's duration moved to the clock.

### Engine delta

- `getSurgeForStep` uses `(turnCounter + i) % 7` with three effects. It becomes the n % 4 rule above.
- The engine has an off-by-one. `advanceToNextTurn` reads the surge before incrementing `turnCounter`, but the preview's entry 0 (the current actor) uses the incremented counter. The badge on the current portrait can therefore differ from the surge actually applied. Number turns once and label preview entry i with `currentTurn + i`.
- `domainTurnsRemaining` (5 or 8 actor turns) is replaced by `domainUnitsRemaining` (40 or 80 units).
