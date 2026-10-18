# Combat brief

Labels: wayfinder:map

## Destination

A locked combat brief. When this map has no open tickets, every ambiguous rule in `combat.md` has been decided against the current battle engine, and a later session can change `src/battle.ts` without reopening design.

## Notes

Reconcile `combat.md` with the battle engine in `src/battle.ts`, `src/types.ts`, `src/main.ts`, and `src/data.ts`. The destination is the brief, not the build. Implementation is a handoff after the map is empty.

Sessions that resolve a ticket use the grilling and domain-modeling skills. There is no `CONTEXT.md` yet. Write a glossary term only when a ticket actually resolves it.

Standing rules:

- Where `combat.md` states a number, the doc wins. Record the engine delta on the ticket. Do not open a new ticket to relitigate it.
- Where the doc is silent, the engine stands. No ticket. That includes the damage formula in `useHeroSkill`, shield absorption, and the undocumented revive of KO'd allies at 25% HP.
- A ticket exists only where the doc names a rule the engine cannot apply without a choice.
- Character kits, items, dungeon layouts, boss scripts, and arena art stay out of scope. A ticket may name an existing skill a combat rule hooks. It may not redesign that skill.

Do not reopen. The doc already states these, or the engine already matches them:

- All four recruited heroes fight. There is no row system.
- Field ambush cracks 1 Stability segment and adds 15% gauge. The engine adds 45.
- After a normal battle, each hero recovers 25% of max Inscription.
- Titan Waygates restore full HP and Inscription.
- Strike the Stone is a free action and does not end the turn.
- Shattered cancels a channel, grants 1.5× damage, and refills when that enemy's next turn starts. Knockback distance is still open; it lives on Assign recovery delay and Shattered knockback.

## Decisions so far

## Not yet specified

- Any elemental type beyond Dawn, Obsidian, and Astral, if Define weakness, Break Power, and Vitality decides that weakness is bigger than domain-versus-enemy-realm.
- Per-skill Threat weights, if Lock threat and telegraphed intent locks the model but not the weights.
- Anything Define the global timeline tick reveals about haste, slow, and swap that is not already on Assign recovery delay and Shattered knockback.

## Out of scope

- Implementing the brief. The map ends when the rules are decided.
- Skill, talent, weapon, glyph, and trinket design in `characters.md` and `progression-and-items.md`.
- Dungeon layout, patrols, camps, and towns in `locations-and-dungeons.md`. The full-restore rule is in scope. Building those places is not.
- Individual boss scripts, including Malakor's puzzle. Define native domain affinity locks the rule only.
- Arena art, music, and VFX in `graphics-and-art-direction.md`.
