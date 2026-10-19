import { FieldEnemy, Hero, HeroId, Wardstone } from './types';
import { createEnemyFromTemplate } from './data';
import { getCachedPixelSprite } from './pixel-art';
import { drawEnemySprite, drawHeroSprite, drawPointLight } from './sprites';

export type TileType =
  | 'WALL'
  | 'FLOOR'
  | 'CHASM'
  | 'LAVA'
  | 'VINE_BRIDGE'
  | 'BASALT_BRIDGE'
  | 'ASTRAL_BRIDGE'
  | 'STAIRS'
  | 'CRATER'
  | 'LANE'
  | 'BOARDS'
  | 'TIMBER';

export const MAP_COLS = 38;
export const MAP_ROWS = 46;
export const TILE_SIZE = 24;

export interface InteractableTrigger {
  id: string;
  type:
    | 'NPC_ORIN'
    | 'RECRUIT_SURA'
    | 'RECRUIT_CASSIAN'
    | 'RECRUIT_VESPER'
    | 'WARDSTONE'
    | 'WAYGATE'
  | 'ANVIL'
  | 'CHEST'
  | 'BOSS'
  | 'PALLET'
  | 'VILLAGE_SIGN'
  | 'VILLAGE_NPC';
  label: string;
  promptText: string;
  x: number;
  y: number;
}

const WARDSTONE_ROWS = [
  '....gggg....',
  '..ggGGGGgg..',
  '.gGGccccGGg.',
  '.gGccWWccGg.',
  '.gGccWWccGg.',
  '.gGGccccGGg.',
  '.gGGGGGGGGg.',
  '.gGGccccGGg.',
  '.gGGGGGGGGg.',
  'ddDDDDDDDDdd',
  'dddddddddddd',
];

const ANVIL_ROWS = [
  '.ppppPPPPpppp.',
  'ppPPPPPPPPPPpp',
  '..ppooYYoopp..',
  '....pppppp....',
  '....pppppp....',
  '..pppppppppp..',
  '.dddddddddddd.',
];

const CHEST_ROWS = [
  '.YYYYYYYYYYYY.',
  'YbbbbbbbbbbbbY',
  'YbbbbYYYYbbbbY',
  'YYYYYYWWYYYYYY',
  'YbbbbYYYYbbbbY',
  'YbbbbbbbbbbbbY',
  '.dddddddddddd.',
];

export class QuarryMap {
  public tiles: TileType[][] = [];
  public playerX = 7.4 * TILE_SIZE;
  public playerY = 41 * TILE_SIZE;
  public playerFacing: 'LEFT' | 'RIGHT' = 'RIGHT';
  /** False until the player walks up from Oakhaven and the shard falls. */
  public shardFallen = false;
  public isPlayerMoving = false;
  public swingTimer = 0;
  public dustParticles: { x: number; y: number; timer: number }[] = [];

  public wardstones: Wardstone[] = [
    {
      id: 'ws_dawn',
      name: 'Dawn Wardstone',
      tileX: 13,
      tileY: 21,
      requiredRealm: 'DAWN',
      attunedBy: 'NONE',
      description:
        'Channel Mythic Dawn energy to grow a living Sun-Vine bridge across the eastern chasm.',
    },
    {
      id: 'ws_obsidian',
      name: 'Obsidian Wardstone',
      tileX: 16,
      tileY: 14,
      requiredRealm: 'OBSIDIAN',
      attunedBy: 'NONE',
      description:
        'Channel Obsidian Reign energy to cool the magma river into a solid blackrock causeway.',
    },
    {
      id: 'ws_astral',
      name: 'Astral Wardstone',
      tileX: 25,
      tileY: 8,
      requiredRealm: 'ASTRAL',
      attunedBy: 'NONE',
      description:
        'Channel Astral Wastes energy to levitate shattered stones across the eastern void.',
    },
  ];

  public relicChestOpened = false;

