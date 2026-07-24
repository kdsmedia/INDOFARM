// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game State Management
// ═══════════════════════════════════════════════════════════════

import { RESOURCES, HEROES, UPGRADES, PRESTIGE_BONUSES, CONFIG } from './data.js';

const SAVE_KEY = 'indofarm_save_v1';

// ── Default State ─────────────────────────────────────────────
function defaultState() {
  return {
    version: 1,
    lastSave: Date.now(),
    tickCount: 0,

    // Resources
    resources: { wheat: 0, wood: 50, stone: 30, gold: 10, gem: 0 },
    maxResources: { wheat: 1000, wood: 1000, stone: 1000, gold: 5000, gem: 200 },

    // Farm (9 plots 3×3)
    farm: {
      plots: Array(9).fill(null).map(() => ({
        crop: null,
        stage: 0,
        plantedAt: null,
        lastTick: null,
      })),
      unlockedCrops: ['wheat'],
    },

    // Buildings placed: { buildingId: { level, builtAt } }
    buildings: {},

    // Heroes
    heroes: Object.fromEntries(
      Object.entries(HEROES).map(([id, def]) => [id, {
        unlocked: def.unlocked,
        level: 1,
        xp: 0,
        task: 'idle',       // idle | farm | chop | mine | trade | guard | quest
        questId: null,      // set when on quest
        questStart: null,
        questDuration: null,
      }])
    ),

    // Completed quest IDs
    completedQuests: [],

    // Upgrade levels: { upgradeId: level }
    upgrades: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),

    // Prestige
    prestigeLevel: 0,
    prestigePoints: 0,
    prestigeBonuses: Object.fromEntries(PRESTIGE_BONUSES.map(b => [b.id, 0])),
    dragonSlain: false,     // set to true after dragon quest, enables prestige

    // Stats
    stats: {
      totalWheatHarvested: 0,
      totalQuestsCompleted: 0,
      totalPrestige: 0,
      totalGoldEarned: 0,
      playTimeSec: 0,
    },
  };
}

// ── GameState class ────────────────────────────────────────────
export class GameState {
  constructor() {
    this.data = null;
    this._ticksSinceSave = 0;
    this._offlineGain = null;   // set after load if offline progress
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Merge with defaults so new fields always exist
        this.data = deepMerge(defaultState(), saved);
        this._offlineGain = this._calcOfflineProgress();
        this.data.lastSave = Date.now();
      } else {
        this.data = defaultState();
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
    this.data = defaultState();
  }

  // ── Offline progress ───────────────────────────────────────
  _calcOfflineProgress() {
    const now = Date.now();
    const elapsed = (now - this.data.lastSave) / 1000;
    if (elapsed < 30) return null; // < 30 sec, ignore

    // Max offline: base + prestige bonus
    const prestigeHours = (this.data.prestigeBonuses?.offline_ext ?? 0) * 2;
    const maxSec = CONFIG.MAX_OFFLINE + prestigeHours * 3600;
    const effective = Math.min(elapsed, maxSec);

    return { elapsedSec: elapsed, effectiveSec: effective };
  }

  getOfflineGain() {
    return this._offlineGain;
  }
  clearOfflineGain() {
    this._offlineGain = null;
  }

  // ── Resource helpers ───────────────────────────────────────
  addResource(type, amount) {
    if (!this.data.resources.hasOwnProperty(type)) return;
    const max = this.data.maxResources[type] ?? 99999;
    this.data.resources[type] = Math.min(max, this.data.resources[type] + amount);
    if (type === 'gold') this.data.stats.totalGoldEarned += amount;
    if (type === 'wheat') this.data.stats.totalWheatHarvested += amount;
  }

  spendResource(costs) {
    // Check first
    for (const [type, amount] of Object.entries(costs)) {
      if ((this.data.resources[type] ?? 0) < amount) return false;
    }
    // Deduct
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

  // ── Prestige reset ─────────────────────────────────────────
  prestigeReset() {
    const saved = {
      prestigeLevel:   this.data.prestigeLevel + 1,
      prestigePoints:  this.data.prestigePoints + 1,
      prestigeBonuses: this.data.prestigeBonuses,
      upgrades:        this.data.upgrades,
      heroes:          this.data.heroes,  // keep heroes but reset task/quest
      completedQuests: this.data.completedQuests,
      stats:           { ...this.data.stats, totalPrestige: this.data.stats.totalPrestige + 1 },
      version:         this.data.version,
    };

    this.data = defaultState();
    this.data.prestigeLevel   = saved.prestigeLevel;
    this.data.prestigePoints  = saved.prestigePoints;
    this.data.prestigeBonuses = saved.prestigeBonuses;
    this.data.upgrades        = saved.upgrades;
    this.data.completedQuests = saved.completedQuests;
    this.data.stats           = saved.stats;

    // Reset hero quests but keep level/xp/unlocked
    for (const [id, h] of Object.entries(saved.heroes)) {
      this.data.heroes[id] = {
        ...h, task: 'idle', questId: null, questStart: null, questDuration: null,
      };
    }

    // Apply prestige bonus: starting gold
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
