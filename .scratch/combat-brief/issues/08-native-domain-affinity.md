# Define native domain affinity

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by:

## Question

What does a boss's native domain affinity do, in a rule that applies before any particular boss is scripted?

`combat.md` says every major boss has a native domain affinity that empowers them until the party overwrites the battlefield domain. The only illustration is Forge-Lord Malakor's Magma Colossus: Obsidian Reign superheats its armor, Astral Wastes flash-cools the plates and exposes the Stability core, and Mythic Dawn entangles its legs so it cannot charge an arena cleave.

The engine stores an enemy `realm` and never reads it as an affinity. Shifting the domain does not empower or weaken a boss.

Decide the general rule:

- What "empowered" means while the active domain matches the boss's native affinity. A stat modifier, a locked or strengthened intent, or both are the live options. Name which.
- What "overwritten" means for that empowerment. It ends when the battlefield domain is something else, including neutral, or only when the party shifts to a counter-domain.
- Whether a non-native domain can impose a stated penalty, or whether penalties are boss-script content and therefore out of scope for this brief.

Malakor's superheat, frost, and sun-roots stay an example. Do not design that fight, or any other boss script. Individual boss scripts are out of scope on the map.

## Answer

### Which enemies, which domain

- Only bosses (`isBoss: true`) have a native domain affinity. It is their domain affinity, the `realm` field ([03](03-weakness-break-vitality.md)). Normal enemies' affinity drives weakness only.

### A boss battle starts in the boss's native domain

- `combat.md` says battles begin neutral "or the dungeon's ambient biome", and that a boss is empowered "until overwritten". So a boss battle starts with the boss's native domain already active as the **ambient domain**. It has no tick limit, and the HUD shows it as "native". *(judgment)*
- When a party shift's ticks run out, the battlefield goes back to the **ambient domain**: neutral in a normal battle, the boss's native domain in a boss battle. [10](10-surge-and-domain-placement.md) applies this. The party has to keep overwriting.
- If one battle has bosses with different native domains, the ambient domain is the first boss's in the encounter list. Each boss is empowered only by its own domain.
- The ambient domain's global rule applies to both sides like any domain. For example, Vane's fight starts under Obsidian Reign, so crit +20 applies to everyone.

### Empowered

While the active domain equals the boss's native domain, the boss is **empowered**. That's a stat modifier with two parts:

1. **Guarded core:** every hit's Stability chip on the boss is reduced by 1 (minimum 0). This term is already in the chip formula on [03](03-weakness-break-vitality.md). Under its own Obsidian Reign, an Obsidian boss's guard cancels the domain's +1.
2. **+20% outgoing damage.**

- *(judgment, numbers)* Both parts are generic and readable on the HUD ("Empowered"), and they press on the core loop: the boss is hard to break and hits harder until the party strikes the Heart-Shard. Locked or strengthened intents were the other option. They are left to boss scripts, because a generic intent rule would have to know each boss's moves.

### Overwritten

- Empowerment ends the moment the active domain is anything other than the native one, whether the party struck a counter-domain or not. With the ambient rule above, a boss battle is never neutral.
- The party may strike the boss's own domain. That empowers the boss and gains nothing, and nothing stops them.

### Penalties from other domains

- There is **no generic penalty** beyond losing empowerment. The weakness cycle already rewards attacks with the counter-domain. Specific penalties, like Malakor's flash-frozen plates or sun-root legs, are boss-script content and out of scope.

### Engine delta

- `realm` is never read as an affinity today, and boss battles start neutral. `startBattle` sets the ambient domain from the boss, and domain expiry reverts to ambient instead of `'NONE'`.
