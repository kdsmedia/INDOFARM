// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game Data Definitions
// ═══════════════════════════════════════════════════════════════

export const CONFIG = {
  TICK_INTERVAL:    1000,      // ms per game tick
  SAVE_INTERVAL:    30,        // ticks between auto-saves
  MAX_OFFLINE:      4 * 3600,  // max 4 hours offline progress (seconds)
  WORLD_SIZE:       20,        // world units (square)
  TILE_SIZE:        2,         // world units per tile
};

// ── Resources ─────────────────────────────────────────────────
export const RESOURCES = {
  wheat: { name: 'Gandum',    icon: '🌾', color: '#f5c518', max: 1000 },
  wood:  { name: 'Kayu',     icon: '🪵', color: '#8B4513', max: 1000 },
  stone: { name: 'Batu',     icon: '🪨', color: '#9e9e9e', max: 1000 },
  gold:  { name: 'Emas',     icon: '💰', color: '#FFD700', max: 5000 },
  gem:   { name: 'Permata',  icon: '💎', color: '#00CED1', max: 200  },
};

// ── Crops ──────────────────────────────────────────────────────
export const CROPS = {
  wheat: {
    name: 'Gandum', icon: '🌾',
    stages: 4, stageDuration: 20,   // seconds per stage
    yield: 8, resource: 'wheat',
    unlocked: true,
    stageColors: [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0xf5c518],
  },
  carrot: {
    name: 'Wortel', icon: '🥕',
    stages: 4, stageDuration: 45,
    yield: 18, resource: 'wheat',
    unlocked: false, unlockCost: { gold: 30 },
    stageColors: [0x5c3d0a, 0x7a5c1a, 0xaa7a2a, 0xff6600],
  },
  pumpkin: {
    name: 'Labu', icon: '🎃',
    stages: 5, stageDuration: 90,
    yield: 50, resource: 'wheat',
    unlocked: false, unlockCost: { gold: 120 },
    stageColors: [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0xbb8822, 0xff7700],
  },
};

// ── Buildings ─────────────────────────────────────────────────
export const BUILDINGS = {
  farm: {
    name: 'Ladang Panen', icon: '🌾', category: 'production',
    description: 'Menghasilkan gandum secara otomatis.',
    cost: { wood: 10 },
    production: { wheat: 0.08 },   // per second per level
    maxLevel: 5,
    upgradeCostMult: 2.0,
    color: 0xc8a951, shape: 'flat',
    worldPos: { x: -4, z: 3 },
  },
  sawmill: {
    name: 'Penggergajian', icon: '🪵', category: 'production',
    description: 'Mengolah kayu dari hutan.',
    cost: { stone: 15, gold: 5 },
    production: { wood: 0.05 },
    maxLevel: 5, upgradeCostMult: 2.0,
    color: 0x8B4513, shape: 'box',
    worldPos: { x: -6, z: -2 },
  },
  quarry: {
    name: 'Tambang Batu', icon: '🪨', category: 'production',
    description: 'Menambang batu dari pegunungan.',
    cost: { wood: 20, gold: 5 },
    production: { stone: 0.05 },
    maxLevel: 5, upgradeCostMult: 2.0,
    color: 0x757575, shape: 'box',
    worldPos: { x: 6, z: -2 },
  },
  market: {
    name: 'Pasar Desa', icon: '🏪', category: 'economy',
    description: 'Menukar sumber daya menjadi emas.',
    cost: { wood: 30, stone: 20 },
    production: { gold: 0.03 },
    maxLevel: 5, upgradeCostMult: 2.5,
    color: 0xe8a020, shape: 'wide',
    worldPos: { x: 2, z: -5 },
  },
  barracks: {
    name: 'Barak Prajurit', icon: '⚔️', category: 'military',
    description: 'Melatih pahlawan dan meningkatkan kekuatan quest.',
    cost: { wood: 50, stone: 30 },
    production: {},
    bonus: { questReward: 0.2 },   // +20% quest reward per level
    maxLevel: 5, upgradeCostMult: 2.5,
    color: 0x1565c0, shape: 'tower',
    worldPos: { x: -2, z: -5 },
  },
  tavern: {
    name: 'Kedai Pahlawan', icon: '🍺', category: 'military',
    description: 'Memulihkan stamina pahlawan lebih cepat.',
    cost: { wood: 40, gold: 20 },
    production: {},
    bonus: { questSpeed: 0.15 },   // -15% quest duration per level
    maxLevel: 5, upgradeCostMult: 2.0,
    color: 0x7b3f00, shape: 'box',
    worldPos: { x: 4, z: -5 },
  },
  forge: {
    name: 'Pandai Besi', icon: '🔨', category: 'economy',
    description: 'Mengubah batu dan kayu menjadi emas lebih efisien.',
    cost: { stone: 60, gold: 40 },
    production: { gold: 0.05 },
    maxLevel: 5, upgradeCostMult: 3.0,
    color: 0xf44336, shape: 'box',
    worldPos: { x: -4, z: -5 },
  },
  library: {
    name: 'Perpustakaan', icon: '📚', category: 'research',
    description: 'Membuka upgrade dan meningkatkan semua produksi.',
    cost: { wood: 80, stone: 50, gold: 50 },
    production: {},
    bonus: { allProduction: 0.1 },  // +10% all production per level
    maxLevel: 3, upgradeCostMult: 4.0,
    color: 0x4a148c, shape: 'tower',
    worldPos: { x: 6, z: -5 },
  },
};

