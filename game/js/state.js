// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game State Management (Full Edition)
// ═══════════════════════════════════════════════════════════════

import { RESOURCES, HEROES, UPGRADES, PRESTIGE_BONUSES, ACHIEVEMENTS, CONFIG } from './data.js';

const SAVE_KEY = 'indofarm_save_v3';

// ── Default State ─────────────────────────────────────────────
function defaultState() {
  return {
    version: 3,
    lastSave: Date.now(),
    tickCount: 0,

    // Resources
    resources: { wheat: 50, wood: 80, stone: 50, gold: 30, gem: 0 },
    maxResources: { wheat: 2000, wood: 2000, stone: 2000, gold: 9999, gem: 500 },

    // Farm (9 plots 3×3)
    farm: {
      plots: Array(9).fill(null).map(() => ({
        crop: null, stage: 0, plantedAt: null, lastTick: null,
      })),
      unlockedCrops: ['wheat'],
    },

    // Buildings: { buildingId: { level, builtAt } }
    buildings: {},

    // Heroes
    heroes: Object.fromEntries(
      Object.entries(HEROES).map(([id, def]) => [id, {
        unlocked: def.unlocked,
        level: 1, xp: 0,
        task: 'idle',
        questId: null, questStart: null, questDuration: null,
        equipped: { weapon: null, armor: null, shield: null, accessory: null },
      }])
    ),

    // Quests
    completedQuests: [],

    // Upgrades
    upgrades: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),

    // Prestige
    prestigeLevel: 0,
    prestigePoints: 0,
    prestigeBonuses: Object.fromEntries(PRESTIGE_BONUSES.map(b => [b.id, 0])),
    dragonSlain: false,

    // ── NEW: Inventory ──────────────────────────────────────
    inventory: {}, // { itemId: quantity }

    // ── NEW: Crafting ───────────────────────────────────────
    crafting: {
      queue: [], // [{ recipeId, startedAt, duration, outputItemId, outputQty }]
    },

    // ── NEW: Army ───────────────────────────────────────────
    army: { soldier: 0, archer: 0, cavalry: 0, mage: 0 },
    armyRecruiting: [], // [{ unitId, count, startedAt, duration }]

    // ── NEW: Battle ──────────────────────────────────────────
    lastBattleResult: null, // { won, enemyName, reward, log, timestamp }

    // ── NEW: Daily Bonus ─────────────────────────────────────
    dailyBonus: {
      lastClaimDate: null, // 'YYYY-MM-DD'
      streak: 0,
      maxStreak: 0,
    },

    // ── NEW: Gacha ───────────────────────────────────────────
    gacha: {
      totalSpins: 0,
      lastResult: null,
      freeSpinDate: null, // 'YYYY-MM-DD' — tanggal terakhir spin gratis dipakai
    },

    // ── NEW: Achievements ────────────────────────────────────
    achievements: Object.fromEntries(
      ACHIEVEMENTS.map(a => [a.id, { unlocked: false, claimedAt: null }])
    ),

    // ── NEW: Settings ────────────────────────────────────────
    settings: {
      soundOn: true,
      musicOn: true,
      notifOn: true,
      language: 'id',
    },

    // Stats
    stats: {
      totalWheatHarvested: 0,
      totalQuestsCompleted: 0,
      totalPrestige: 0,
      totalGoldEarned: 0,
      playTimeSec: 0,
      battlesWon: 0,
      battlesLost: 0,
      itemsCrafted: 0,
      gachaSpins: 0,
      maxLoginStreak: 0,
    },

    // ── NEW: Character Selection ─────────────────────────────
    selectedHero: 'barbarian', // hero yang dipilih di lobby

    // ── NEW: Cloud Account ───────────────────────────────────
    cloudUser: null, // { uid, displayName, email, photoURL } or null
  };
}

