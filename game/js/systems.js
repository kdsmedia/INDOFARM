// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Game Systems (Full Edition)
// ═══════════════════════════════════════════════════════════════

import {
  BUILDINGS, CROPS, QUESTS, HEROES, UPGRADES, PRESTIGE_BONUSES,
  ITEMS, CRAFTING_RECIPES, MARKET_BUY, MARKET_SELL_RATES,
  GACHA_POOL, ARMY_UNITS, AI_KINGDOMS, ACHIEVEMENTS, DAILY_REWARDS, AD_REWARDS,
  xpToNextLevel
} from './data.js';
import { resetPrestigeState } from './state.js';

// ── Resource System ───────────────────────────────────────────
export const ResourceSystem = {
  getRate(state, resourceType) {
    let rate = 0;
    const upg = state.upgrades;
    const pres = state.prestigeBonuses;
    const prestigeProd = 1 + (pres.prod_boost ?? 0) * 0.15;
    const libLevel = state.buildings['library']?.level ?? 0;
    const libraryBonus = 1 + libLevel * 0.10;

    for (const [bId, bState] of Object.entries(state.buildings)) {
      const def = BUILDINGS[bId];
      if (!def || !def.production[resourceType]) continue;
      const base = def.production[resourceType] * bState.level;

      let heroMult = 1;
      for (const [hId, hState] of Object.entries(state.heroes)) {
        if (!hState.unlocked || hState.task === 'quest') continue;
        const hDef = HEROES[hId];
        const task = hState.task;
        if (resourceType === 'wheat' && task === 'farm' && hDef.bonus.wheat)
          heroMult += (hDef.bonus.wheat - 1) * (1 + (hState.level - 1) * 0.05);
        if (resourceType === 'wood' && task === 'chop' && hDef.bonus.wood)
          heroMult += (hDef.bonus.wood - 1) * (1 + (hState.level - 1) * 0.05);
        if (resourceType === 'stone' && task === 'mine' && hDef.bonus.stone)
          heroMult += (hDef.bonus.stone - 1) * (1 + (hState.level - 1) * 0.05);
        if (resourceType === 'gold' && task === 'trade' && hDef.bonus.gold)
          heroMult += (hDef.bonus.gold - 1) * (1 + (hState.level - 1) * 0.05);
      }

      let upgBonus = 1;
      if (resourceType === 'wood')  upgBonus += (upg.sharp_axe ?? 0) * 0.30;
      if (resourceType === 'stone') upgBonus += (upg.iron_pickaxe ?? 0) * 0.30;
      if (resourceType === 'gold')  upgBonus += (upg.trade_routes ?? 0) * 0.40;

      rate += base * heroMult * upgBonus * libraryBonus * prestigeProd;
    }
    return rate;
  },

  tick(state) {
    for (const res of ['wheat', 'wood', 'stone', 'gold', 'gem']) {
      const rate = this.getRate(state, res);
      if (rate > 0) {
        const max = state.maxResources[res];
        const gain = Math.min(max - state.resources[res], rate);
        if (gain > 0) {
          state.resources[res] += gain;
          if (res === 'gold') state.stats.totalGoldEarned += gain;
          if (res === 'wheat') state.stats.totalWheatHarvested += gain;
        }
      }
    }
  },

  applyOffline(state, seconds) {
    const gained = {};
    for (const res of ['wheat', 'wood', 'stone', 'gold', 'gem']) {
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

// ── Farm System ───────────────────────────────────────────────
export const FarmSystem = {
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
    const hasRangerFarm = Object.entries(state.heroes).some(
      ([id, h]) => id === 'ranger' && h.unlocked && h.task === 'farm'
    );
    if (hasRangerFarm) {
      for (const plot of state.farm.plots) {
        if (this._isHarvestable(plot)) this._doHarvest(state, plot);
      }
    }
  },

  _maxStage(cropId) { return CROPS[cropId]?.stages ?? 4; },
  _isHarvestable(plot) {
    if (!plot.crop) return false;
    return plot.stage >= this._maxStage(plot.crop);
  },

  plant(state, plotIndex, cropId) {
    if (!state.farm.unlockedCrops.includes(cropId)) return { ok: false, msg: 'Tanaman belum dibuka.' };
    const plot = state.farm.plots[plotIndex];
    if (!plot) return { ok: false, msg: 'Plot tidak valid.' };
    if (plot.crop) return { ok: false, msg: 'Plot sudah berisi tanaman.' };
    const now = Date.now();
    plot.crop = cropId; plot.stage = 1; plot.plantedAt = now; plot.lastTick = now;
    return { ok: true };
  },

  harvest(state, plotIndex) {
    const plot = state.farm.plots[plotIndex];
    if (!plot) return { ok: false, msg: 'Plot tidak valid.' };
    if (!this._isHarvestable(plot)) return { ok: false, msg: 'Belum siap panen.' };
    return this._doHarvest(state, plot);
  },

  _doHarvest(state, plot) {
    const cropDef = CROPS[plot.crop];
    if (!cropDef) return { ok: false };
    const yieldBonus = 1 + (state.upgrades.better_seeds ?? 0) * 0.25;
    const prestigeBonus = 1 + (state.prestigeBonuses?.prod_boost ?? 0) * 0.15;
    const rangerLevel = state.heroes.ranger?.task === 'farm' ? state.heroes.ranger.level : 0;
    const rangerBonus = rangerLevel > 0 ? HEROES.ranger.bonus.wheat * (1 + (rangerLevel - 1) * 0.05) : 1;
    const total = Math.floor(cropDef.yield * yieldBonus * prestigeBonus * rangerBonus);
    const max = state.maxResources[cropDef.resource];
    state.resources[cropDef.resource] = Math.min(max, state.resources[cropDef.resource] + total);
    if (cropDef.resource === 'wheat') state.stats.totalWheatHarvested += total;
    plot.crop = null; plot.stage = 0; plot.plantedAt = null; plot.lastTick = null;
    return { ok: true, amount: total, resource: cropDef.resource };
  },

  unlockCrop(state, cropId) {
    const cropDef = CROPS[cropId];
    if (!cropDef || state.farm.unlockedCrops.includes(cropId)) return { ok: false };
    if (!cropDef.unlockCost) return { ok: false };
    const canAfford = Object.entries(cropDef.unlockCost).every(([r, a]) => state.resources[r] >= a);
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(cropDef.unlockCost)) state.resources[r] -= a;
    state.farm.unlockedCrops.push(cropId);
    return { ok: true };
  },
};

// ── Build System ──────────────────────────────────────────────
export const BuildSystem = {
  build(state, buildingId) {
    const def = BUILDINGS[buildingId];
    if (!def) return { ok: false, msg: 'Bangunan tidak dikenal.' };
    if (state.buildings[buildingId]) return { ok: false, msg: 'Sudah dibangun.' };
    const canAfford = Object.entries(def.cost).every(([r, a]) => state.resources[r] >= a);
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(def.cost)) state.resources[r] -= a;
    state.buildings[buildingId] = { level: 1, builtAt: Date.now() };
    // Apply warehouse bonus immediately
    if (def.bonus?.storageBoost) {
      for (const res of ['wheat', 'wood', 'stone', 'gold']) {
        state.maxResources[res] += def.bonus.storageBoost;
      }
    }
    return { ok: true };
  },

  upgrade(state, buildingId) {
    const def = BUILDINGS[buildingId];
    const bState = state.buildings[buildingId];
    if (!def || !bState) return { ok: false, msg: 'Bangunan belum dibangun.' };
    if (bState.level >= def.maxLevel) return { ok: false, msg: 'Sudah level maksimum.' };
    const cost = this.upgradeCost(def, bState.level);
    const canAfford = Object.entries(cost).every(([r, a]) => state.resources[r] >= a);
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    bState.level++;
    if (def.bonus?.storageBoost) {
      for (const res of ['wheat', 'wood', 'stone', 'gold']) {
        state.maxResources[res] += def.bonus.storageBoost;
      }
    }
    return { ok: true, newLevel: bState.level };
  },

  upgradeCost(def, currentLevel) {
    const mult = Math.pow(def.upgradeCostMult ?? 2.0, currentLevel);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) cost[r] = Math.ceil(a * mult);
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

// ── Hero System ───────────────────────────────────────────────
export const HeroSystem = {
  assign(state, heroId, task) {
    const hState = state.heroes[heroId];
    if (!hState || !hState.unlocked) return { ok: false, msg: 'Hero belum terbuka.' };
    if (hState.task === 'quest') return { ok: false, msg: 'Hero sedang dalam quest.' };
    hState.task = task;
    return { ok: true };
  },

  unlock(state, heroId) {
    const def = HEROES[heroId];
    const hState = state.heroes[heroId];
    if (!def || !hState || hState.unlocked) return { ok: false };
    if (!def.unlockCost) return { ok: false };
    const canAfford = Object.entries(def.unlockCost).every(([r, a]) => state.resources[r] >= a);
    if (!canAfford) return { ok: false, msg: 'Permata tidak cukup.' };
    for (const [r, a] of Object.entries(def.unlockCost)) state.resources[r] -= a;
    hState.unlocked = true;
    return { ok: true };
  },

  addXP(state, heroId, xp) {
    const hState = state.heroes[heroId];
    if (!hState || !hState.unlocked) return;
    const xpBonus = 1 + (state.upgrades.hero_training ?? 0) * 0.50;
    hState.xp += Math.floor(xp * xpBonus);
    while (hState.level < 20 && hState.xp >= xpToNextLevel(hState.level)) {
      hState.xp -= xpToNextLevel(hState.level);
      hState.level++;
    }
  },

  equipItem(state, heroId, itemId) {
    const hState = state.heroes[heroId];
    const itemDef = ITEMS[itemId];
    if (!hState || !itemDef || !itemDef.slot) return { ok: false, msg: 'Item tidak bisa diequip.' };
    if (!state.inventory[itemId] || state.inventory[itemId] < 1) return { ok: false, msg: 'Item tidak ada di inventori.' };
    const slot = itemDef.slot;
    const prev = hState.equipped[slot];
    // Return old item to inventory
    if (prev) {
      state.inventory[prev] = (state.inventory[prev] ?? 0) + 1;
    }
    // Equip new item
    hState.equipped[slot] = itemId;
    state.inventory[itemId]--;
    if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
    return { ok: true };
  },

  unequipItem(state, heroId, slot) {
    const hState = state.heroes[heroId];
    if (!hState) return { ok: false };
    const itemId = hState.equipped[slot];
    if (!itemId) return { ok: false, msg: 'Tidak ada item di slot ini.' };
    state.inventory[itemId] = (state.inventory[itemId] ?? 0) + 1;
    hState.equipped[slot] = null;
    return { ok: true };
  },

  getEffectiveStats(state, heroId) {
    const hState = state.heroes[heroId];
    const hDef = HEROES[heroId];
    if (!hState || !hDef) return { atk: 0, def: 0, hp: 0 };
    let atk = hDef.atk + (hState.level - 1) * 2;
    let def = hDef.def + (hState.level - 1) * 1;
    let hp  = hDef.hp  + (hState.level - 1) * 15;
    for (const [slot, itemId] of Object.entries(hState.equipped)) {
      if (!itemId) continue;
      const item = ITEMS[itemId];
      if (!item) continue;
      atk += item.atk ?? 0;
      def += item.def ?? 0;
    }
    return { atk, def, hp };
  },
};

// ── Quest System ──────────────────────────────────────────────
export const QuestSystem = {
  send(state, heroId, questId) {
    const questDef = QUESTS.find(q => q.id === questId);
    if (!questDef) return { ok: false, msg: 'Quest tidak ditemukan.' };
    const hState = state.heroes[heroId];
    if (!hState?.unlocked) return { ok: false, msg: 'Hero belum terbuka.' };
    if (hState.task === 'quest') return { ok: false, msg: 'Hero sudah dalam quest lain.' };
    if (hState.level < questDef.minLevel) return { ok: false, msg: `Butuh hero level ${questDef.minLevel}.` };
    if (questDef.requires && !state.completedQuests.includes(questDef.requires)) {
      const previous = QUESTS.find(q => q.id === questDef.requires);
      return { ok: false, msg: `Selesaikan quest "${previous?.name ?? questDef.requires}" terlebih dahulu.` };
    }
    const tavernLevel = state.buildings['tavern']?.level ?? 0;
    const tavernBonus = tavernLevel * 0.15;
    const upgradeBonus = (state.upgrades.fast_travel ?? 0) * 0.20;
    const durationMult = Math.max(0.3, 1 - tavernBonus - upgradeBonus);
    const duration = Math.floor(questDef.duration * durationMult);
    hState.task = 'quest'; hState.questId = questId;
    hState.questStart = Date.now(); hState.questDuration = duration;
    return { ok: true, duration };
  },

  tick(state) {
    const completed = [];
    for (const [hId, hState] of Object.entries(state.heroes)) {
      if (hState.task !== 'quest' || !hState.questId) continue;
      const elapsed = (Date.now() - hState.questStart) / 1000;
      if (elapsed >= hState.questDuration) completed.push({ heroId: hId, questId: hState.questId });
    }
    return completed;
  },

  claim(state, heroId) {
    const hState = state.heroes[heroId];
    if (!hState || hState.task !== 'quest') return { ok: false };
    const elapsed = (Date.now() - hState.questStart) / 1000;
    if (elapsed < hState.questDuration) return { ok: false, remaining: hState.questDuration - elapsed };
    const questDef = QUESTS.find(q => q.id === hState.questId);
    if (!questDef) return { ok: false };
    const questPower = this.getQuestPower(state, heroId);
    // Quest power, hero attributes, equipment, and guard duty all affect
    // the result. The reward curve is deterministic so a save/load cannot
    // randomly duplicate or erase a completed quest.
    const rewardMult = Math.max(0.75, Math.min(2.5, 0.65 + questPower / 4));
    const barrackLevel = state.buildings['barracks']?.level ?? 0;
    const barrackRewardMult = 1 + barrackLevel * 0.20;
    const gemBonus = 1 + (state.upgrades.gem_polish ?? 0) * 0.50;
    const prestigeGem = state.prestigeBonuses?.gem_income ?? 0;
    const gained = {};
    for (const [res, amount] of Object.entries(questDef.reward)) {
      let final = Math.floor(amount * rewardMult * barrackRewardMult);
      if (res === 'gem') final = Math.floor(final * gemBonus) + prestigeGem;
      gained[res] = final;
      const max = state.maxResources[res] ?? 99999;
      state.resources[res] = Math.min(max, (state.resources[res] ?? 0) + final);
    }
    HeroSystem.addXP(state, heroId, Math.floor(questDef.xpReward * Math.min(2, 0.85 + questPower / 5)));
    if (hState.questId === 'dragon') state.dragonSlain = true;
    state.stats.totalQuestsCompleted++;
    if (!state.completedQuests.includes(hState.questId)) state.completedQuests.push(hState.questId);
    hState.task = 'idle'; hState.questId = null; hState.questStart = null; hState.questDuration = null;
    return { ok: true, reward: gained, heroId };
  },

  getQuestPower(state, heroId) {
    const hero = state.heroes[heroId];
    const def = HEROES[heroId];
    if (!hero || !def) return 0;
    const stats = HeroSystem.getEffectiveStats(state, heroId);
    const guardCount = Object.values(state.heroes).filter(h => h.unlocked && h.task === 'guard').length;
    return def.questPower + stats.atk / 50 + stats.def / 75 + guardCount * 0.1;
  },
};

// ── Upgrade System ────────────────────────────────────────────
export const UpgradeSystem = {
  buy(state, upgradeId) {
    const def = UPGRADES.find(u => u.id === upgradeId);
    if (!def) return { ok: false };
    const current = state.upgrades[upgradeId] ?? 0;
    if (current >= (def.maxLevel ?? 1)) return { ok: false, msg: 'Sudah level maksimum.' };
    const lvlMult = Math.pow(2, current);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) cost[r] = Math.ceil(a * lvlMult);
    const canAfford = Object.entries(cost).every(([r, a]) => state.resources[r] >= a);
    if (!canAfford) return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    state.upgrades[upgradeId] = current + 1;
    if (def.effect.maxWheat) state.maxResources.wheat += def.effect.maxWheat;
    if (def.effect.allMax) for (const r of ['wheat', 'wood', 'stone', 'gold']) state.maxResources[r] += def.effect.allMax;
    return { ok: true, newLevel: current + 1 };
  },

  getCost(upgradeId, currentLevel) {
    const def = UPGRADES.find(u => u.id === upgradeId);
    if (!def) return {};
    const lvlMult = Math.pow(2, currentLevel);
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) cost[r] = Math.ceil(a * lvlMult);
    return cost;
  },
};

