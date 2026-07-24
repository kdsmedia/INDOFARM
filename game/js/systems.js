// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game Systems
// ═══════════════════════════════════════════════════════════════

import { BUILDINGS, CROPS, QUESTS, HEROES, UPGRADES, PRESTIGE_BONUSES, xpToNextLevel } from './data.js';

// ── Resource System ──────────────────────────────────────────────
export const ResourceSystem = {
  /** Hitung produksi per detik untuk satu jenis resource */
  getRate(state, resourceType) {
    let rate = 0;
    const upg = state.upgrades;
    const pres = state.prestigeBonuses;
    const presLevel = state.prestigeLevel;

    // Bonus prestige global
    const prestigeProd = 1 + (pres.prod_boost ?? 0) * 0.15;

    // Bonus library
    const libLevel = state.buildings['library']?.level ?? 0;
    const libraryBonus = 1 + libLevel * 0.10;

    for (const [bId, bState] of Object.entries(state.buildings)) {
      const def = BUILDINGS[bId];
      if (!def || !def.production[resourceType]) continue;

      const base = def.production[resourceType] * bState.level;

      // Hero bonus untuk bangunan ini
      let heroMult = 1;
      for (const [hId, hState] of Object.entries(state.heroes)) {
        if (!hState.unlocked || hState.task === 'quest') continue;
        const hDef = HEROES[hId];
        const task = hState.task;
        // Ranger di ladang → bonus wheat
        if (resourceType === 'wheat' && task === 'farm' && hDef.bonus.wheat) {
          heroMult += (hDef.bonus.wheat - 1) * (1 + (hState.level - 1) * 0.05);
        }
        // Barbarian menebang → bonus wood
        if (resourceType === 'wood' && task === 'chop' && hDef.bonus.wood) {
          heroMult += (hDef.bonus.wood - 1) * (1 + (hState.level - 1) * 0.05);
        }
        // Barbarian menambang → bonus stone
        if (resourceType === 'stone' && task === 'mine' && hDef.bonus.stone) {
          heroMult += (hDef.bonus.stone - 1) * (1 + (hState.level - 1) * 0.05);
        }
        // Rogue berdagang → bonus gold
        if (resourceType === 'gold' && task === 'trade' && hDef.bonus.gold) {
          heroMult += (hDef.bonus.gold - 1) * (1 + (hState.level - 1) * 0.05);
        }
      }

      // Upgrade bonus per resource
      let upgBonus = 1;
      if (resourceType === 'wood')  upgBonus += (upg.sharp_axe ?? 0) * 0.30;
      if (resourceType === 'stone') upgBonus += (upg.iron_pickaxe ?? 0) * 0.30;
      if (resourceType === 'gold')  upgBonus += (upg.trade_routes ?? 0) * 0.40;

      rate += base * heroMult * upgBonus * libraryBonus * prestigeProd;
    }

    return rate;
  },

  /** Terapkan produksi satu tick (1 detik) */
  tick(state) {
    for (const res of ['wheat', 'wood', 'stone', 'gold']) {
      const rate = this.getRate(state, res);
      if (rate > 0) {
        const max = state.maxResources[res];
        state.resources[res] = Math.min(max, state.resources[res] + rate);
        if (res === 'gold') state.stats.totalGoldEarned += rate;
        if (res === 'wheat') state.stats.totalWheatHarvested += rate;
      }
    }
    state.stats.playTimeSec++;
  },

  /** Terapkan progres offline (elapsed detik) */
  applyOffline(state, seconds) {
    const gained = {};
    for (const res of ['wheat', 'wood', 'stone', 'gold']) {
      const rate = this.getRate(state, res);
      const amount = rate * seconds;
      if (amount > 0) {
        const before = state.resources[res];
        const max = state.maxResources[res];
        state.resources[res] = Math.min(max, before + amount);
        gained[res] = state.resources[res] - before;
      }
    }
    return gained;
  },
};

