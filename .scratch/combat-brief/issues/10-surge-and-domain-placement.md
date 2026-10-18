# Place surges and domain duration on the clock

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by: 01, 06

## Question

Where do ley-line surge slots sit on the timeline, and how are a domain shift's 4 and 8 ticks counted on that same clock?

This ticket waits on Define the global timeline tick and on Lock the ley-line surge catalog. The catalog says what a slot does. The tick says what a tick is. This ticket places the slots and applies the durations.

`combat.md` says specific slots on the bar periodically glow, and that one charge lasts 4 global timeline ticks while an overdrive shift lasts 8. The engine does neither. `getSurgeForStep` attaches an effect to every 7th preview step, not to a position on a shared bar. `domainTurnsRemaining` counts actor turns: 5 for a normal shift, 8 for overdrive.

Decide:

- How often a surge slot appears, and whether it occupies a fixed position on the bar or rides an upcoming turn.
- Confirm that one charge lasts 4 ticks and three charges last 8, counted in the unit Define the global timeline tick locked. Those numbers stand. The open choice is how the clock consumes them.

Do not reopen the surge effect list or the Domain Burst's magnitude. Those are Lock the ley-line surge catalog and Close the fuzzy domain rules.
