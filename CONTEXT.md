# Shattered Covenant (Vaelora)

A turn-based fantasy JRPG set on the continent of Vaelora, where the shattering of the Edict Pillar has plunged three neighboring superpowers into a race to claim its Four Great Shards and rewrite the magical laws of the world.

## Language

### World & Cosmology

**Vaelora**:
The single interconnected continent where the game takes place, divided among three neighboring superpower Realms surrounding the central crater of the shattered Edict Pillar.

**Edict Pillar**:
The colossal divine monolith carved by the ancient Titans at the center of Vaelora to balance the continent's ley-lines and govern the laws of magic prior to its shattering.
_Avoid_: Covenant Pillar (use *The Covenant Stone* only as an in-world liturgical epithet)

**Great Shard**:
One of the four massive fragments of the shattered Edict Pillar that crashed into the four ancient, sealed Titan Vaults across Vaelora.
_Avoid_: World Shard, Pillar Fragment

**Heart-Shard**:
The palm-sized core of the Edict Pillar that fell into Oakhaven's quarry and fused permanently to Kaelen Vance's mason gauntlet, serving as the sole key capable of unsealing Titan Vaults, re-inscribing Titan Waygates, and shifting Domains.
_Avoid_: Core Shard

**Realm**:
One of the distinct geopolitical territories of Vaelora: the three superpowers (*The Mythic Dawn*, *The Obsidian Reign*, *The Astral Wastes*), the neutral hub (*The Grand Archive*), and the border region (*The Frontier*).
_Avoid_: Era, timeline, dimension, zone, domain (when referring to a geopolitical territory)

**Frontier**:
The border-region Realm of Act I, containing Oakhaven, the Cratered Quarry, and the Kingsroad Pass, lying between The Obsidian Reign and The Mythic Dawn.
_Avoid_: treating Oakhaven as part of The Obsidian Reign

**Domain**:
One of the three primal magical aspects of the Edict Pillar (`DAWN`, `OBSIDIAN`, `ASTRAL`) drawn from Vaelora's ley-lines and channeled through the Heart-Shard Gauntlet to transform field Wardstones or shift the active battlefield ley-line state.
_Avoid_: Element, school, realm (when referring to the magical energy or affinity)

### Exploration & World Mechanics

**Zone**:
A discrete, walkable 2D tile-grid map representing a specific location in Vaelora (a town, canyon pass, Titan Vault, or sanctuary), connected to other Zones via border exits, Titan Waygates, or Sun-Drake travel.
_Avoid_: Overworld grid, room, level, stage

**Regional Hub**:
The primary fortified settlement Zone within each of the three superpower Realms in Act II (**Sun-Scale Hold** in The Mythic Dawn, **Cinderhold** in The Obsidian Reign, and **The Star-Bound Conclave** in The Astral Wastes), linked directly to The Grand Archive and serving as the staging base for its Realm's Warzone Approach and Titan Vault.
_Avoid_: Blackrock Spire, Imperial Foundry, The Iron Bastion (for Cinderhold); Outpost of the Star-Bound, Mirage Sanctum (for The Star-Bound Conclave)

**Warzone Approach**:
The contested outdoor route Zone connecting a Realm's Regional Hub to its ancient Titan Vault (**Emerald Canopy Causeway** in The Mythic Dawn, **Blackrock Magma Viaduct** in The Obsidian Reign, and **Shattered Star-Dunes** in The Astral Wastes).
_Avoid_: World map route, overworld path

**Local Wardstone**:
An ancient regional ley-line monolith within a Zone into which Kaelen can channel any unlocked Domain (`DAWN`, `OBSIDIAN`, `ASTRAL`) to dynamically transform surrounding terrain and puzzle obstacles.
_Avoid_: Obelisk, shrine, switch

**Titan Waygate**:
An ancient teleportation arch whose runes can be re-inscribed by the Heart-Shard Gauntlet to unlock fast travel between discovered Waygates, full party restoration, and free Talent respecs.
_Avoid_: Save point, portal, teleporter

**Vaelora Map**:
The illustrated, non-walkable travel selector of the continent, opened from a Titan Waygate (discovered Waygates only) or by calling the Sun-Drakes from an open-sky Zone (adds high-altitude dungeons, hidden Titan sanctuaries and The Sunken Reliquary).
_Avoid_: Overworld, world map (when implying a walkable grid)

