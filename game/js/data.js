// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game Data Definitions (Full Edition)
// ═══════════════════════════════════════════════════════════════

export const CONFIG = {
  TICK_INTERVAL:    1000,
  SAVE_INTERVAL:    30,
  MAX_OFFLINE:      8 * 3600,
  WORLD_SIZE:       20,
  TILE_SIZE:        2,
};

// ── Resources ─────────────────────────────────────────────────
export const RESOURCES = {
  wheat: { name: 'Gandum',   icon: '🌾', color: '#f5c518', max: 2000 },
  wood:  { name: 'Kayu',    icon: '🪵', color: '#8B4513', max: 2000 },
  stone: { name: 'Batu',    icon: '🪨', color: '#9e9e9e', max: 2000 },
  gold:  { name: 'Emas',    icon: '💰', color: '#FFD700', max: 9999 },
  gem:   { name: 'Permata', icon: '💎', color: '#00CED1', max: 500  },
};

// ── Crops ──────────────────────────────────────────────────────
export const CROPS = {
  wheat: {
    name: 'Gandum', icon: '🌾',
    stages: 4, stageDuration: 20,
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
  corn: {
    name: 'Jagung', icon: '🌽',
    stages: 5, stageDuration: 60,
    yield: 30, resource: 'wheat',
    unlocked: false, unlockCost: { gold: 70 },
    stageColors: [0x5c3d0a, 0x7a8c2a, 0x9ab52a, 0xe8c840, 0xf5e040],
  },
  berry: {
    name: 'Beri', icon: '🫐',
    stages: 3, stageDuration: 30,
    yield: 12, resource: 'wheat',
    unlocked: false, unlockCost: { gold: 50 },
    stageColors: [0x5c3d0a, 0x6a8a3a, 0x8844cc],
  },
};

// ── Buildings ─────────────────────────────────────────────────
export const BUILDINGS = {
  farm: {
    name: 'Ladang Panen', icon: '🌾', category: 'production',
    description: 'Menghasilkan gandum secara otomatis.',
    cost: { wood: 10 },
    production: { wheat: 0.08 },
    maxLevel: 5, upgradeCostMult: 2.0,
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
    bonus: { questReward: 0.2 },
    maxLevel: 5, upgradeCostMult: 2.5,
    color: 0x1565c0, shape: 'tower',
    worldPos: { x: -2, z: -5 },
  },
  tavern: {
    name: 'Kedai Pahlawan', icon: '🍺', category: 'military',
    description: 'Memulihkan stamina pahlawan lebih cepat.',
    cost: { wood: 40, gold: 20 },
    production: {},
    bonus: { questSpeed: 0.15 },
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
    bonus: { allProduction: 0.1 },
    maxLevel: 3, upgradeCostMult: 4.0,
    color: 0x4a148c, shape: 'tower',
    worldPos: { x: 6, z: -5 },
  },
  warehouse: {
    name: 'Gudang Besar', icon: '🏚️', category: 'storage',
    description: 'Meningkatkan kapasitas penyimpanan semua resource.',
    cost: { wood: 60, stone: 40 },
    production: {},
    bonus: { storageBoost: 500 },
    maxLevel: 5, upgradeCostMult: 2.5,
    color: 0x6d4c41, shape: 'wide',
    worldPos: { x: 0, z: -5 },
  },
  shrine: {
    name: 'Kuil Pemuja', icon: '⛩️', category: 'special',
    description: 'Memberikan bonus permata dan mempercepat prestige.',
    cost: { stone: 100, gem: 5 },
    production: { gem: 0.002 },
    maxLevel: 3, upgradeCostMult: 5.0,
    color: 0xff7043, shape: 'tower',
    worldPos: { x: -6, z: -5 },
  },
};

// ── Heroes ────────────────────────────────────────────────────
export const HEROES = {
  barbarian: {
    name: 'Barbarian', title: 'Si Penghancur',
    icon: '🪓', color: '#c62828',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Barbarian.glb',
    unlocked: true,
    bonus: { wood: 1.8, stone: 1.5 },
    questPower: 1.2, atk: 15, def: 8, hp: 200,
    description: 'Ahli menebang pohon dan menambang batu.',
    worldZone: { x: -6, z: 0 },
  },
  knight: {
    name: 'Ksatria', title: 'Pelindung Desa',
    icon: '🛡️', color: '#1565c0',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Knight.glb',
    unlocked: true,
    bonus: { quest: 2.0 },
    questPower: 2.0, atk: 12, def: 20, hp: 250,
    description: 'Petarung terbaik untuk misi berbahaya.',
    worldZone: { x: -2, z: -4 },
  },
  mage: {
    name: 'Penyihir', title: 'Pencari Permata',
    icon: '🔮', color: '#6a1b9a',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Mage.glb',
    unlocked: true,
    bonus: { gem: 2.0, gold: 1.3 },
    questPower: 1.8, atk: 25, def: 5, hp: 120,
    description: 'Mahir menemukan permata dan harta tersembunyi.',
    worldZone: { x: 4, z: -4 },
  },
  ranger: {
    name: 'Pemburu', title: 'Penjaga Ladang',
    icon: '🏹', color: '#2e7d32',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Ranger.glb',
    unlocked: true,
    bonus: { wheat: 2.5, farm: 2.0 },
    questPower: 1.4, atk: 18, def: 10, hp: 160,
    description: 'Panen otomatis lebih cepat dan hasil lebih banyak.',
    worldZone: { x: -3, z: 2 },
  },
  rogue: {
    name: 'Pencuri', title: 'Tangan Licin',
    icon: '🗡️', color: '#37474f',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue.glb',
    unlocked: true,
    bonus: { gold: 2.5 },
    questPower: 1.6, atk: 20, def: 7, hp: 140,
    description: 'Mengumpulkan emas dua kali lebih banyak.',
    worldZone: { x: 2, z: -4 },
  },
  rogue_hooded: {
    name: 'Rogue Bertopeng', title: 'Sang Bayangan',
    icon: '🥷', color: '#212121',
    model: '/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue_Hooded.glb',
    unlocked: false, unlockCost: { gem: 10 },
    bonus: { gold: 3.0, gem: 1.5 },
    questPower: 2.5, atk: 28, def: 12, hp: 180,
    description: 'Karakter langka dengan bonus emas dan permata tertinggi.',
    worldZone: { x: 0, z: -4 },
  },
};

// ── Hero Tasks ─────────────────────────────────────────────────
export const TASKS = {
  idle:    { name: 'Istirahat', icon: '💤', bonus: {} },
  farm:    { name: 'Bertani',   icon: '🌾', bonus: 'wheat' },
  chop:    { name: 'Menebang',  icon: '🪓', bonus: 'wood'  },
  mine:    { name: 'Menambang', icon: '⛏️', bonus: 'stone' },
  trade:   { name: 'Berdagang', icon: '💰', bonus: 'gold'  },
  guard:   { name: 'Menjaga',   icon: '🛡️', bonus: 'quest' },
};

// ── Quests ─────────────────────────────────────────────────────
export const QUESTS = [
  { id: 'goblin', name: 'Sarang Goblin', icon: '👺',
    description: 'Bersihkan sarang goblin di hutan barat.',
    duration: 60, reward: { gold: 15 }, xpReward: 20, minLevel: 1, difficulty: '⭐', requires: null },
  { id: 'forest_beast', name: 'Binatang Hutan', icon: '🐗',
    description: 'Kalahkan binatang buas yang menyerang ladang.',
    duration: 180, reward: { wood: 40, gold: 20 }, xpReward: 50, minLevel: 2, difficulty: '⭐⭐', requires: 'goblin' },
  { id: 'bandit', name: 'Perampok Jalan', icon: '🦹',
    description: 'Lindungi karavan pedagang dari perampok.',
    duration: 240, reward: { stone: 60, gold: 40 }, xpReward: 80, minLevel: 3, difficulty: '⭐⭐', requires: 'forest_beast' },
  { id: 'dungeon', name: 'Penjara Bawah Tanah', icon: '🏰',
    description: 'Jelajahi penjara kuno penuh harta karun.',
    duration: 360, reward: { gold: 80, gem: 3 }, xpReward: 120, minLevel: 4, difficulty: '⭐⭐⭐', requires: 'bandit' },
  { id: 'sea_monster', name: 'Monster Laut', icon: '🐙',
    description: 'Singkirkan monster laut yang mengganggu pelabuhan.',
    duration: 420, reward: { gold: 60, gem: 2, stone: 80 }, xpReward: 100, minLevel: 4, difficulty: '⭐⭐⭐', requires: 'dungeon' },
  { id: 'volcano', name: 'Gunung Berapi', icon: '🌋',
    description: 'Ekspedisi berbahaya ke gunung berapi aktif.',
    duration: 480, reward: { gem: 6, gold: 120 }, xpReward: 150, minLevel: 5, difficulty: '⭐⭐⭐', requires: 'sea_monster' },
  { id: 'ancient_ruins', name: 'Reruntuhan Kuno', icon: '🗿',
    description: 'Temukan artefak kuno di reruntuhan.',
    duration: 600, reward: { gem: 8, gold: 100 }, xpReward: 200, minLevel: 6, difficulty: '⭐⭐⭐⭐', requires: 'volcano' },
  { id: 'cursed_village', name: 'Desa Terkutuk', icon: '👻',
    description: 'Bebaskan desa dari kutukan hantu kuno.',
    duration: 720, reward: { gem: 12, gold: 200 }, xpReward: 300, minLevel: 7, difficulty: '⭐⭐⭐⭐', requires: 'ancient_ruins' },
  { id: 'dragon', name: 'Sarang Naga Merah', icon: '🐉',
    description: 'Tantang naga merah legendaris. Hadiahnya tak ternilai.',
    duration: 1200, reward: { gem: 25, gold: 500 }, xpReward: 1000, minLevel: 10,
    difficulty: '⭐⭐⭐⭐⭐', isPrestige: true, requires: 'cursed_village' },
];

// ── Upgrades ───────────────────────────────────────────────────
export const UPGRADES = [
  { id: 'better_seeds',   name: 'Benih Unggul',    icon: '🌱',
    description: 'Panen 25% lebih banyak dari semua tanaman.',
    cost: { gold: 50 }, effect: { cropYield: 0.25 }, maxLevel: 3 },
  { id: 'irrigation',     name: 'Sistem Irigasi',  icon: '💧',
    description: 'Tanaman tumbuh 20% lebih cepat.',
    cost: { wood: 40, stone: 30 }, effect: { growSpeed: 0.20 }, maxLevel: 3 },
  { id: 'storage_farm',   name: 'Gudang Gandum',   icon: '🏚️',
    description: 'Kapasitas gandum +500.',
    cost: { wood: 60 }, effect: { maxWheat: 500 }, maxLevel: 5 },
  { id: 'sharp_axe',      name: 'Kapak Tajam',     icon: '🪓',
    description: 'Produksi kayu +30%.',
    cost: { gold: 40, stone: 20 }, effect: { woodProd: 0.30 }, maxLevel: 4 },
  { id: 'iron_pickaxe',   name: 'Cangkul Besi',    icon: '⛏️',
    description: 'Produksi batu +30%.',
    cost: { gold: 40, wood: 20 }, effect: { stoneProd: 0.30 }, maxLevel: 4 },
  { id: 'trade_routes',   name: 'Jalur Dagang',    icon: '🛤️',
    description: 'Produksi emas pasar +40%.',
    cost: { gold: 100 }, effect: { goldProd: 0.40 }, maxLevel: 3 },
  { id: 'gem_polish',     name: 'Kilap Permata',   icon: '💎',
    description: 'Reward permata dari quest +50%.',
    cost: { gem: 5 }, effect: { gemReward: 0.50 }, maxLevel: 3 },
  { id: 'big_warehouse',  name: 'Gudang Besar',    icon: '🏗️',
    description: 'Kapasitas semua sumber daya +1000.',
    cost: { wood: 100, stone: 80 }, effect: { allMax: 1000 }, maxLevel: 5 },
  { id: 'hero_training',  name: 'Latihan Keras',   icon: '💪',
    description: 'Pahlawan mendapat XP 50% lebih banyak.',
    cost: { gold: 80 }, effect: { xpBonus: 0.50 }, maxLevel: 3 },
  { id: 'fast_travel',    name: 'Kuda Cepat',      icon: '🐎',
    description: 'Durasi quest -20%.',
    cost: { gold: 120, gem: 2 }, effect: { questSpeed: 0.20 }, maxLevel: 3 },
  { id: 'army_tactics',   name: 'Taktik Perang',   icon: '📜',
    description: 'Kekuatan pasukan +25% dalam pertempuran.',
    cost: { gold: 200, gem: 3 }, effect: { armyPower: 0.25 }, maxLevel: 4 },
  { id: 'market_savvy',   name: 'Jago Dagang',     icon: '🏪',
    description: 'Harga beli di pasar -15%.',
    cost: { gold: 150 }, effect: { marketDiscount: 0.15 }, maxLevel: 3 },
];

// ── Prestige Bonuses ───────────────────────────────────────────
export const PRESTIGE_BONUSES = [
  { id: 'prod_boost',  name: 'Warisan Pertanian', icon: '🌟',
    description: '+15% semua produksi per level prestige.',
    cost: 1, effect: { allProd: 0.15 }, maxLevel: 10 },
  { id: 'offline_ext', name: 'Tanpa Batas Waktu', icon: '⏰',
    description: '+2 jam batas offline per level.',
    cost: 1, effect: { offlineHours: 2 }, maxLevel: 6 },
  { id: 'start_gold',  name: 'Modal Awal',        icon: '💰',
    description: 'Mulai dengan +100 emas per level.',
    cost: 1, effect: { startGold: 100 }, maxLevel: 10 },
  { id: 'gem_income',  name: 'Tambang Permata',   icon: '💎',
    description: 'Semua quest memberikan +1 permata per level.',
    cost: 2, effect: { bonusGem: 1 }, maxLevel: 5 },
  { id: 'crop_magic',  name: 'Keajaiban Panen',   icon: '🌾',
    description: 'Semua tanaman panen instan setiap prestige.',
    cost: 3, effect: { instantHarvest: true }, maxLevel: 1 },
];

// ── Items ──────────────────────────────────────────────────────
export const ITEMS = {
  // Weapons
  sword_iron:      { name: 'Pedang Besi',    icon: '⚔️', type: 'weapon',    rarity: 'common',    atk: 10, slot: 'weapon',    desc: 'Pedang besi standar prajurit.' },
  axe_iron:        { name: 'Kapak Besi',     icon: '🪓', type: 'weapon',    rarity: 'common',    atk: 12, slot: 'weapon',    desc: 'Kapak besi untuk pertempuran.' },
  bow_wood:        { name: 'Busur Kayu',     icon: '🏹', type: 'weapon',    rarity: 'common',    atk: 8,  slot: 'weapon',    desc: 'Busur standar para pemburu.' },
  dagger_steel:    { name: 'Belati Baja',    icon: '🗡️', type: 'weapon',    rarity: 'uncommon',  atk: 9,  slot: 'weapon',    desc: 'Senjata cepat sang pencuri.' },
  staff_oak:       { name: 'Tongkat Ek',     icon: '🔮', type: 'weapon',    rarity: 'rare',      atk: 15, slot: 'weapon',    desc: 'Tongkat bermagis para penyihir.' },
  sword_gold:      { name: 'Pedang Emas',    icon: '✨', type: 'weapon',    rarity: 'legendary', atk: 30, slot: 'weapon',    desc: 'Pedang berkilau emas legenda.' },
  crossbow:        { name: 'Arbalest',       icon: '🎯', type: 'weapon',    rarity: 'rare',      atk: 20, slot: 'weapon',    desc: 'Busur silang dengan daya tembus tinggi.' },
  spear_iron:      { name: 'Tombak Besi',    icon: '🔱', type: 'weapon',    rarity: 'uncommon',  atk: 11, slot: 'weapon',    desc: 'Tombak besi panjang.' },
  // Armor
  armor_leather:   { name: 'Baju Kulit',     icon: '🥋', type: 'armor',     rarity: 'common',    def: 8,  slot: 'armor',     desc: 'Pelindung kulit ringan.' },
  armor_chain:     { name: 'Baju Rantai',    icon: '🛡️', type: 'armor',     rarity: 'uncommon',  def: 15, slot: 'armor',     desc: 'Pelindung rantai besi.' },
  armor_plate:     { name: 'Baju Plat',      icon: '🪖', type: 'armor',     rarity: 'rare',      def: 25, slot: 'armor',     desc: 'Pelindung baja penuh.' },
  robe_mage:       { name: 'Jubah Penyihir', icon: '🧥', type: 'armor',     rarity: 'rare',      def: 8, magic: 20, slot: 'armor', desc: 'Jubah magis meningkatkan mantra.' },
  // Shields
  shield_wood:     { name: 'Perisai Kayu',   icon: '🪣', type: 'shield',    rarity: 'common',    def: 5,  slot: 'shield',    desc: 'Perisai kayu dasar.' },
  shield_iron:     { name: 'Perisai Besi',   icon: '🔰', type: 'shield',    rarity: 'uncommon',  def: 12, slot: 'shield',    desc: 'Perisai besi kokoh.' },
  shield_tower:    { name: 'Perisai Menara', icon: '🗡️', type: 'shield',    rarity: 'rare',      def: 20, slot: 'shield',    desc: 'Perisai besar pelindung penuh.' },
  // Accessories
  ring_gold:       { name: 'Cincin Emas',    icon: '💍', type: 'accessory', rarity: 'rare',      slot: 'accessory', bonus: { goldRate: 0.15 }, desc: 'Meningkatkan perolehan emas 15%.' },
  gem_amulet:      { name: 'Kalung Permata', icon: '📿', type: 'accessory', rarity: 'epic',      slot: 'accessory', bonus: { gemRate: 0.20 }, desc: 'Meningkatkan perolehan permata 20%.' },
  boot_speed:      { name: 'Sepatu Kilat',   icon: '👢', type: 'accessory', rarity: 'uncommon',  slot: 'accessory', bonus: { questSpeed: 0.10 }, desc: 'Mengurangi waktu quest 10%.' },
  // Consumables
  potion_hp:       { name: 'Ramuan HP',      icon: '🧪', type: 'consumable', rarity: 'common',   heal: 50,   desc: 'Memulihkan HP dalam pertempuran.' },
  potion_strength: { name: 'Ramuan ATK',     icon: '💪', type: 'consumable', rarity: 'rare',     atkBoost: 20, desc: 'Meningkatkan ATK sementara.' },
  food_bread:      { name: 'Roti',           icon: '🍞', type: 'consumable', rarity: 'common',   heal: 20,   desc: 'Makanan sederhana pahlawan.' },
  scroll_quest:    { name: 'Gulungan Quest', icon: '📜', type: 'consumable', rarity: 'uncommon', effect: 'reduce_quest_time', desc: 'Mengurangi durasi quest 50%.' },
  elixir_xp:       { name: 'Eliksir XP',    icon: '🌀', type: 'consumable', rarity: 'rare',     xpBoost: 100, desc: 'Memberikan 100 XP ke hero pilihan.' },
};

// ── Crafting Recipes ───────────────────────────────────────────
export const CRAFTING_RECIPES = [
  { id: 'craft_sword_iron',   name: 'Pedang Besi',    output: 'sword_iron',    outputQty: 1, ingredients: { stone: 30, wood: 10, gold: 20 }, time: 30, icon: '⚔️' },
  { id: 'craft_axe_iron',     name: 'Kapak Besi',     output: 'axe_iron',      outputQty: 1, ingredients: { stone: 35, gold: 15 },          time: 25, icon: '🪓' },
  { id: 'craft_bow_wood',     name: 'Busur Kayu',     output: 'bow_wood',      outputQty: 1, ingredients: { wood: 40, gold: 10 },            time: 20, icon: '🏹' },
  { id: 'craft_spear',        name: 'Tombak Besi',    output: 'spear_iron',    outputQty: 1, ingredients: { stone: 25, wood: 20 },           time: 22, icon: '🔱' },
  { id: 'craft_armor_leather',name: 'Baju Kulit',     output: 'armor_leather', outputQty: 1, ingredients: { wood: 30, gold: 25 },            time: 40, icon: '🥋' },
  { id: 'craft_shield_wood',  name: 'Perisai Kayu',   output: 'shield_wood',   outputQty: 1, ingredients: { wood: 50, gold: 15 },            time: 35, icon: '🪣' },
  { id: 'craft_armor_chain',  name: 'Baju Rantai',    output: 'armor_chain',   outputQty: 1, ingredients: { stone: 60, wood: 20, gold: 50 }, time: 90, icon: '🛡️' },
  { id: 'craft_shield_iron',  name: 'Perisai Besi',   output: 'shield_iron',   outputQty: 1, ingredients: { stone: 50, gold: 40 },           time: 60, icon: '🔰' },
  { id: 'craft_potion_hp',    name: 'Ramuan HP',      output: 'potion_hp',     outputQty: 3, ingredients: { wheat: 20, gold: 10 },           time: 15, icon: '🧪' },
  { id: 'craft_food_bread',   name: 'Roti',           output: 'food_bread',    outputQty: 5, ingredients: { wheat: 30 },                    time: 10, icon: '🍞' },
  { id: 'craft_ring_gold',    name: 'Cincin Emas',    output: 'ring_gold',     outputQty: 1, ingredients: { gold: 200, gem: 2 },             time: 120, icon: '💍' },
  { id: 'craft_crossbow',     name: 'Arbalest',       output: 'crossbow',      outputQty: 1, ingredients: { wood: 60, stone: 40, gold: 60 }, time: 80, icon: '🎯' },
  { id: 'craft_elixir_xp',    name: 'Eliksir XP',    output: 'elixir_xp',     outputQty: 1, ingredients: { gem: 3, gold: 100 },             time: 60, icon: '🌀' },
];

// ── Market Items (Buy) ─────────────────────────────────────────
export const MARKET_BUY = [
  { id: 'buy_potion_hp',      itemId: 'potion_hp',      qty: 3,  price: { gold: 60 }        },
  { id: 'buy_potion_strength',itemId: 'potion_strength', qty: 1,  price: { gold: 100, gem: 1 } },
  { id: 'buy_food_bread',     itemId: 'food_bread',      qty: 5,  price: { gold: 30 }        },
  { id: 'buy_scroll_quest',   itemId: 'scroll_quest',    qty: 1,  price: { gem: 3 }          },
  { id: 'buy_gem_amulet',     itemId: 'gem_amulet',      qty: 1,  price: { gem: 15, gold: 200 } },
  { id: 'buy_boot_speed',     itemId: 'boot_speed',      qty: 1,  price: { gold: 150, gem: 2 } },
  { id: 'buy_sword_iron',     itemId: 'sword_iron',      qty: 1,  price: { gold: 80 }        },
  { id: 'buy_armor_leather',  itemId: 'armor_leather',   qty: 1,  price: { gold: 100 }       },
  { id: 'buy_elixir_xp',      itemId: 'elixir_xp',       qty: 1,  price: { gem: 5 }          },
];

// Resource exchange rates (sell X resource → gold)
export const MARKET_SELL_RATES = {
  wheat: { goldPer100: 5  },
  wood:  { goldPer100: 8  },
  stone: { goldPer100: 10 },
  gem:   { goldPer1:   50 },
};

// ── Achievements ───────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_harvest',   name: 'Panen Pertama',      icon: '🌾', desc: 'Panen tanaman pertamamu.',              req: { stat: 'totalWheatHarvested', val: 1    }, reward: { gold: 50 } },
  { id: 'harvest_100',     name: 'Petani Handal',      icon: '🌾', desc: 'Total panen 100 gandum.',              req: { stat: 'totalWheatHarvested', val: 100  }, reward: { gold: 100, gem: 1 } },
  { id: 'harvest_1000',    name: 'Raja Pertanian',     icon: '👑', desc: 'Total panen 1.000 gandum.',            req: { stat: 'totalWheatHarvested', val: 1000 }, reward: { gold: 500, gem: 5 } },
  { id: 'harvest_10000',   name: 'Legenda Pertanian',  icon: '🌟', desc: 'Total panen 10.000 gandum.',           req: { stat: 'totalWheatHarvested', val: 10000 }, reward: { gold: 2000, gem: 15 } },
  { id: 'first_quest',     name: 'Petualang Pertama',  icon: '⚔️', desc: 'Selesaikan quest pertamamu.',         req: { stat: 'totalQuestsCompleted', val: 1   }, reward: { gold: 30 } },
  { id: 'quest_10',        name: 'Veteran Quest',      icon: '🏅', desc: 'Selesaikan 10 quest.',                req: { stat: 'totalQuestsCompleted', val: 10  }, reward: { gold: 200, gem: 2 } },
  { id: 'quest_50',        name: 'Pahlawan Sejati',    icon: '🏆', desc: 'Selesaikan 50 quest.',                req: { stat: 'totalQuestsCompleted', val: 50  }, reward: { gold: 1000, gem: 10 } },
  { id: 'gold_1000',       name: 'Pedagang Kaya',      icon: '💰', desc: 'Kumpulkan total 1.000 emas.',         req: { stat: 'totalGoldEarned', val: 1000 }, reward: { gem: 5 } },
  { id: 'gold_10000',      name: 'Tuan Bangsawan',     icon: '👑', desc: 'Kumpulkan total 10.000 emas.',        req: { stat: 'totalGoldEarned', val: 10000 }, reward: { gem: 20 } },
  { id: 'first_prestige',  name: 'Reinkarnasi',        icon: '🔄', desc: 'Lakukan prestige pertamamu.',         req: { stat: 'totalPrestige', val: 1 }, reward: { gem: 20 } },
  { id: 'prestige_5',      name: 'Jiwa Abadi',         icon: '♾️', desc: 'Lakukan prestige 5 kali.',            req: { stat: 'totalPrestige', val: 5 }, reward: { gem: 50 } },
  { id: 'play_1h',         name: 'Petualang Aktif',    icon: '⏰', desc: 'Bermain selama 1 jam.',               req: { stat: 'playTimeSec', val: 3600  }, reward: { gold: 200, gem: 2 } },
  { id: 'play_10h',        name: 'Petualang Setia',    icon: '⏳', desc: 'Bermain selama 10 jam.',              req: { stat: 'playTimeSec', val: 36000 }, reward: { gold: 500, gem: 10 } },
  { id: 'battle_won_1',    name: 'Panglima Perang',    icon: '⚔️', desc: 'Menangkan pertempuran pertama.',     req: { stat: 'battlesWon', val: 1 }, reward: { gold: 100, gem: 2 } },
  { id: 'battle_won_10',   name: 'Penakluk',           icon: '🗡️', desc: 'Menangkan 10 pertempuran.',          req: { stat: 'battlesWon', val: 10 }, reward: { gold: 500, gem: 8 } },
  { id: 'craft_10',        name: 'Pengrajin Handal',   icon: '🔨', desc: 'Buat 10 item di bengkel.',           req: { stat: 'itemsCrafted', val: 10 }, reward: { gold: 150, gem: 2 } },
  { id: 'gacha_lucky',     name: 'Keberuntungan Gacha',icon: '🎰', desc: 'Dapatkan item langka dari gacha.',   req: { stat: 'gachaSpins', val: 1 }, reward: { gold: 50 } },
  { id: 'daily_7',         name: 'Pelanggan Setia',    icon: '🗓️', desc: 'Login 7 hari berturut-turut.',       req: { stat: 'maxLoginStreak', val: 7 }, reward: { gem: 15, gold: 300 } },
];

