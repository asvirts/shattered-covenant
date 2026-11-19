# Define weakness, Break Power, and Vitality

Labels: wayfinder:grilling
Type: grilling
Status: resolved
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

## Answer

### Weakness is domain against domain, in a fixed cycle

- An enemy's domain affinity is its `realm` field, which already holds a `DomainType`. (At implementation, rename it to `domainAffinity`. `CONTEXT.md` reserves "Realm" for geopolitical territory.)
- **ASTRAL beats OBSIDIAN, OBSIDIAN beats DAWN, DAWN beats ASTRAL.** A hit is a weakness hit when the skill's `domainAffinity` beats the enemy's affinity. If either side is `NONE`, there is no weakness.
- Why this cycle: the doc's only example is Astral exposing an Obsidian boss's Stability core. Only one three-way cycle contains Astral → Obsidian, so the example fixes the whole chart and no lore is invented.
- No elemental types beyond Dawn, Obsidian and Astral are needed. The map's Not-yet-specified item about elemental types is closed.
- A weakness hit gets **no damage bonus**. The doc is silent and the engine has none. The payoff is Stability and +10% gauge ([02](02-heart-shard-gauge.md)).
- Today's data: Kaelen and Cassian (Obsidian kits) hit Dawn enemies' weakness, Sura (Dawn) hits Astral enemies', and Vesper (Astral) hits Obsidian enemies'.

### When a hit chips Stability, and by how much

A hit chips only if at least one of these is true: it is a weakness hit, it is a crit, it is a Mason skill (owner or Dual Tech partner is Kaelen), or it lands a Bind. Obsidian Reign also adds a flat +1 to every hit (below).

Per enemy hit:

```
trigger = weakness || crit || masonSkill || bindLanded
chip = (trigger ? skill.stabilityBreak : 0)
     + (weakness ? attacker.stats.brk : 0)
     + (crit && skill.damageType === 'PHYSICAL' ? 1 : 0)
     + (activeDomain === 'OBSIDIAN' ? 1 : 0)
     - (target is an empowered boss ? 1 : 0)   // 08
chip = max(0, chip)
```

- **Break Power** has two sources: the skill's rating (`skill.stabilityBreak`, applied whenever the hit chips) and the weapon or gear rating (`Stats.brk`, applied **only** on a weakness hit). Gear Break Power does nothing on a hit that is not a weakness.
- "Physical/kinetic" means `damageType === 'PHYSICAL'`. `HYBRID` counts as magical, because the engine defends against it with Warding. *(judgment)*
- Shattered enemies take no chip until they refill (the engine stands).
- A missed hit ([04](04-crit-and-evasion.md)) chips nothing.

### Recorded deltas

- The engine chips `skill.stabilityBreak` on **every** hit. Under the doc, an off-weakness, non-crit hit from anyone but Kaelen chips 0. This is the largest gameplay change in the brief.
- **Obsidian Reign +1:** the doc says "attacks chip +1 extra Stability", so it applies to every damaging hit on an enemy, and a hit that would chip 0 chips 1. The engine applies it only to physical or Obsidian-affinity skills. The doc wins.
- The physical crit +1 stands as stated. The engine doesn't apply it yet.
- `Stats.brk` is 0 for all four heroes in `src/data.ts`. The ticket's "Kaelen starts at 1" is out of date.

### Vitality

- **Vitality (`VIT`) is the max HP stat.** It is stored as `maxHp`, with 1 VIT = 1 max HP. There is no separate field, and armor that "provides VIT" adds max HP.
- "Physical stagger resistance" is dropped. Heroes have no Stability meter and no stagger state. Enemy Stability segments are authored per enemy (`maxStability`), not derived from Vitality.
