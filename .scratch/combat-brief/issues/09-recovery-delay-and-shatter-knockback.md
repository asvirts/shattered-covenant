# Assign recovery delay and Shattered knockback

Labels: wayfinder:grilling
Type: grilling
Status: resolved
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

## Answer

All values are in global timeline ticks, where 1 tick = 10 `ctbValue` units ([01](01-global-timeline-tick.md)).

### Recovery

```
recovery = tempoInterval + classDelay
tempoInterval = max(22, round(1000 / max(10, effectiveTmp)))   // heroes; enemies floor at 28 (engine stands)
```

| Class | `classDelay` | Turn ends? |
| :--- | :--- | :--- |
| **Free** | 0 | No. The actor still takes a main action this turn. Only Strike the Stone is free (one per turn, [02](02-heart-shard-gauge.md)). |
| **Fast** | +0 ticks | Yes |
| **Heavy** | **+3 ticks (+30 units)** | Yes |

- `classDelay` is flat. Tempo, Haste, Slow and domains don't scale it. A flat delay costs a fast hero proportionally more than a slow one: Sura goes from 4 to 7 ticks, Kaelen from 6.7 to 9.7. That suits Kaelen as the maul-slam hero. *(judgment: the +3 size and flat shape)*
- Fast keeps the engine's current recovery, so most actions don't move at all.

### Class is derived, with an optional override

- Add optional `Skill.recovery?: 'FAST' | 'HEAVY'`. When it is absent: **HEAVY if `isDualTech` or base `costIns >= 20`; otherwise FAST.** Use the base cost, before Astral halving or a Zero-INS surge. *(judgment)*
- Today this makes HEAVY: the three Dual Techs, Shatter-Fault Blow (20), Meteor Lance (22), Astral Halo (22), Supernova (24) and Chain Clauses (20). Everything else is FAST, including all basics and Fault-Line Slam (14). No tags are needed now.
- Items and Defend are FAST.
- Enemy actions are FAST, except a `CHARGING` release ([05](05-threat-and-intent.md)), which is HEAVY.
- A Dual Tech's Heavy delay applies to the hero who uses it. The partner's counter doesn't move (engine stands; the doc is silent).
- The timeline preview simulates future turns as FAST. When a skill is highlighted in the menu, the preview should place the acting hero's next portrait using that skill's class, so the player sees the cost before committing. This is the `research.md` "light vs heavy on a visible timeline" goal.

### Shattered knockback

- **+4 ticks (+40 units)**, added to the enemy's counter when it becomes Shattered. Engine: +35.
- It is a fixed number. Astral's +50% doesn't apply, because knockback is a Stability rule, not a skill's turn-delay effect.
- Why 4: it equals the fastest base hero's interval (TMP 25). A hero with TMP 25 or higher who Shatters an enemy with a Fast action always gets another turn before that enemy refills.
- That guarantee relies on the tie-break, which this answer locks: **on equal counters, heroes act before enemies, and heroes act in party order.** This is what the engine's stable sort already does.