// ── Heroes ────────────────────────────────────────────────────
export const HEROES = {
  barbarian: {
    name: 'Barbarian',    title: 'Si Penghancur',
    icon: '🪓', color: '#c62828',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Barbarian.glb',
    unlocked: true,
    bonus: { wood: 1.8, stone: 1.5 },
    questPower: 1.2,
    description: 'Ahli menebang pohon dan menambang batu.',
    worldZone: { x: -6, z: 0 },
  },
  knight: {
    name: 'Ksatria',      title: 'Pelindung Desa',
    icon: '🛡️', color: '#1565c0',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Knight.glb',
    unlocked: true,
    bonus: { quest: 2.0 },
    questPower: 2.0,
    description: 'Petarung terbaik untuk misi berbahaya.',
    worldZone: { x: -2, z: -4 },
  },
  mage: {
    name: 'Penyihir',     title: 'Pencari Permata',
    icon: '🔮', color: '#6a1b9a',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Mage.glb',
    unlocked: true,
    bonus: { gem: 2.0, gold: 1.3 },
    questPower: 1.8,
    description: 'Mahir menemukan permata dan harta tersembunyi.',
    worldZone: { x: 4, z: -4 },
  },
  ranger: {
    name: 'Pemburu',      title: 'Penjaga Ladang',
    icon: '🏹', color: '#2e7d32',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Ranger.glb',
    unlocked: true,
    bonus: { wheat: 2.5, farm: 2.0 },
    questPower: 1.4,
    description: 'Panen otomatis lebih cepat dan hasil lebih banyak.',
    worldZone: { x: -3, z: 2 },
  },
  rogue: {
    name: 'Pencuri',      title: 'Tangan Licin',
    icon: '🗡️', color: '#37474f',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue.glb',
    unlocked: true,
    bonus: { gold: 2.5 },
    questPower: 1.6,
    description: 'Mengumpulkan emas dua kali lebih banyak.',
    worldZone: { x: 2, z: -4 },
  },
  rogue_hooded: {
    name: 'Rogue Bertopeng', title: 'Sang Bayangan',
    icon: '🥷', color: '#212121',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue_Hooded.glb',
    unlocked: false, unlockCost: { gem: 10 },
    bonus: { gold: 3.0, gem: 1.5 },
    questPower: 2.5,
    description: 'Karakter langka dengan bonus emas dan permata tertinggi.',
    worldZone: { x: 0, z: -4 },
  },
};