// ── Prestige System ───────────────────────────────────────────
export const PrestigeSystem = {
  canPrestige(state) { return state.dragonSlain === true; },
  doPrestige(state) {
    if (!this.canPrestige(state)) return { ok: false, msg: 'Harus menyelesaikan quest Sarang Naga.' };
    // GameState owns the single reset policy so UI/system entry points cannot
    // disagree about armies, queues, farms, or persistent progression.
    Object.assign(state, resetPrestigeState(state));
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
    return { ok: true };
  },
};

// ── Inventory System ──────────────────────────────────────────
export const InventorySystem = {
  useConsumable(state, itemId, heroId) {
    const itemDef = ITEMS[itemId];
    if (!itemDef || itemDef.type !== 'consumable') return { ok: false, msg: 'Bukan item konsumabel.' };
    if (!state.inventory[itemId] || state.inventory[itemId] < 1) return { ok: false, msg: 'Item tidak tersedia.' };
    state.inventory[itemId]--;
    if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
    if (itemDef.xpBoost && heroId) HeroSystem.addXP(state, heroId, itemDef.xpBoost);
    return { ok: true, item: itemDef };
  },
};

// ── Crafting System ───────────────────────────────────────────
export const CraftSystem = {
  canCraft(state, recipeId) {
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    return Object.entries(recipe.ingredients).every(([r, a]) => (state.resources[r] ?? 0) >= a);
  },

  startCraft(state, recipeId) {
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { ok: false, msg: 'Resep tidak ditemukan.' };
    if (!this.canCraft(state, recipeId)) return { ok: false, msg: 'Material tidak cukup.' };
    if (state.crafting.queue.length >= 3) return { ok: false, msg: 'Antrian penuh (maks 3).' };
    for (const [r, a] of Object.entries(recipe.ingredients)) state.resources[r] -= a;
    state.crafting.queue.push({
      recipeId, startedAt: Date.now(),
      duration: recipe.time * 1000,
      outputItemId: recipe.output, outputQty: recipe.outputQty,
    });
    return { ok: true };
  },

  tick(state) {
    const now = Date.now();
    const done = [];
    state.crafting.queue = state.crafting.queue.filter(job => {
      if (now - job.startedAt >= job.duration) {
        state.inventory[job.outputItemId] = (state.inventory[job.outputItemId] ?? 0) + job.outputQty;
        state.stats.itemsCrafted++;
        done.push(job);
        return false;
      }
      return true;
    });
    return done;
  },
};

