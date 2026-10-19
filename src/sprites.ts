import { DomainType, Enemy, Hero, HeroId } from './types';
import { applyPixelOutline } from './pixel-art';

// ---------------------------------------------------------------------------
// SEA OF STARS STYLE: 100% PIXEL-GRID-LOCKED FRAME-BY-FRAME SPRITE ENGINE
// - Zero downscaled JPEGs, zero scanline shearing, zero sub-pixel mixels.
// - Every frame is drawn on an exact integer pixel grid (1px = 1px on 640x360),
//   outlined with a unified 1px dark plum-charcoal border (#161020), and
//   stepped at discrete frame rates (6-8 FPS) just like Sea of Stars / Chrono Trigger.
// ---------------------------------------------------------------------------

export interface BattleVfxEffect {
  id: number;
  type: 'SLASH' | 'SEISMIC' | 'SPEAR_DIVE' | 'ASTRAL_NOVA' | 'INK_BLOT' | 'HEAL_WAVE';
  x: number;
  y: number;
  color: string;
  timer: number;
  maxTimer: number;
}

const frameCache = new Map<string, HTMLCanvasElement>();

export function drawPointLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colorHex: string,
  alpha = 0.35
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const grad = ctx.createRadialGradient(
    Math.round(x),
    Math.round(y),
    2,
    Math.round(x),
    Math.round(y),
    radius
  );
  grad.addColorStop(0, hexToRgba(colorHex, alpha));
  grad.addColorStop(0.5, hexToRgba(colorHex, alpha * 0.45));
  grad.addColorStop(1, hexToRgba(colorHex, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type PoseType = 'IDLE' | 'WALK' | 'ATTACK' | 'CAST' | 'HIT';

/** Returns a cached pixel sprite frame for the hero’s pose, weapon tier, and optional apprentice shard. */
function getHeroFrameCanvas(
  heroId: HeroId,
  pose: PoseType,
  frameIdx: number,
  weaponTierIndex: number,
  weaponColor: string,
  glowColor: string,
  showShard = false
): HTMLCanvasElement {
  const key = `sos_hero_${heroId}_${pose}_${frameIdx}_w${weaponTierIndex}_s${showShard ? 1 : 0}`;
  const cached = frameCache.get(key);
  if (cached) return cached;

  const W = 44;
  const H = 44;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Discrete pixel-stepped offsets for breathing and walking (strictly integer pixels!)
  const breathY = pose === 'IDLE' && (frameIdx === 1 || frameIdx === 2) ? 1 : 0;
  const walkBobY = pose === 'WALK' && (frameIdx === 1 || frameIdx === 3) ? -1 : 0;
  const bodyY = breathY + walkBobY;

  // Leg positions for 4-frame walk vs idle
  let leftLegX = 16;
  let leftLegY = 32;
  let rightLegX = 22;
  let rightLegY = 32;

  if (pose === 'WALK') {
    if (frameIdx === 0) {
      leftLegX = 14;
      leftLegY = 31;
      rightLegX = 24;
      rightLegY = 32;
    } else if (frameIdx === 1) {
      leftLegX = 17;
      leftLegY = 32;
      rightLegX = 21;
      rightLegY = 31;
    } else if (frameIdx === 2) {
      leftLegX = 23;
      leftLegY = 32;
      rightLegX = 15;
      rightLegY = 31;
    } else {
      leftLegX = 20;
      leftLegY = 31;
      rightLegX = 18;
      rightLegY = 32;
    }
  } else if (pose === 'ATTACK') {
    leftLegX = 14;
    rightLegX = 25;
  }

  if (heroId === 'kaelen' && weaponTierIndex < 1) {
    // Apprentice mason: linen, rope belt, scuffed boots, a nicked chisel. No pauldron, scarf, or relic glow.
    px(leftLegX, leftLegY, 4, 6, '#57534e');
    px(leftLegX, leftLegY + 4, 5, 3, '#292524');
    px(rightLegX, rightLegY, 4, 6, '#44403c');
    px(rightLegX, rightLegY + 4, 5, 3, '#1c1917');

    px(15, 19 + bodyY, 12, 13, '#d6d3d1');
    px(16, 20 + bodyY, 10, 9, '#e7e5e4');
    px(15, 18 + bodyY, 12, 2, '#a8a29e');
    px(15, 27 + bodyY, 12, 3, '#78350f');
    px(20, 28 + bodyY, 2, 2, '#a8a29e');

    const headY = 8 + bodyY;
    px(15, headY + 3, 12, 9, '#cf8d6c');
    px(16, headY + 2, 11, 8, '#f5cba7');
    px(17, headY + 2, 8, 4, '#ffe0c8');
    px(20, headY + 5, 2, 2, '#1e1b4b');
    px(21, headY + 5, 1, 2, '#f59e0b');
    px(25, headY + 5, 2, 2, '#1e1b4b');
    px(26, headY + 5, 1, 2, '#f59e0b');
    px(14, headY, 14, 4, '#292524');
    px(15, headY - 1, 10, 3, '#44403c');
    px(14, headY + 3, 3, 4, '#292524');
    px(24, headY + 2, 3, 3, '#292524');

    const armY = 22 + bodyY + (pose === 'CAST' ? -3 : 0);
    px(12, armY, 5, 4, '#92400e');
    px(13, armY + 1, 3, 2, '#b45309');
    if (showShard) {
      px(14, armY + 1, 2, 2, '#c084fc');
    }

    if (pose === 'ATTACK') {
      px(24, 22 + bodyY, 12, 2, '#78350f');
      px(34, 18 + bodyY, 5, 8, '#6b7280');
      px(35, 19 + bodyY, 3, 5, '#9ca3af');
    } else {
      const wY = 14 + bodyY;
      px(26, wY + 4, 2, 12, '#78350f');
      px(23, wY + 1, 8, 5, '#4b5563');
      px(24, wY + 2, 6, 3, weaponColor);
    }
  } else if (heroId === 'kaelen') {
    // 1. Billowing Crimson Scarf Tail (behind shoulder, 4 distinct pixel frames)
    const scarfY = 18 + bodyY;
    px(9, scarfY + (frameIdx % 2), 6, 4, '#991b1b');
    px(7, scarfY + 1 + ((frameIdx + 1) % 2), 5, 4, '#dc2626');
    if (frameIdx === 1 || frameIdx === 2) {
      px(5, scarfY + 2, 3, 3, '#ef4444');
    }

    // 2. Boots & Legs (pixel-stepped walk/idle)
    px(leftLegX, leftLegY, 4, 6, '#3f3f46');
    px(leftLegX, leftLegY + 4, 5, 3, '#27272a');
    px(leftLegX + 1, leftLegY + 4, 3, 1, '#d97706'); // Brass boot cuff

    px(rightLegX, rightLegY, 4, 6, '#52525b');
    px(rightLegX, rightLegY + 4, 5, 3, '#27272a');
    px(rightLegX + 1, rightLegY + 4, 3, 1, '#fbbf24');

    // 3. Torso: Slate Mason Tunic, Leather Brigandine & Brass Belt
    px(15, 19 + bodyY, 12, 13, '#334155'); // Base tunic
    px(16, 20 + bodyY, 10, 10, '#475569'); // Tunic midtone
    px(15, 27 + bodyY, 12, 3, '#78350f'); // Heavy leather belt
    px(20, 27 + bodyY, 3, 3, '#fbbf24'); // Gold belt buckle

    // Crimson Scarf Collar & Steel Shoulder Pauldron
    px(14, 18 + bodyY, 14, 3, '#dc2626');
    px(15, 18 + bodyY, 12, 2, '#ef4444');
    px(13, 19 + bodyY, 5, 5, '#94a3b8'); // Left Pauldron
    px(14, 20 + bodyY, 3, 2, '#e2e8f0'); // Pauldron shine

    // 4. Expressive Sea-of-Stars Head & Spiky Dark Hair
    const headY = 7 + bodyY;
    px(15, headY + 3, 12, 9, '#cf8d6c'); // Skin shadow
    px(16, headY + 2, 11, 8, '#f5cba7'); // Warm skin midtone
    px(17, headY + 2, 8, 4, '#ffe0c8'); // Forehead highlight

    // Eyes (2px tall with sclera + amber iris)
    px(20, headY + 5, 2, 2, '#1e1b4b');
    px(21, headY + 5, 1, 2, '#f59e0b');
    px(25, headY + 5, 2, 2, '#1e1b4b');
    px(26, headY + 5, 1, 2, '#f59e0b');

    // Spiky Layered Mason Hair (Sea of Stars style volume)
    px(13, headY, 15, 5, '#1e1b24');
    px(14, headY - 2, 12, 4, '#2e2938');
    px(16, headY - 3, 5, 2, '#484057'); // Hair highlight spike
    px(22, headY - 2, 5, 2, '#484057');
    px(14, headY + 3, 3, 5, '#1e1b24'); // Sideburn lock
    px(19, headY + 2, 3, 3, '#2e2938'); // Front bang

    // 5. Heart-Shard Gauntlet (Left Front Arm)
    const armY = 21 + bodyY + (pose === 'CAST' ? -4 : 0);
    px(12, armY, 5, 5, '#b45309');
    px(13, armY + 1, 3, 3, '#fbbf24');
    px(14, armY + 1, 2, 2, '#c084fc'); // Glowing Heart-Shard core

    // 6. Evolving Heavy Chisel-Maul (Pixel-locked in Right Hand)
    if (pose === 'ATTACK') {
      // Forward smash pose
      px(24, 20 + bodyY, 14, 2, '#78350f'); // Horizontal haft
      px(33, 14 + bodyY, 8, 12, '#3f3f46');
      px(34, 15 + bodyY, 6, 10, weaponColor);
      px(35, 18 + bodyY, 4, 4, glowColor);
    } else {
      // Resting / Poised over shoulder
      const wY = 10 + bodyY - (frameIdx === 2 ? 1 : 0);
      px(26, wY + 4, 2, 16, '#78350f'); // Wooden haft
      px(22, wY, 10, 6, '#3f3f46'); // Maul bevel
      px(23, wY + 1, 8, 4, weaponColor); // Maul head
      px(25, wY + 2, 4, 2, glowColor); // Runic core
    }
  } else if (heroId === 'sura') {
    // 1. Flowing Forest-Green Valkyrie Cape (4 pixel frames)
    const capeY = 18 + bodyY;
    px(9, capeY, 7, 13, '#064e3b');
    px(7 + (frameIdx % 2), capeY + 3, 6, 11, '#047857');
    px(6, capeY + 7 + (frameIdx % 2), 5, 7, '#059669');

    // 2. Bronze & Emerald Greaves
    px(leftLegX, leftLegY, 4, 7, '#065f46');
    px(leftLegX, leftLegY + 3, 4, 4, '#d97706');
    px(leftLegX + 1, leftLegY + 4, 3, 2, '#fde047');

    px(rightLegX, rightLegY, 4, 7, '#065f46');
    px(rightLegX, rightLegY + 3, 4, 4, '#d97706');
    px(rightLegX + 1, rightLegY + 4, 3, 2, '#fde047');

    // 3. Wyvern-Scale Emerald & Gold Cuirass
    px(15, 19 + bodyY, 12, 13, '#047857');
    px(16, 20 + bodyY, 10, 9, '#10b981');
    px(15, 19 + bodyY, 12, 3, '#eab308'); // Gold collar trim
    px(19, 21 + bodyY, 4, 6, '#fde047'); // Solar breastplate emblem
    px(15, 28 + bodyY, 12, 3, '#78350f'); // Waist belt
    px(14, 30 + bodyY, 4, 3, '#fbbf24'); // Gold hip tassets
    px(24, 30 + bodyY, 4, 3, '#fbbf24');

    // 4. Head, Braided Copper Mane & Golden Wing-Crest
    const headY = 7 + bodyY;
    px(11, headY + 2, 5, 13, '#9a3412'); // Long copper braid behind head
    px(10 + (frameIdx % 2), headY + 9, 4, 7, '#c2410c');

    px(15, headY + 3, 12, 9, '#b57856'); // Sun-bronzed skin shadow
    px(16, headY + 2, 11, 8, '#e0a382'); // Sun-bronzed midtone
    px(20, headY + 5, 2, 2, '#064e3b');
    px(21, headY + 5, 1, 2, '#34d399'); // Bright emerald iris
    px(25, headY + 5, 2, 2, '#064e3b');
    px(26, headY + 5, 1, 2, '#34d399');
    px(18, headY + 7, 2, 1, '#ef4444'); // Red clan cheek warpaint

    // Copper hair crown + Golden Feathered Valkyrie Crest
    px(14, headY - 1, 13, 4, '#9a3412');
    px(15, headY - 2, 11, 3, '#ea580c');
    px(19, headY - 5, 7, 4, '#eab308');
    px(21, headY - 6, 5, 3, '#fef08a');

    // 5. Evolving Bronze Great-Spear
    if (pose === 'ATTACK') {
      px(14, 22 + bodyY, 20, 2, '#78350f');
      px(32, 20 + bodyY, 9, 6, weaponColor);
      px(34, 22 + bodyY, 6, 2, glowColor);
    } else {
      const spY = 21 + bodyY;
      px(11, spY, 21, 2, '#78350f');
      px(29, spY - 1, 2, 4, '#dc2626'); // Red spear tassel
      px(31, spY - 2, 8, 6, weaponColor);
      px(33, spY, 5, 2, glowColor);
    }
  } else if (heroId === 'vesper') {
    // Floating Ethereal Mystic (bobs cleanly by 1-2 integer pixels across 4 frames)
    const floatMap = [0, -1, -2, -1];
    const vY = floatMap[frameIdx % 4];

    // 1. Layered Indigo & Violet Star-Weaver Robes
    px(15, 31 + vY, 12, 6, '#1e1b4b');
    px(14 + (frameIdx % 2), 34 + vY, 14, 3, '#312e81');
    px(14, 19 + vY, 14, 14, '#1e1b4b');
    px(16, 20 + vY, 10, 12, '#312e81');
    px(19, 20 + vY, 4, 15, '#a855f7'); // Center silver-violet rune stole
    px(20, 21 + vY, 2, 13, '#e0e7ff');
    px(13, 18 + vY, 16, 4, '#4c1d95'); // Mantle shoulders
    px(19, 19 + vY, 4, 3, '#fbbf24'); // Gold astral clasp

    // 2. Pointed Astral Hood, Runic Bandages & Glowing Cyan Eyes
    const headY = 6 + vY;
    px(13, headY, 16, 12, '#1e1b4b');
    px(15, headY - 2, 12, 4, '#312e81');
    px(16, headY - 4, 8, 3, '#4c1d95'); // Pointed wizard/mystic hood tip
    px(14, headY + 2, 14, 2, '#c084fc'); // Hood trim

    // Starlight Visage & Ivory Bandages
    px(16, headY + 4, 10, 8, '#581c87');
    px(16, headY + 4, 10, 2, '#e0e7ff'); // Upper bandage wrap
    px(16, headY + 9, 10, 3, '#cbd5e1'); // Lower bandage wrap

    // Glowing Cyan Eyes (2px wide with bright core)
    px(18, headY + 6, 3, 2, '#0284c7');
    px(19, headY + 6, 2, 2, '#7dd3fc');
    px(23, headY + 6, 3, 2, '#0284c7');
    px(24, headY + 6, 2, 2, '#7dd3fc');

    // 3. Three Orbiting Pixel Astrolabe Orbs (stepped cleanly across 4 frames!)
    const orbOffsets = [
      [
        [9, 15],
        [29, 13],
        [31, 24],
      ],
      [
        [10, 12],
        [31, 16],
        [28, 26],
      ],
      [
        [12, 14],
        [30, 19],
        [25, 25],
      ],
      [
        [8, 17],
        [28, 14],
        [30, 22],
      ],
    ][frameIdx % 4];

    for (const [ox, oy] of orbOffsets) {
      px(ox, oy + vY, 4, 4, weaponColor);
      px(ox + 1, oy + 1 + vY, 2, 2, glowColor);
    }
  } else {
    // CASSIAN THORNE (Inkwright / Defector Scribe)
    // 1. Crimson Velvet Half-Cloak (4 stepped frames)
    const cloakY = 18 + bodyY;
    px(9, cloakY, 7, 14, '#881337');
    px(8 + (frameIdx % 2), cloakY + 3, 6, 11, '#be123c');
    px(7, cloakY + 7 + (frameIdx % 2), 5, 6, '#e11d48');

    // 2. Duelist Boots
    px(leftLegX, leftLegY, 4, 7, '#18181b');
    px(leftLegX + 1, leftLegY + 3, 3, 1, '#fbbf24');
    px(rightLegX, rightLegY, 4, 7, '#18181b');
    px(rightLegX + 1, rightLegY + 3, 3, 1, '#fbbf24');

    // 3. Aristocratic Black & Gold Inquisitor Coat
    px(15, 19 + bodyY, 12, 13, '#18181b');
    px(16, 20 + bodyY, 10, 11, '#27272a');
    px(19, 19 + bodyY, 4, 12, '#be123c'); // Crimson lapel center
    px(20, 20 + bodyY, 2, 10, '#fbbf24'); // Gold filigree trim
    px(15, 27 + bodyY, 12, 2, '#9f1239'); // Crimson sash

    // High Inquisitor Collar
    px(13, 16 + bodyY, 16, 4, '#9f1239');
    px(14, 16 + bodyY, 14, 2, '#e11d48');

    // 4. Pale Noble Head & Swept Silver-White Hair
    const headY = 7 + bodyY;
    px(15, headY + 3, 12, 9, '#d4a59a');
    px(16, headY + 2, 11, 8, '#fae1d8');
    px(20, headY + 5, 2, 2, '#18181b');
    px(21, headY + 5, 1, 2, '#f43f5e'); // Crimson iris
    px(25, headY + 5, 2, 2, '#18181b');
    px(26, headY + 5, 1, 2, '#f43f5e');

    // Swept Silver Hair
    px(13, headY - 1, 15, 5, '#94a3b8');
    px(14, headY - 2, 14, 4, '#e2e8f0');
    px(16, headY - 3, 9, 2, '#ffffff');
    px(25, headY + 2, 3, 6, '#cbd5e1'); // Aristocratic side lock

    // 5. Levitating Grimoire Scroll + Evolving Rapier-Quill
    const grimY = 13 + bodyY + (frameIdx % 2);
    px(7, grimY, 5, 7, '#fbbf24');
    px(8, grimY + 1, 3, 5, '#fef3c7');
    px(9, grimY + 2, 1, 3, '#e11d48');

    if (pose === 'ATTACK') {
      px(24, 21 + bodyY, 3, 5, '#fbbf24'); // Swept hilt guard
      px(27, 23 + bodyY, 14, 2, weaponColor);
      px(36, 23 + bodyY, 5, 2, glowColor);
    } else {
      const rpY = 22 + bodyY;
      px(25, rpY - 2, 3, 5, '#fbbf24'); // Cup hilt
      px(28, rpY, 12, 2, weaponColor); // Rapier needle blade
      px(36, rpY, 4, 2, glowColor); // Glowing ink tip
    }
  }

  // Apply unified 1px Sea-of-Stars dark plum-charcoal outline (#161020)
  applyPixelOutline(canvas, '#161020');

  frameCache.set(key, canvas);
  return canvas;
}

function getEnemyFrameCanvas(
  templateId: string,
  frameIdx: number,
  shattered: boolean
): HTMLCanvasElement {
  const key = `sos_enemy_${templateId}_f${frameIdx}_sh${shattered ? 1 : 0}`;
  const cached = frameCache.get(key);
  if (cached) return cached;

  const isColossal = templateId === 'siege_golem' || templateId === 'inquisitor_vane';
  const W = isColossal ? 58 : 44;
  const H = isColossal ? 58 : 44;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  const bY = frameIdx === 1 || frameIdx === 2 ? 1 : 0;
  const legStep = frameIdx % 2 === 0 ? 1 : -1;

  if (templateId === 'kobold_scavenger') {
    // Shard-Bitten Kobold (facing left)
    // Glowing Amber/Violet Crystal shards erupting from back
    px(24, 11 + bY, 6, 9, '#d97706');
    px(25, 12 + bY, 4, 6, '#fde047');
    px(28, 15 + bY, 5, 7, '#9333ea');
    px(29, 16 + bY, 3, 4, '#e879f9');

    // Legs & Claws
    px(17 + legStep, 31, 4, 7, '#78350f');
    px(23 - legStep, 31, 4, 7, '#92400e');

    // Hunched Reptilian Torso & Mining Harness
    px(15, 19 + bY, 13, 13, '#9a3412');
    px(16, 20 + bY, 10, 10, '#c2410c');
    px(15, 25 + bY, 12, 3, '#44403c'); // Belt

    // Snout, Fangs & Glowing Eyes
    px(9, 13 + bY, 13, 9, '#9a3412');
    px(10, 14 + bY, 11, 6, '#ea580c');
    px(10, 20 + bY, 5, 2, '#f8fafc'); // Fangs
    px(13, 15 + bY, 3, 2, '#fef08a'); // Fierce yellow eye

    // Iron Mining Pickaxe in Front Hand
    const pickY = 14 + bY + (frameIdx % 2) * 2;
    px(8, pickY, 2, 16, '#78350f');
    px(4, pickY, 10, 3, '#94a3b8');
    px(5, pickY + 1, 8, 1, '#e2e8f0');
  } else if (templateId === 'obsidian_hound') {
    // Mechanical Blackrock & Magma War-Hound (facing left)
    px(13 + legStep, 29, 4, 9, '#27272a');
    px(19 - legStep, 30, 4, 8, '#18181b');
    px(27 - legStep, 29, 4, 9, '#27272a');
    px(32 + legStep, 30, 4, 8, '#18181b');

    // Armored Blackrock Body & Glowing Furnace Ribs
    px(12, 18 + bY, 22, 12, '#27272a');
    px(14, 19 + bY, 18, 9, '#3f3f46');
    px(16, 21 + bY, 12, 6, '#dc2626'); // Molten core
    px(18, 22 + bY, 8, 4, frameIdx % 2 === 0 ? '#fde047' : '#f97316');
    // Iron rib bars over magma core
    px(19, 20 + bY, 2, 8, '#27272a');
    px(23, 20 + bY, 2, 8, '#27272a');

    // Hound Head, Brass Crest & Fiery Jaws
    px(6, 13 + bY, 11, 10, '#3f3f46');
    px(7, 14 + bY, 9, 6, '#52525b');
    px(12, 11 + bY, 6, 3, '#d97706'); // Brass plating
    px(7, 20 + bY, 7, 3, '#ea580c'); // Glowing maw
    px(9, 15 + bY, 3, 2, '#fde047'); // Eye
  } else if (templateId === 'ward_golem') {
    // Fractured Ward-Golem Sentinel (levitating monolith pieces)
    const fY = frameIdx % 2 === 0 ? 0 : -2;
    px(15, 31, 5, 7, '#334155');
    px(24, 31, 5, 7, '#334155');

    // Monolith Torso with Glowing Astral & Gold Titan Runes
    px(12, 12 + fY, 20, 19, '#334155');
    px(14, 13 + fY, 16, 17, '#475569');
    px(16, 14 + fY, 12, 14, '#64748b');

    // Glowing Rune Core in Chest
    px(18, 17 + fY, 8, 8, '#7e22ce');
    px(19, 18 + fY, 6, 6, '#c084fc');
    px(20, 19 + fY, 4, 4, '#38bdf8');

    // Floating Stone Pauldrons & Fists
    px(6, 14 + bY, 6, 12, '#475569');
    px(7, 15 + bY, 4, 9, '#94a3b8');
    px(32, 14 + bY, 6, 12, '#475569');
    px(33, 15 + bY, 4, 9, '#94a3b8');

    // Golem Crown & Visor
    px(16, 6 + fY, 12, 6, '#475569');
    px(18, 8 + fY, 8, 2, '#fde047');
  } else if (templateId === 'inquisitor_vane') {
    // BOSS: Inquisitor Vane (58x58 canvas)
    // Gilded Crimson Grand Inquisitor Cloak
    px(24, 16 + bY, 18, 32, '#881337');
    px(26, 18 + bY, 15, 28, '#be123c');
    px(28, 16 + bY, 12, 4, '#fbbf24');

    // Ornate Blackrock Plate Armor
    px(19, 38, 6, 11, '#18181b');
    px(29, 38, 6, 11, '#18181b');
    px(18, 19 + bY, 18, 20, '#18181b');
    px(20, 20 + bY, 14, 17, '#27272a');
    px(24, 20 + bY, 6, 16, '#fbbf24'); // Gold tabard
    px(25, 21 + bY, 4, 14, '#e11d48');

    // Horned Inquisitor Helm & Glowing Visor
    px(20, 8 + bY, 14, 11, '#27272a');
    px(18, 5 + bY, 4, 8, '#fbbf24'); // Left horn
    px(32, 5 + bY, 4, 8, '#fbbf24'); // Right horn
    px(21, 13 + bY, 9, 2, '#f43f5e'); // Visor slit

    // Blazing Staff of Imperial Seizure
    const stY = 6 + (frameIdx % 2);
    px(12, stY + 6, 3, 38, '#b45309');
    px(9, stY, 9, 9, '#fbbf24');
    px(10, stY + 1, 7, 7, '#ef4444');
    px(12, stY + 3, 3, 3, '#fef08a');
  } else {
    // COLOSSAL BOSS: Runebound Siege-Golem (58x58 canvas)
    px(16, 40, 9, 11, '#18181b');
    px(33, 40, 9, 11, '#18181b');
    px(17, 42, 7, 4, '#dc2626');
    px(34, 42, 7, 4, '#dc2626');

    // Massive Blackrock Torso & Molten Furnace Chest Grate
    px(13, 14 + bY, 32, 27, '#18181b');
    px(15, 16 + bY, 28, 23, '#27272a');
    px(18, 19 + bY, 22, 16, '#9a3412');
    px(20, 21 + bY, 18, 12, frameIdx % 2 === 0 ? '#f97316' : '#ef4444');
    px(23, 23 + bY, 12, 8, '#fde047');

    // Iron Grate Bars across chest furnace
    px(23, 19 + bY, 2, 16, '#18181b');
    px(28, 19 + bY, 2, 16, '#18181b');
    px(33, 19 + bY, 2, 16, '#18181b');

    // Spiked Siege Pauldrons & Heavy Gauntlets
    px(6, 12 + bY, 10, 16, '#dc2626');
    px(8, 14 + bY, 6, 12, '#991b1b');
    px(42, 12 + bY, 10, 16, '#dc2626');
    px(44, 14 + bY, 6, 12, '#991b1b');

    px(5, 28 + (frameIdx % 2) * 2, 9, 12, '#27272a');
    px(44, 28 + ((frameIdx + 1) % 2) * 2, 9, 12, '#27272a');

    // Fortress Head Crown
    px(20, 6 + bY, 18, 9, '#27272a');
    px(22, 10 + bY, 14, 3, '#ef4444');
    px(25, 10 + bY, 8, 2, '#fde047');
  }

  applyPixelOutline(canvas, shattered ? '#fbbf24' : '#161020');
  frameCache.set(key, canvas);
  return canvas;
}

/** Draws a hero’s animated sprite with facing, weapon appearance, and Heart-Shard presentation. */
export function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  x: number,
  y: number,
  time: number,
  facing: 'LEFT' | 'RIGHT' = 'RIGHT',
  _scale = 1,
  isMoving = false
): void {
  ctx.save();
  // Lock strictly to integer pixel coordinates!
  let drawX = Math.round(x);
  let drawY = Math.round(y);

  if (hero.animState === 'ATTACK') {
    drawX += facing === 'RIGHT' ? 22 : -22;
  } else if (hero.animState === 'CAST') {
    drawY -= 5;
  } else if (hero.animState === 'HIT') {
    drawX += (Math.floor(time / 45) % 2 === 0 ? -4 : 4);
  }

  ctx.translate(drawX, drawY);
  if (facing === 'LEFT') {
    ctx.scale(-1, 1);
  }

  // Crisp pixel ground shadow
  ctx.fillStyle = 'rgba(10, 8, 16, 0.5)';
  ctx.fillRect(-10, 0, 20, 3);
  ctx.fillRect(-8, -1, 16, 5);

  // Determine discrete animation pose & stepped frame index (6-8 FPS)
  let pose: PoseType = 'IDLE';
  let frameIdx = Math.floor(time / 190) % 4;
  if (hero.animState === 'ATTACK') {
    pose = 'ATTACK';
    frameIdx = 0;
  } else if (hero.animState === 'CAST') {
    pose = 'CAST';
    frameIdx = Math.floor(time / 120) % 4;
  } else if (isMoving) {
    pose = 'WALK';
    frameIdx = Math.floor(time / 115) % 4;
  }

  const weaponTier = hero.weaponTiers[hero.weaponTierIndex] || hero.weaponTiers[0];
  const showShard = hero.id === 'kaelen' && hero.presentation === 'SHARD' && hero.weaponTierIndex < 1;
  const frameCanvas = getHeroFrameCanvas(
    hero.id,
    pose,
    frameIdx,
    hero.weaponTierIndex,
    weaponTier.visualColor,
    weaponTier.glowColor,
    showShard
  );

  // Draw at exact 1:1 native pixel resolution!
  ctx.drawImage(
    frameCanvas,
    -Math.floor(frameCanvas.width / 2),
    -frameCanvas.height + 4
  );

  // Pixel-art Attack Slash Effect (stepped pixel arc)
  if (hero.animState === 'ATTACK') {
    ctx.fillStyle = weaponTier.glowColor;
    ctx.fillRect(16, -28, 3, 18);
    ctx.fillRect(19, -24, 3, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, -26, 2, 14);
  }

  // Wardstone Shield Pixel Ring
  if (hero.shieldHp > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-14, -26, 2, 16);
    ctx.fillRect(12, -26, 2, 16);
    ctx.fillRect(-10, -34, 20, 2);
  }

  ctx.restore();
}