// ── GameState Class ────────────────────────────────────────────
export class GameState {
  constructor() {
    this.data = null;
    this._ticksSinceSave = 0;
    this._offlineGain = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        this.data = deepMerge(defaultState(), saved);
        this._offlineGain = this._calcOfflineProgress();
        this.data.lastSave = Date.now();
      } else {
        // Migration from old save key
        const oldRaw = localStorage.getItem('indofarm_save_v1');
        if (oldRaw) {
          const saved = JSON.parse(oldRaw);
          this.data = deepMerge(defaultState(), saved);
        } else {
          this.data = defaultState();
        }
        this._offlineGain = null;
      }
    } catch (e) {
      console.warn('Save corrupted, resetting:', e);
      this.data = defaultState();
    }
    return this;
  }

  save() {
    if (!this.data) return;
    this.data.lastSave = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  saveIfNeeded() {
    this._ticksSinceSave++;
    if (this._ticksSinceSave >= CONFIG.SAVE_INTERVAL) {
      this._ticksSinceSave = 0;
      this.save();
    }
  }

  hardReset() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('indofarm_save_v1');
    this.data = defaultState();
  }

  // ── Offline progress ──────────────────────────────────────
  _calcOfflineProgress() {
    const now = Date.now();
    const elapsed = (now - this.data.lastSave) / 1000;
    if (elapsed < 30) return null;
    const prestigeHours = (this.data.prestigeBonuses?.offline_ext ?? 0) * 2;
    const maxSec = CONFIG.MAX_OFFLINE + prestigeHours * 3600;
    const effective = Math.min(elapsed, maxSec);
    return { elapsedSec: elapsed, effectiveSec: effective };
  }

  getOfflineGain() { return this._offlineGain; }
  clearOfflineGain() { this._offlineGain = null; }

  // ── Resource helpers ──────────────────────────────────────
  addResource(type, amount) {
    if (!Object.prototype.hasOwnProperty.call(this.data.resources, type)) return;
    const max = this.data.maxResources[type] ?? 99999;
    this.data.resources[type] = Math.min(max, this.data.resources[type] + amount);
    if (type === 'gold') this.data.stats.totalGoldEarned += amount;
    if (type === 'wheat') this.data.stats.totalWheatHarvested += amount;
  }

  spendResource(costs) {
    for (const [type, amount] of Object.entries(costs)) {
      if ((this.data.resources[type] ?? 0) < amount) return false;
    }
    for (const [type, amount] of Object.entries(costs)) {
      this.data.resources[type] -= amount;
    }
    return true;
  }

  canAfford(costs) {
    return Object.entries(costs).every(
      ([type, amount]) => (this.data.resources[type] ?? 0) >= amount
    );
  }

  // ── Inventory helpers ─────────────────────────────────────
  addItem(itemId, qty = 1) {
    this.data.inventory[itemId] = (this.data.inventory[itemId] ?? 0) + qty;
  }

  removeItem(itemId, qty = 1) {
    const cur = this.data.inventory[itemId] ?? 0;
    if (cur < qty) return false;
    this.data.inventory[itemId] = cur - qty;
    if (this.data.inventory[itemId] <= 0) delete this.data.inventory[itemId];
    return true;
  }

  hasItem(itemId, qty = 1) {
    return (this.data.inventory[itemId] ?? 0) >= qty;
  }

  // ── Prestige reset ────────────────────────────────────────
  prestigeReset() {
    const saved = {
      prestigeLevel:   this.data.prestigeLevel + 1,
      prestigePoints:  this.data.prestigePoints + 1,
      prestigeBonuses: this.data.prestigeBonuses,
      upgrades:        this.data.upgrades,
      heroes:          this.data.heroes,
      completedQuests: this.data.completedQuests,
      inventory:       this.data.inventory,
      stats:           { ...this.data.stats, totalPrestige: this.data.stats.totalPrestige + 1 },
      achievements:    this.data.achievements,
      settings:        this.data.settings,
      dailyBonus:      this.data.dailyBonus,
      gacha:           this.data.gacha,
      version:         this.data.version,
    };

    this.data = defaultState();
    this.data.prestigeLevel   = saved.prestigeLevel;
    this.data.prestigePoints  = saved.prestigePoints;
    this.data.prestigeBonuses = saved.prestigeBonuses;
    this.data.upgrades        = saved.upgrades;
    this.data.completedQuests = saved.completedQuests;
    this.data.inventory       = saved.inventory;
    this.data.stats           = saved.stats;
    this.data.achievements    = saved.achievements;
    this.data.settings        = saved.settings;
    this.data.dailyBonus      = saved.dailyBonus;
    this.data.gacha           = saved.gacha;

    for (const [id, h] of Object.entries(saved.heroes)) {
      this.data.heroes[id] = {
        ...h, task: 'idle', questId: null, questStart: null, questDuration: null,
      };
    }

    const startGoldBonus = (this.data.prestigeBonuses.start_gold ?? 0) * 100;
    this.data.resources.gold += startGoldBonus;
  }
}

// ── Deep merge helper ─────────────────────────────────────────
function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}