// ── Market System ─────────────────────────────────────────────
export const MarketSystem = {
  buy(state, marketItemId) {
    const entry = MARKET_BUY.find(m => m.id === marketItemId);
    if (!entry) return { ok: false, msg: 'Item tidak ditemukan di pasar.' };
    const discount = (state.upgrades.market_savvy ?? 0) * 0.15;
    const price = {};
    for (const [r, a] of Object.entries(entry.price)) price[r] = Math.ceil(a * (1 - discount));
    if (!Object.entries(price).every(([r, a]) => (state.resources[r] ?? 0) >= a))
      return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(price)) state.resources[r] -= a;
    state.inventory[entry.itemId] = (state.inventory[entry.itemId] ?? 0) + entry.qty;
    return { ok: true, itemId: entry.itemId, qty: entry.qty };
  },

  sellResource(state, resourceId, qty) {
    if (!state.resources[resourceId] || state.resources[resourceId] < qty) return { ok: false, msg: 'Tidak cukup.' };
    const rates = MARKET_SELL_RATES[resourceId];
    if (!rates) return { ok: false, msg: 'Resource ini tidak bisa dijual.' };
    let gold = 0;
    if (rates.goldPer100) gold = Math.floor((qty / 100) * rates.goldPer100);
    if (rates.goldPer1)   gold = qty * rates.goldPer1;
    if (gold <= 0) return { ok: false, msg: 'Jumlah terlalu sedikit.' };
    state.resources[resourceId] -= qty;
    const maxGold = state.maxResources.gold;
    state.resources.gold = Math.min(maxGold, state.resources.gold + gold);
    state.stats.totalGoldEarned += gold;
    return { ok: true, goldGained: gold };
  },
};