**Sun-Drake**:
A tamed sky-mount earned in The Mythic Dawn during Act II that unlocks elevated sky-map travel to reach high-altitude dungeons, hidden Titan sanctuaries, and The Sunken Reliquary across the central sea.
_Avoid_: Airship, wyvern mount (wyverns are ridden by Sun-Scale scouts; the party's tamed mounts are Sun-Drakes)

**Tri-Realm Forging**:
The signature multi-step weapon crafting questline (unlocking Weapon Tier 4) in which a dormant weapon frame is tempered in The Obsidian Reign, infused with living amber in The Mythic Dawn, and etched with star-runes in The Astral Wastes.
_Avoid_: Weapon synthesis, generic anvil upgrade

**World Phase**:
One of the three global narrative acts (`ACT_I_QUARRY_FALL`, `ACT_II_VAULT_RACE`, `ACT_III_UNWRITTEN_COVENANT`) that governs available Zones, regional NPC/faction states, and the transformation of The Grand Archive into The Spire of the First Word alongside the Tri-Realm Coalition War Camp. Always derived from Story Beats, never stored.
_Avoid_: World state, chapter, era

**Story Beat**:
One named, permanent moment of story progress (e.g. `shard_fell`, `sura_joined`, `seraphine_betrayal`), drawn from a fixed typed list and recorded once in `WorldMemory`. Beats are the only record of story progress: recruitment, recovered Great Shards, faction changes and one-time scenes are all beats.
_Avoid_: Story flag, quest flag, switch

**Scene**:
A scripted sequence (dialogue, fades, battles, party changes) written as an async TypeScript function and started by a Zone trigger. Scenes are the only thing that add Story Beats.
_Avoid_: Cutscene script, event (when referring to the authored sequence)

### Combat & Battle Systems

**Heart-Shard Gauge**:
The party's shared three-Charge meter (0–100%), filled by hero actions, weakness hits, critical hits, Shatters and damage taken, and spent to Strike the Heart-Shard for a Domain shift. Only Domains the party has unlocked can be struck.
_Avoid_: Ley-Line Gauge, Domain Gauge

**Timeline Tick**:
The unit of the CTB Timeline's shared clock, equal to 10 turn-counter units. Domain durations, Recovery Delays and Shattered knockback are measured in Ticks.
_Avoid_: turn, round (when meaning clock time)

**Recovery Delay**:
The Ticks an action adds to its user's next turn on top of the Tempo interval: Free (0, the turn continues), Fast (+0) or Heavy (+3).
_Avoid_: cast time, wind-up

**Weakness Hit**:
A hit whose skill Domain beats the target's Domain affinity in the cycle Astral → Obsidian → Dawn → Astral. It chips Stability and charges the Heart-Shard Gauge but adds no damage.
_Avoid_: elemental weakness

**Break Power**:
The Stability segments an attack removes: the skill's rating whenever its hit chips, plus the weapon's rating on a Weakness Hit.
_Avoid_: stagger power

**Ley-Line Surge**:
One of four effects (+30% Crit, Zero INS Cost, Ley Surge, Volatile Shock) attached to every 4th turn of a battle, applied to whichever unit takes that turn.
_Avoid_: surge bonus

**Intent Line**:
The telegraphed target rule on an enemy's next action (Highest Threat, Lowest HP, a named hero, All, Charging, Fortifying), shown with the hero it currently points at.
_Avoid_: AI pattern, enemy script (when meaning the visible forecast)

**Ambient Domain**:
The Domain a battle returns to when a party shift expires: neutral in normal battles, the boss's native Domain in boss battles.
_Avoid_: default domain, base state

**Empowered**:
A boss's state while its native Domain is active: +20% damage dealt and 1 less Stability chipped per hit.
_Avoid_: enraged, buffed

**Stability**:
An enemy's visible carved-rune stagger meter, chipped by weakness hits, critical hits, Binds, and Kaelen's Mason skills, and emptied to trigger *Shattered*.
_Avoid_: Break gauge, poise, stagger bar

**Shattered**:
The stagger state an enemy enters when its Stability reaches zero, cancelling its charged action, knocking it back on the CTB Timeline, and multiplying incoming damage until its next turn.
_Avoid_: Broken, stunned, toppled

**Ailment**:
A layer-one status effect applied to an ally or enemy that alters its behavior over time (Poison, Bleed, Burn, Silence, Blind, Slow, Stun, Weaken/Vulnerable).
_Avoid_: Debuff, condition, affliction (when referring specifically to an Ailment)

**Bind**:
A layer-two status effect that seals one specific body-part capability of an enemy—`Head` (casting/breath), `Arm` (physical strikes), or `Leg` (charge/movement)—without disabling the enemy's whole turn.
_Avoid_: Part break, limb lock, disable (reserve *break* for Stability)

**Enemy Codex**:
The in-menu record that reveals an encountered enemy's per-Ailment resistances, Stability segments, and known telegraphed moves.
_Avoid_: Bestiary, monster log
