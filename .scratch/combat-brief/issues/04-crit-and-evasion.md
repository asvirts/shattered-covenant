# Lock crit chance and Tempo evasion

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

Does the doc's crit formula replace stored crit, and does Tempo grant an evasion roll?

`combat.md` says critical rate is `5% + (TMP × 0.1%)`, and that a critical hit deals 1.5× damage. It also says Tempo governs evasion as well as turn recovery and crit chance. The 1.5× multiplier is a stated number. It stands. The engine already uses 1.5×, except under the Obsidian domain, where that exception belongs to Close the fuzzy domain rules.

The engine stores `crit` on the hero (about 10–22 before gear, then weapon, talent, and glyph bonuses) and rolls `Math.random() * 100 < hero.stats.crit`. Tempo never feeds that number. There is no evasion roll on incoming attacks.

Decide:

- Whether `5% + (TMP × 0.1%)` replaces stored crit, is the base that gear adds to, or is only the floor before other sources.
- Whether Tempo grants evasion, and if it does, what the roll avoids (a physical hit, a magical hit, or both) and how Grit and Warding relate to a miss. If evasion is not a combat rule, say that explicitly so the brief drops it. The doc names it, so silence is not available. The engine simply never implemented it.

Do not change the damage formula. The doc is silent on it, so `useHeroSkill` stands. Do not assign the +1 Stability chip on a physical crit. That number already stands on Define weakness, Break Power, and Vitality.

## Answer

### Crit chance: the doc's formula is the base, and gear adds on top

```
critChance% = 5 + 0.1 × stats.tmp + stats.crit + situational
critChance  = min(100, critChance)
```

- `stats.crit` now holds **only bonuses** from weapons, talents, glyphs and trinkets. The heroes' stored base crit (Kaelen 4, Sura 18, Vesper 12, Cassian 15) goes to 0. The doc's formula replaces it.
- `stats.tmp` is Tempo after gear. Haste and Slow multipliers don't feed crit. *(judgment: it keeps crit stable within a turn)*
- Situational adds: Obsidian Reign +20 ([07](07-fuzzy-domain-rules.md)) and a Keen surge +30 ([06](06-ley-line-surge-catalog.md)).
- Effects that guarantee a crit (Sura's Sky-Dive in Dawn on a Shattered target) stand.
- A crit deals 1.5× in every domain. Crit is rolled per target hit, as the engine does now.
- **Enemies crit too**, using the same formula with no bonus term (about 6.4–7.2% for today's templates). The doc's stat section is titled "Character & Enemy Stats", and Kaelen's Basalt Skin talent already reduces incoming crit damage. *(judgment)* An enemy crit gives the party no crit gauge. The party gains only through the taking-damage row in [02](02-heart-shard-gauge.md).

### Evasion: yes, small, and physical single-target only

```
evadeChance% = 0.2 × defender.stats.tmp      // TMP 25 → 5%, TMP 15 → 3%
```

- Only a **single-target `PHYSICAL`** attack can be evaded. Multi-target attacks, `MAGICAL` and `HYBRID` damage, heals and Domain Burst always land.
- It applies to heroes and enemies alike.
- Grit and Warding have nothing to do with hit chance. They only reduce damage once a hit lands.
- Order per target: the evasion roll comes first, then the crit roll.
- A Shattered enemy cannot evade. A Leg Bind sets the target's evasion to 0. Blind adds to the attacker's miss chance, and its number belongs to the Ailment design.
- **On a miss:** no damage, no Stability chip, no status from that hit, no weakness or crit gauge, and no taking-damage gauge. The attacker's action gain (+5% or +8%) still applies. The log and the floating text say **MISS**, kept distinct from **IMMUNE** per `combat.md` §5 rule 7.
- *(judgment)* Why keep evasion at all: the doc names it, and Leg Bind ("prevents evasion") and Blind ("reduces physical accuracy") only mean something if it exists. Keeping it small and physical-only means a telegraphed cleave or a spell can never be dodged by luck, and the deliberate answers (Taunt, Sky-Leap, Redact, shields) stay the reliable ones.

### Engine delta

- `Math.random() * 100 < hero.stats.crit` becomes the formula above.
- Enemies never crit today. There is no evasion roll today.