// ── Hero Tasks (what they can be assigned to) ─────────────────
export const TASKS = {
  idle:    { name: 'Istirahat',      icon: '💤', bonus: {} },
  farm:    { name: 'Bertani',        icon: '🌾', bonus: 'wheat' },
  chop:    { name: 'Menebang',       icon: '🪓', bonus: 'wood'  },
  mine:    { name: 'Menambang',      icon: '⛏️', bonus: 'stone' },
  trade:   { name: 'Berdagang',      icon: '💰', bonus: 'gold'  },
  guard:   { name: 'Menjaga',        icon: '🛡️', bonus: 'quest' },
};

// ── Quests ─────────────────────────────────────────────────────
export const QUESTS = [
  {
    id: 'goblin',
    name: 'Sarang Goblin', icon: '👺',
    description: 'Bersihkan sarang goblin di hutan barat.',
    duration: 60,
    reward: { gold: 15 },
    xpReward: 20, minLevel: 1,
    difficulty: '⭐',
  },
  {
    id: 'forest_beast',
    name: 'Binatang Hutan', icon: '🐗',
    description: 'Kalahkan binatang buas yang menyerang ladang.',
    duration: 180,
    reward: { wood: 40, gold: 20 },
    xpReward: 50, minLevel: 2,
    difficulty: '⭐⭐',
  },
  {
    id: 'dungeon',
    name: 'Penjara Bawah Tanah', icon: '🏰',
    description: 'Jelajahi penjara kuno penuh harta karun.',
    duration: 360,
    reward: { gold: 80, gem: 3 },
    xpReward: 120, minLevel: 4,
    difficulty: '⭐⭐⭐',
  },
  {
    id: 'bandit',
    name: 'Perampok Jalan', icon: '🦹',
    description: 'Lindungi karavan pedagang dari perampok.',
    duration: 240,
    reward: { stone: 60, gold: 40 },
    xpReward: 80, minLevel: 3,
    difficulty: '⭐⭐',
  },
  {
    id: 'ancient_ruins',
    name: 'Reruntuhan Kuno', icon: '🗿',
    description: 'Temukan artefak kuno di reruntuhan.',
    duration: 600,
    reward: { gem: 8, gold: 100 },
    xpReward: 200, minLevel: 6,
    difficulty: '⭐⭐⭐⭐',
  },
  {
    id: 'dragon',
    name: 'Sarang Naga Merah', icon: '🐉',
    description: 'Tantang naga merah legendaris. Hadiahnya tak ternilai.',
    duration: 1200,
    reward: { gem: 25, gold: 500 },
    xpReward: 1000, minLevel: 10,
    difficulty: '⭐⭐⭐⭐⭐',
    isPrestige: true,
  },
];

