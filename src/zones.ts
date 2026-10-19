import {
  BiomePaletteId,
  DomainType,
  FieldEnemySpawn,
  RealmId,
  TileType,
  Wardstone,
  ZoneAudioProfileId,
  ZoneId,
} from './types';

export type Edge = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

export interface ZoneExit {
  id: string;
  edge: Edge;
  /** First tile of the strip along the edge. */
  cross: number;
  width: number;
  targetZoneId: ZoneId;
  /** Exit id on the destination Zone whose strip the party steps inward from. */
  targetExitId: string;
}

export interface TileRect {
  c1: number;
  r1: number;
  c2: number;
  r2: number;
  type: TileType;
}

export interface BiomePalette {
  id: BiomePaletteId;
  wall: string;
  wallDeep: string;
  wallFace: string;
  wallHighlight: string;
  wallSpeckle: string;
  floorA: string;
  floorB: string;
  floorShade: string;
  floorBevel: string;
  floorAccent: string;
  stairs: string;
  stairTread: string;
  stairHighlight: string;
  chasm: string;
  chasmSpark: string;
  lavaDeep: string;
  lavaMid: string;
  lavaMidHot: string;
  lavaCore: string;
  lavaCoreHot: string;
  /** Screen-edge tint. Null keeps the Zone free of a rim overlay. */
  rim: string | null;
  mote: string;
  moteAlpha: number;
  moteCount: number;
  dustRgb: string;
  exitMark: string;
}

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  realm: RealmId;
  cols: number;
  rows: number;
  biomePalette: BiomePaletteId;
  audioProfile: ZoneAudioProfileId;
  /** Stored for a later combat pass. Battles still begin with no Domain active. */
  defaultBattleDomain: DomainType;
  kind: 'QUARRY' | 'SHELL';
  start: { tileX: number; tileY: number; facing: 'LEFT' | 'RIGHT' };
  rects: TileRect[];
  exits: ZoneExit[];
  wardstones: Wardstone[];
  fieldEnemies: FieldEnemySpawn[];
}

export const QUARRY_CHEST_ID = 'quarry_relic_chest';
export const QUARRY_WAYGATE_ID = 'quarry_waygate';

export const REALM_LABEL: Record<RealmId, string> = {
  FRONTIER: 'The Frontier',
  GRAND_ARCHIVE: 'The Grand Archive',
  MYTHIC_DAWN: 'The Mythic Dawn',
  OBSIDIAN_REIGN: 'The Obsidian Reign',
  ASTRAL_WASTES: 'The Astral Wastes',
  TRI_BORDER_MAELSTROM: 'The Contested Tri-Border Maelstrom',
};

export const BIOME_PALETTES: Record<BiomePaletteId, BiomePalette> = {
  CRATER_QUARRY: {
    id: 'CRATER_QUARRY',
    wall: '#141218',
    wallDeep: '#09080c',
    wallFace: '#3f3b47',
    wallHighlight: '#78716c',
    wallSpeckle: '#1f1c24',
    floorA: '#36322d',
    floorB: '#302c27',
    floorShade: '#24211d',
    floorBevel: '#47423b',
    floorAccent: '#15803d',
    stairs: '#292524',
    stairTread: '#78716c',
    stairHighlight: '#a8a29e',
    chasm: '#07070c',
    chasmSpark: '#312e81',
    lavaDeep: '#450a0a',
    lavaMid: '#991b1b',
    lavaMidHot: '#dc2626',
    lavaCore: '#f97316',
    lavaCoreHot: '#fde047',
    rim: null,
    mote: '#d6d3d1',
    moteAlpha: 0.22,
    moteCount: 10,
    dustRgb: '214, 211, 209',
    exitMark: '#fde047',
  },
  OAKHAVEN: {
    id: 'OAKHAVEN',
    wall: '#1a1410',
    wallDeep: '#0e0b09',
    wallFace: '#6b3e28',
    wallHighlight: '#c4a574',
    wallSpeckle: '#3f2a1d',
    floorA: '#5a4636',
    floorB: '#4e3d30',
    floorShade: '#3a2c22',
    floorBevel: '#7a5c42',
    floorAccent: '#d97706',
    stairs: '#3f342c',
    stairTread: '#8a6a4a',
    stairHighlight: '#e8c99a',
    chasm: '#120e0c',
    chasmSpark: '#b45309',
    lavaDeep: '#451a03',
    lavaMid: '#9a3412',
    lavaMidHot: '#ea580c',
    lavaCore: '#f59e0b',
    lavaCoreHot: '#fde68a',
    rim: 'rgba(217, 119, 6, 0.28)',
    mote: '#fbbf24',
    moteAlpha: 0.45,
    moteCount: 22,
    dustRgb: '196, 165, 116',
    exitMark: '#fde68a',
  },
  KINGSROAD_PASS: {
    id: 'KINGSROAD_PASS',
    wall: '#3a2a1c',
    wallDeep: '#24180f',
    wallFace: '#6b4f32',
    wallHighlight: '#c4a36a',
    wallSpeckle: '#2a1e14',
    floorA: '#b08968',
    floorB: '#9c7a58',
    floorShade: '#6b5340',
    floorBevel: '#d4b48a',
    floorAccent: '#a16207',
    stairs: '#7c5c3e',
    stairTread: '#c4a36a',
    stairHighlight: '#f5e6c8',
    chasm: '#1c140e',
    chasmSpark: '#92400e',
    lavaDeep: '#431407',
    lavaMid: '#9a3412',
    lavaMidHot: '#c2410c',
    lavaCore: '#fdba74',
    lavaCoreHot: '#ffedd5',
    rim: 'rgba(214, 163, 92, 0.32)',
    mote: '#e7d3b0',
    moteAlpha: 0.5,
    moteCount: 26,
    dustRgb: '212, 180, 138',
    exitMark: '#1c1917',
  },
  GRAND_ARCHIVE: {
    id: 'GRAND_ARCHIVE',
    wall: '#1c1917',
    wallDeep: '#0c0a09',
    wallFace: '#e7e5e4',
    wallHighlight: '#fafaf9',
    wallSpeckle: '#292524',
    floorA: '#f5f5f4',
    floorB: '#e7e5e4',
    floorShade: '#a8a29e',
    floorBevel: '#fafaf9',
    floorAccent: '#44403c',
    stairs: '#d6d3d1',
    stairTread: '#fafaf9',
    stairHighlight: '#78716c',
    chasm: '#0c0a09',
    chasmSpark: '#57534e',
    lavaDeep: '#1c1917',
    lavaMid: '#44403c',
    lavaMidHot: '#78716c',
    lavaCore: '#d6d3d1',
    lavaCoreHot: '#fafaf9',
    rim: 'rgba(231, 229, 228, 0.22)',
    mote: '#fafaf9',
    moteAlpha: 0.55,
    moteCount: 24,
    dustRgb: '168, 162, 158',
    exitMark: '#1c1917',
  },
};

