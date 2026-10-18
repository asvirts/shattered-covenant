# Close the fuzzy domain rules

Labels: wayfinder:grilling
Type: grilling
Status: open
Blocked by:

## Question

Which domain-table cells did the engine guess, and what are the three resonance passives and the Domain Burst in rules the engine can apply?

These cells are already numeric. Do not reopen them. Record the engine delta and leave the doc's number in place:

- Mythic Dawn: physical and elemental damage +25%, Grit and Warding −15%, regen and bleed tick twice. The engine applies +25% to hero damage, +15% to enemy damage, and the defense cut only on the defense stat that matches the hero's damage type. Regen and bleed already tick twice while Dawn is active, so that part of the cell matches.
- Astral Wastes: skill Inscription costs halved, cooldowns tick down twice as fast, and turn-delay and haste effects are +50% stronger. The engine roughly matches this (`getEffectiveInsCost`, cooldown step 2, and ×1.5 on `ctbAdvance` and `ctbDelay`).

Decide the cells the doc leaves fuzzy or the engine implemented as a guess:

- Obsidian Reign says `CRIT%` increases by +20%. The engine treats that as crit damage (1.7× instead of 1.5×) and the battle log calls it +20% crit damage. Lock whether +20% is crit chance or crit damage.
- Obsidian Reign says barrier and shield values increase by +30%. The engine applies that only to Bastion Decree (46 instead of 35). Lock which effects count as a barrier or a shield.
- Domain Burst: the doc says an overdrive shift unleashes an immediate area burst and gives no magnitude. The engine deals 65 damage and 2 Stability to every living enemy. Lock the burst's magnitude.
- Resonance passives, which are absent from the engine. Hook each one to an existing skill. Do not redesign the skill.
  - Sura's Apex Predator: Sky-Leap dives resolve instantly with 0 turn delay while Mythic Dawn is active.
  - Kaelen and Cassian's Forgeborn Calibration: attacks restore 10% Inscription and deal +15% damage to armored or shielded foes while Obsidian Reign is active. Define what counts as armored or shielded.
  - Vesper's Zero-Point Conduit: single-target heals and shields splash to all allies at 50% potency while Astral Wastes is active.

How many ticks a shift lasts is not this ticket. Place surges and domain duration on the clock owns the count, once Define the global timeline tick has named the unit. The doc's 4 and 8 stand.