  public fieldEnemies: FieldEnemy[] = [
    {
      id: 'fe_kobold_1',
      name: 'Shard-Bitten Kobold',
      x: 21 * TILE_SIZE,
      y: 23 * TILE_SIZE,
      homeX: 21 * TILE_SIZE,
      homeY: 23 * TILE_SIZE,
      patrolRadius: 36,
      dir: 'LEFT',
      encounterIds: ['kobold_scavenger'],
      defeated: false,
      stunTimer: 0,
    },
    {
      id: 'fe_hound_1',
      name: 'Obsidian Recon Pack',
      x: 24 * TILE_SIZE,
      y: 15 * TILE_SIZE,
      homeX: 24 * TILE_SIZE,
      homeY: 15 * TILE_SIZE,
      patrolRadius: 42,
      dir: 'RIGHT',
      encounterIds: ['obsidian_hound', 'kobold_scavenger'],
      defeated: false,
      stunTimer: 0,
    },
    {
      id: 'fe_golem_1',
      name: 'Fractured Ward-Golem',
      x: 21 * TILE_SIZE,
      y: 8 * TILE_SIZE,
      homeX: 21 * TILE_SIZE,
      homeY: 8 * TILE_SIZE,
      patrolRadius: 30,
      dir: 'LEFT',
      encounterIds: ['ward_golem', 'obsidian_hound'],
      defeated: false,
      stunTimer: 0,
    },
    {
      id: 'fe_boss_vane',
      name: 'Inquisitor Vane & Siege-Golem',
      x: 19 * TILE_SIZE,
      y: 3.5 * TILE_SIZE,
      homeX: 19 * TILE_SIZE,
      homeY: 3.5 * TILE_SIZE,
      patrolRadius: 0,
      dir: 'DOWN',
      encounterIds: ['inquisitor_vane', 'siege_golem'],
      isBoss: true,
      defeated: false,
      stunTimer: 0,
    },
  ];

  private fieldEnemySprites = new Map<string, ReturnType<typeof createEnemyFromTemplate>>();

  constructor() {
    this.buildTiles();
    for (const fe of this.fieldEnemies) {
      this.fieldEnemySprites.set(fe.id, createEnemyFromTemplate(fe.encounterIds[0]));
    }
  }

  private buildTiles(): void {
    for (let r = 0; r < MAP_ROWS; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < MAP_COLS; c++) {
        this.tiles[r][c] = 'WALL';
      }
    }