export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  x: number,
  y: number,
  time: number,
  isMoving = false
): void {
  ctx.save();
  let drawX = Math.round(x);
  let drawY = Math.round(y);

  if (enemy.animState === 'ATTACK') {
    drawX -= 22;
  } else if (enemy.animState === 'HIT') {
    drawX += Math.floor(time / 45) % 2 === 0 ? 5 : -3;
  }

  ctx.translate(drawX, drawY);

  // Crisp pixel shadow
  const shW = enemy.isBoss ? 30 : 20;
  ctx.fillStyle = 'rgba(10, 8, 16, 0.55)';
  ctx.fillRect(-shW / 2, 0, shW, 3);
  ctx.fillRect(-shW / 2 + 2, -1, shW - 4, 5);

  const frameRate = isMoving ? 130 : 210;
  const frameIdx = Math.floor(time / frameRate) % 4;
  const frameCanvas = getEnemyFrameCanvas(
    enemy.templateId,
    frameIdx,
    enemy.shattered
  );

  ctx.drawImage(
    frameCanvas,
    -Math.floor(frameCanvas.width / 2),
    -frameCanvas.height + 4
  );

  ctx.restore();
}

export function drawBattleVfx(
  ctx: CanvasRenderingContext2D,
  effects: BattleVfxEffect[]
): void {
  for (const fx of effects) {
    const progress = 1 - fx.timer / fx.maxTimer;
    const step = Math.floor(progress * 5); // Stepped pixel VFX frames!
    const x = Math.round(fx.x);
    const y = Math.round(fx.y);

    ctx.save();
    ctx.translate(x, y);

    if (fx.type === 'SLASH') {
      ctx.fillStyle = fx.color;
      ctx.fillRect(-12 + step * 4, -28 + step * 3, 6, 6);
      ctx.fillRect(-6 + step * 4, -22 + step * 3, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10 + step * 4, -26 + step * 3, 4, 4);
    } else if (fx.type === 'SEISMIC') {
      // Stepped pixel rock pillars erupting from floor
      for (let i = -2; i <= 2; i++) {
        const px = i * (6 + step * 2);
        const ph = Math.max(4, 22 - Math.abs(i) * 4 - step * 2);
        ctx.fillStyle = '#161020';
        ctx.fillRect(px - 4, 2 - ph - 1, 8, ph + 2);
        ctx.fillStyle = i % 2 === 0 ? fx.color : '#fbbf24';
        ctx.fillRect(px - 3, 2 - ph, 6, ph);
      }
    } else if (fx.type === 'SPEAR_DIVE') {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-2, -48 + step * 6, 5, 38 - step * 4);
      ctx.fillStyle = fx.color;
      const spread = 6 + step * 5;
      ctx.fillRect(-spread, -14, 6, 4);
      ctx.fillRect(spread - 6, -14, 6, 4);
    } else if (fx.type === 'ASTRAL_NOVA') {
      const r = 6 + step * 5;
      ctx.fillStyle = fx.color;
      ctx.fillRect(-r, -20, 4, 4);
      ctx.fillRect(r - 4, -20, 4, 4);
      ctx.fillRect(-2, -20 - r, 4, 4);
      ctx.fillRect(-2, -20 + r - 4, 4, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -22, 8, 8);
    } else if (fx.type === 'INK_BLOT') {
      const d = step * 4;
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-12 - d, -30 - d, 6, 6);
      ctx.fillRect(6 + d, -30 - d, 6, 6);
      ctx.fillRect(-3, -21, 6, 6);
      ctx.fillRect(-12 - d, -12 + d, 6, 6);
      ctx.fillRect(6 + d, -12 + d, 6, 6);
    } else if (fx.type === 'HEAL_WAVE') {
      const ry = -6 - step * 6;
      ctx.fillStyle = '#34d399';
      ctx.fillRect(-14, ry, 28, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-8, ry - 4, 3, 3);
      ctx.fillRect(6, ry - 4, 3, 3);
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// SEA OF STARS STYLE 48x48 PIXEL BUST PORTRAITS (SCALED 2X TO 96x96)
// ---------------------------------------------------------------------------

/** Draws a cached animated bust; Kaelen’s variant selects his humble, shard, or heroic appearance. */
export function drawPortrait(
  canvas: HTMLCanvasElement,
  portraitId: HeroId | 'orin' | 'vane' | 'stone',
  expression: 'NEUTRAL' | 'DETERMINED' | 'SURPRISED' | 'GRIM' | 'WARM' = 'NEUTRAL',
  time = performance.now(),
  variant: 'humble' | 'shard' | 'heroic' = 'heroic'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Stepped 2-frame breathing on portraits (every 450ms)
  const breathStep = Math.floor(time / 450) % 2;
  const cacheKey = `sos_portrait_${portraitId}_${expression}_${breathStep}_${variant}`;
  let offscreen = frameCache.get(cacheKey);

  if (!offscreen) {
    offscreen = document.createElement('canvas');
    offscreen.width = 48;
    offscreen.height = 48;
    const octx = offscreen.getContext('2d')!;
    octx.imageSmoothingEnabled = false;

    const px = (x: number, y: number, w: number, h: number, c: string) => {
      octx.fillStyle = c;
      octx.fillRect(x, y + breathStep, w, h);
    };

    if (portraitId === 'kaelen' && variant !== 'heroic') {
      px(14, 6, 20, 12, '#3f3a36');
      px(16, 5, 16, 6, '#57534e');
      px(15, 13, 18, 16, '#cf8d6c');
      px(16, 12, 16, 14, '#f5cba7');
      px(18, 13, 8, 4, '#ffe0c8');
      px(14, 10, 4, 8, '#3f3a36');
      px(19, 9, 5, 4, '#57534e');
      px(28, 10, 4, 6, '#3f3a36');
      px(17, 15, 5, 1, '#1e1b24');
      px(26, 15, 5, 1, '#1e1b24');
      px(18, 17, 4, 3, '#ffffff');
      px(26, 17, 4, 3, '#ffffff');
      px(19, 17, 2, 3, '#f59e0b');
      px(27, 17, 2, 3, '#f59e0b');
      px(20, 18, 1, 2, '#161020');
      px(28, 18, 1, 2, '#161020');
      px(21, 24, 5, expression === 'SURPRISED' ? 2 : 1, '#78350f');
      px(10, 31, 28, 16, '#d6d3d1');
      px(12, 32, 24, 12, '#a8a29e');
      px(16, 30, 16, 3, '#78716c');
      px(32, 34, 8, 8, '#92400e');
      px(33, 35, 6, 5, '#b45309');
      if (variant === 'shard') {
        px(35, 36, 3, 3, '#c084fc');
      }
    } else if (portraitId === 'kaelen') {
      // Spiky Sea-of-Stars Hair Back & Crown
      px(12, 5, 24, 15, '#1e1b24');
      px(14, 3, 20, 9, '#2e2938');
      px(16, 2, 7, 3, '#484057');
      px(25, 3, 7, 3, '#484057');

      // Warm Shaded Face
      px(15, 13, 18, 16, '#cf8d6c');
      px(16, 12, 16, 14, '#f5cba7');
      px(18, 13, 8, 4, '#ffe0c8');

      // Hair Front Locks
      px(14, 9, 4, 9, '#1e1b24');
      px(19, 9, 5, 4, '#2e2938');
      px(28, 9, 4, 6, '#1e1b24');

      // Expressive Eyes
      px(17, 15, 5, 1, '#1e1b24');
      px(26, 15, 5, 1, '#1e1b24');
      px(18, 17, 4, 3, '#ffffff');
      px(26, 17, 4, 3, '#ffffff');
      px(19, 17, 2, 3, '#f59e0b');
      px(27, 17, 2, 3, '#f59e0b');
      px(20, 18, 1, 2, '#161020');
      px(28, 18, 1, 2, '#161020');

      // Mouth
      px(21, 24, 5, expression === 'SURPRISED' ? 2 : 1, '#78350f');

      // Crimson Scarf, Steel Pauldron & Heart-Shard Gauntlet
      px(8, 31, 32, 16, '#334155');
      px(7, 30, 11, 10, '#94a3b8');
      px(9, 31, 7, 4, '#e2e8f0');
      px(13, 28, 22, 7, '#991b1b');
      px(15, 29, 18, 4, '#dc2626');
      px(32, 29, 10, 12, '#b45309');
      px(34, 31, 6, 6, '#fbbf24');
      px(35, 32, 4, 4, '#c084fc');
    } else if (portraitId === 'sura') {
      px(18, 2, 12, 6, '#eab308');
      px(20, 3, 8, 4, '#fef08a');
      px(11, 7, 26, 26, '#7c2d12');
      px(13, 7, 22, 8, '#c2410c');
      px(15, 13, 18, 15, '#b57856');
      px(16, 12, 16, 13, '#e0a382');
      px(17, 15, 5, 1, '#431407');
      px(26, 15, 5, 1, '#431407');
      px(18, 17, 4, 3, '#ffffff');
      px(26, 17, 4, 3, '#ffffff');
      px(19, 17, 2, 3, '#10b981');
      px(27, 17, 2, 3, '#10b981');
      px(16, 21, 4, 1, '#ef4444');
      px(28, 21, 4, 1, '#ef4444');
      px(21, 24, 5, 1, '#7c2d12');
      px(7, 30, 34, 17, '#065f46');
      px(9, 31, 10, 9, '#10b981');
      px(29, 31, 10, 9, '#10b981');
      px(14, 30, 20, 4, '#fbbf24');
    } else if (portraitId === 'vesper') {
      px(10, 4, 28, 42, '#1e1b4b');
      px(12, 6, 24, 26, '#312e81');
      px(12, 7, 24, 2, '#c084fc');
      px(15, 12, 18, 17, '#581c87');
      px(15, 13, 18, 3, '#e0e7ff');
      px(15, 22, 18, 4, '#e0e7ff');
      px(17, 17, 5, 3, '#0284c7');
      px(26, 17, 5, 3, '#0284c7');
      px(18, 17, 3, 2, '#7dd3fc');
      px(27, 17, 3, 2, '#7dd3fc');
      px(21, 31, 6, 6, '#fbbf24');
    } else if (portraitId === 'cassian') {
      px(9, 21, 30, 25, '#881337');
      px(10, 22, 6, 14, '#be123c');
      px(32, 22, 6, 14, '#be123c');
      px(13, 5, 22, 14, '#94a3b8');
      px(14, 4, 20, 9, '#e2e8f0');
      px(17, 5, 10, 3, '#ffffff');
      px(15, 13, 18, 15, '#d4a59a');
      px(16, 12, 16, 13, '#fae1d8');
      px(17, 15, 5, 1, '#334155');
      px(26, 15, 5, 1, '#334155');
      px(18, 17, 4, 3, '#ffffff');
      px(26, 17, 4, 3, '#ffffff');
      px(19, 17, 2, 3, '#e11d48');
      px(27, 17, 2, 3, '#e11d48');
      px(21, 24, 5, 1, '#881337');
      px(12, 30, 24, 17, '#18181b');
      px(22, 31, 4, 13, '#fbbf24');
    } else if (portraitId === 'orin') {
      px(10, 29, 28, 17, '#78350f');
      px(15, 11, 18, 14, '#d6b29a');
      px(13, 20, 22, 16, '#9ca3af');
      px(15, 21, 18, 10, '#e5e7eb');
      px(18, 15, 3, 2, '#18181b');
      px(27, 15, 3, 2, '#18181b');
    } else if (portraitId === 'vane') {
      px(8, 27, 32, 19, '#881337');
      px(14, 7, 20, 22, '#27272a');
      px(14, 4, 4, 9, '#fbbf24');
      px(30, 4, 4, 9, '#fbbf24');
      px(17, 17, 14, 3, '#ef4444');
    } else {
      px(17, 4, 14, 38, '#b45309');
      px(19, 6, 10, 34, '#fbbf24');
      px(22, 10, 4, 26, '#c084fc');
    }

    applyPixelOutline(offscreen, '#161020');
    frameCache.set(cacheKey, offscreen);
  }

  const bgThemes: Record<string, [string, string, string]> = {
    kaelen: ['#1f1612', '#451a03', '#f59e0b'],
    sura: ['#042f2e', '#065f46', '#fde047'],
    vesper: ['#0f0e26', '#2e1065', '#38bdf8'],
    cassian: ['#1c0a13', '#4c0519', '#f43f5e'],
    orin: ['#271a0c', '#78350f', '#c084fc'],
    vane: ['#1f0808', '#7f1d1d', '#ef4444'],
    stone: ['#131129', '#312e81', '#fbbf24'],
  };
  const [c1, c2, spark] = bgThemes[portraitId] || ['#18181b', '#27272a', '#fbbf24'];
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 96, 48);
  ctx.fillStyle = c2;
  ctx.fillRect(0, 48, 96, 48);

  ctx.fillStyle = spark;
  ctx.fillRect(10, 14 + breathStep * 2, 4, 4);
  ctx.fillRect(80, 20 - breathStep * 2, 4, 4);

  // Exact 2x integer pixel scaling (48x48 -> 96x96)
  ctx.drawImage(offscreen, 0, 0, 96, 96);

  if (portraitId === 'orin') {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(8, 6, 80, 84);
  }
}

