export type DomainType = 'NONE' | 'DAWN' | 'OBSIDIAN' | 'ASTRAL';

export type RealmId =
  | 'FRONTIER'
  | 'GRAND_ARCHIVE'
  | 'MYTHIC_DAWN'
  | 'OBSIDIAN_REIGN'
  | 'ASTRAL_WASTES'
  | 'TRI_BORDER_MAELSTROM';

export type BiomePaletteId = 'CRATER_QUARRY' | 'OAKHAVEN' | 'KINGSROAD_PASS' | 'GRAND_ARCHIVE';

export type ZoneAudioProfileId = 'CRATER_QUARRY' | 'OAKHAVEN' | 'KINGSROAD_PASS' | 'GRAND_ARCHIVE';

export type ZoneId = 'cratered_quarry' | 'oakhaven_town' | 'kingsroad_pass' | 'grand_archive';

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
  | 'EXIT';

export type HeroId = 'kaelen' | 'sura' | 'vesper' | 'cassian';

export type HeroPresentation = 'HUMBLE' | 'SHARD';

export interface Stats {
  maxHp: number;
  hp: number;
  maxIns: number;
  ins: number;
  mgt: number;   // Physical Power
  res: number;   // Magical / Runic Power
  grt: number;   // Physical Defense
  wrd: number;   // Magical Defense
  tmp: number;   // Tempo / Speed on CTB Timeline
  crit: number;  // Crit % (0-100)
  brk: number;   // Bonus Stability Break efficiency
  thr: number;   // Threat / Aggro weight
}

export type SkillTarget = 'ENEMY_SINGLE' | 'ENEMY_ALL' | 'ALLY_SINGLE' | 'ALLY_ALL' | 'SELF';

export type StatusEffectType =
  | 'TAUNT'
  | 'SHIELD'
  | 'BLEED'
  | 'CURSED_INK'
  | 'REGEN'
  | 'HASTE'
  | 'SLOW'
  | 'REDACTED'
  | 'ECHO_CAST'
  | 'VULNERABLE'
  | 'AERIAL_LEAP';

export interface StatusEffect {
  type: StatusEffectType;
  name: string;
  duration: number;
  value: number;
  sourceId?: string;
}

export interface Skill {
  id: string;
  name: string;
  ownerId: HeroId;
  costIns: number;
  cooldown: number;
  currentCooldown?: number;
  target: SkillTarget;
  damageType: 'PHYSICAL' | 'MAGICAL' | 'HYBRID' | 'HEAL' | 'BUFF';
  powerMultiplier: number; // Multiplier on MGT or RES
  stabilityBreak: number;  // How many shield pips it cracks
  ctbDelay?: number;       // Push target back on timeline
  ctbAdvance?: number;     // Pull target/self forward on timeline
  domainAffinity: DomainType;
  description: string;
  domainBonusText?: string;
  statusApplied?: {
    type: StatusEffectType;
    name: string;
    duration: number;
    value: number;
    toSelf?: boolean;
  };
  isDualTech?: boolean;
  partnerId?: HeroId;
}

export interface TalentNode {
  id: string;
  name: string;
  branchName: string;
  branchIndex: 0 | 1; // 0 = Left Spec, 1 = Right Spec
  tier: 1 | 2 | 3;    // 1 = Tier 1, 2 = Tier 2, 3 = Capstone
  description: string;
  unlocked: boolean;
  unlocksSkill?: Skill;
  statBonuses?: Partial<Stats>;
}

export interface WeaponTier {
  tier: number;
  name: string;
  title: string;
  mgtBonus: number;
  resBonus: number;
  critBonus: number;
  passiveText: string;
  visualColor: string;
  glowColor: string;
}

export interface Trinket {
  id: string;
  name: string;
  realm: DomainType;
  description: string;
  statBonuses: Partial<Stats>;
}

export interface Glyph {
  id: string;
  name: string;
  realm: 'DAWN' | 'OBSIDIAN' | 'ASTRAL';
  description: string;
  statBonuses: Partial<Stats>;
  grantsSkill?: Skill;
}

export interface Hero {
  id: HeroId;
  name: string;
  epithet: string;
  origin: string;
  className: string;
  realm: 'DAWN' | 'OBSIDIAN' | 'ASTRAL';
  /** HUMBLE: ordinary clothes, no Heart-Shard. SHARD: the key has fused; power still has to be earned. */
  presentation: HeroPresentation;
  recruited: boolean;
  level: number;
  exp: number;
  talentPoints: number;
  baseStats: Stats;
  stats: Stats;
  skills: Skill[];
  talents: TalentNode[];
  weaponTierIndex: number; // 0 to 4
  weaponTiers: WeaponTier[];
  trinkets: Trinket[];
  glyphSockets: (Glyph | null)[]; // 4 sockets in Act I
  statuses: StatusEffect[];
  shieldHp: number;
  ctbValue: number; // Lower = acts sooner (0 = turn ready)
  animState: 'IDLE' | 'ATTACK' | 'CAST' | 'HIT' | 'VICTORY';
  animTimer: number;
}

export interface Enemy {
  id: string;
  templateId: string;
  name: string;
  title: string;
  realm: DomainType;
  isBoss?: boolean;
  maxHp: number;
  hp: number;
  maxStability: number;
  stability: number;
  shattered: boolean;
  mgt: number;
  res: number;
  grt: number;
  wrd: number;
  tmp: number;
  ctbValue: number;
  intentText: string;
  channeling?: boolean;
  statuses: StatusEffect[];
  shieldHp: number;
  animState: 'IDLE' | 'ATTACK' | 'HIT' | 'SHATTERED';
  animTimer: number;
  expReward: number;
  oreReward: number;
}

export type SurgeBonusType = 'NONE' | 'DMG_BOOST' | 'ZERO_MANA' | 'LEY_SURGE';

export interface TimelineEntry {
  unitId: string;
  isHero: boolean;
  name: string;
  realm: DomainType;
  ticksUntilTurn: number;
  surgeBonus: SurgeBonusType;
  shattered?: boolean;
}

export interface DialogueLine {
  speaker: string;
  title?: string;
  portraitId: HeroId | 'orin' | 'vane' | 'stone';
  expression?: 'NEUTRAL' | 'DETERMINED' | 'SURPRISED' | 'GRIM' | 'WARM';
  text: string;
  /** When set on a Kaelen line, updates his field presentation as the line appears. */
  look?: HeroPresentation;
}

export interface FieldEnemy {
  id: string;
  name: string;
  x: number; // in pixels
  y: number;
  homeX: number;
  homeY: number;
  patrolRadius: number;
  dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  encounterIds: string[];
  isBoss?: boolean;
  defeated: boolean;
  stunTimer: number;
}

export interface Wardstone {
  id: string;
  name: string;
  tileX: number;
  tileY: number;
  requiredRealm: 'DAWN' | 'OBSIDIAN' | 'ASTRAL';
  attunedBy: 'NONE' | 'DAWN' | 'OBSIDIAN' | 'ASTRAL';
  description: string;
}

export interface FieldEnemySpawn {
  id: string;
  name: string;
  homeTileX: number;
  homeTileY: number;
  patrolRadius: number;
  dir: FieldEnemy['dir'];
  encounterIds: string[];
  isBoss?: boolean;
}
