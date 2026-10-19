# Quality-of-Life, Accessibility & UX Baseline

This document is the canonical list of the friction-removal features that *Shattered Covenant* treats as **launch-blocking**, not post-launch niceties. Every item here traces to a specific player complaint captured in [`research.md`](./research.md): the through-line is that players will forgive a nostalgic aesthetic but not wasted time, opaque rules, or lost progress.

**Governing principle:** the default experience should respect the player's time. Options exist to let players *opt into* more friction (or less), never to make the baseline unpleasant.

---

## 1. Accessibility & Input

| Feature | Behavior |
| :--- | :--- |
| **Wait mode** | The CTB Timeline pauses while a command menu is open. No turn-based player is ever rushed while reading a menu ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)). |
| **Auto-timing** | If any timed-hit or parry input is ever added, it ships with a 100% auto-success toggle. *Shattered Covenant* currently ships with **no mandatory QTEs**—turn-based combat stays turn-based ([r/gamedesign](https://www.reddit.com/r/gamedesign/comments/1s9e2pz/what_makes_a_turnbased_combat_system_actually_fun/)). |
| **Face-button mapping** | The four battle command categories map to the controller's face buttons for eyes-free input flow ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)). |
| **Full remapping** | All keyboard/gamepad bindings are remappable, including menu confirm/cancel. |
| **Text & subtitles** | Adjustable text speed, auto-advance, subtitle size, and high-contrast dialogue backgrounds. |
| **Screen-reader-friendly menus** | Menu labels are plain-language; icons never carry meaning alone. |

---

## 2. Combat Flow & Speed

* **Input queueing:** the player can begin the next hero's command while the previous animation is still playing. The cursor never waits on a spell to finish ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Turbo toggle:** built-in **2× / 4×** battle speed, adjustable on the fly and persisted across sessions.
* **Skip seen animations:** spell and summon animations are skippable after their first viewing; enemy death dissolves never block input.
* **Instant transitions:** the 0.5-second rune-shatter transition doubles as the loading veil. There are no camera pans, battle-intro swirls, or unskippable wind-ups ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/)).
* **Instant boss retry:** on a party wipe, the game offers **Retry** and **Retry with Loadout Adjustment** at the arena entrance—never a title-screen boot and a dungeon re-clear ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Auto-resolve trivial fights:** contacting an enemy whose level is far below the party's triggers a one-button auto-win with full rewards (EarthBound / *Dragon Quest XI S* model), or the enemy simply flees ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).

---

## 3. Information Transparency

Players repeatedly ask to be told what the rules *are* rather than left to guess ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).