export function drawBattleStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  domain: DomainType,
  time: number
): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  if (domain === 'DAWN') {
    skyGrad.addColorStop(0, '#042f2e');
    skyGrad.addColorStop(0.55, '#065f46');
    skyGrad.addColorStop(1, '#d97706');
  } else if (domain === 'OBSIDIAN') {
    skyGrad.addColorStop(0, '#14070a');
    skyGrad.addColorStop(0.55, '#450a0a');
    skyGrad.addColorStop(1, '#9a3412');
  } else if (domain === 'ASTRAL') {
    skyGrad.addColorStop(0, '#070514');
    skyGrad.addColorStop(0.55, '#1e1b4b');
    skyGrad.addColorStop(1, '#581c87');
  } else {
    skyGrad.addColorStop(0, '#17152b');
    skyGrad.addColorStop(0.55, '#262340');
    skyGrad.addColorStop(1, '#4a3b47');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Shattered Edict Pillar on the Horizon
  ctx.fillStyle = '#161020';
  ctx.fillRect(292, 34, 56, 142);
  ctx.fillStyle = domain === 'ASTRAL' ? '#312e81' : '#2e2938';
  ctx.fillRect(294, 36, 52, 140);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(317, 36, 6, 85);
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(319, 40, 2, 75);

  const shardStep = Math.floor(time / 350) % 2;
  ctx.fillStyle = '#fde047';
  ctx.fillRect(300, 18 + shardStep * 2, 10, 10);
  ctx.fillRect(330, 22 - shardStep * 2, 9, 9);

  for (let i = 0; i < 9; i++) {
    const cx = i * 76;
    const ch = 112 + ((i * 23) % 30);
    ctx.fillStyle = '#161020';
    ctx.fillRect(cx - 1, ch - 1, 80, 75);
    ctx.fillStyle =
      domain === 'OBSIDIAN' ? '#2a1215' : domain === 'DAWN' ? '#063e2e' : '#231f33';
    ctx.fillRect(cx, ch, 78, 74);
  }

  const floorY = 175;
  ctx.fillStyle =
    domain === 'DAWN'
      ? '#064e3b'
      : domain === 'OBSIDIAN'
      ? '#271417'
      : domain === 'ASTRAL'
      ? '#1e1b4b'
      : '#38323c';
  ctx.fillRect(0, floorY, width, height - floorY);

  ctx.fillStyle =
    domain === 'DAWN'
      ? '#34d399'
      : domain === 'OBSIDIAN'
      ? '#ef4444'
      : domain === 'ASTRAL'
      ? '#a855f7'
      : '#a8a29e';
  ctx.fillRect(0, floorY - 2, width, 2);

  ctx.fillStyle = 'rgba(22, 16, 32, 0.45)';
  for (let row = 0; row < 5; row++) {
    const ry = floorY + 18 + row * 34;
    ctx.fillRect(0, ry, width, 2);
    for (let col = 0; col < 10; col++) {
      const rx = (col * 72 + row * 32) % width;
      ctx.fillRect(rx, ry - 32, 2, 32);
    }
  }

  if (domain === 'DAWN') {
    for (let i = 0; i < 12; i++) {
      const fx = 35 + i * 50;
      const fy = 195 + ((i * 39) % 105);
      ctx.fillStyle = '#059669';
      ctx.fillRect(fx, fy, 10, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(fx + 3, fy - 3, 4, 4);
    }
    drawPointLight(ctx, 320, 140, 240, '#fbbf24', 0.24);
  } else if (domain === 'OBSIDIAN') {
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < 6; i++) {
      const cx = 55 + i * 102;
      ctx.fillRect(cx, 180, 4, 45);
      ctx.fillRect(cx + 4, 225, 4, 50);
    }
    drawPointLight(ctx, 320, 240, 250, '#ef4444', 0.26);
  } else if (domain === 'ASTRAL') {
    for (let i = 0; i < 30; i++) {
      const sx = (i * 67) % width;
      const sy = (i * 37) % 168;
      ctx.fillStyle = (Math.floor(time / 300) + i) % 2 === 0 ? '#e0e7ff' : '#818cf8';
      ctx.fillRect(sx, sy, 2, 2);
    }
    drawPointLight(ctx, 320, 180, 250, '#a855f7', 0.28);
  } else {
    drawPointLight(ctx, 320, 85, 175, '#f59e0b', 0.18);
  }
}