// ── Gacha System ──────────────────────────────────────────────
export const GachaSystem = {
  SINGLE_COST: { gem: 10 },
  MULTI_COST:  { gem: 90 },

  spin(state, count = 1) {
    const cost = count === 1 ? { gem: 10 } : { gem: 90 };
    if (!Object.entries(cost).every(([r, a]) => state.resources[r] >= a))
      return { ok: false, msg: 'Permata tidak cukup.' };
    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    const results = [];
    for (let i = 0; i < count; i++) results.push(this._pick());
    for (const r of results) this._applyReward(state, r);
    state.gacha.totalSpins += count;
    state.stats.gachaSpins += count;
    state.gacha.lastResult = results;
    return { ok: true, results };
  },

  _pick() {
    const total = GACHA_POOL.reduce((s, e) => s + e.weight, 0);
    let rand = Math.random() * total;
    for (const entry of GACHA_POOL) {
      rand -= entry.weight;
      if (rand <= 0) return { ...entry };
    }
    return { ...GACHA_POOL[0] };
  },

  _applyReward(state, entry) {
    if (entry.type === 'item') {
      state.inventory[entry.itemId] = (state.inventory[entry.itemId] ?? 0) + entry.qty;
    } else if (entry.type === 'resource') {
      const max = state.maxResources[entry.resourceId] ?? 99999;
      state.resources[entry.resourceId] = Math.min(max, (state.resources[entry.resourceId] ?? 0) + entry.qty);
    }
  },
};

