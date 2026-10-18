# Lock the ley-line surge catalog

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

What is the closed list of ley-line surge effects?

`combat.md` says specific slots on the conditional turn-based bar glow with ley-line surges, and gives examples: +30% crit, zero Inscription cost, and Volatile Shock. It does not say those examples are exhaustive, and it does not define Volatile Shock.

The engine's `getSurgeForStep` rotates three effects every 7 steps: +15% damage (`DMG_BOOST`), zero Inscription (`ZERO_MANA`), and +25 gauge (`LEY_SURGE`). The HUD copies those three. None of them is +30% crit or Volatile Shock.

Decide the closed catalog of surge effects and what each one does to the action that lands on it. The doc's examples are in scope. The engine's three effects are candidates, not winners, because the doc did not state those numbers.

Do not decide where the slots sit on the bar, or how often they appear. That is Place surges and domain duration on the clock, which waits on this catalog and on Define the global timeline tick.
