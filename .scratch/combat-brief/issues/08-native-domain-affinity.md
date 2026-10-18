# Define native domain affinity

Labels: wayfinder:grilling
Type: grilling
Status: open
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