// ── Daily Bonus System ────────────────────────────────────────
export const DailySystem = {
  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  canClaim(state) {
    return state.dailyBonus.lastClaimDate !== this.todayStr();
  },

  claim(state) {
    if (!this.canClaim(state)) return { ok: false, msg: 'Sudah diklaim hari ini.' };
    const today = this.todayStr();
    const last = state.dailyBonus.lastClaimDate;
    let streak = state.dailyBonus.streak;
    if (last) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
      streak = (last === yStr) ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    streak = Math.min(streak, 7);
    state.dailyBonus.streak = streak;
    state.dailyBonus.lastClaimDate = today;
    state.dailyBonus.maxStreak = Math.max(state.dailyBonus.maxStreak ?? 0, streak);
    if (streak > (state.stats.maxLoginStreak ?? 0)) state.stats.maxLoginStreak = streak;
    const dayReward = DAILY_REWARDS.find(r => r.day === streak) ?? DAILY_REWARDS[0];
    for (const [res, amt] of Object.entries(dayReward.rewards)) {
      if (state.resources[res] !== undefined) {
        state.resources[res] = Math.min(state.maxResources[res] ?? 99999, (state.resources[res] ?? 0) + amt);
      }
    }
    return { ok: true, reward: dayReward, streak };
  },

  claimAdReward(state, rewardId) {
    const pick = AD_REWARDS.find(reward => reward.id === rewardId);
    if (!pick) return { ok: false, msg: 'Hadiah iklan tidak ditemukan.' };
    if (pick.rewards.item) {
      state.inventory[pick.rewards.item] = (state.inventory[pick.rewards.item] ?? 0) + (pick.rewards.qty ?? 1);
    } else {
      for (const [res, amt] of Object.entries(pick.rewards)) {
        if (state.resources[res] !== undefined) {
          state.resources[res] = Math.min(state.maxResources[res] ?? 99999, (state.resources[res] ?? 0) + amt);
        }
      }
    }
    return { ok: true, reward: pick };
  },
};

