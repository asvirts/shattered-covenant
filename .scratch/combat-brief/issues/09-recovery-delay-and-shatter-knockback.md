# Assign recovery delay and Shattered knockback

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by: 01

## Question

How long, in global timeline ticks, is the recovery of a fast action, a heavy action, and a free action, and how far does Shattered push an enemy's portrait?

This ticket waits on Define the global timeline tick. The distances are meaningless until that unit exists.

`combat.md` says the next turn's place on the bar depends on Tempo and the recovery delay of the previous action. Quick strikes, items, and swift casts are low delay. Maul slams, ultimate edicts, and dual techs are high delay. Striking the Heart-Shard is a free action: 0 recovery, taken on the active character's turn before the main skill. The engine already treats Strike the Stone that way. `triggerDomainShift` does not end the turn.

The engine otherwise ignores action weight. After any skill, `useHeroSkill` sets the hero's next counter to `1000 / TMP` (haste multiplies Tempo by 1.3 first). Enemy turns do the same with their Tempo. There is no fast or heavy class.

Shattered "knocks the enemy's turn portrait back" and gives no distance. The engine adds a flat +35 to `ctbValue` inside `damageStability`.

Decide:

- The recovery, in ticks, for a fast action, a heavy action, and a free action.
- Whether the class is authored on the skill or derived from a property the skill already has. Naming the rule is in scope. Tagging every existing skill is not, unless the rule is derived and needs no tags.
- The Shattered knockback distance in the same unit.

Do not move surge slots or reinterpret the 4-tick and 8-tick domain durations. Place surges and domain duration on the clock owns those.