// ── Daily Rewards ──────────────────────────────────────────────
export const DAILY_REWARDS = [
  { day: 1, rewards: { gold: 50 },                   label: 'Hari 1', icon: '💰' },
  { day: 2, rewards: { gold: 100, wheat: 100 },      label: 'Hari 2', icon: '🌾' },
  { day: 3, rewards: { gold: 150, wood: 100 },       label: 'Hari 3', icon: '🪵' },
  { day: 4, rewards: { gold: 200, gem: 2 },          label: 'Hari 4', icon: '💎' },
  { day: 5, rewards: { gold: 300, stone: 150 },      label: 'Hari 5', icon: '🪨' },
  { day: 6, rewards: { gold: 500, gem: 5 },          label: 'Hari 6', icon: '💎' },
  { day: 7, rewards: { gold: 1000, gem: 20, wheat: 500 }, label: 'Hari 7 ⭐', icon: '🌟' },
];

// Ad Reward pool
export const AD_REWARDS = [
  { id: 'ad_gold',   rewards: { gold: 500 },      desc: '500 Emas' },
  { id: 'ad_gem',    rewards: { gem: 5 },          desc: '5 Permata' },
  { id: 'ad_wheat',  rewards: { wheat: 300 },      desc: '300 Gandum' },
  { id: 'ad_item',   rewards: { item: 'potion_hp', qty: 3 }, desc: '3 Ramuan HP' },
];