// ── Army System ───────────────────────────────────────────────
export const ArmySystem = {
  recruit(state, unitId, count = 1) {
    const def = ARMY_UNITS[unitId];
    if (!def) return { ok: false };
    const cost = {};
    for (const [r, a] of Object.entries(def.cost)) cost[r] = a * count;
    if (!Object.entries(cost).every(([r, a]) => (state.resources[r] ?? 0) >= a))
      return { ok: false, msg: 'Sumber daya tidak cukup.' };
    for (const [r, a] of Object.entries(cost)) state.resources[r] -= a;
    state.armyRecruiting.push({
      unitId, count, startedAt: Date.now(),
      duration: def.recruitTime * 1000 * count,
    });
    return { ok: true };
  },

  tick(state) {
    const now = Date.now();
    state.armyRecruiting = state.armyRecruiting.filter(job => {
      if (now - job.startedAt >= job.duration) {
        state.army[job.unitId] = (state.army[job.unitId] ?? 0) + job.count;
        return false;
      }
      return true;
    });
  },

  totalPower(state) {
    let power = 0;
    for (const [unitId, count] of Object.entries(state.army)) {
      const def = ARMY_UNITS[unitId];
      if (def) power += (def.atk + def.def) * count;
    }
    const armyUpg = 1 + (state.upgrades.army_tactics ?? 0) * 0.25;
    return Math.floor(power * armyUpg);
  },

  totalUnits(state) {
    return Object.values(state.army).reduce((s, c) => s + c, 0);
  },

  attack(state, kingdomId) {
    const kingdom = AI_KINGDOMS.find(k => k.id === kingdomId);
    if (!kingdom) return { ok: false };
    const myPower = this.totalPower(state);
    let enemyPower = 0;
    for (const [unitId, count] of Object.entries(kingdom.army)) {
      const def = ARMY_UNITS[unitId];
      if (def) enemyPower += (def.atk + def.def) * count;
    }
    const ratio = myPower / Math.max(1, enemyPower);
    const won = ratio >= 0.8 + (Math.random() * 0.4 - 0.2);
    const log = this._generateBattleLog(state, kingdom, ratio, won);
    const casualtyRate = won ? Math.max(0.05, 0.4 / ratio) : 0.6 + Math.random() * 0.3;
    for (const unitId of Object.keys(state.army)) {
      const lost = Math.floor((state.army[unitId] ?? 0) * casualtyRate);
      state.army[unitId] = Math.max(0, (state.army[unitId] ?? 0) - lost);
    }
    let gained = {};
    if (won) {
      gained = { ...kingdom.reward };
      for (const [res, amt] of Object.entries(gained)) {
        const max = state.maxResources[res] ?? 99999;
        state.resources[res] = Math.min(max, (state.resources[res] ?? 0) + amt);
      }
      state.stats.battlesWon++;
    } else {
      state.stats.battlesLost++;
      // Lose some resources on defeat
      for (const r of ['gold', 'wheat']) {
        const loss = Math.floor((state.resources[r] ?? 0) * 0.1);
        state.resources[r] = Math.max(0, (state.resources[r] ?? 0) - loss);
      }
    }
    state.lastBattleResult = { won, enemyName: kingdom.name, reward: gained, log, timestamp: Date.now() };
    return { ok: true, won, reward: gained, log, power: { mine: myPower, enemy: enemyPower } };
  },

  _generateBattleLog(state, kingdom, ratio, won) {
    const lines = [];
    lines.push(`⚔️ Menyerang ${kingdom.name}!`);
    lines.push(`🗡️ Kekuatan pasukanmu: ${this.totalPower(state)}`);
    let ep = 0;
    for (const [uid, cnt] of Object.entries(kingdom.army)) {
      const d = ARMY_UNITS[uid];
      if (d) ep += (d.atk + d.def) * cnt;
    }
    lines.push(`👹 Kekuatan musuh: ${ep}`);
    lines.push('');
    if (ratio >= 2) {
      lines.push('💥 Kemenangan mudah! Musuh lari ketakutan.');
    } else if (ratio >= 1.2) {
      lines.push('⚔️ Pertempuran sengit! Akhirnya kamu menang.');
    } else if (ratio >= 0.8) {
      lines.push('😰 Pertempuran seimbang... Nasib menentukan!');
    } else {
      lines.push('💀 Kamu kalah melawan musuh yang lebih kuat!');
    }
    lines.push(won ? '🏆 MENANG! Rampas harta musuh!' : '😢 KALAH! Beberapa pasukan gugur.');
    return lines;
  },
};

// ── Achievement System ────────────────────────────────────────
export const AchievementSystem = {
  check(state) {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      const achState = state.achievements[ach.id];
      if (!achState || achState.unlocked) continue;
      const req = ach.req;
      let met = false;
      if (req.stat) {
        met = (state.stats[req.stat] ?? 0) >= req.val;
      }
      if (met) {
        achState.unlocked = true;
        achState.claimedAt = Date.now();
        // Apply reward
        if (ach.reward) {
          for (const [res, amt] of Object.entries(ach.reward)) {
            if (state.resources[res] !== undefined) {
              state.resources[res] = Math.min(state.maxResources[res] ?? 99999, (state.resources[res] ?? 0) + amt);
            }
          }
        }
        newlyUnlocked.push(ach);
      }
    }
    return newlyUnlocked;
  },
};
