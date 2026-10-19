import { FieldEnemy, Hero, HeroId, TileType, Wardstone } from './types';
import { createEnemyFromTemplate } from './data';
import { getCachedPixelSprite } from './pixel-art';
import { drawEnemySprite, drawHeroSprite, drawPointLight } from './sprites';
import {
  BIOME_PALETTES,
  BiomePalette,
  Edge,
  QUARRY_CHEST_ID,
  WorldMemory,
  ZoneDefinition,
  ZoneExit,
} from './zones';

export type { TileType } from './types';

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

export class ZoneMap {
  public definition: ZoneDefinition;
  public cols: number;
  public rows: number;
  public tiles: TileType[][] = [];
  public playerX = 0;
  public playerY = 0;
  public playerFacing: 'LEFT' | 'RIGHT' = 'RIGHT';
  public isPlayerMoving = false;
  public swingTimer = 0;
  public dustParticles: { x: number; y: number; timer: number }[] = [];

  public wardstones: Wardstone[] = [];
  public relicChestOpened = false;
  public fieldEnemies: FieldEnemy[] = [];
  /** The Heart-Shard crater is painted only after the opening dialogue. */
  public shardFallen = false;

  private fieldEnemySprites = new Map<string, ReturnType<typeof createEnemyFromTemplate>>();
  private palette: BiomePalette;

  constructor(definition: ZoneDefinition, world: WorldMemory) {
    this.definition = definition;
    this.cols = definition.cols;
    this.rows = definition.rows;
    this.palette = BIOME_PALETTES[definition.biomePalette];
    this.load(definition, world, { start: true });
  }

  public load(
    definition: ZoneDefinition,
    world: WorldMemory,
    entry: { start: true } | { exitId: string }
  ): void {
    this.definition = definition;
    this.cols = definition.cols;
    this.rows = definition.rows;
    this.palette = BIOME_PALETTES[definition.biomePalette];
    this.dustParticles = [];
    this.swingTimer = 0;
    this.isPlayerMoving = false;
    this.buildTiles();
    this.wardstones = definition.wardstones.map((ws) => ({
      ...ws,
      attunedBy: world.wardstoneAttunement[ws.id] ?? 'NONE',
    }));
    for (const ws of this.wardstones) {
      if (ws.attunedBy !== 'NONE') this.paintWardstoneBridge(ws.id);
    }
    this.relicChestOpened = definition.kind === 'QUARRY' && world.openedChestIds.has(QUARRY_CHEST_ID);
    this.fieldEnemies = definition.fieldEnemies.map((spawn) => {
      const x = spawn.homeTileX * TILE_SIZE;
      const y = spawn.homeTileY * TILE_SIZE;
      const defeated = spawn.isBoss
        ? world.defeatedBossIds.has(spawn.id)
        : world.defeatedFieldEnemyIds.has(spawn.id);
      return {
        id: spawn.id,
        name: spawn.name,
        x,
        y,
        homeX: x,
        homeY: y,
        patrolRadius: spawn.patrolRadius,
        dir: spawn.dir,
        encounterIds: [...spawn.encounterIds],
        isBoss: spawn.isBoss,
        defeated,
        stunTimer: 0,
      };
    });
    this.fieldEnemySprites = new Map();
    for (const fe of this.fieldEnemies) {
      this.fieldEnemySprites.set(fe.id, createEnemyFromTemplate(fe.encounterIds[0]));
    }
    if ('exitId' in entry) this.placeAtExit(entry.exitId);
    else this.placeAtStart();
  }

  public refreshFieldEnemyDefeat(world: WorldMemory): void {
    for (const fe of this.fieldEnemies) {
      const defeated = fe.isBoss
        ? world.defeatedBossIds.has(fe.id)
        : world.defeatedFieldEnemyIds.has(fe.id);
      fe.defeated = defeated;
      if (!defeated) {
        fe.x = fe.homeX;
        fe.y = fe.homeY;
      }
    }
  }

