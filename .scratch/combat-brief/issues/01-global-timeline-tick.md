# Define the global timeline tick

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

What is one global timeline tick?

`combat.md` measures domain duration, and the language around the conditional turn-based bar, in global timeline ticks. One charge of a domain shift lasts 4 ticks. An overdrive shift lasts 8. The battle engine does not have that unit. `getTimelinePreview` in `src/battle.ts` advances a per-actor counter (`1000 / Tempo`), and `advanceToNextTurn` decrements `domainTurnsRemaining` once per actor turn. A normal shift lasts 5 of those turns. Overdrive lasts 8.

This clock is the root. Assign recovery delay and Shattered knockback, and Place surges and domain duration on the clock, both wait on the answer. Those tickets own the distances and the slot placement. This ticket owns the unit they are measured in.

Decide what one tick is, in terms of the existing per-actor counter or a new shared clock, so a later session can count 4 and 8 without guessing. Do not assign recovery classes, surge effects, or domain-rule numbers here. Where `combat.md` already states 4 and 8, those numbers stand. The open choice is what they count.

## Answer

**One global timeline tick is 10 units of the existing CTB counter (`ctbValue`).** It is a slice of shared time, not an actor turn.

### Rules

- The engine already runs one shared clock. `advanceToNextTurn` subtracts the same `delta` from every living unit's `ctbValue`. A tick is a fixed amount of that clock. Add `CTB_UNITS_PER_TICK = 10`.
- The turn interval is unchanged: `round(1000 / TMP)` units, which is `100 / TMP` ticks. TMP 25 is 4 ticks. TMP 15 is about 6.7 ticks.
- Everything stated in ticks converts at ×10. One charge (4 ticks) is 40 units. Overdrive (8 ticks) is 80 units. Existing numbers read the same way: Chrono-Shear Pulse's `ctbDelay: 35` is 3.5 ticks, Sun-Scale Warcry's `ctbAdvance: 20` is 2 ticks.
- Fractions are fine internally. Anything shown to the player rounds up to whole ticks.
- The clock moves only inside `advanceToNextTurn`. It never runs in real time and never moves while a command menu is open, so Wait mode in `qol-and-ux.md` holds by construction. Turbo changes animation speed, not ticks.
- `domainTurnsRemaining` (a count of actor turns) is replaced by a count on this clock. [10](10-surge-and-domain-placement.md) says how the clock consumes it.
- Haste and Slow act on the tempo interval at the moment a unit's recovery is set (Haste already multiplies TMP by 1.3). Swap exchanges two units' counters. All three are measured in this unit. Slow's multiplier is still not specified.

### Why

- A duration in time is fair across battle sizes. If a domain counted actor turns, every extra enemy would use up one of the party's domain turns. Counted in time, a fast or hasted party gets more turns inside its own domain, which is what `combat.md` asks Tempo and Astral haste to do.
- Recovery delay ([09](09-recovery-delay-and-shatter-knockback.md)) and Shattered knockback need a time unit. An actor-turn count can't express "this action delays you more".
- *(judgment)* The size, 10 units. With 4 ticks = 40 units, a one-charge shift lasts about one tempo interval of the fastest hero (TMP 25). With today's seven-unit fights (average interval about 45 units) that covers about the same number of actor turns as the engine's current 5-turn shift, so balance barely moves.

### Engine delta

- `domainTurnsRemaining` counts actor turns (5 normal, 8 overdrive). It becomes a time budget of 40 or 80 counter units.
- The battle HUD's `(Nt)` label shows ticks remaining (rounded up), not turns.
