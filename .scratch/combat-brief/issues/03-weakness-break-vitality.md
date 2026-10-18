# Define weakness, Break Power, and Vitality

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

What is a weakness hit, how does Break Power combine with a skill's Stability break, and what does Vitality's stagger resistance do?

`combat.md` says Stability chips when an attack hits a domain or elemental weakness, lands a critical hit, or uses Kaelen's Mason skills. A critical hit on a physical or kinetic attack chips one extra segment. Break Power is a rating on weapons and skills that sets how many segments an attack removes on a weakness hit. Vitality governs maximum HP and physical stagger resistance.

The engine has no weakness chart. `Stats.brk` is stored (Kaelen starts at 1, the others at 0) and never read. `damageStability` subtracts `skill.stabilityBreak` only, plus 1 while the Obsidian domain is active for a physical skill or an Obsidian-affinity skill. There is no Vitality field. HP is `maxHp`. Nothing in the engine models stagger resistance for a hero.

Decide:

- What makes a hit a weakness hit. If the answer needs elemental types beyond Dawn, Obsidian, and Astral, say so and leave that chart in the map's Not yet specified. If weakness is domain-versus-enemy-realm, lock that rule here.
- How Break Power and `skill.stabilityBreak` combine on a weakness hit, and whether Break Power does anything on a hit that is not a weakness.
- Whether Vitality is a stat that feeds `maxHp`, a separate defensive layer, or a name the brief retires in favor of `maxHp`. If heroes have stagger resistance, say what it resists. Enemy Stability is the only stagger meter the doc describes.

The crit bonus of +1 Stability on a physical or kinetic crit is a stated number. It stands. Do not reopen the crit-chance formula. That belongs to Lock crit chance and Tempo evasion. Obsidian Reign's +1 extra Stability is also a stated number. It stands. The engine applies that +1 only to a physical skill or an Obsidian-affinity skill. Record that delta here. Close the fuzzy domain rules does not own it. That ticket's open cells are crit chance versus crit damage, which effects count as a barrier, Domain Burst's magnitude, and the three resonance passives.