  private placeAtStart(): void {
    const start = this.definition.start;
    this.playerX = start.tileX * TILE_SIZE;
    this.playerY = start.tileY * TILE_SIZE;
    this.playerFacing = start.facing;
  }

  private placeAtExit(exitId: string): void {
    const exit = this.definition.exits.find((candidate) => candidate.id === exitId);
    if (!exit) {
      this.placeAtStart();
      return;
    }
    const mid = (exit.cross + exit.width / 2) * TILE_SIZE;
    if (exit.edge === 'NORTH') {
      this.playerX = mid;
      this.playerY = TILE_SIZE + 1.5 * TILE_SIZE;
    } else if (exit.edge === 'SOUTH') {
      this.playerX = mid;
      this.playerY = (this.rows - 1) * TILE_SIZE - 1.5 * TILE_SIZE;
    } else if (exit.edge === 'WEST') {
      this.playerX = TILE_SIZE + 1.5 * TILE_SIZE;
      this.playerY = mid;
      this.playerFacing = 'RIGHT';
    } else {
      this.playerX = (this.cols - 1) * TILE_SIZE - 1.5 * TILE_SIZE;
      this.playerY = mid;
      this.playerFacing = 'LEFT';
    }
  }

  private buildTiles(): void {
    this.tiles = [];
    for (let r = 0; r < this.rows; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.tiles[r][c] = 'WALL';
      }
    }
    for (const rect of this.definition.rects) {
      for (let r = rect.r1; r <= rect.r2; r++) {
        for (let c = rect.c1; c <= rect.c2; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.tiles[r][c] = rect.type;
          }
        }
      }
    }
    for (const exit of this.definition.exits) {
      for (let i = 0; i < exit.width; i++) {
        if (exit.edge === 'NORTH') this.tiles[0][exit.cross + i] = 'EXIT';
        else if (exit.edge === 'SOUTH') this.tiles[this.rows - 1][exit.cross + i] = 'EXIT';
        else if (exit.edge === 'WEST') this.tiles[exit.cross + i][0] = 'EXIT';
        else this.tiles[exit.cross + i][this.cols - 1] = 'EXIT';
      }
    }
    if (this.shardFallen) this.paintCrater();
  }

  public applyShardfall(): void {
    if (this.shardFallen) return;
    this.shardFallen = true;
    this.paintCrater();
  }

  private paintCrater(): void {
    if (this.definition.id !== 'cratered_quarry') return;
    const cells: [number, number][] = [
      [6, 20],
      [7, 20],
      [6, 21],
      [7, 21],
    ];
    for (const [c, r] of cells) {
      if (this.tiles[r]) this.tiles[r][c] = 'CRATER';
    }
  }

  public attuneWardstone(id: string): void {
    const ws = this.wardstones.find((w) => w.id === id);
    if (!ws) return;
    ws.attunedBy = ws.requiredRealm;
    this.paintWardstoneBridge(id);
  }

  private paintWardstoneBridge(id: string): void {
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
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
      const t = this.tiles[r][c];
      if (t === 'WALL' || t === 'CHASM' || t === 'LAVA') return false;
    }
    return true;
  }

  public exitUnderPlayer(): ZoneExit | null {
    const c = Math.floor(this.playerX / TILE_SIZE);
    const r = Math.floor(this.playerY / TILE_SIZE);
    if (this.tiles[r]?.[c] !== 'EXIT') return null;
    return (
      this.definition.exits.find((exit) => this.exitContains(exit, c, r)) ?? null
    );
  }

  private exitContains(exit: ZoneExit, c: number, r: number): boolean {
    if (exit.edge === 'NORTH') return r === 0 && c >= exit.cross && c < exit.cross + exit.width;
    if (exit.edge === 'SOUTH') {
      return r === this.rows - 1 && c >= exit.cross && c < exit.cross + exit.width;
    }
    if (exit.edge === 'WEST') return c === 0 && r >= exit.cross && r < exit.cross + exit.width;
    return c === this.cols - 1 && r >= exit.cross && r < exit.cross + exit.width;
  }

  private edgeAt(c: number, r: number): Edge | null {
    for (const exit of this.definition.exits) {
      if (this.exitContains(exit, c, r)) return exit.edge;
    }
    return null;
  }

  public getNearestTrigger(heroes: Record<HeroId, Hero>): InteractableTrigger | null {
    const triggers: InteractableTrigger[] = [];

    if (this.definition.id === 'oakhaven_town') {
      triggers.push(
        {
          id: 'pallet',
          type: 'PALLET',
          label: 'Sleeping pallet',
          promptText: '[Space / Click] Look at the pallet',
          x: 13.5 * TILE_SIZE,
          y: 19.2 * TILE_SIZE,
        },
        {
          id: 'sign',
          type: 'VILLAGE_SIGN',
          label: 'Hamlet sign',
          promptText: '[Space / Click] Read the road sign',
          x: 15.2 * TILE_SIZE,
          y: 7.4 * TILE_SIZE,
        },
        {
          id: 'bram',
          type: 'VILLAGE_NPC',
          label: 'Bram',
          promptText: '[Space / Click] Speak with Bram',
          x: 13.2 * TILE_SIZE,
          y: 14.6 * TILE_SIZE,
        }
      );
    } else if (this.definition.kind !== 'QUARRY') {
      return null;
    } else if (this.shardFallen) {
      triggers.push({
        id: 'orin',
        type: 'NPC_ORIN',
        label: 'Master Orin (Petrified)',
        promptText: '[Space / Click] Inspect Petrified Master Orin',
        x: 7.5 * TILE_SIZE,
        y: 20.8 * TILE_SIZE,
      });
    }

    if (this.definition.kind === 'QUARRY') {
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
        promptText: '[Space / Click] Open Titan Relic Cache (+5 Heart-Ore, Talent, & Orin\'s Plumb-Line)',
        x: 31.5 * TILE_SIZE,
        y: 8.5 * TILE_SIZE,
      });
    }
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

  public render(
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number,
    heroes: Record<HeroId, Hero>,
    time: number
  ): { camX: number; camY: number } {
    const mapW = this.cols * TILE_SIZE;
    const mapH = this.rows * TILE_SIZE;
    const camX = Math.max(0, Math.min(mapW - viewportW, Math.round(this.playerX - viewportW / 2)));
    const camY = Math.max(0, Math.min(mapH - viewportH, Math.round(this.playerY - viewportH / 2)));
    const palette = this.palette;

    ctx.save();
    ctx.translate(-camX, -camY);

    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const endCol = Math.min(this.cols - 1, Math.ceil((camX + viewportW) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
    const endRow = Math.min(this.rows - 1, Math.ceil((camY + viewportH) / TILE_SIZE) + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = this.tiles[r][c];
        const tx = c * TILE_SIZE;
        const ty = r * TILE_SIZE;

        if (t === 'WALL') {
          ctx.fillStyle = palette.wall;
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          if (r + 1 < this.rows && this.tiles[r + 1][c] !== 'WALL') {
            ctx.fillStyle = palette.wallDeep;
            ctx.fillRect(tx, ty + TILE_SIZE - 10, TILE_SIZE, 10);
            ctx.fillStyle = palette.wallFace;
            ctx.fillRect(tx + 1, ty + TILE_SIZE - 9, TILE_SIZE - 2, 7);
            ctx.fillStyle = palette.wallHighlight;
            ctx.fillRect(tx + 2, ty + TILE_SIZE - 9, TILE_SIZE - 4, 2);
          } else {
            ctx.fillStyle = palette.wallSpeckle;
            ctx.fillRect(tx + 3, ty + 3, 7, 5);
            ctx.fillRect(tx + 13, ty + 12, 8, 5);
          }
        } else if (t === 'FLOOR' || t === 'EXIT') {
          this.drawFloorTile(ctx, tx, ty, r, c);
          if (t === 'EXIT') {
            const edge = this.edgeAt(c, r);
            if (edge) this.drawChevron(ctx, tx, ty, edge);
          }
        } else if (t === 'STAIRS') {
          ctx.fillStyle = palette.stairs;
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          for (let s = 2; s < TILE_SIZE; s += 6) {
            ctx.fillStyle = palette.stairTread;
            ctx.fillRect(tx + 2, ty + s, TILE_SIZE - 4, 3);
            ctx.fillStyle = palette.stairHighlight;
            ctx.fillRect(tx + 3, ty + s, TILE_SIZE - 6, 1);
          }
        } else if (t === 'CHASM') {
          ctx.fillStyle = palette.chasm;
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          if ((r + c) % 4 === 0) {
            ctx.fillStyle = palette.chasmSpark;
            ctx.fillRect(tx + 9, ty + 9, 3, 3);
          }
        } else if (t === 'LAVA') {
          const pulse = Math.sin(time * 0.005 + c * 0.8 + r * 0.5) > 0;
          ctx.fillStyle = palette.lavaDeep;
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = pulse ? palette.lavaMidHot : palette.lavaMid;
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = pulse ? palette.lavaCoreHot : palette.lavaCore;
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
        }
      }
    }

    this.drawMotes(ctx, time, mapW, mapH);

    if (this.definition.id === 'oakhaven_town') {
      this.drawHamletProps(ctx);
    } else if (this.definition.kind === 'QUARRY') {
      this.drawQuarryProps(ctx, heroes, time);
    }

    for (const dp of this.dustParticles) {
      ctx.save();
      ctx.fillStyle = `rgba(${palette.dustRgb}, ${dp.timer * 1.4})`;
      const radius = (1 - dp.timer * 2) * 3.5 + 1.5;
      ctx.beginPath();
      ctx.arc(dp.x, dp.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

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
      drawPointLight(ctx, this.playerX, this.playerY - 16, 18, '#c084fc', 0.14);
    }

    if (this.swingTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      const arcX = this.playerX + (this.playerFacing === 'RIGHT' ? 18 : -18);
      const arcY = this.playerY - 14;
      ctx.beginPath();
      ctx.arc(arcX, arcY, 19, -Math.PI * 0.45, Math.PI * 0.45, this.playerFacing === 'LEFT');
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    if (palette.rim) {
      const gradient = ctx.createRadialGradient(
        viewportW / 2,
        viewportH / 2,
        viewportW * 0.25,
        viewportW / 2,
        viewportH / 2,
        viewportW * 0.72
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, palette.rim);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, viewportW, viewportH);
    }

    return { camX, camY };
  }

  private drawFloorTile(
    ctx: CanvasRenderingContext2D,
    tx: number,
    ty: number,
    r: number,
    c: number
  ): void {
    const palette = this.palette;
    ctx.fillStyle = (r + c) % 2 === 0 ? palette.floorA : palette.floorB;
    ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = palette.floorShade;
    ctx.fillRect(tx, ty + TILE_SIZE - 1, TILE_SIZE, 1);
    ctx.fillRect(tx + TILE_SIZE - 1, ty, 1, TILE_SIZE);
    ctx.fillStyle = palette.floorBevel;
    ctx.fillRect(tx + 2, ty + 2, 5, 2);
    if ((r * 7 + c * 13) % 9 === 0) {
      ctx.fillStyle = palette.floorAccent;
      ctx.fillRect(tx + 16, ty + 16, 4, 3);
    }
  }

  private drawChevron(ctx: CanvasRenderingContext2D, tx: number, ty: number, edge: Edge): void {
    ctx.fillStyle = this.palette.exitMark;
    if (edge === 'SOUTH' || edge === 'NORTH') {
      const y0 = edge === 'SOUTH' ? ty + 14 : ty + 8;
      const dir = edge === 'SOUTH' ? 1 : -1;
      ctx.fillRect(tx + 8, y0, 8, 2);
      ctx.fillRect(tx + 6, y0 + dir * 3, 4, 2);
      ctx.fillRect(tx + 14, y0 + dir * 3, 4, 2);
      ctx.fillRect(tx + 10, y0 + dir * 5, 4, 2);
    } else {
      const x0 = edge === 'EAST' ? tx + 14 : tx + 8;
      const dir = edge === 'EAST' ? 1 : -1;
      ctx.fillRect(x0, ty + 8, 2, 8);
      ctx.fillRect(x0 + dir * 3, ty + 6, 2, 4);
      ctx.fillRect(x0 + dir * 3, ty + 14, 2, 4);
      ctx.fillRect(x0 + dir * 5, ty + 10, 2, 4);
    }
  }

  private drawMotes(
    ctx: CanvasRenderingContext2D,
    time: number,
    mapW: number,
    mapH: number
  ): void {
    const palette = this.palette;
    if (palette.moteCount <= 0 || palette.moteAlpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = palette.moteAlpha;
    ctx.fillStyle = palette.mote;
    for (let i = 0; i < palette.moteCount; i++) {
      const x = ((i * 137 + Math.sin(time * 0.0004 + i) * 36) % mapW + mapW) % mapW;
      const y = (time * 0.018 + i * 83) % mapH;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  }

  private drawQuarryProps(
    ctx: CanvasRenderingContext2D,
    heroes: Record<HeroId, Hero>,
    time: number
  ): void {
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

    for (const ws of this.wardstones) {
      const wx = (ws.tileX + 0.5) * TILE_SIZE;
      const wy = (ws.tileY + 0.5) * TILE_SIZE;
      const color =
        ws.requiredRealm === 'DAWN' ? '#10b981' : ws.requiredRealm === 'OBSIDIAN' ? '#ef4444' : '#a855f7';

      const wsSprite = getCachedPixelSprite(`prop_${ws.id}_${ws.attunedBy}`, WARDSTONE_ROWS, {
        g: '#27272a',
        G: '#52525b',
        d: '#18181b',
        D: '#3f3f46',
        c: ws.attunedBy !== 'NONE' ? color : '#71717a',
        W: ws.attunedBy !== 'NONE' ? '#fde047' : '#a1a1aa',
      });
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
    const chestSprite = getCachedPixelSprite(`prop_chest_${this.relicChestOpened}`, CHEST_ROWS, {
      Y: '#fbbf24',
      b: this.relicChestOpened ? '#44403c' : '#b45309',
      W: this.relicChestOpened ? '#71717a' : '#fef08a',
      d: '#1c1917',
    });
    ctx.drawImage(chestSprite, chestX - 11, chestY - 13, 22, 14);
    if (!this.relicChestOpened) {
      drawPointLight(ctx, chestX, chestY - 6, 44, '#fde047', 0.36);
    }

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
  }

  private drawHamletProps(ctx: CanvasRenderingContext2D): void {
    const wellX = 20.5 * TILE_SIZE;
    const wellY = 14.5 * TILE_SIZE;
    ctx.fillStyle = '#44403c';
    ctx.fillRect(wellX - 7, wellY - 6, 14, 10);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(wellX - 5, wellY - 4, 10, 6);
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(wellX - 3, wellY - 2, 6, 3);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(wellX - 8, wellY - 8, 16, 2);

    const signX = 15.2 * TILE_SIZE;
    const signY = 7.4 * TILE_SIZE;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(signX - 1, signY - 14, 2, 14);
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(signX - 8, signY - 16, 16, 7);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(signX - 6, signY - 14, 10, 1);

    const palletX = 13.4 * TILE_SIZE;
    const palletY = 19.6 * TILE_SIZE;
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
    ctx.drawImage(bram, 13.2 * TILE_SIZE - 10, 14.6 * TILE_SIZE - 24, 20, 24);

    const logs = getCachedPixelSprite(
      'prop_woodpile',
      ['..llllll..', '.lLLLLlL..', 'llLLLLll..', '.lLLLLl...', '..llll....'],
      { l: '#92400e', L: '#b45309' }
    );
    ctx.drawImage(logs, 22.2 * TILE_SIZE, 18.2 * TILE_SIZE - 8, 20, 12);
  }
}