// ── Farm System ──────────────────────────────────────────────────
export const FarmSystem = {
  /** Tick pertumbuhan semua plot */
  tick(state) {
    const now = Date.now();
    const speedBonus = 1 + (state.upgrades.irrigation ?? 0) * 0.20;

    for (const plot of state.farm.plots) {
      if (!plot.crop || plot.stage >= this._maxStage(plot.crop)) continue;

      const cropDef = CROPS[plot.crop];
      if (!cropDef) continue;

      const stageDur = (cropDef.stageDuration * 1000) / speedBonus;
      if (now - plot.lastTick >= stageDur) {
        plot.stage++;
        plot.lastTick = now;
      }
    }

    // Auto-panen jika Ranger ditugaskan ke farm
    const hasRangerFarm = Object.entries(state.heroes).some(
      ([id, h]) => id === 'ranger' && h.unlocked && h.task === 'farm'
    );
    if (hasRangerFarm) {
      for (const plot of state.farm.plots) {
        if (this._isHarvestable(plot)) this._doHarvest(state, plot);
      }
    }
  },

  _maxStage(cropId) {
    return (CROPS[cropId]?.stages ?? 4);
  },

  _isHarvestable(plot) {
    if (!plot.crop) return false;
    return plot.stage >= this._maxStage(plot.crop);
  },

  /** Tanam tanaman di plot */
  plant(state, plotIndex, cropId) {
    if (!state.farm.unlockedCrops.includes(cropId)) return { ok: false, msg: 'Tanaman belum dibuka.' };
    const plot = state.farm.plots[plotIndex];
    if (!plot) return { ok: false, msg: 'Plot tidak valid.' };
    if (plot.crop) return { ok: false, msg: 'Plot sudah berisi tanaman.' };

    const now = Date.now();
    plot.crop = cropId;
    plot.stage = 1;
    plot.plantedAt = now;
    plot.lastTick = now;
    return { ok: true };
  },

  /** Panen plot */
  harvest(state, plotIndex) {
    const plot = state.farm.plots[plotIndex];
    if (!plot) return { ok: false, msg: 'Plot tidak valid.' };
    if (!this._isHarvestable(plot)) return { ok: false, msg: 'Belum siap panen.' };
    return this._doHarvest(state, plot);
  },

  _doHarvest(state, plot) {
    const cropDef = CROPS[plot.crop];
    if (!cropDef) return { ok: false, msg: 'Tanaman tidak dikenal.' };

    const yieldBonus = 1 + (state.upgrades.better_seeds ?? 0) * 0.25;
    const prestigeBonus = 1 + (state.prestigeBonuses?.prod_boost ?? 0) * 0.15;

    // Ranger di farm → bonus panen
    const rangerLevel = state.heroes.ranger?.task === 'farm' ? state.heroes.ranger.level : 0;
    const rangerBonus = rangerLevel > 0 ? HEROES.ranger.bonus.wheat * (1 + (rangerLevel - 1) * 0.05) : 1;

    const total = Math.floor(cropDef.yield * yieldBonus * prestigeBonus * rangerBonus);

    const gameState = { addResource: (t, a) => { /* handled by caller */ } };
    const max = state.maxResources[cropDef.resource];
    state.resources[cropDef.resource] = Math.min(max, state.resources[cropDef.resource] + total);
    if (cropDef.resource === 'wheat') state.stats.totalWheatHarvested += total;

    // Reset plot
    plot.crop = null;
    plot.stage = 0;
    plot.plantedAt = null;
    plot.lastTick = null;

    return { ok: true, amount: total, resource: cropDef.resource };
  },

  /** Buka tanaman baru */
  unlockCrop(state, cropId) {
    const cropDef = CROPS[cropId];
    if (!cropDef || state.farm.unlockedCrops.includes(cropId)) return { ok: false };
    if (!cropDef.unlockCost) return { ok: false };

    const canAfford = Object.entries(cropDef.unlockCost).every(
      ([r, a]) => state.resources[r] >= a
    );
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };

    for (const [r, a] of Object.entries(cropDef.unlockCost)) state.resources[r] -= a;
    state.farm.unlockedCrops.push(cropId);
    return { ok: true };
  },
};

// ── Build System ─────────────────────────────────────────────────
export const BuildSystem = {
  /** Bangun bangunan baru */
  build(state, buildingId) {
    const def = BUILDINGS[buildingId];
    if (!def) return { ok: false, msg: 'Bangunan tidak dikenal.' };
    if (state.buildings[buildingId]) return { ok: false, msg: 'Sudah dibangun.' };

    const canAfford = Object.entries(def.cost).every(
      ([r, a]) => state.resources[r] >= a
    );
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };

    for (const [r, a] of Object.entries(def.cost)) state.resources[r] -= a;
    state.buildings[buildingId] = { level: 1, builtAt: Date.now() };
    return { ok: true };
  },

  /** Upgrade bangunan */
  upgrade(state, buildingId) {
    const def = BUILDINGS[buildingId];
    const bState = state.buildings[buildingId];
    if (!def || !bState) return { ok: false, msg: 'Bangunan belum dibangun.' };
    if (bState.level >= def.maxLevel) return { ok: false, msg: 'Sudah level maksimum.' };

    const cost = this.upgradeCost(def, bState.level);
    const canAfford = Object.entries(cost).every(
      ([r, a]) => state.resources[r] >= a
    );
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };

    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    bState.level++;
    return { ok: true, newLevel: bState.level };
  },

  upgradeCost(def, currentLevel) {
    const mult = Math.pow(def.upgradeCostMult ?? 2.0, currentLevel);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) {
      cost[r] = Math.ceil(a * mult);
    }
    return cost;
  },

  canAffordUpgrade(state, buildingId) {
    const def = BUILDINGS[buildingId];
    const bState = state.buildings[buildingId];
    if (!def || !bState || bState.level >= def.maxLevel) return false;
    const cost = this.upgradeCost(def, bState.level);
    return Object.entries(cost).every(([r, a]) => state.resources[r] >= a);
  },
};

