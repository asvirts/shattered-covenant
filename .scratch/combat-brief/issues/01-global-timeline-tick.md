# Define the global timeline tick

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

What is one global timeline tick?

`combat.md` measures domain duration, and the language around the conditional turn-based bar, in global timeline ticks. One charge of a domain shift lasts 4 ticks. An overdrive shift lasts 8. The battle engine does not have that unit. `getTimelinePreview` in `src/battle.ts` advances a per-actor counter (`1000 / Tempo`), and `advanceToNextTurn` decrements `domainTurnsRemaining` once per actor turn. A normal shift lasts 5 of those turns. Overdrive lasts 8.

This clock is the root. Assign recovery delay and Shattered knockback, and Place surges and domain duration on the clock, both wait on the answer. Those tickets own the distances and the slot placement. This ticket owns the unit they are measured in.

Decide what one tick is, in terms of the existing per-actor counter or a new shared clock, so a later session can count 4 and 8 without guessing. Do not assign recovery classes, surge effects, or domain-rule numbers here. Where `combat.md` already states 4 and 8, those numbers stand. The open choice is what they count.