// ── Upgrades ───────────────────────────────────────────────────
export const UPGRADES = [
  // Farm upgrades
  { id: 'better_seeds',   name: 'Benih Unggul',       icon: '🌱',
    description: 'Panen 25% lebih banyak dari semua tanaman.',
    cost: { gold: 50 }, effect: { cropYield: 0.25 }, maxLevel: 3 },
  { id: 'irrigation',     name: 'Sistem Irigasi',     icon: '💧',
    description: 'Tanaman tumbuh 20% lebih cepat.',
    cost: { wood: 40, stone: 30 }, effect: { growSpeed: 0.20 }, maxLevel: 3 },
  { id: 'storage_farm',   name: 'Gudang Gandum',       icon: '🏚️',
    description: 'Kapasitas gandum +500.',
    cost: { wood: 60 }, effect: { maxWheat: 500 }, maxLevel: 5 },

  // Production upgrades
  { id: 'sharp_axe',      name: 'Kapak Tajam',        icon: '🪓',
    description: 'Produksi kayu +30%.',
    cost: { gold: 40, stone: 20 }, effect: { woodProd: 0.30 }, maxLevel: 4 },
  { id: 'iron_pickaxe',   name: 'Cangkul Besi',       icon: '⛏️',
    description: 'Produksi batu +30%.',
    cost: { gold: 40, wood: 20 }, effect: { stoneProd: 0.30 }, maxLevel: 4 },

  // Economy upgrades
  { id: 'trade_routes',   name: 'Jalur Dagang',       icon: '🛤️',
    description: 'Produksi emas pasar +40%.',
    cost: { gold: 100 }, effect: { goldProd: 0.40 }, maxLevel: 3 },
  { id: 'gem_polish',     name: 'Kilap Permata',       icon: '💎',
    description: 'Reward permata dari quest +50%.',
    cost: { gem: 5 }, effect: { gemReward: 0.50 }, maxLevel: 3 },

  // Storage upgrades
  { id: 'big_warehouse',  name: 'Gudang Besar',        icon: '🏗️',
    description: 'Kapasitas semua sumber daya +1000.',
    cost: { wood: 100, stone: 80 }, effect: { allMax: 1000 }, maxLevel: 5 },

  // Quest upgrades
  { id: 'hero_training',  name: 'Latihan Keras',       icon: '💪',
    description: 'Pahlawan mendapat XP 50% lebih banyak.',
    cost: { gold: 80 }, effect: { xpBonus: 0.50 }, maxLevel: 3 },
  { id: 'fast_travel',    name: 'Kuda Cepat',          icon: '🐎',
    description: 'Durasi quest -20%.',
    cost: { gold: 120, gem: 2 }, effect: { questSpeed: 0.20 }, maxLevel: 3 },
];

// ── Prestige Bonuses ───────────────────────────────────────────
export const PRESTIGE_BONUSES = [
  { id: 'prod_boost',  name: 'Warisan Pertanian', icon: '🌟',
    description: '+15% semua produksi per level prestige.',
    cost: 1, effect: { allProd: 0.15 }, maxLevel: 10 },
  { id: 'offline_ext', name: 'Tanpa Batas Waktu',  icon: '⏰',
    description: '+2 jam batas offline per level.',
    cost: 1, effect: { offlineHours: 2 }, maxLevel: 6 },
  { id: 'start_gold',  name: 'Modal Awal',         icon: '💰',
    description: 'Mulai dengan +100 emas per level.',
    cost: 1, effect: { startGold: 100 }, maxLevel: 10 },
  { id: 'gem_income',  name: 'Tambang Permata',    icon: '💎',
    description: 'Semua quest memberikan +1 permata per level.',
    cost: 2, effect: { bonusGem: 1 }, maxLevel: 5 },
  { id: 'crop_magic',  name: 'Keajaiban Panen',    icon: '🌾',
    description: 'Semua tanaman panen instan setiap prestige.',
    cost: 3, effect: { instantHarvest: true }, maxLevel: 1 },
];

// ── Nature Models (for world decoration) ─────────────────────
export const NATURE_MODELS = {
  trees: [
    '/Stylized_Nature_MegaKit/glTF/CommonTree_1.gltf',
    '/Stylized_Nature_MegaKit/glTF/CommonTree_2.gltf',
    '/Stylized_Nature_MegaKit/glTF/CommonTree_3.gltf',
    '/Stylized_Nature_MegaKit/glTF/Pine_1.gltf',
    '/Stylized_Nature_MegaKit/glTF/Pine_2.gltf',
    '/Stylized_Nature_MegaKit/glTF/TwistedTree_1.gltf',
  ],
  rocks: [
    '/Stylized_Nature_MegaKit/glTF/Rock_Medium_1.gltf',
    '/Stylized_Nature_MegaKit/glTF/Rock_Medium_2.gltf',
    '/Stylized_Nature_MegaKit/glTF/Rock_Medium_3.gltf',
  ],
};

// ── XP Table ──────────────────────────────────────────────────
export function xpToNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