// ── Hero System ──────────────────────────────────────────────────
export const HeroSystem = {
  /** Tugaskan hero ke tugas */
  assign(state, heroId, task) {
    const hState = state.heroes[heroId];
    if (!hState || !hState.unlocked) return { ok: false, msg: 'Hero belum terbuka.' };
    if (hState.task === 'quest') return { ok: false, msg: 'Hero sedang dalam quest.' };

    hState.task = task;
    return { ok: true };
  },

  /** Buka hero langka */
  unlock(state, heroId) {
    const def = HEROES[heroId];
    const hState = state.heroes[heroId];
    if (!def || !hState) return { ok: false };
    if (hState.unlocked) return { ok: false, msg: 'Sudah terbuka.' };
    if (!def.unlockCost) return { ok: false };

    const canAfford = Object.entries(def.unlockCost).every(
      ([r, a]) => state.resources[r] >= a
    );
    if (!canAfford) return { ok: false, msg: 'Permata tidak cukup.' };

    for (const [r, a] of Object.entries(def.unlockCost)) state.resources[r] -= a;
    hState.unlocked = true;
    return { ok: true };
  },

  /** Tambah XP ke hero */
  addXP(state, heroId, xp) {
    const hState = state.heroes[heroId];
    if (!hState || !hState.unlocked) return;
    const xpBonus = 1 + (state.upgrades.hero_training ?? 0) * 0.50;
    hState.xp += Math.floor(xp * xpBonus);

    while (hState.level < 10 && hState.xp >= xpToNextLevel(hState.level)) {
      hState.xp -= xpToNextLevel(hState.level);
      hState.level++;
    }
  },
};

// ── Quest System ─────────────────────────────────────────────────
export const QuestSystem = {
  /** Kirim hero ke quest */
  send(state, heroId, questId) {
    const questDef = QUESTS.find(q => q.id === questId);
    if (!questDef) return { ok: false, msg: 'Quest tidak ditemukan.' };

    const hState = state.heroes[heroId];
    const hDef   = HEROES[heroId];
    if (!hState?.unlocked) return { ok: false, msg: 'Hero belum terbuka.' };
    if (hState.task === 'quest') return { ok: false, msg: 'Hero sudah dalam quest lain.' };
    if (hState.level < questDef.minLevel) {
      return { ok: false, msg: `Butuh hero level ${questDef.minLevel}.` };
    }

    // Durasi dengan bonus
    const tavernLevel = state.buildings['tavern']?.level ?? 0;
    const tavernBonus = tavernLevel * 0.15;
    const upgradeBonus = (state.upgrades.fast_travel ?? 0) * 0.20;
    const durationMult = Math.max(0.3, 1 - tavernBonus - upgradeBonus);
    const duration = Math.floor(questDef.duration * durationMult);

    hState.task          = 'quest';
    hState.questId       = questId;
    hState.questStart    = Date.now();
    hState.questDuration = duration;
    return { ok: true, duration };
  },

  /** Cek & klaim quest yang selesai */
  tick(state) {
    const completed = [];
    for (const [hId, hState] of Object.entries(state.heroes)) {
      if (hState.task !== 'quest' || !hState.questId) continue;
      const elapsed = (Date.now() - hState.questStart) / 1000;
      if (elapsed >= hState.questDuration) {
        completed.push({ heroId: hId, questId: hState.questId });
      }
    }
    return completed;
  },

  /** Klaim reward quest */
  claim(state, heroId) {
    const hState = state.heroes[heroId];
    if (!hState || hState.task !== 'quest') return { ok: false };

    const elapsed = (Date.now() - hState.questStart) / 1000;
    if (elapsed < hState.questDuration) {
      return { ok: false, remaining: hState.questDuration - elapsed };
    }

    const questDef = QUESTS.find(q => q.id === hState.questId);
    if (!questDef) return { ok: false };

    // Hitung reward
    const barrackLevel = state.buildings['barracks']?.level ?? 0;
    const rewardMult = 1 + barrackLevel * 0.20;
    const gemBonus   = 1 + (state.upgrades.gem_polish ?? 0) * 0.50;
    const prestigeGem = state.prestigeBonuses?.gem_income ?? 0;

    const gained = {};
    for (const [res, amount] of Object.entries(questDef.reward)) {
      let final = Math.floor(amount * rewardMult);
      if (res === 'gem') {
        final = Math.floor(final * gemBonus) + prestigeGem;
      }
      gained[res] = final;
      const max = state.maxResources[res] ?? 99999;
      state.resources[res] = Math.min(max, (state.resources[res] ?? 0) + final);
    }

    // XP
    HeroSystem.addXP(state, heroId, questDef.xpReward);

    // Tandai dragon quest
    if (hState.questId === 'dragon') state.dragonSlain = true;

    // Statistik
    state.stats.totalQuestsCompleted++;
    if (!state.completedQuests.includes(hState.questId)) {
      state.completedQuests.push(hState.questId);
    }

    // Reset hero
    hState.task = 'idle';
    hState.questId = null;
    hState.questStart = null;
    hState.questDuration = null;

    return { ok: true, reward: gained, heroId };
  },
};