// ── Gacha Pool ─────────────────────────────────────────────────
export const GACHA_POOL = [
  { type: 'item',     itemId: 'food_bread',      qty: 5,  weight: 30, rarity: 'common',    rarityColor: '#9e9e9e', rarityLabel: 'Biasa' },
  { type: 'item',     itemId: 'potion_hp',        qty: 3,  weight: 25, rarity: 'common',    rarityColor: '#9e9e9e', rarityLabel: 'Biasa' },
  { type: 'resource', resourceId: 'gold',         qty: 150,weight: 20, rarity: 'common',    rarityColor: '#9e9e9e', rarityLabel: 'Biasa' },
  { type: 'item',     itemId: 'bow_wood',         qty: 1,  weight: 12, rarity: 'uncommon',  rarityColor: '#2ea043', rarityLabel: 'Tidak Biasa' },
  { type: 'item',     itemId: 'dagger_steel',     qty: 1,  weight: 10, rarity: 'uncommon',  rarityColor: '#2ea043', rarityLabel: 'Tidak Biasa' },
  { type: 'resource', resourceId: 'gem',          qty: 3,  weight: 8,  rarity: 'uncommon',  rarityColor: '#2ea043', rarityLabel: 'Tidak Biasa' },
  { type: 'item',     itemId: 'spear_iron',       qty: 1,  weight: 8,  rarity: 'uncommon',  rarityColor: '#2ea043', rarityLabel: 'Tidak Biasa' },
  { type: 'item',     itemId: 'staff_oak',        qty: 1,  weight: 5,  rarity: 'rare',      rarityColor: '#1f6feb', rarityLabel: 'Langka' },
  { type: 'item',     itemId: 'armor_chain',      qty: 1,  weight: 4,  rarity: 'rare',      rarityColor: '#1f6feb', rarityLabel: 'Langka' },
  { type: 'item',     itemId: 'ring_gold',        qty: 1,  weight: 3,  rarity: 'rare',      rarityColor: '#1f6feb', rarityLabel: 'Langka' },
  { type: 'item',     itemId: 'crossbow',         qty: 1,  weight: 3,  rarity: 'rare',      rarityColor: '#1f6feb', rarityLabel: 'Langka' },
  { type: 'item',     itemId: 'gem_amulet',       qty: 1,  weight: 2,  rarity: 'epic',      rarityColor: '#8957e5', rarityLabel: 'Epik' },
  { type: 'item',     itemId: 'armor_plate',      qty: 1,  weight: 1,  rarity: 'epic',      rarityColor: '#8957e5', rarityLabel: 'Epik' },
  { type: 'item',     itemId: 'sword_gold',       qty: 1,  weight: 1,  rarity: 'legendary', rarityColor: '#f5c518', rarityLabel: '✨ LEGENDARIS' },
];