const QUARRY_WARDSTONES: Wardstone[] = [
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

const QUARRY_ENEMIES: FieldEnemySpawn[] = [
  {
    id: 'fe_kobold_1',
    name: 'Shard-Bitten Kobold',
    homeTileX: 21,
    homeTileY: 23,
    patrolRadius: 36,
    dir: 'LEFT',
    encounterIds: ['kobold_scavenger', 'kobold_scavenger'],
  },
  {
    id: 'fe_hound_1',
    name: 'Obsidian Recon Pack',
    homeTileX: 24,
    homeTileY: 15,
    patrolRadius: 42,
    dir: 'RIGHT',
    encounterIds: ['obsidian_hound', 'kobold_scavenger'],
  },
  {
    id: 'fe_golem_1',
    name: 'Fractured Ward-Golem',
    homeTileX: 21,
    homeTileY: 8,
    patrolRadius: 30,
    dir: 'LEFT',
    encounterIds: ['ward_golem', 'obsidian_hound'],
  },
  {
    id: 'fe_boss_vane',
    name: 'Inquisitor Vane & Siege-Golem',
    homeTileX: 19,
    homeTileY: 3.5,
    patrolRadius: 0,
    dir: 'DOWN',
    encounterIds: ['inquisitor_vane', 'siege_golem'],
    isBoss: true,
  },
];

export const ZONE_BY_ID: Record<ZoneId, ZoneDefinition> = {
  cratered_quarry: {
    id: 'cratered_quarry',
    name: 'The Cratered Quarry',
    realm: 'FRONTIER',
    cols: 38,
    rows: 28,
    biomePalette: 'CRATER_QUARRY',
    audioProfile: 'CRATER_QUARRY',
    defaultBattleDomain: 'NONE',
    kind: 'QUARRY',
    start: { tileX: 9, tileY: 22, facing: 'RIGHT' },
    rects: [
      { c1: 4, r1: 19, c2: 13, r2: 24, type: 'FLOOR' },
      { c1: 6, r1: 20, c2: 7, r2: 21, type: 'CRATER' },
      { c1: 14, r1: 19, c2: 17, r2: 24, type: 'CHASM' },
      { c1: 18, r1: 19, c2: 29, r2: 24, type: 'FLOOR' },
      { c1: 25, r1: 16, c2: 27, r2: 18, type: 'STAIRS' },
      { c1: 13, r1: 13, c2: 29, r2: 16, type: 'FLOOR' },
      { c1: 11, r1: 11, c2: 29, r2: 12, type: 'LAVA' },
      { c1: 9, r1: 6, c2: 25, r2: 10, type: 'FLOOR' },
      { c1: 26, r1: 6, c2: 29, r2: 10, type: 'CHASM' },
      { c1: 30, r1: 7, c2: 33, r2: 9, type: 'FLOOR' },
      { c1: 18, r1: 5, c2: 20, r2: 6, type: 'STAIRS' },
      { c1: 15, r1: 2, c2: 23, r2: 5, type: 'FLOOR' },
      { c1: 8, r1: 25, c2: 11, r2: 26, type: 'FLOOR' },
    ],
    exits: [
      {
        id: 'to_oakhaven',
        edge: 'SOUTH',
        cross: 8,
        width: 4,
        targetZoneId: 'oakhaven_town',
        targetExitId: 'to_quarry',
      },
    ],
    wardstones: QUARRY_WARDSTONES,
    fieldEnemies: QUARRY_ENEMIES,
  },
  oakhaven_town: {
    id: 'oakhaven_town',
    name: 'Oakhaven',
    realm: 'FRONTIER',
    cols: 38,
    rows: 28,
    biomePalette: 'OAKHAVEN',
    audioProfile: 'OAKHAVEN',
    defaultBattleDomain: 'NONE',
    kind: 'SHELL',
    start: { tileX: 18, tileY: 14, facing: 'RIGHT' },
    rects: [
      { c1: 8, r1: 6, c2: 29, r2: 21, type: 'FLOOR' },
      { c1: 16, r1: 1, c2: 19, r2: 6, type: 'FLOOR' },
      { c1: 29, r1: 12, c2: 36, r2: 15, type: 'FLOOR' },
    ],
    exits: [
      {
        id: 'to_quarry',
        edge: 'NORTH',
        cross: 16,
        width: 4,
        targetZoneId: 'cratered_quarry',
        targetExitId: 'to_oakhaven',
      },
      {
        id: 'to_kingsroad',
        edge: 'EAST',
        cross: 12,
        width: 4,
        targetZoneId: 'kingsroad_pass',
        targetExitId: 'to_oakhaven',
      },
    ],
    wardstones: [],
    fieldEnemies: [],
  },
  kingsroad_pass: {
    id: 'kingsroad_pass',
    name: 'The Kingsroad Pass',
    realm: 'FRONTIER',
    cols: 38,
    rows: 28,
    biomePalette: 'KINGSROAD_PASS',
    audioProfile: 'KINGSROAD_PASS',
    defaultBattleDomain: 'NONE',
    kind: 'SHELL',
    start: { tileX: 18, tileY: 14, facing: 'RIGHT' },
    rects: [
      { c1: 4, r1: 8, c2: 33, r2: 19, type: 'FLOOR' },
      { c1: 1, r1: 12, c2: 4, r2: 15, type: 'FLOOR' },
      { c1: 33, r1: 12, c2: 36, r2: 15, type: 'FLOOR' },
    ],
    exits: [
      {
        id: 'to_oakhaven',
        edge: 'WEST',
        cross: 12,
        width: 4,
        targetZoneId: 'oakhaven_town',
        targetExitId: 'to_kingsroad',
      },
      {
        id: 'to_archive',
        edge: 'EAST',
        cross: 12,
        width: 4,
        targetZoneId: 'grand_archive',
        targetExitId: 'to_kingsroad',
      },
    ],
    wardstones: [],
    fieldEnemies: [],
  },
  grand_archive: {
    id: 'grand_archive',
    name: 'The Grand Archive',
    realm: 'GRAND_ARCHIVE',
    cols: 38,
    rows: 28,
    biomePalette: 'GRAND_ARCHIVE',
    audioProfile: 'GRAND_ARCHIVE',
    defaultBattleDomain: 'NONE',
    kind: 'SHELL',
    start: { tileX: 18, tileY: 14, facing: 'LEFT' },
    rects: [
      { c1: 6, r1: 6, c2: 31, r2: 21, type: 'FLOOR' },
      { c1: 1, r1: 12, c2: 6, r2: 15, type: 'FLOOR' },
    ],
    exits: [
      {
        id: 'to_kingsroad',
        edge: 'WEST',
        cross: 12,
        width: 4,
        targetZoneId: 'kingsroad_pass',
        targetExitId: 'to_archive',
      },
    ],
    wardstones: [],
    fieldEnemies: [],
  },
};

export function getZone(id: ZoneId): ZoneDefinition {
  return ZONE_BY_ID[id];
}

export class WorldMemory {
  openedChestIds = new Set<string>();
  defeatedBossIds = new Set<string>();
  defeatedFieldEnemyIds = new Set<string>();
  wardstoneAttunement: Record<string, DomainType> = {};
  discoveredWaygateIds = new Set<string>();

  respawnNonBossesInRealm(realm: RealmId): void {
    for (const zone of Object.values(ZONE_BY_ID)) {
      if (zone.realm !== realm) continue;
      for (const fe of zone.fieldEnemies) {
        if (!fe.isBoss) this.defeatedFieldEnemyIds.delete(fe.id);
      }
    }
  }

  respawnAllNonBosses(): void {
    for (const zone of Object.values(ZONE_BY_ID)) {
      for (const fe of zone.fieldEnemies) {
        if (!fe.isBoss) this.defeatedFieldEnemyIds.delete(fe.id);
      }
    }
  }
}