// ── Upgrade System ────────────────────────────────────────────────
export const UpgradeSystem = {
  buy(state, upgradeId) {
    const def = UPGRADES.find(u => u.id === upgradeId);
    if (!def) return { ok: false };

    const current = state.upgrades[upgradeId] ?? 0;
    if (current >= (def.maxLevel ?? 1)) {
      return { ok: false, msg: 'Sudah level maksimum.' };
    }

    const lvlMult = Math.pow(2, current);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) {
      cost[r] = Math.ceil(a * lvlMult);
    }

    const canAfford = Object.entries(cost).every(
      ([r, a]) => state.resources[r] >= a
    );
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };

    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    state.upgrades[upgradeId] = current + 1;

    // Terapkan efek storage
    if (def.effect.maxWheat) state.maxResources.wheat += def.effect.maxWheat;
    if (def.effect.allMax) {
      for (const r of ['wheat', 'wood', 'stone', 'gold']) {
        state.maxResources[r] += def.effect.allMax;
      }
    }

    return { ok: true, newLevel: current + 1 };
  },

  getCost(upgradeId, currentLevel) {
    const def = UPGRADES.find(u => u.id === upgradeId);
    if (!def) return {};
    const lvlMult = Math.pow(2, currentLevel);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) {
      cost[r] = Math.ceil(a * lvlMult);
    }
    return cost;
  },
};

// ── Prestige System ───────────────────────────────────────────────
export const PrestigeSystem = {
  canPrestige(state) {
    return state.dragonSlain === true;
  },

  doPrestige(state) {
    if (!this.canPrestige(state)) return { ok: false, msg: 'Harus menyelesaikan quest Sarang Naga.' };

    state.prestigeLevel++;
    state.prestigePoints++;
    state.dragonSlain = false;

    // Reset sumber daya & bangunan & farm
    state.resources = { wheat: 0, wood: 50, stone: 30, gold: 10, gem: 0 };
    state.buildings = {};
    state.farm.plots = Array(9).fill(null).map(() => ({
      crop: null, stage: 0, plantedAt: null, lastTick: null,
    }));

    // Reset hero task tapi simpan level & xp
    for (const hState of Object.values(state.heroes)) {
      hState.task = 'idle';
      hState.questId = null;
      hState.questStart = null;
      hState.questDuration = null;
    }

    // Bonus gold awal
    const startGold = (state.prestigeBonuses?.start_gold ?? 0) * 100;
    state.resources.gold = 10 + startGold;

    state.stats.totalPrestige++;
    return { ok: true, level: state.prestigeLevel };
  },

  buyBonus(state, bonusId) {
    const def = PRESTIGE_BONUSES.find(b => b.id === bonusId);
    if (!def) return { ok: false };

    const current = state.prestigeBonuses[bonusId] ?? 0;
    if (current >= def.maxLevel) return { ok: false, msg: 'Sudah maksimum.' };
    if (state.prestigePoints < def.cost) return { ok: false, msg: 'Poin prestige tidak cukup.' };

    state.prestigePoints -= def.cost;
    state.prestigeBonuses[bonusId] = current + 1;

    // Terapkan bonus offline
    if (def.effect.offlineHours) {
      // Sudah ditangani di state.js saat load
    }

    return { ok: true };
  },
};