// ── Army Units ─────────────────────────────────────────────────
export const ARMY_UNITS = {
  soldier: { name: 'Prajurit',  icon: '⚔️', cost: { gold: 20 },         atk: 10, def: 10, hp: 100, recruitTime: 10 },
  archer:  { name: 'Pemanah',   icon: '🏹', cost: { gold: 25 },         atk: 15, def: 5,  hp: 70,  recruitTime: 12 },
  cavalry: { name: 'Kavaleri',  icon: '🐎', cost: { gold: 50 },         atk: 22, def: 15, hp: 150, recruitTime: 20 },
  mage:    { name: 'Penyihir',  icon: '🔮', cost: { gold: 80, gem: 1 }, atk: 35, def: 3,  hp: 50,  recruitTime: 30 },
};

// ── AI Kingdoms ────────────────────────────────────────────────
export const AI_KINGDOMS = [
  { id: 'goblin_camp',    name: 'Kamp Goblin',       icon: '👺', difficulty: 1,
    army: { soldier: 5 },                                       reward: { gold: 80, wood: 30 },          minArmy: 3 },
  { id: 'bandit_fort',    name: 'Benteng Perampok',  icon: '🦹', difficulty: 2,
    army: { soldier: 10, archer: 5 },                          reward: { gold: 150, stone: 50, gem: 1 },minArmy: 8 },
  { id: 'orc_stronghold', name: 'Benteng Ork',       icon: '👹', difficulty: 3,
    army: { soldier: 20, archer: 10, cavalry: 5 },             reward: { gold: 300, gem: 3 },           minArmy: 20 },
  { id: 'dark_castle',    name: 'Kastil Gelap',      icon: '🏚️', difficulty: 4,
    army: { soldier: 30, archer: 20, cavalry: 10, mage: 5 },  reward: { gold: 600, gem: 8 },           minArmy: 40 },
  { id: 'dragon_fortress',name: 'Benteng Naga',      icon: '🐉', difficulty: 5,
    army: { soldier: 60, archer: 40, cavalry: 25, mage: 15 }, reward: { gold: 1500, gem: 25 },         minArmy: 80 },
];