* **Exact tooltips:** every skill, Glyph, Talent, and stat shows its exact multiplier, damage type (physical vs. magical), `INS` cost, cooldown, and infliction %—before the turn is committed.
* **Plain-language stat explanations:** hovering any stat (`VIT`, `INS`, `MGT`, `RES`, `GRT`, `WRD`, `TMP`) opens a one-sentence explanation of what it governs and who scales with it.
* **RNG vs. immunity:** the battle log distinguishes **MISS** (the roll failed) from **IMMUNE** (the target is genuinely resistant), so players learn instead of guessing ([r/JRPG](https://www.reddit.com/r/JRPG/comments/13m93jw/status_effects_yay_or_nay_and_which_jrpg_games/)).
* **Enemy Codex:** once an enemy is fought, its per-ailment resistances, Stability segments, and known telegraphs are recorded and viewable in the menu ([r/JRPG](https://www.reddit.com/r/JRPG/comments/13m93jw/status_effects_yay_or_nay_and_which_jrpg_games/)).
* **Damage & status previews:** targeting an enemy previews expected damage range and the infliction chance on the target line.
* **Visible timers:** ailment/Bind durations and stacking-resistance counters are displayed on the portrait at all times.
* **Equipment comparison:** shop and inventory screens show a stat-delta preview against currently equipped gear.

---

## 4. Encounter Control

* **Visible enemies only:** dungeons and field zones use patrol-based on-map enemies; there are no blind random encounters ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Puzzle-room sanctuary:** no enemy spawns or ambushes inside a puzzle room—players are never interrupted while solving ([r/JRPG](https://www.reddit.com/r/JRPG/comments/14a9jp1/turn_based_jrpg_enthusiasts_what_are_your_main/)).
* **Outleveled enemies flee** on sight, and touching them offers the auto-resolve prompt instead of a full battle.
* **Encounter-rate fallback:** if any zone ever uses pressure-based spawning, it exposes a slider (Off / Low / Normal / High), following the *Final Fantasy* remaster "No Encounters" precedent.
* **Field ambush is opt-in value:** striking an enemy first grants the Stability/Domain advantage; avoiding combat entirely is always a valid choice.

---

## 5. Content Availability (No Missables)

Classic JRPGs often gate ultimate weapons and true endings behind irreversible choices; modern players exploring without a walkthrough find that hostile ([r/JRPG](https://www.reddit.com/r/JRPG/comments/1czqnwg/what_mechanics_do_you_like_to_see_in_a_turnbased/), [r/JRPG](https://www.reddit.com/r/JRPG/comments/1vjvqjj/why_does_this_sub_hate_sea_of_stars/)).

* **No permanently missable endgame content.** Unique weapons, Glyphs, lore tablets, and true-ending prerequisites remain obtainable after the credits roll or via a post-game return.
* **Unreachable chest relocation:** if a container becomes unreachable because of a one-time opening order, its contents move to the **Hall of the Rubbings** at the Grand Archive once the dungeon is cleared.
* **No "wrong chest" traps:** opening a chest never locks the player out of an ultimate weapon or a permanent upgrade.
* **Quest state is recoverable:** abandoned or failed sidequests return to the board rather than vanishing silently.
* **Collectibles are tracked:** the journal shows a per-zone completion count so players know whether they missed something without consulting a guide.

---

## 6. Narrative & Save QoL

* **Pause-first cutscenes:** Start pauses rather than skips; skipping requires a second confirm ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Dialogue log:** a scrollable backlog of recent dialogue, reachable from the pause menu.
* **Story So Far:** on load, a one-screen recap of the current objective and recent story beats so returning players are oriented immediately ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Generous autosave:** autosave at every **Titan Waygate**, zone transition, and boss-arena entrance, plus a suspend save that survives closing the game.
* **Objective marker in the journal:** current goal is always one button away, without a floating quest arrow that spoils exploration.

---

## 7. Party & Progression QoL

* **Full-party XP:** all four heroes fight in every battle, so nobody benches, falls behind, or needs a catch-up grind ([r/JRPG](https://www.reddit.com/r/JRPG/comments/164h5oa/quality_of_life_features_a_modern_jrpg_absolutely/)).
* **Free respec at every Waygate**, with a one-screen summary of what changed.
* **Loadout presets:** save and swap Glyph/Talent/equipment sets between fights.
* **Bulk actions:** sort, filter, and "sell all junk" in shops; no per-item confirm spam.
* **Glyph quick-scroll:** the tablet and crafting menus support page-jump and filter, avoiding the tedious crystal-menu problem ([r/JRPG](https://www.reddit.com/r/JRPG/comments/10k2oss/chained_echoes_refilling_my_hpmp_was_great_at/)).

---

## 8. Traceability

| Player complaint (from `research.md`) | Feature that answers it | Primary doc |
| :--- | :--- | :--- |
| Bosses are blanket-immune to statuses | Ailments & Binds fairness rules, visible infliction % | `combat.md` §5 |
| "Spam basic attack until you win" | Attack economy, meaningful Defend | `combat.md` §1 |
| Slow transitions / unskippable animations | Turbo, input queueing, skippable spells | `graphics-and-art-direction.md`, §2 here |
| 40-minute HP-sponge bosses | Tactics-based difficulty, enrage timers | `combat.md` §6 |
| Random encounters in puzzle rooms | Puzzle-room sanctuary rule | `locations-and-dungeons.md` §6 |
| Bloated `Fire 1/2/3` spell lists | 6–10 evolving abilities per hero | `progression-and-items.md` §2 |
| Permanently missable endgame content | No-missable policy, chest relocation | §5 here |
| Instant game-over when the protagonist falls | Party-wipe-only defeat rule | `combat.md` §6 |
| Underleveled benched characters | Fixed four-hero party, full-party XP | `progression-and-items.md` §5 |
| Opaque stats and hidden infliction odds | Exact tooltips, Enemy Codex, MISS vs IMMUNE | §3 here |
| No pause / log / recap for returning players | Pause-first scenes, dialogue log, Story So Far | §6 here |