    const carveRect = (
      c1: number,
      r1: number,
      c2: number,
      r2: number,
      type: TileType = 'FLOOR'
    ) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
            this.tiles[r][c] = type;
          }
        }
      }
    };

    // 1. South-West Quarry Floor (Master Orin waits here; the crater appears when the shard falls)
    carveRect(4, 19, 13, 24, 'FLOOR');

    // Eastern Chasm between Start Area and Sura's Sky-Skiff
    carveRect(14, 19, 17, 24, 'CHASM');

    // 2. South-East Terrace (Sura's Sky-Skiff Crash Site)
    carveRect(18, 19, 29, 24, 'FLOOR');

    // Ramp going north from South-East Terrace to Central Magma Terrace
    carveRect(25, 16, 27, 18, 'STAIRS');

    // 3. Central Magma Terrace (Cassian & Obsidian Wardstone)
    carveRect(13, 13, 29, 16, 'FLOOR');

    // Magma River blocking the northern ascent
    carveRect(11, 11, 29, 12, 'LAVA');

    // 4. Upper Sanctum (Vesper, Titan Waygate, Master Anvil, Astral Wardstone)
    carveRect(9, 6, 25, 10, 'FLOOR');

    // Astral Void Chasm to the East Relic Island
    carveRect(26, 6, 29, 10, 'CHASM');
    carveRect(30, 7, 33, 9, 'FLOOR');

    // 5. North Crater Summit (Boss Arena: Inquisitor Vane & Siege-Golem)
    carveRect(18, 5, 20, 6, 'STAIRS');
    carveRect(15, 2, 23, 5, 'FLOOR');

    // 6. Oakhaven — humble frontier hamlet south of the quarry cut
    carveRect(2, 28, 25, 44, 'LANE');
    carveRect(7, 24, 11, 28, 'STAIRS');

    // West cottage
    carveRect(3, 30, 6, 33, 'TIMBER');
    carveRect(4, 31, 5, 32, 'BOARDS');
    this.tiles[33][5] = 'LANE';

    // East cottage
    carveRect(12, 30, 16, 33, 'TIMBER');
    carveRect(13, 31, 15, 32, 'BOARDS');
    this.tiles[33][14] = 'LANE';

    // Woodshed on the east lane, so the hamlet fills the opening view
    carveRect(19, 31, 23, 34, 'TIMBER');
    carveRect(20, 32, 22, 33, 'BOARDS');
    this.tiles[34][21] = 'LANE';

    // Masons' Guild loft, where Kaelen wakes
    carveRect(4, 37, 13, 43, 'TIMBER');
    carveRect(5, 38, 12, 42, 'BOARDS');
    this.tiles[37][7] = 'LANE';
    this.tiles[37][8] = 'LANE';
    this.tiles[37][9] = 'LANE';
  }

  public applyShardfall(): void {
    if (this.shardFallen) return;
    this.shardFallen = true;
    for (const [c, r] of [
      [6, 20],
      [7, 20],
      [6, 21],
      [7, 21],
    ]) {
      this.tiles[r][c] = 'CRATER';
    }
  }

  public attuneWardstone(id: string): void {
    const ws = this.wardstones.find((w) => w.id === id);
    if (!ws) return;
    ws.attunedBy = ws.requiredRealm;

    if (id === 'ws_dawn') {
      for (let c = 14; c <= 17; c++) {
        this.tiles[21][c] = 'VINE_BRIDGE';
        this.tiles[22][c] = 'VINE_BRIDGE';
      }
    } else if (id === 'ws_obsidian') {
      for (let r = 11; r <= 12; r++) {
        for (let c = 15; c <= 18; c++) {
          this.tiles[r][c] = 'BASALT_BRIDGE';
        }
      }
    } else if (id === 'ws_astral') {
      for (let c = 26; c <= 29; c++) {
        this.tiles[8][c] = 'ASTRAL_BRIDGE';
      }
    }
  }

  public isWalkablePixel(px: number, py: number): boolean {
    const margin = 6;
    const points = [
      [px - margin, py - margin],
      [px + margin, py - margin],
      [px - margin, py + 2],
      [px + margin, py + 2],
    ];
    for (const [x, y] of points) {
      const c = Math.floor(x / TILE_SIZE);
      const r = Math.floor(y / TILE_SIZE);
      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
      const t = this.tiles[r][c];
      if (t === 'WALL' || t === 'CHASM' || t === 'LAVA' || t === 'TIMBER') {
        return false;
      }
    }
    return true;
  }

  public getNearestTrigger(heroes: Record<HeroId, Hero>): InteractableTrigger | null {
    const triggers: InteractableTrigger[] = [
      {
        id: 'pallet',
        type: 'PALLET',
        label: 'Straw Pallet',
        promptText: '[Space / Click] Look at the straw pallet',
        x: 7.4 * TILE_SIZE,
        y: 41 * TILE_SIZE,
      },
      {
        id: 'sign',
        type: 'VILLAGE_SIGN',
        label: 'Hamlet Sign',
        promptText: '[Space / Click] Read the road sign',
        x: 6.5 * TILE_SIZE,
        y: 29.2 * TILE_SIZE,
      },
      {
        id: 'bram',
        type: 'VILLAGE_NPC',
        label: 'Bram',
        promptText: '[Space / Click] Speak with Bram',
        x: 5.2 * TILE_SIZE,
        y: 35.2 * TILE_SIZE,
      },
    ];

    if (this.shardFallen) {
      triggers.push({
        id: 'orin',
        type: 'NPC_ORIN',
        label: 'Master Orin (Petrified)',
        promptText: '[Space / Click] Inspect Petrified Master Orin',
        x: 7.5 * TILE_SIZE,
        y: 20.8 * TILE_SIZE,
      });
    }

    for (const ws of this.wardstones) {
      if (ws.attunedBy === 'NONE') {
        const canAttune =
          ws.requiredRealm === 'DAWN' ||
          (ws.requiredRealm === 'OBSIDIAN' && heroes.cassian.recruited) ||
          (ws.requiredRealm === 'ASTRAL' && heroes.vesper.recruited);

        triggers.push({
          id: ws.id,
          type: 'WARDSTONE',
          label: ws.name,
          promptText: canAttune
            ? `[Space / Click] Attune ${ws.name} (${ws.requiredRealm})`
            : `${ws.name} — Requires ${
                ws.requiredRealm === 'OBSIDIAN' ? 'Cassian’s Writ' : 'Vesper’s Loom'
              }`,
          x: (ws.tileX + 0.5) * TILE_SIZE,
          y: (ws.tileY + 0.5) * TILE_SIZE,
        });
      }
    }

    if (!heroes.sura.recruited) {
      triggers.push({
        id: 'sura',
        type: 'RECRUIT_SURA',
        label: 'Sura of the Sun-Scales',
        promptText: '[Space / Click] Speak to Sura (Recruit Sky-Lancer)',
        x: 20.5 * TILE_SIZE,
        y: 21.2 * TILE_SIZE,
      });
    }

    if (!heroes.cassian.recruited) {
      triggers.push({
        id: 'cassian',
        type: 'RECRUIT_CASSIAN',
        label: 'Cassian Thorne',
        promptText: '[Space / Click] Speak to Cassian (Recruit Inkwright)',
        x: 18.5 * TILE_SIZE,
        y: 14.5 * TILE_SIZE,
      });
    }

    if (!heroes.vesper.recruited) {
      triggers.push({
        id: 'vesper',
        type: 'RECRUIT_VESPER',
        label: 'Vesper',
        promptText: '[Space / Click] Speak to Vesper (Recruit Astral Weaver)',
        x: 15.5 * TILE_SIZE,
        y: 8.2 * TILE_SIZE,
      });
    }

    triggers.push({
      id: 'waygate',
      type: 'WAYGATE',
      label: 'Ancient Titan Waygate',
      promptText: '[Space / Click] Rest at Titan Waygate (Full Restore & Talents)',
      x: 12.5 * TILE_SIZE,
      y: 7.5 * TILE_SIZE,
    });

    triggers.push({
      id: 'anvil',
      type: 'ANVIL',
      label: 'Quarry Master’s Anvil',
      promptText: '[Space / Click] Reforge Signature Weapons (Spend Heart-Ore)',
      x: 10.5 * TILE_SIZE,
      y: 8.5 * TILE_SIZE,
    });

    if (!this.relicChestOpened) {
      triggers.push({
        id: 'chest_1',
        type: 'CHEST',
        label: 'Titan Relic Chest',
        promptText: '[Space / Click] Open Titan Relic Cache (+5 Heart-Ore & +1 Talent Pt)',
        x: 31.5 * TILE_SIZE,
        y: 8.5 * TILE_SIZE,
      });
    }

    let best: InteractableTrigger | null = null;
    let bestDist = 38;
    for (const t of triggers) {
      const d = Math.hypot(this.playerX - t.x, this.playerY - t.y);
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  }

  private drawVillageProps(ctx: CanvasRenderingContext2D, time: number): void {
    const wellX = 15.2 * TILE_SIZE;
    const wellY = 35.4 * TILE_SIZE;
    ctx.fillStyle = '#44403c';
    ctx.fillRect(wellX - 7, wellY - 6, 14, 10);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(wellX - 5, wellY - 4, 10, 6);
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(wellX - 3, wellY - 2, 6, 3);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(wellX - 8, wellY - 8, 16, 2);

    const signX = 6.5 * TILE_SIZE;
    const signY = 29.2 * TILE_SIZE;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(signX - 1, signY - 14, 2, 14);
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(signX - 8, signY - 16, 16, 7);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(signX - 6, signY - 14, 10, 1);

    const palletX = 7.4 * TILE_SIZE;
    const palletY = 41.2 * TILE_SIZE;
    ctx.fillStyle = '#a16207';
    ctx.fillRect(palletX - 10, palletY - 4, 20, 7);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(palletX - 8, palletY - 6, 16, 4);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(palletX - 4, palletY - 7, 6, 2);

    const bramRows = [
      '..hhhhhh..',
      '.hssssssh.',
      '.hsseessh.',
      '..tttttt..',
      '.tttttttt.',
      '.t.tttt.t.',
      '..b.bb.b..',
    ];
    const bram = getCachedPixelSprite('npc_bram', bramRows, {
      h: '#44403c',
      s: '#e7c2a4',
      e: '#1c1917',
      t: '#78716c',
      b: '#292524',
    });
    ctx.drawImage(bram, 5.2 * TILE_SIZE - 10, 35.2 * TILE_SIZE - 24, 20, 24);

    const logs = getCachedPixelSprite('prop_woodpile', [
      '..llllll..',
      '.lLLLLlL..',
      'llLLLLll..',
      '.lLLLLl...',
      '..llll....',
    ], {
      l: '#92400e',
      L: '#b45309',
    });
    ctx.drawImage(logs, 20.4 * TILE_SIZE, 36 * TILE_SIZE - 8, 20, 12);

    const puff = Math.floor(time / 280) % 3;
    ctx.fillStyle = 'rgba(214, 211, 209, 0.55)';
    ctx.fillRect(4.5 * TILE_SIZE, 30 * TILE_SIZE - 10 - puff, 3, 2);
    ctx.fillRect(14.2 * TILE_SIZE, 30 * TILE_SIZE - 12 - puff, 3, 2);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number,
    heroes: Record<HeroId, Hero>,
    time: number
  ): { camX: number; camY: number } {
    const camX = Math.max(
      0,
      Math.min(MAP_COLS * TILE_SIZE - viewportW, Math.round(this.playerX - viewportW / 2))
    );
    const camY = Math.max(
      0,
      Math.min(MAP_ROWS * TILE_SIZE - viewportH, Math.round(this.playerY - viewportH / 2))
    );

    ctx.save();
    ctx.translate(-camX, -camY);

    // 1. Draw Textured Hi-Bit Quarry Tiles
    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const endCol = Math.min(MAP_COLS - 1, Math.ceil((camX + viewportW) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
    const endRow = Math.min(MAP_ROWS - 1, Math.ceil((camY + viewportH) / TILE_SIZE) + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = this.tiles[r][c];
        const tx = c * TILE_SIZE;
        const ty = r * TILE_SIZE;

        if (t === 'WALL') {
          ctx.fillStyle = '#141218';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          // Beveled cliff rock face if walkable below
          if (r + 1 < MAP_ROWS && this.tiles[r + 1][c] !== 'WALL') {
            ctx.fillStyle = '#09080c';
            ctx.fillRect(tx, ty + TILE_SIZE - 10, TILE_SIZE, 10);
            ctx.fillStyle = '#3f3b47';
            ctx.fillRect(tx + 1, ty + TILE_SIZE - 9, TILE_SIZE - 2, 7);
            ctx.fillStyle = '#78716c';
            ctx.fillRect(tx + 2, ty + TILE_SIZE - 9, TILE_SIZE - 4, 2);
          } else {
            ctx.fillStyle = '#1f1c24';
            ctx.fillRect(tx + 3, ty + 3, 7, 5);
            ctx.fillRect(tx + 13, ty + 12, 8, 5);
          }
        } else if (t === 'FLOOR') {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#36322d' : '#302c27';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          // Carved flagstone bevels & pebbles
          ctx.fillStyle = '#24211d';
          ctx.fillRect(tx, ty + TILE_SIZE - 1, TILE_SIZE, 1);
          ctx.fillRect(tx + TILE_SIZE - 1, ty, 1, TILE_SIZE);
          ctx.fillStyle = '#47423b';
          ctx.fillRect(tx + 2, ty + 2, 5, 2);
          if ((r * 7 + c * 13) % 9 === 0) {
            ctx.fillStyle = '#15803d'; // Subtle quarry moss tuft
            ctx.fillRect(tx + 16, ty + 16, 4, 3);
          }
        } else if (t === 'STAIRS') {
          ctx.fillStyle = '#292524';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          for (let s = 2; s < TILE_SIZE; s += 6) {
            ctx.fillStyle = '#78716c';
            ctx.fillRect(tx + 2, ty + s, TILE_SIZE - 4, 3);
            ctx.fillStyle = '#a8a29e';
            ctx.fillRect(tx + 3, ty + s, TILE_SIZE - 6, 1);
          }
        } else if (t === 'CHASM') {
          ctx.fillStyle = '#07070c';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          if ((r + c) % 4 === 0) {
            ctx.fillStyle = '#312e81';
            ctx.fillRect(tx + 9, ty + 9, 3, 3);
          }
        } else if (t === 'LAVA') {
          const pulse = Math.sin(time * 0.005 + c * 0.8 + r * 0.5) > 0;
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = pulse ? '#dc2626' : '#991b1b';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = pulse ? '#fde047' : '#f97316';
          ctx.fillRect(tx + 5, ty + 8, TILE_SIZE - 10, 6);
        } else if (t === 'VINE_BRIDGE') {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#047857';
          ctx.fillRect(tx + 1, ty + 2, TILE_SIZE - 2, TILE_SIZE - 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(tx + 2, ty + 4, TILE_SIZE - 4, 5);
          ctx.fillRect(tx + 2, ty + 14, TILE_SIZE - 4, 5);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(tx + 10, ty + 9, 4, 4);
        } else if (t === 'BASALT_BRIDGE') {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#3f3f46';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, 2);
          ctx.fillRect(tx + 2, ty + TILE_SIZE - 4, TILE_SIZE - 4, 2);
        } else if (t === 'ASTRAL_BRIDGE') {
          ctx.fillStyle = '#07070c';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#312e81';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(tx + 4, ty + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 8, ty + 8, 8, 8);
        } else if (t === 'CRATER') {
          ctx.fillStyle = '#1c1512';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(tx + 4, ty + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(tx + 7, ty + 7, 10, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx + 10, ty + 10, 4, 4);
        } else if (t === 'LANE') {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#6b4f3a' : '#7c5b44';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#8a6a4e';
          ctx.fillRect(tx + 2, ty + 3, 4, 2);
          if ((r * 5 + c * 3) % 4 === 0) {
            ctx.fillStyle = '#3f6212';
            ctx.fillRect(tx + 15, ty + 14, 5, 3);
            ctx.fillStyle = '#4d7c0f';
            ctx.fillRect(tx + 16, ty + 13, 2, 2);
          }
        } else if (t === 'BOARDS') {
          ctx.fillStyle = '#8a5a32';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#6b4423';
          for (let p = 4; p < TILE_SIZE; p += 6) {
            ctx.fillRect(tx, ty + p, TILE_SIZE, 1);
          }
          ctx.fillStyle = '#a36b3c';
          ctx.fillRect(tx + 3, ty + 2, 8, 2);
        } else if (t === 'TIMBER') {
          ctx.fillStyle = '#3f2a1e';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#5c3d28';
          ctx.fillRect(tx + 2, ty + 2, 4, TILE_SIZE - 4);
          ctx.fillRect(tx + 10, ty + 2, 4, TILE_SIZE - 4);
          ctx.fillRect(tx + 18, ty + 2, 4, TILE_SIZE - 4);
          const southOpen =
            r + 1 < MAP_ROWS &&
            this.tiles[r + 1][c] !== 'TIMBER' &&
            this.tiles[r + 1][c] !== 'WALL';
          if (southOpen) {
            ctx.fillStyle = '#2a1b14';
            ctx.fillRect(tx, ty + TILE_SIZE - 6, TILE_SIZE, 6);
            ctx.fillStyle = '#7c4a2d';
            ctx.fillRect(tx, ty, TILE_SIZE, 3);
          }
        }
      }
    }

    this.drawVillageProps(ctx, time);

    // 2. Master Orin — alive at the boundary stone until the shard falls
    const orinX = 7.5 * TILE_SIZE;
    const orinY = 20.8 * TILE_SIZE;
    if (!this.shardFallen) {
      const liveRows = [
        '...hhhhhh...',
        '..hssssssh..',
        '..hsseessh..',
        '..hssssssh..',
        '...tttttt...',
        '..tttttttt..',
        '..t.tttt.t..',
        '..b.b..b.b..',
        '...b....b...',
      ];
      const liveOrin = getCachedPixelSprite('npc_orin_living', liveRows, {
        h: '#d6d3d1',
        s: '#e7c2a4',
        e: '#1c1917',
        t: '#78716c',
        b: '#44403c',
      });
      ctx.drawImage(liveOrin, orinX - 12, orinY - 28, 24, 28);
    } else {
    const orinRows = [
      '....CCCCCC....',
      '..CCccccccCC..',
      '.CcchhhhhhccC.',
      '.CchsssssshcC.',
      '.CchsseesshcC.',
      '.CchwwwwwwhcC.',
      '.CchwwwwwwhcC.',
      '.CcbbbbbbbbcC.',
      '..CCbbbbbbCC..',
      '...CCCCCCCC...',
    ];
    const orinSprite = getCachedPixelSprite('npc_orin_crystal', orinRows, {
      C: '#f59e0b',
      c: '#c084fc',
      h: '#78350f',
      s: '#d6b29a',
      e: '#18181b',
      w: '#d1d5db',
      b: '#92400e',
    });
    ctx.drawImage(orinSprite, orinX - 14, orinY - 30, 28, 30);
    drawPointLight(ctx, orinX, orinY - 14, 62, '#f59e0b', 0.36);
    }

    // 3. Draw Outlined Pixel Wardstones
    for (const ws of this.wardstones) {
      const wx = (ws.tileX + 0.5) * TILE_SIZE;
      const wy = (ws.tileY + 0.5) * TILE_SIZE;
      const color =
        ws.requiredRealm === 'DAWN'
          ? '#10b981'
          : ws.requiredRealm === 'OBSIDIAN'
          ? '#ef4444'
          : '#a855f7';

      const wsSprite = getCachedPixelSprite(
        `prop_${ws.id}_${ws.attunedBy}`,
        WARDSTONE_ROWS,
        {
          g: '#27272a',
          G: '#52525b',
          d: '#18181b',
          D: '#3f3f46',
          c: ws.attunedBy !== 'NONE' ? color : '#71717a',
          W: ws.attunedBy !== 'NONE' ? '#fde047' : '#a1a1aa',
        }
      );
      ctx.drawImage(wsSprite, wx - 11, wy - 25, 22, 26);
      drawPointLight(
        ctx,
        wx,
        wy - 12,
        ws.attunedBy !== 'NONE' ? 58 : 34,
        color,
        ws.attunedBy !== 'NONE' ? 0.45 : 0.24
      );
    }

    // 4. Draw Titan Waygate, Master Anvil & Relic Chest
    const wgX = 12.5 * TILE_SIZE;
    const wgY = 7.5 * TILE_SIZE;
    ctx.fillStyle = '#09070d';
    ctx.fillRect(wgX - 15, wgY - 13, 30, 18);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(wgX - 14, wgY - 12, 28, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wgX - 9, wgY - 9, 18, 10);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(wgX - 5, wgY - 6, 10, 4);
    drawPointLight(ctx, wgX, wgY - 4, 58, '#38bdf8', 0.36);

    const anvilX = 10.5 * TILE_SIZE;
    const anvilY = 8.5 * TILE_SIZE;
    const anvilSprite = getCachedPixelSprite('prop_anvil', ANVIL_ROWS, {
      p: '#3f3f46',
      P: '#71717a',
      o: '#ea580c',
      Y: '#fde047',
      d: '#18181b',
    });
    ctx.drawImage(anvilSprite, anvilX - 12, anvilY - 14, 24, 15);
    drawPointLight(ctx, anvilX, anvilY - 8, 38, '#f97316', 0.3);

    const chestX = 31.5 * TILE_SIZE;
    const chestY = 8.5 * TILE_SIZE;
    const chestSprite = getCachedPixelSprite(
      `prop_chest_${this.relicChestOpened}`,
      CHEST_ROWS,
      {
        Y: '#fbbf24',
        b: this.relicChestOpened ? '#44403c' : '#b45309',
        W: this.relicChestOpened ? '#71717a' : '#fef08a',
        d: '#1c1917',
      }
    );
    ctx.drawImage(chestSprite, chestX - 11, chestY - 13, 22, 14);
    if (!this.relicChestOpened) {
      drawPointLight(ctx, chestX, chestY - 6, 44, '#fde047', 0.36);
    }

    // 5. Draw Unrecruited Party Members on the Field
    if (!heroes.sura.recruited) {
      drawHeroSprite(ctx, heroes.sura, 20.5 * TILE_SIZE, 21.2 * TILE_SIZE, time, 'LEFT');
      drawPointLight(ctx, 20.5 * TILE_SIZE, 21.2 * TILE_SIZE - 16, 46, '#10b981', 0.3);
    }
    if (!heroes.cassian.recruited) {
      drawHeroSprite(ctx, heroes.cassian, 18.5 * TILE_SIZE, 14.5 * TILE_SIZE, time, 'LEFT');
      drawPointLight(ctx, 18.5 * TILE_SIZE, 14.5 * TILE_SIZE - 16, 46, '#e11d48', 0.3);
    }
    if (!heroes.vesper.recruited) {
      drawHeroSprite(ctx, heroes.vesper, 15.5 * TILE_SIZE, 8.2 * TILE_SIZE, time, 'RIGHT');
      drawPointLight(ctx, 15.5 * TILE_SIZE, 8.2 * TILE_SIZE - 16, 48, '#a855f7', 0.34);
    }

    // 6. Draw Visible Field Enemies Using Full Hi-Bit Enemy Pixel Sprites!
    for (const fe of this.fieldEnemies) {
      if (fe.defeated) continue;
      const proxyEnemy = this.fieldEnemySprites.get(fe.id);
      if (proxyEnemy) {
        drawEnemySprite(ctx, proxyEnemy, fe.x, fe.y, time, fe.patrolRadius > 0);
      }
      if (fe.isBoss) {
        drawPointLight(ctx, fe.x, fe.y - 20, 68, '#ef4444', 0.38);
      }
    }

    // Draw Footstep Dust Puffs behind Kaelen
    for (const dp of this.dustParticles) {
      ctx.save();
      ctx.fillStyle = `rgba(214, 211, 209, ${dp.timer * 1.4})`;
      const r = (1 - dp.timer * 2) * 3.5 + 1.5;
      ctx.beginPath();
      ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Player (Kaelen Vance) + Field Ambush Swing Arc
    drawHeroSprite(
      ctx,
      heroes.kaelen,
      this.playerX,
      this.playerY,
      time,
      this.playerFacing,
      1,
      this.isPlayerMoving
    );
    const kaelen = heroes.kaelen;
    if (kaelen.weaponTierIndex > 0) {
      const glow = kaelen.weaponTiers[kaelen.weaponTierIndex]?.glowColor ?? '#f59e0b';
      drawPointLight(ctx, this.playerX, this.playerY - 16, 68, glow, 0.28);
    } else if (kaelen.presentation === 'SHARD') {
      drawPointLight(ctx, this.playerX, this.playerY - 14, 18, '#c084fc', 0.14);
    }

    if (this.swingTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      const arcX = this.playerX + (this.playerFacing === 'RIGHT' ? 18 : -18);
      const arcY = this.playerY - 14;
      ctx.beginPath();
      ctx.arc(
        arcX,
        arcY,
        19,
        -Math.PI * 0.45,
        Math.PI * 0.45,
        this.playerFacing === 'LEFT'
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    return { camX, camY };
  }
}