// ── Map Zones ──────────────────────────────────────────────────
export const MAP_ZONES = [
  { id: 'farm',         name: 'Ladang Hijau',    icon: '🌾', color: '#2ea043', desc: 'Area pertanian utama. Tanam & panen tanaman beragam.',          unlocked: true,  pos: { x: 28, y: 55 } },
  { id: 'forest',       name: 'Hutan Lebat',     icon: '🌲', color: '#155724', desc: 'Hutan rimbun tempat menebang kayu & berburu.',                  unlocked: true,  pos: { x: 12, y: 38 } },
  { id: 'quarry',       name: 'Tambang Batu',    icon: '⛏️', color: '#7d8590', desc: 'Tambang batu di pegunungan. Sumber batu terbaik.',              unlocked: true,  pos: { x: 72, y: 38 } },
  { id: 'village',      name: 'Desa Indofarm',   icon: '🏰', color: '#f5c518', desc: 'Desa utama. Pusat semua kegiatan dan bangunan.',                unlocked: true,  pos: { x: 45, y: 48 } },
  { id: 'market_town',  name: 'Kota Dagang',     icon: '🏪', color: '#1f6feb', desc: 'Kota besar tempat berdagang dan berbelanja item.',             unlocked: true,  pos: { x: 62, y: 65 } },
  { id: 'dungeon',      name: 'Penjara Kuno',    icon: '🏚️', color: '#8957e5', desc: 'Penjara kuno penuh harta dan monster berbahaya.',              unlocked: false, pos: { x: 30, y: 22 } },
  { id: 'ancient_ruins',name: 'Reruntuhan Kuno', icon: '🗿', color: '#9e9e9e', desc: 'Reruntuhan misterius menyimpan artefak kuno.',                 unlocked: false, pos: { x: 16, y: 20 } },
  { id: 'volcano',      name: 'Gunung Api',      icon: '🌋', color: '#f85149', desc: 'Gunung berapi aktif. Berbahaya tapi kaya mineral langka.',     unlocked: false, pos: { x: 78, y: 20 } },
  { id: 'dragon_lair',  name: 'Sarang Naga',     icon: '🐉', color: '#c62828', desc: 'Sarang naga merah legendaris. Tempat pertarungan akhir.',      unlocked: false, pos: { x: 85, y: 12 } },
  { id: 'sea_coast',    name: 'Pantai Timur',    icon: '🌊', color: '#0288d1', desc: 'Pantai tempat berlabuh. Monster laut mengancam.',              unlocked: false, pos: { x: 90, y: 55 } },
];

// ── Nature Models ──────────────────────────────────────────────
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

// ── XP Table ───────────────────────────────────────────────────
export function xpToNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
