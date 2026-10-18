# Lock crit chance and Tempo evasion

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

Does the doc's crit formula replace stored crit, and does Tempo grant an evasion roll?

`combat.md` says critical rate is `5% + (TMP × 0.1%)`, and that a critical hit deals 1.5× damage. It also says Tempo governs evasion as well as turn recovery and crit chance. The 1.5× multiplier is a stated number. It stands. The engine already uses 1.5×, except under the Obsidian domain, where that exception belongs to Close the fuzzy domain rules.

The engine stores `crit` on the hero (about 10–22 before gear, then weapon, talent, and glyph bonuses) and rolls `Math.random() * 100 < hero.stats.crit`. Tempo never feeds that number. There is no evasion roll on incoming attacks.

Decide:

- Whether `5% + (TMP × 0.1%)` replaces stored crit, is the base that gear adds to, or is only the floor before other sources.
- Whether Tempo grants evasion, and if it does, what the roll avoids (a physical hit, a magical hit, or both) and how Grit and Warding relate to a miss. If evasion is not a combat rule, say that explicitly so the brief drops it. The doc names it, so silence is not available. The engine simply never implemented it.

Do not change the damage formula. The doc is silent on it, so `useHeroSkill` stands. Do not assign the +1 Stability chip on a physical crit. That number already stands on Define weakness, Break Power, and Vitality.
