// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — UI Manager (Full Edition — 16 Panels)
// ═══════════════════════════════════════════════════════════════

import {
  RESOURCES, BUILDINGS, CROPS, QUESTS, HEROES, UPGRADES, PRESTIGE_BONUSES,
  ITEMS, CRAFTING_RECIPES, MARKET_BUY, MARKET_SELL_RATES,
  GACHA_POOL, ARMY_UNITS, AI_KINGDOMS, ACHIEVEMENTS, DAILY_REWARDS, AD_REWARDS,
  MAP_ZONES, xpToNextLevel
} from './data.js';
import {
  FarmSystem, BuildSystem, QuestSystem, HeroSystem, UpgradeSystem, PrestigeSystem,
  InventorySystem, CraftSystem, MarketSystem, GachaSystem, DailySystem,
  ArmySystem, AchievementSystem, ResourceSystem,
} from './systems.js';

const PANELS = [
  { id: 'farm',       icon: '🌾', label: 'Farm'      },
  { id: 'build',      icon: '🏰', label: 'Bangun'    },
  { id: 'quest',      icon: '⚔️', label: 'Quest'     },
  { id: 'heroes',     icon: '👤', label: 'Pahlawan'  },
  { id: 'inventory',  icon: '🎒', label: 'Inventori' },
  { id: 'crafting',   icon: '🔨', label: 'Kerajinan' },
  { id: 'market',     icon: '🏪', label: 'Pasar'     },
  { id: 'gacha',      icon: '🎰', label: 'Gacha'     },
  { id: 'bonus',      icon: '🎁', label: 'Bonus'     },
  { id: 'battle',     icon: '🗡️', label: 'Perang'    },
  { id: 'map',        icon: '🗺️', label: 'Peta'      },
  { id: 'upgrade',    icon: '⬆️', label: 'Upgrade'   },
  { id: 'prestige',   icon: '🔄', label: 'Prestige'  },
  { id: 'achievement',icon: '🏆', label: 'Capaian'   },
  { id: 'stats',      icon: '📊', label: 'Statistik' },
  { id: 'settings',   icon: '⚙️', label: 'Setting'   },
];

export class GameUI {
  constructor(state, engine, onStateChange, services = {}) {
    this.state         = state;
    this.engine        = engine;
    this.onStateChange = onStateChange;
    this.activePanel   = 'farm';
    this._toastTimer   = null;
    this._achieveQueue = [];
    // Injected services
    this._BattleSim    = services.BattleSim    ?? null;
    this._AdMobService = services.AdMobService ?? null;
  }

  init() {
    this._buildSkeleton();
    this._bindNavTabs();
    this.renderAll();
  }

  // ── Skeleton ──────────────────────────────────────────────
  _buildSkeleton() {
    const panelDivs = PANELS.map(p =>
      `<div id="panel-${p.id}" class="panel${p.id === 'farm' ? ' active' : ''}"></div>`
    ).join('');

    const tabBtns = PANELS.map(p =>
      `<button class="tab-btn${p.id === 'farm' ? ' active' : ''}" data-panel="${p.id}" ontouchstart="">${p.icon}<span>${p.label}</span></button>`
    ).join('');

    document.getElementById('app').innerHTML = `
      <div id="hud">
        <div class="hud-resources" id="hud-resources"></div>
        <div class="hud-right">
          <span id="hud-time" class="hud-time"></span>
          <button class="hud-save" id="btn-save" ontouchstart="">💾</button>
        </div>
      </div>
      <div id="world-wrap">
        <canvas id="game-canvas"></canvas>
        <div id="world-overlay">
          <div id="loading-bar"><div id="loading-fill"></div></div>
          <div id="loading-text">Memuat dunia...</div>
        </div>
      </div>
      <div id="panel-wrap">${panelDivs}</div>
      <nav id="tab-bar">${tabBtns}</nav>
      <div id="toast"></div>
      <div id="modal-backdrop" style="display:none"></div>
      <div id="modal-box" style="display:none"></div>
      <div id="achieve-pop" class="achieve-pop"></div>
    `;

    document.getElementById('btn-save').addEventListener('click', () => {
      this.state.save();
      this.showToast('💾 Game tersimpan!', 'success');
    });
  }

  _bindNavTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePanel = btn.dataset.panel;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const el = document.getElementById('panel-' + this.activePanel);
        if (el) el.classList.add('active');
        this.renderPanel(this.activePanel);
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });
  }

  renderAll() {
    this._renderHUD();
    this.renderPanel(this.activePanel);
    this._updateWorldSync();
  }

  renderPanel(name) {
    switch (name) {
      case 'farm':        this._renderFarm();        break;
      case 'build':       this._renderBuild();       break;
      case 'quest':       this._renderQuest();       break;
      case 'heroes':      this._renderHeroes();      break;
      case 'inventory':   this._renderInventory();   break;
      case 'crafting':    this._renderCrafting();    break;
      case 'market':      this._renderMarket();      break;
      case 'gacha':       this._renderGacha();       break;
      case 'bonus':       this._renderBonus();       break;
      case 'battle':      this._renderBattle();      break;
      case 'map':         this._renderMap();         break;
      case 'upgrade':     this._renderUpgrade();     break;
      case 'prestige':    this._renderPrestige();    break;
      case 'achievement': this._renderAchievement(); break;
      case 'stats':       this._renderStats();       break;
      case 'settings':    this._renderSettings();    break;
    }
  }

  _updateWorldSync() {
    if (this.engine) this.engine.syncState(this.state.data, CROPS, BUILDINGS);
  }

  // ── HUD ───────────────────────────────────────────────────
  _renderHUD() {
    const res = this.state.data.resources;
    const el  = document.getElementById('hud-resources');
    if (!el) return;
    el.innerHTML = Object.entries(RESOURCES).map(([id, def]) => `
      <div class="hud-res">
        <span class="hud-icon">${def.icon}</span>
        <span class="hud-val">${this._fmt(res[id] ?? 0)}</span>
      </div>
    `).join('');
    const t = this.state.data.stats.playTimeSec;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const timeEl = document.getElementById('hud-time');
    if (timeEl) timeEl.textContent = h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  // ── Panel: Farm ───────────────────────────────────────────
  _renderFarm() {
    const el    = document.getElementById('panel-farm');
    const state = this.state.data;
    const plots = state.farm.plots;
    const stageLabel = ['🌑 Kosong', '🌱 Baru Tanam', '🌿 Tunas', '🌾 Tumbuh', '🌻 Subur', '✨ Siap Panen!'];

    el.innerHTML = `
      <div class="panel-header">
        <h2>🌾 Ladang</h2>
        <p class="panel-sub">Tanam & panen untuk dapat sumber daya</p>
      </div>
      <div class="farm-grid" id="farm-grid">
        ${plots.map((plot, i) => this._farmPlotCard(plot, i, stageLabel)).join('')}
      </div>
      <div class="section-title">Produksi Per Detik</div>
      <div class="rate-row">
        ${Object.entries(RESOURCES).filter(([id]) => ['wheat','wood','stone','gold','gem'].includes(id)).map(([id, def]) => {
          const rate = ResourceSystem.getRate(state, id);
          return rate > 0 ? `<div class="rate-chip">${def.icon} +${rate.toFixed(2)}/s</div>` : '';
        }).join('')}
      </div>
      <div class="section-title">Buka Tanaman Baru</div>
      <div class="crop-unlock-row">
        ${Object.entries(CROPS).filter(([id]) => !state.farm.unlockedCrops.includes(id)).map(([id, def]) => `
          <div class="crop-unlock-card">
            <div class="crop-icon">${def.icon}</div>
            <div class="crop-name">${def.name}</div>
            <div class="crop-cost">${Object.entries(def.unlockCost ?? {}).map(([r,a]) => `${RESOURCES[r]?.icon}${this._fmt(a)}`).join(' ')}</div>
            <button class="btn-primary btn-sm" ontouchstart="" data-unlock-crop="${id}">Buka</button>
          </div>
        `).join('') || '<div class="empty-msg">Semua tanaman sudah terbuka 🎉</div>'}
      </div>
    `;

    el.querySelectorAll('[data-plot]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.plot);
        const plot = state.farm.plots[i];
        if (!plot.crop) {
          this._showPlantModal(i);
        } else if (FarmSystem._isHarvestable(plot)) {
          const r = FarmSystem.harvest(state, i);
          if (r.ok) {
            this.showToast(`🌾 Panen ${r.amount} ${RESOURCES[r.resource]?.name}!`, 'success');
            this.renderAll(); this.onStateChange();
          }
        }
      });
    });
    el.querySelectorAll('[data-unlock-crop]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.dataset.unlockCrop;
        const r = FarmSystem.unlockCrop(state, cropId);
        if (r.ok) {
          this.showToast(`🌱 ${CROPS[cropId]?.name} berhasil dibuka!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg ?? 'Tidak cukup sumber daya', 'error'); }
      });
    });
  }

  _farmPlotCard(plot, i, stageLabel) {
    const harvestable = FarmSystem._isHarvestable(plot);
    const cropDef = plot.crop ? CROPS[plot.crop] : null;
    const pct = cropDef ? Math.round((plot.stage / cropDef.stages) * 100) : 0;
    if (!plot.crop) return `<div class="farm-plot empty" data-plot="${i}"><div class="plot-icon">➕</div><div class="plot-label">Tanam</div></div>`;
    return `<div class="farm-plot ${harvestable ? 'harvestable pulse' : 'growing'}" data-plot="${i}">
      <div class="plot-icon">${cropDef?.icon ?? '🌾'}</div>
      <div class="plot-stage">${stageLabel[plot.stage] ?? ''}</div>
      <div class="plot-bar"><div class="plot-fill" style="width:${pct}%"></div></div>
      ${harvestable ? '<div class="plot-tap">Tap panen!</div>' : `<div class="plot-pct">${pct}%</div>`}
    </div>`;
  }

  _showPlantModal(plotIndex) {
    const state = this.state.data;
    const crops = state.farm.unlockedCrops.map(id => ({ id, ...CROPS[id] })).filter(Boolean);
    this._openModal(`
      <h3>🌱 Pilih Tanaman</h3>
      <div class="modal-crop-list">
        ${crops.map(c => `
          <button class="modal-crop-btn" ontouchstart="" data-crop="${c.id}">
            <span class="crop-modal-icon">${c.icon}</span>
            <div>
              <div class="crop-modal-name">${c.name}</div>
              <div class="crop-modal-info">⏱ ${c.stageDuration * c.stages}s · 🌾 +${c.yield}</div>
            </div>
          </button>
        `).join('')}
      </div>
      <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
    `);
    document.querySelectorAll('.modal-crop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = FarmSystem.plant(state, plotIndex, btn.dataset.crop);
        if (r.ok) {
          this._closeModal();
          this.showToast('🌱 Tanaman berhasil ditanam!', 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel: Build ──────────────────────────────────────────
  _renderBuild() {
    const el    = document.getElementById('panel-build');
    const state = this.state.data;
    const categories = { production: '⚒️ Produksi', economy: '💰 Ekonomi', military: '⚔️ Militer', research: '📚 Riset', storage: '📦 Gudang', special: '✨ Spesial' };

    let html = `<div class="panel-header"><h2>🏰 Bangunan</h2><p class="panel-sub">Bangun & upgrade untuk tingkatkan produksi</p></div>`;
    for (const [cat, catLabel] of Object.entries(categories)) {
      const blds = Object.entries(BUILDINGS).filter(([,d]) => d.category === cat);
      if (!blds.length) continue;
      html += `<div class="section-title">${catLabel}</div><div class="build-list">`;
      for (const [id, def] of blds) {
        const bState = state.buildings[id];
        const built  = !!bState;
        const level  = bState?.level ?? 0;
        const maxed  = level >= def.maxLevel;
        const upgCost = built ? BuildSystem.upgradeCost(def, level) : null;
        const canBuild = !built && Object.entries(def.cost).every(([r,a]) => state.resources[r] >= a);
        const canUpg   = built && !maxed && BuildSystem.canAffordUpgrade(state, id);
        html += `<div class="build-card ${built ? 'built' : ''}">
          <div class="build-icon">${def.icon}</div>
          <div class="build-info">
            <div class="build-name">${def.name}</div>
            <div class="build-desc">${def.description}</div>
            ${built ? `<div class="build-level">⭐ Level ${level}/${def.maxLevel}</div>` : ''}
            <div class="build-prod">${this._prodText(def)}</div>
          </div>
          <div class="build-action">
            ${!built ? `
              <div class="cost-row">${this._costRow(def.cost, state)}</div>
              <button class="btn-primary btn-sm ${canBuild ? '' : 'disabled'}" ontouchstart="" data-build="${id}">Bangun</button>
            ` : maxed ? `<div class="badge-maxed">MAX ⭐</div>` : `
              <div class="cost-row">${this._costRow(upgCost, state)}</div>
              <button class="btn-accent btn-sm ${canUpg ? '' : 'disabled'}" ontouchstart="" data-upgrade="${id}">↑ Lv.${level+1}</button>
            `}
          </div>
        </div>`;
      }
      html += '</div>';
    }
    el.innerHTML = html;

    el.querySelectorAll('[data-build]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = BuildSystem.build(state, btn.dataset.build);
        if (r.ok) {
          this.showToast(`🏰 ${BUILDINGS[btn.dataset.build]?.name} berhasil dibangun!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
    el.querySelectorAll('[data-upgrade]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = BuildSystem.upgrade(state, btn.dataset.upgrade);
        if (r.ok) {
          this.showToast(`⬆️ Upgrade ke level ${r.newLevel}!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel: Quest ──────────────────────────────────────────
  _renderQuest() {
    const el    = document.getElementById('panel-quest');
    const state = this.state.data;
    el.innerHTML = `
      <div class="panel-header"><h2>⚔️ Quest</h2><p class="panel-sub">Kirim pahlawan berpetualangan</p></div>
      <div class="quest-list">
        ${QUESTS.map(q => {
          const onQuest = Object.entries(state.heroes).find(([,h]) => h.task === 'quest' && h.questId === q.id);
          const elapsed = onQuest ? (Date.now() - onQuest[1].questStart) / 1000 : 0;
          const dur     = onQuest ? onQuest[1].questDuration : q.duration;
          const pct     = onQuest ? Math.min(100, (elapsed / dur) * 100) : 0;
          const done    = onQuest && elapsed >= dur;
          return `<div class="quest-card ${done ? 'quest-done' : ''}">
            <div class="quest-header">
              <span class="quest-icon">${q.icon}</span>
              <div><div class="quest-name">${q.name}</div><div class="quest-diff">${q.difficulty} · Min Lv.${q.minLevel}</div></div>
              ${q.isPrestige ? '<span class="badge-prestige">PRESTIGE</span>' : ''}
            </div>
            <div class="quest-desc">${q.description}</div>
            <div class="quest-reward">Reward: ${Object.entries(q.reward).map(([r,a]) => `${RESOURCES[r]?.icon ?? r}${a}`).join(' ')} · ✨${q.xpReward}XP</div>
            ${onQuest ? `
              <div class="quest-progress">
                <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
                <div class="quest-eta">${done ? '✅ Selesai!' : this._etaText(dur - elapsed)}</div>
              </div>
              ${done ? `<button class="btn-primary btn-sm" ontouchstart="" data-claim="${onQuest[0]}">🎁 Klaim Reward</button>` : ''}
            ` : `<div class="quest-footer"><span class="quest-dur">⏱ ${this._etaText(q.duration)}</span><button class="btn-accent btn-sm" ontouchstart="" data-send-quest="${q.id}">Kirim Hero →</button></div>`}
          </div>`;
        }).join('')}
      </div>
    `;
    el.querySelectorAll('[data-send-quest]').forEach(btn => btn.addEventListener('click', () => this._showSendHeroModal(btn.dataset.sendQuest)));
    el.querySelectorAll('[data-claim]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = QuestSystem.claim(state, btn.dataset.claim);
        if (r.ok) {
          const rStr = Object.entries(r.reward).map(([res,amt]) => `${RESOURCES[res]?.icon ?? res}${amt}`).join(' ');
          this.showToast(`🎁 Quest selesai! +${rStr}`, 'success');
          this._checkAchievements();
          this.renderAll(); this.onStateChange();
        }
      });
    });
  }

  _showSendHeroModal(questId) {
    const state   = this.state.data;
    const questDef = QUESTS.find(q => q.id === questId);
    const heroes   = Object.entries(state.heroes).filter(([,h]) => h.unlocked && h.task !== 'quest');
    this._openModal(`
      <h3>${questDef?.icon} Pilih Pahlawan</h3>
      <p class="modal-sub">untuk: ${questDef?.name}</p>
      <div class="modal-hero-list">
        ${heroes.length ? heroes.map(([id, h]) => {
          const def   = HEROES[id];
          const enough = h.level >= (questDef?.minLevel ?? 1);
          const stats = HeroSystem.getEffectiveStats(state, id);
          return `<button class="modal-hero-btn ${enough ? '' : 'disabled'}" ontouchstart="" data-hero="${id}">
            <span class="hero-modal-icon">${def.icon}</span>
            <div>
              <div class="hero-modal-name">${def.name} · Lv.${h.level}</div>
              <div class="hero-modal-lvl">⚔️${stats.atk} 🛡️${stats.def} ❤️${stats.hp} ${enough ? '' : '(butuh Lv.'+questDef.minLevel+')'}</div>
            </div>
          </button>`;
        }).join('') : '<div class="empty-msg">Semua hero sedang bertugas.</div>'}
      </div>
      <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
    `);
    document.querySelectorAll('.modal-hero-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = QuestSystem.send(state, btn.dataset.hero, questId);
        if (r.ok) {
          this._closeModal();
          this.showToast(`⚔️ ${HEROES[btn.dataset.hero]?.name} berangkat! (${this._etaText(r.duration)})`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel: Heroes ─────────────────────────────────────────
  _renderHeroes() {
    const el    = document.getElementById('panel-heroes');
    const state = this.state.data;
    el.innerHTML = `
      <div class="panel-header"><h2>👤 Pahlawan</h2><p class="panel-sub">Tugaskan & upgrade pahlawanmu</p></div>
      <div class="hero-list">
        ${Object.entries(HEROES).map(([id, def]) => {
          const h = state.heroes[id];
          if (!h.unlocked && !def.unlockCost) return '';
          const xpNext = xpToNextLevel(h.level);
          const xpPct  = h.unlocked ? Math.round((h.xp / xpNext) * 100) : 0;
          const onQuest = h.task === 'quest';
          const stats   = h.unlocked ? HeroSystem.getEffectiveStats(state, id) : null;
          return `<div class="hero-card ${h.unlocked ? '' : 'locked'}">
            <div class="hero-avatar" style="border-color:${def.color}">${def.icon}</div>
            <div class="hero-info">
              <div class="hero-name">${def.name} <span class="hero-title-badge">${def.title}</span></div>
              ${h.unlocked ? `
                <div class="hero-stats-row">⚔️${stats.atk} 🛡️${stats.def} ❤️${stats.hp}</div>
                <div class="hero-level">Lv.${h.level}
                  <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
                  <span class="xp-text">${h.xp}/${xpNext}</span>
                </div>
                <div class="hero-task-row">Tugas: <b>${onQuest ? '⚔️ Quest — '+this._etaText((h.questDuration??0) - (Date.now()-h.questStart)/1000) : h.task}</b></div>
                <div class="hero-equip-row">
                  ${['weapon','armor','shield','accessory'].map(slot => {
                    const eqId = h.equipped[slot];
                    const eqDef = eqId ? ITEMS[eqId] : null;
                    return `<span class="equip-slot ${eqDef ? 'has-item' : ''}" data-hero="${id}" data-slot="${slot}" title="${slot}">
                      ${eqDef ? eqDef.icon : '○'}
                    </span>`;
                  }).join('')}
                </div>
              ` : `<div class="hero-locked-cost">🔒 ${Object.entries(def.unlockCost ?? {}).map(([r,a]) => `${RESOURCES[r]?.icon}${a}`).join(' ')}</div>`}
            </div>
            <div class="hero-actions">
              ${h.unlocked && !onQuest ? `
                <select class="task-select" data-hero="${id}" ontouchstart="">
                  <option value="idle"  ${h.task==='idle' ?'selected':''}>💤 Istirahat</option>
                  <option value="farm"  ${h.task==='farm' ?'selected':''}>🌾 Bertani</option>
                  <option value="chop"  ${h.task==='chop' ?'selected':''}>🪓 Menebang</option>
                  <option value="mine"  ${h.task==='mine' ?'selected':''}>⛏️ Menambang</option>
                  <option value="trade" ${h.task==='trade'?'selected':''}>💰 Berdagang</option>
                  <option value="guard" ${h.task==='guard'?'selected':''}>🛡️ Menjaga</option>
                </select>
              ` : !h.unlocked ? `
                <button class="btn-primary btn-sm" ontouchstart="" data-unlock-hero="${id}">Buka</button>
              ` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    el.querySelectorAll('.task-select').forEach(sel => {
      sel.addEventListener('change', () => {
        HeroSystem.assign(state, sel.dataset.hero, sel.value);
        this.renderAll(); this.onStateChange();
      });
    });
    el.querySelectorAll('[data-unlock-hero]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = HeroSystem.unlock(state, btn.dataset.unlockHero);
        if (r.ok) { this.showToast(`🥷 ${HEROES[btn.dataset.unlockHero]?.name} dibuka!`, 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg ?? 'Permata tidak cukup', 'error'); }
      });
    });
    el.querySelectorAll('.equip-slot[data-hero]').forEach(slot => {
      slot.addEventListener('click', () => {
        const heroId = slot.dataset.hero;
        const slotName = slot.dataset.slot;
        const h = state.heroes[heroId];
        const equipped = h.equipped[slotName];
        if (equipped) {
          const r = HeroSystem.unequipItem(state, heroId, slotName);
          if (r.ok) { this.showToast(`✅ Item dicopot.`, 'success'); this.renderAll(); this.onStateChange(); }
        } else {
          this._showEquipModal(heroId, slotName);
        }
      });
    });
  }

  _showEquipModal(heroId, slotName) {
    const state = this.state.data;
    const eligible = Object.entries(state.inventory)
      .filter(([itemId, qty]) => qty > 0 && ITEMS[itemId]?.slot === slotName)
      .map(([itemId]) => itemId);
    this._openModal(`
      <h3>🎒 Equip ${slotName}</h3>
      <div class="modal-crop-list">
        ${eligible.length ? eligible.map(itemId => {
          const item = ITEMS[itemId];
          return `<button class="modal-crop-btn" ontouchstart="" data-equip-item="${itemId}">
            <span class="crop-modal-icon">${item.icon}</span>
            <div>
              <div class="crop-modal-name">${item.name} <span class="rarity-${item.rarity}">${item.rarity}</span></div>
              <div class="crop-modal-info">${item.atk?'⚔️'+item.atk+' ':''}${item.def?'🛡️'+item.def+' ':''}${item.desc}</div>
            </div>
          </button>`;
        }).join('') : '<div class="empty-msg">Tidak ada item untuk slot ini.</div>'}
      </div>
      <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
    `);
    document.querySelectorAll('[data-equip-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = HeroSystem.equipItem(state, heroId, btn.dataset.equipItem);
        if (r.ok) { this._closeModal(); this.showToast('⚔️ Item diequip!', 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel: Inventory ──────────────────────────────────────
  _renderInventory() {
    const el    = document.getElementById('panel-inventory');
    const state = this.state.data;
    const inv   = state.inventory;
    const entries = Object.entries(inv).filter(([,q]) => q > 0);
    const types = { weapon: '⚔️ Senjata', armor: '🛡️ Armor', shield: '🔰 Perisai', accessory: '📿 Aksesori', consumable: '🧪 Konsumabel' };

    let html = `<div class="panel-header"><h2>🎒 Inventori</h2><p class="panel-sub">${entries.length} item tersimpan</p></div>`;
    if (!entries.length) {
      html += `<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Inventori Kosong</div><div class="empty-sub">Dapatkan item dari Quest, Pasar, atau Gacha!</div></div>`;
    } else {
      for (const [type, typeLabel] of Object.entries(types)) {
        const items = entries.filter(([id]) => ITEMS[id]?.type === type);
        if (!items.length) continue;
        html += `<div class="section-title">${typeLabel}</div><div class="inv-grid">`;
        for (const [itemId, qty] of items) {
          const def = ITEMS[itemId];
          if (!def) continue;
          html += `<div class="inv-card rarity-border-${def.rarity}" data-item="${itemId}">
            <div class="inv-icon">${def.icon}</div>
            <div class="inv-name">${def.name}</div>
            <div class="inv-qty">×${qty}</div>
            <div class="inv-rarity rarity-${def.rarity}">${def.rarity}</div>
          </div>`;
        }
        html += '</div>';
      }
    }
    el.innerHTML = html;

    el.querySelectorAll('[data-item]').forEach(card => {
      card.addEventListener('click', () => {
        const itemId = card.dataset.item;
        const def = ITEMS[itemId];
        const qty = inv[itemId] ?? 0;
        this._openModal(`
          <h3>${def.icon} ${def.name}</h3>
          <div class="item-detail">
            <div class="item-rarity rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="item-stat-row">
              ${def.atk ? `<span class="item-stat">⚔️ ATK +${def.atk}</span>` : ''}
              ${def.def ? `<span class="item-stat">🛡️ DEF +${def.def}</span>` : ''}
              ${def.heal ? `<span class="item-stat">❤️ HP +${def.heal}</span>` : ''}
              ${def.xpBoost ? `<span class="item-stat">✨ XP +${def.xpBoost}</span>` : ''}
            </div>
            <p class="item-desc">${def.desc}</p>
            <p class="item-qty">Jumlah: <b>${qty}</b></p>
          </div>
          <div class="modal-btns">
            ${def.slot ? `<button class="btn-primary" id="btn-equip-modal" ontouchstart="">⚔️ Equip ke Hero</button>` : ''}
            ${def.type === 'consumable' ? `<button class="btn-accent" id="btn-use-modal" ontouchstart="">✅ Gunakan</button>` : ''}
            <button class="btn-ghost" id="modal-cancel" ontouchstart="">Tutup</button>
          </div>
        `);
        document.getElementById('btn-equip-modal')?.addEventListener('click', () => {
          this._closeModal();
          this._showEquipHeroSelectModal(itemId);
        });
        document.getElementById('btn-use-modal')?.addEventListener('click', () => {
          const r = InventorySystem.useConsumable(state, itemId, null);
          if (r.ok) { this._closeModal(); this.showToast(`✅ ${def.name} digunakan!`, 'success'); this.renderAll(); this.onStateChange(); }
          else { this.showToast(r.msg, 'error'); }
        });
        document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
      });
    });
  }

  _showEquipHeroSelectModal(itemId) {
    const state = this.state.data;
    const itemDef = ITEMS[itemId];
    const heroes = Object.entries(state.heroes).filter(([,h]) => h.unlocked && h.task !== 'quest');
    this._openModal(`
      <h3>⚔️ Pilih Hero untuk Equip</h3>
      <p class="modal-sub">${itemDef.icon} ${itemDef.name}</p>
      <div class="modal-hero-list">
        ${heroes.map(([id, h]) => {
          const def = HEROES[id];
          return `<button class="modal-hero-btn" ontouchstart="" data-hero="${id}">
            <span class="hero-modal-icon">${def.icon}</span>
            <div><div class="hero-modal-name">${def.name} · Lv.${h.level}</div></div>
          </button>`;
        }).join('')}
      </div>
      <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
    `);
    document.querySelectorAll('.modal-hero-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = HeroSystem.equipItem(state, btn.dataset.hero, itemId);
        if (r.ok) { this._closeModal(); this.showToast('⚔️ Item diequip!', 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel: Crafting ───────────────────────────────────────
  _renderCrafting() {
    const el    = document.getElementById('panel-crafting');
    const state = this.state.data;
    const queue = state.crafting.queue;
    const now   = Date.now();
    el.innerHTML = `
      <div class="panel-header"><h2>🔨 Bengkel Kerajinan</h2><p class="panel-sub">Buat item dari sumber daya</p></div>
      ${queue.length ? `
        <div class="section-title">⏳ Sedang Dibuat (${queue.length}/3)</div>
        <div class="craft-queue">
          ${queue.map(job => {
            const recipe = CRAFTING_RECIPES.find(r => r.id === job.recipeId);
            const elapsed = now - job.startedAt;
            const pct = Math.min(100, (elapsed / job.duration) * 100);
            const remaining = Math.max(0, (job.duration - elapsed) / 1000);
            return `<div class="craft-queue-item">
              <span class="craft-q-icon">${recipe?.icon ?? '🔨'}</span>
              <div class="craft-q-info">
                <div class="craft-q-name">${recipe?.name}</div>
                <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
                <div class="craft-q-eta">${pct >= 100 ? '✅ Selesai!' : this._etaText(remaining)}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
      <div class="section-title">📋 Resep</div>
      <div class="craft-list">
        ${CRAFTING_RECIPES.map(recipe => {
          const canCraft = CraftSystem.canCraft(state, recipe.id);
          const queueFull = queue.length >= 3;
          const outputItem = ITEMS[recipe.output];
          return `<div class="craft-card">
            <div class="craft-output">
              <div class="craft-out-icon">${recipe.icon}</div>
              <div>
                <div class="craft-out-name">${recipe.name}</div>
                <div class="craft-out-qty">× ${recipe.outputQty} ${outputItem ? `<span class="rarity-${outputItem.rarity}">${outputItem.rarity}</span>` : ''}</div>
                <div class="craft-time">⏱ ${this._etaText(recipe.time)}</div>
              </div>
            </div>
            <div class="craft-ingredients">
              ${Object.entries(recipe.ingredients).map(([r,a]) => {
                const have = state.resources[r] ?? 0;
                return `<span class="ingr-chip ${have >= a ? '' : 'ingr-lack'}">${RESOURCES[r]?.icon ?? r}${this._fmt(a)}</span>`;
              }).join('')}
            </div>
            <button class="btn-primary btn-sm ${(canCraft && !queueFull) ? '' : 'disabled'}" ontouchstart="" data-craft="${recipe.id}">
              ${queueFull ? 'Antrian Penuh' : canCraft ? 'Buat ▶' : 'Kurang Material'}
            </button>
          </div>`;
        }).join('')}
      </div>
    `;
    el.querySelectorAll('[data-craft]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = CraftSystem.startCraft(state, btn.dataset.craft);
        if (r.ok) { this.showToast('🔨 Mulai membuat item!', 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel: Market ─────────────────────────────────────────
  _renderMarket() {
    const el    = document.getElementById('panel-market');
    const state = this.state.data;
    const discount = (state.upgrades.market_savvy ?? 0) * 0.15;
    el.innerHTML = `
      <div class="panel-header"><h2>🏪 Pasar</h2><p class="panel-sub">Beli item & jual sumber daya${discount > 0 ? ` · Diskon ${Math.round(discount*100)}%` : ''}</p></div>

      <div class="section-title">🛍️ Beli Item</div>
      <div class="market-buy-list">
        ${MARKET_BUY.map(entry => {
          const itemDef = ITEMS[entry.itemId];
          const price = {};
          for (const [r,a] of Object.entries(entry.price)) price[r] = Math.ceil(a * (1 - discount));
          const canBuy = Object.entries(price).every(([r,a]) => (state.resources[r] ?? 0) >= a);
          return `<div class="market-item-card">
            <div class="market-item-icon">${itemDef?.icon ?? '📦'}</div>
            <div class="market-item-info">
              <div class="market-item-name">${itemDef?.name} × ${entry.qty}</div>
              <div class="market-item-desc">${itemDef?.desc ?? ''}</div>
            </div>
            <div class="market-item-action">
              <div class="cost-row">${this._costRow(price, state)}</div>
              <button class="btn-primary btn-sm ${canBuy ? '' : 'disabled'}" ontouchstart="" data-buy="${entry.id}">Beli</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="section-title">💱 Jual Sumber Daya</div>
      <div class="sell-list">
        ${Object.entries(MARKET_SELL_RATES).map(([resId, rates]) => {
          const def = RESOURCES[resId];
          const qty100 = rates.goldPer100 ? 100 : 1;
          const goldGain = rates.goldPer100 ?? rates.goldPer1;
          const have = state.resources[resId] ?? 0;
          const can = have >= qty100;
          return `<div class="sell-card">
            <div class="sell-icon">${def.icon}</div>
            <div class="sell-info">
              <div class="sell-name">${def.name}</div>
              <div class="sell-rate">${rates.goldPer100 ? `100 → 💰${rates.goldPer100}` : `1 → 💰${rates.goldPer1}`}</div>
              <div class="sell-have">Kamu punya: <b>${this._fmt(have)}</b></div>
            </div>
            <div class="sell-actions">
              <button class="btn-accent btn-sm ${can ? '' : 'disabled'}" ontouchstart="" data-sell="${resId}" data-qty="${qty100}">Jual ${qty100}</button>
              ${have >= qty100 * 10 ? `<button class="btn-accent btn-sm" ontouchstart="" data-sell="${resId}" data-qty="${qty100 * 10}">Jual ${qty100 * 10}</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    el.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = MarketSystem.buy(state, btn.dataset.buy);
        if (r.ok) { this.showToast(`🛒 Berhasil dibeli!`, 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
    el.querySelectorAll('[data-sell]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = MarketSystem.sellResource(state, btn.dataset.sell, parseInt(btn.dataset.qty));
        if (r.ok) { this.showToast(`💰 Terjual +${r.goldGained} emas!`, 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel: Gacha ──────────────────────────────────────────
  _renderGacha() {
    const el    = document.getElementById('panel-gacha');
    const state = this.state.data;
    const last  = state.gacha.lastResult;
    el.innerHTML = `
      <div class="panel-header"><h2>🎰 Gacha Pelangi</h2><p class="panel-sub">Total putaran: ${state.gacha.totalSpins} · Permata: ${state.resources.gem} 💎</p></div>
      <div class="gacha-wheel">
        <div class="gacha-banner">
          <div class="gacha-banner-icons">✨🎲🏆💎🗡️🎁🌟</div>
          <div class="gacha-banner-title">Putar & Menangkan!</div>
          <div class="gacha-banner-sub">Item langka menunggumu</div>
        </div>
        <div class="gacha-btns">
          <button class="btn-gacha-single" id="btn-gacha-1" ontouchstart="">
            <span>🎲 Putar 1x</span><span class="gacha-cost">💎 10</span>
          </button>
          <button class="btn-gacha-multi" id="btn-gacha-10" ontouchstart="">
            <span>🎰 Putar 10x</span><span class="gacha-cost">💎 90 <span class="gacha-save">Hemat 10!</span></span>
          </button>
        </div>
      </div>
      <div class="section-title">📊 Peluang Drop</div>
      <div class="gacha-rates">
        ${[
          { rarity: 'common',    color: '#9e9e9e', label: 'Biasa',        pct: '55%' },
          { rarity: 'uncommon',  color: '#2ea043', label: 'Tidak Biasa',  pct: '28%' },
          { rarity: 'rare',      color: '#1f6feb', label: 'Langka',       pct: '13%' },
          { rarity: 'epic',      color: '#8957e5', label: 'Epik',         pct: '3%'  },
          { rarity: 'legendary', color: '#f5c518', label: '✨ Legendaris', pct: '1%'  },
        ].map(r => `<div class="rate-row-item"><span class="rate-dot" style="background:${r.color}"></span>${r.label}<span class="rate-pct">${r.pct}</span></div>`).join('')}
      </div>
      ${last ? `
        <div class="section-title">🎁 Hasil Terakhir</div>
        <div class="gacha-results">
          ${last.map(r => {
            const label = r.type === 'item' ? ITEMS[r.itemId]?.name : `${RESOURCES[r.resourceId]?.name} ×${r.qty}`;
            const icon  = r.type === 'item' ? ITEMS[r.itemId]?.icon : RESOURCES[r.resourceId]?.icon;
            return `<div class="gacha-result-card rarity-border-${r.rarity}">
              <div class="gacha-res-icon">${icon}</div>
              <div class="gacha-res-label">${label}</div>
              <div class="gacha-res-rarity rarity-${r.rarity}">${r.rarityLabel}</div>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
    `;
    document.getElementById('btn-gacha-1')?.addEventListener('click', () => {
      const r = GachaSystem.spin(state, 1);
      if (r.ok) { this.showToast('🎲 Dapat '+this._gachaResultLabel(r.results[0])+'!', 'success'); this.renderAll(); this.onStateChange(); }
      else { this.showToast(r.msg, 'error'); }
    });
    document.getElementById('btn-gacha-10')?.addEventListener('click', () => {
      const r = GachaSystem.spin(state, 10);
      if (r.ok) { this.showToast(`🎰 10 item didapat!`, 'success'); this.renderAll(); this.onStateChange(); }
      else { this.showToast(r.msg, 'error'); }
    });
  }

  _gachaResultLabel(r) {
    if (!r) return '';
    if (r.type === 'item') return `${ITEMS[r.itemId]?.icon} ${ITEMS[r.itemId]?.name}`;
    return `${RESOURCES[r.resourceId]?.icon} ${r.qty} ${RESOURCES[r.resourceId]?.name}`;
  }

  // ── Panel: Bonus ──────────────────────────────────────────
  _renderBonus() {
    const el    = document.getElementById('panel-bonus');
    const state = this.state.data;
    const db    = state.dailyBonus;
    const canClaim = DailySystem.canClaim(state);
    const streak   = db.streak ?? 0;
    el.innerHTML = `
      <div class="panel-header"><h2>🎁 Bonus Harian</h2><p class="panel-sub">Streak: ${streak} hari 🔥</p></div>
      <div class="daily-calendar">
        ${DAILY_REWARDS.map((r, i) => {
          const day = i + 1;
          const done = day < streak || (day === streak && !canClaim);
          const today = day === streak && canClaim;
          return `<div class="daily-day ${done ? 'day-done' : today ? 'day-today' : 'day-future'}">
            <div class="daily-day-num">Hari ${day}</div>
            <div class="daily-day-icon">${r.icon}</div>
            <div class="daily-day-reward">${Object.entries(r.rewards).map(([res,amt]) => `${RESOURCES[res]?.icon ?? res}${amt}`).join(' ')}</div>
            ${done ? '<div class="day-check">✅</div>' : ''}
          </div>`;
        }).join('')}
      </div>
      <button class="btn-primary btn-daily ${canClaim ? '' : 'disabled'}" id="btn-claim-daily" ontouchstart="">
        ${canClaim ? `🎁 Klaim Bonus Hari ${Math.min(streak+1,7)}` : '✅ Sudah diklaim hari ini'}
      </button>

      <div class="section-title">📺 Bonus Iklan (Ad Reward)</div>
      <div class="ad-reward-list">
        ${AD_REWARDS.map((ar, idx) => `
          <div class="ad-reward-card">
            <div class="ad-reward-icon">📺</div>
            <div class="ad-reward-info">
              <div class="ad-reward-name">${ar.desc}</div>
              <div class="ad-reward-sub">Tonton iklan, dapat reward gratis!</div>
            </div>
            <button class="btn-accent btn-sm" ontouchstart="" data-ad="${idx}">▶ Tonton</button>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('btn-claim-daily')?.addEventListener('click', () => {
      if (!canClaim) return;
      const r = DailySystem.claim(state);
      if (r.ok) {
        const rStr = Object.entries(r.reward.rewards).map(([res,amt]) => `${RESOURCES[res]?.icon ?? res}${amt}`).join(' ');
        this.showToast(`🎁 Bonus Hari ${r.streak}: ${rStr}`, 'success');
        this.renderAll(); this.onStateChange();
      }
    });
    el.querySelectorAll('[data-ad]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '⏳';
        // Use real AdMob or simulated ad (both no-skip, 30s)
        const adSvc = this._AdMobService;
        const result = adSvc
          ? await adSvc.showRewarded('free_item')
          : { ok: true, earned: false };
        btn.disabled = false;
        btn.textContent = '▶ Tonton';
        if (result.earned || (!adSvc)) {
          // For browser without AdMob, the simulate already blocks until complete
          const r = DailySystem.claimAdReward(state);
          if (r.ok) {
            this.showToast(`📺 Reward: ${r.reward.desc}!`, 'success');
            this.renderAll(); this.onStateChange();
          }
        }
      });
    });
  }

  // ── Panel: Battle ─────────────────────────────────────────
  _renderBattle() {
    const el    = document.getElementById('panel-battle');
    const state = this.state.data;
    const totalUnits = ArmySystem.totalUnits(state);
    const totalPower = ArmySystem.totalPower(state);
    const last  = state.lastBattleResult;
    const recruiting = state.armyRecruiting;
    const now = Date.now();

    el.innerHTML = `
      <div class="panel-header"><h2>🗡️ Pertempuran</h2><p class="panel-sub">Rekrut pasukan & serang kerajaan musuh</p></div>

      <div class="army-overview">
        <div class="army-stat"><span class="army-stat-val">${totalUnits}</span><span class="army-stat-label">Total Pasukan</span></div>
        <div class="army-stat"><span class="army-stat-val">${totalPower}</span><span class="army-stat-label">Kekuatan</span></div>
        <div class="army-stat"><span class="army-stat-val">${state.stats.battlesWon}</span><span class="army-stat-label">Menang</span></div>
        <div class="army-stat"><span class="army-stat-val">${state.stats.battlesLost}</span><span class="army-stat-label">Kalah</span></div>
      </div>

      <div class="section-title">⚔️ Pasukan Aktif</div>
      <div class="army-units-grid">
        ${Object.entries(ARMY_UNITS).map(([unitId, def]) => {
          const count = state.army[unitId] ?? 0;
          const recJob = recruiting.find(j => j.unitId === unitId);
          const recPct = recJob ? Math.min(100, ((now - recJob.startedAt) / recJob.duration) * 100) : 0;
          const canAfford = Object.entries(def.cost).every(([r,a]) => (state.resources[r] ?? 0) >= a);
          return `<div class="unit-card">
            <div class="unit-icon">${def.icon}</div>
            <div class="unit-info">
              <div class="unit-name">${def.name}</div>
              <div class="unit-count">×${count}</div>
              <div class="unit-stats">⚔️${def.atk} 🛡️${def.def} ❤️${def.hp}</div>
              ${recJob ? `<div class="quest-bar" style="margin-top:4px"><div class="quest-fill" style="width:${recPct}%"></div></div>` : ''}
              <div class="cost-row small">${this._costRow(def.cost, state)}</div>
            </div>
            <div class="unit-actions">
              <button class="btn-primary btn-sm ${canAfford && !recJob ? '' : 'disabled'}" ontouchstart="" data-recruit="${unitId}" data-count="1">+1</button>
              <button class="btn-accent btn-sm ${canAfford && !recJob ? '' : 'disabled'}" ontouchstart="" data-recruit="${unitId}" data-count="5">+5</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="section-title">🏰 Kerajaan Musuh</div>
      <div class="kingdom-list">
        ${AI_KINGDOMS.map(k => {
          const hasEnough = totalUnits >= k.minArmy;
          let enemyPower = 0;
          for (const [uid, cnt] of Object.entries(k.army)) {
            const d = ARMY_UNITS[uid];
            if (d) enemyPower += (d.atk + d.def) * cnt;
          }
          return `<div class="kingdom-card diff-${k.difficulty}">
            <div class="kingdom-icon">${k.icon}</div>
            <div class="kingdom-info">
              <div class="kingdom-name">${k.name}</div>
              <div class="kingdom-diff">${'★'.repeat(k.difficulty)}${'☆'.repeat(5-k.difficulty)} · Kekuatan Musuh: ${enemyPower}</div>
              <div class="kingdom-army">${Object.entries(k.army).map(([uid,cnt]) => `${ARMY_UNITS[uid]?.icon}×${cnt}`).join(' ')}</div>
              <div class="kingdom-reward">Reward: ${Object.entries(k.reward).map(([r,a]) => `${RESOURCES[r]?.icon ?? r}${a}`).join(' ')}</div>
              <div class="kingdom-req ${hasEnough ? 'req-ok' : 'req-fail'}">
                ${hasEnough ? '✅ Siap menyerang' : `⚠️ Butuh min ${k.minArmy} pasukan`}
              </div>
            </div>
            <button class="btn-battle ${hasEnough ? '' : 'disabled'}" ontouchstart="" data-attack="${k.id}">
              ${hasEnough ? '⚔️ Serang!' : '🔒'}
            </button>
          </div>`;
        }).join('')}
      </div>

      ${last ? `
        <div class="section-title">${last.won ? '🏆 Kemenangan Terakhir' : '💀 Kekalahan Terakhir'}</div>
        <div class="battle-log ${last.won ? 'battle-won' : 'battle-lost'}">
          ${last.log.map(l => `<div class="log-line">${l}</div>`).join('')}
        </div>
      ` : ''}
    `;

    el.querySelectorAll('[data-recruit]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = ArmySystem.recruit(state, btn.dataset.recruit, parseInt(btn.dataset.count));
        if (r.ok) { this.showToast(`⚔️ Merekrut pasukan...`, 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
    el.querySelectorAll('[data-attack]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const kingdom = AI_KINGDOMS.find(k => k.id === btn.dataset.attack);
        this._openModal(`
          <h3>⚔️ Konfirmasi Serangan</h3>
          <p class="modal-sub">Menyerang: ${kingdom?.icon} ${kingdom?.name}</p>
          <p class="modal-warn">Pasukanmu: ${totalUnits} unit (Kekuatan: ${totalPower})<br>Ada risiko kehilangan pasukan!</p>
          <div class="modal-btns">
            <button class="btn-battle" id="confirm-attack" ontouchstart="">⚔️ Serang!</button>
            <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
          </div>
        `);
        document.getElementById('confirm-attack')?.addEventListener('click', () => {
          this._closeModal();
          const r = ArmySystem.attack(state, btn.dataset.attack);
          if (r.ok) {
            this._showBattleResult(r, { ...state.army }, kingdom);
            this._checkAchievements();
            this.onStateChange();
          }
        });
        document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
      });
    });
  }

  _showBattleResult(r, myArmy, kingdom) {
    // Use visual battle simulation if available
    if (this._BattleSim && myArmy && kingdom) {
      this._BattleSim.show(myArmy, kingdom, r, () => {
        this._renderBattle();
      });
    } else {
      // Fallback: text modal
      const rewardStr = Object.entries(r.reward ?? {}).map(([res,amt]) => `${RESOURCES[res]?.icon ?? res}${amt}`).join(' ');
      this._openModal(`
        <h3>${r.won ? '🏆 MENANG!' : '💀 KALAH!'}</h3>
        <div class="battle-result-${r.won ? 'won' : 'lost'}">
          <div class="battle-power">⚔️ Pasukanmu: ${r.power?.mine ?? '-'} vs 👹 Musuh: ${r.power?.enemy ?? '-'}</div>
          <div class="battle-log-modal">
            ${(r.log ?? []).map(l => `<div class="log-line">${l}</div>`).join('')}
          </div>
          ${r.won ? `<div class="battle-reward">💰 Reward: ${rewardStr}</div>` : '<div class="battle-loss">😢 Kehilangan beberapa pasukan & resource</div>'}
        </div>
        <button class="btn-primary" id="modal-cancel" ontouchstart="">OK</button>
      `);
      document.getElementById('modal-cancel')?.addEventListener('click', () => { this._closeModal(); this._renderBattle(); });
    }
  }

  // ── Panel: Map ────────────────────────────────────────────
  _renderMap() {
    const el    = document.getElementById('panel-map');
    const state = this.state.data;
    el.innerHTML = `
      <div class="panel-header"><h2>🗺️ Peta Dunia</h2><p class="panel-sub">Jelajahi wilayah Indofarm</p></div>
      <div class="world-map">
        <div class="map-canvas">
          <div class="map-bg">
            ${MAP_ZONES.map(zone => `
              <div class="map-zone ${zone.unlocked ? 'zone-unlocked' : 'zone-locked'}"
                   style="left:${zone.pos.x}%;top:${zone.pos.y}%;"
                   data-zone="${zone.id}">
                <div class="zone-icon-wrap" style="border-color:${zone.color}">
                  <span class="zone-icon">${zone.icon}</span>
                </div>
                <div class="zone-label">${zone.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="section-title">📍 Daftar Zona</div>
      <div class="zone-list">
        ${MAP_ZONES.map(zone => `
          <div class="zone-item ${zone.unlocked ? '' : 'zone-item-locked'}" data-zone-info="${zone.id}">
            <div class="zone-item-icon" style="color:${zone.color}">${zone.icon}</div>
            <div class="zone-item-info">
              <div class="zone-item-name">${zone.name} ${zone.unlocked ? '' : '🔒'}</div>
              <div class="zone-item-desc">${zone.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    el.querySelectorAll('[data-zone], [data-zone-info]').forEach(el2 => {
      el2.addEventListener('click', () => {
        const zoneId = el2.dataset.zone ?? el2.dataset.zoneInfo;
        const zone = MAP_ZONES.find(z => z.id === zoneId);
        if (!zone) return;
        this._openModal(`
          <h3>${zone.icon} ${zone.name}</h3>
          <p class="modal-sub">${zone.unlocked ? '✅ Terbuka' : '🔒 Terkunci'}</p>
          <p class="modal-warn">${zone.desc}</p>
          <button class="btn-ghost" id="modal-cancel" ontouchstart="">Tutup</button>
        `);
        document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
      });
    });
  }

  // ── Panel: Upgrade ────────────────────────────────────────
  _renderUpgrade() {
    const el    = document.getElementById('panel-upgrade');
    const state = this.state.data;
    el.innerHTML = `
      <div class="panel-header"><h2>⬆️ Upgrade</h2><p class="panel-sub">Tingkatkan efisiensi dan kapasitas</p></div>
      <div class="upgrade-list">
        ${UPGRADES.map(u => {
          const cur = state.upgrades[u.id] ?? 0;
          const maxed = cur >= u.maxLevel;
          const cost = maxed ? {} : UpgradeSystem.getCost(u.id, cur);
          const can  = !maxed && Object.entries(cost).every(([r,a]) => state.resources[r] >= a);
          return `<div class="upgrade-card">
            <div class="upgrade-icon">${u.icon}</div>
            <div class="upgrade-info">
              <div class="upgrade-name">${u.name}</div>
              <div class="upgrade-desc">${u.description}</div>
              <div class="upgrade-level">Lv.${cur}/${u.maxLevel}</div>
            </div>
            <div class="upgrade-action">
              ${maxed ? '<div class="badge-maxed">MAX</div>' : `
                <div class="cost-row small">${this._costRow(cost, state)}</div>
                <button class="btn-primary btn-sm ${can ? '' : 'disabled'}" ontouchstart="" data-upgrade-id="${u.id}">Beli</button>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    el.querySelectorAll('[data-upgrade-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = UpgradeSystem.buy(state, btn.dataset.upgradeId);
        if (r.ok) { this.showToast(`⬆️ Upgrade berhasil!`, 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel: Prestige ───────────────────────────────────────
  _renderPrestige() {
    const el    = document.getElementById('panel-prestige');
    const state = this.state.data;
    const can   = PrestigeSystem.canPrestige(state);
    el.innerHTML = `
      <div class="panel-header"><h2>🔄 Prestige</h2><p class="panel-sub">Reset & mulai lebih kuat · Level ${state.prestigeLevel}</p></div>
      <div class="prestige-status ${can ? 'prestige-ready' : ''}">
        ${can ? '<div class="prestige-ready-text">✨ Kamu siap Prestige! Naga telah dikalahkan.</div>'
              : '<div class="prestige-req">🐉 Selesaikan Quest <b>Sarang Naga</b> untuk membuka Prestige.</div>'}
        <button class="btn-prestige ${can ? '' : 'disabled'}" ontouchstart="" id="btn-prestige">🔄 Lakukan Prestige</button>
        <div class="prestige-points">Poin Prestige: <b>${state.prestigePoints}</b> tersedia</div>
      </div>
      <div class="section-title">🌟 Bonus Prestige Permanen</div>
      <div class="prestige-bonus-list">
        ${PRESTIGE_BONUSES.map(b => {
          const cur = state.prestigeBonuses[b.id] ?? 0;
          const maxed = cur >= b.maxLevel;
          const canBuy = !maxed && state.prestigePoints >= b.cost;
          return `<div class="prestige-bonus-card">
            <div class="prestige-bonus-icon">${b.icon}</div>
            <div class="prestige-bonus-info">
              <div class="prestige-bonus-name">${b.name}</div>
              <div class="prestige-bonus-desc">${b.description}</div>
              <div class="prestige-bonus-level">Lv.${cur}/${b.maxLevel}</div>
            </div>
            <div class="prestige-bonus-action">
              ${maxed ? '<div class="badge-maxed">MAX</div>' : `
                <div class="cost-prestige">${b.cost} poin</div>
                <button class="btn-primary btn-sm ${canBuy ? '' : 'disabled'}" ontouchstart="" data-buy-bonus="${b.id}">Beli</button>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    document.getElementById('btn-prestige')?.addEventListener('click', () => {
      if (!can) return;
      this._openModal(`
        <h3>🔄 Konfirmasi Prestige</h3>
        <p class="modal-warn">⚠️ Bangunan, resource, dan ladang direset.<br>Hero, item, upgrade & pencapaian tetap!</p>
        <div class="modal-btns">
          <button class="btn-prestige" id="confirm-prestige" ontouchstart="">Ya, Prestige!</button>
          <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
        </div>
      `);
      document.getElementById('confirm-prestige')?.addEventListener('click', () => {
        const r = PrestigeSystem.doPrestige(state);
        this._closeModal();
        if (r.ok) { this.showToast(`🌟 Prestige Level ${r.level}!`, 'success'); this.renderAll(); this.onStateChange(); }
      });
      document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
    });
    el.querySelectorAll('[data-buy-bonus]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = PrestigeSystem.buyBonus(state, btn.dataset.buyBonus);
        if (r.ok) { this.showToast('🌟 Bonus prestige dibeli!', 'success'); this.renderAll(); this.onStateChange(); }
        else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel: Achievement ────────────────────────────────────
  _renderAchievement() {
    const el    = document.getElementById('panel-achievement');
    const state = this.state.data;
    const total = ACHIEVEMENTS.length;
    const done  = ACHIEVEMENTS.filter(a => state.achievements[a.id]?.unlocked).length;
    el.innerHTML = `
      <div class="panel-header"><h2>🏆 Pencapaian</h2><p class="panel-sub">${done}/${total} terbuka</p></div>
      <div class="achieve-progress-bar">
        <div class="achieve-fill" style="width:${Math.round((done/total)*100)}%"></div>
      </div>
      <div class="achieve-list">
        ${ACHIEVEMENTS.map(ach => {
          const achState = state.achievements[ach.id];
          const unlocked = achState?.unlocked;
          const req = ach.req;
          const cur = req.stat ? (state.stats[req.stat] ?? 0) : 0;
          const pct = req.val ? Math.min(100, Math.floor((cur / req.val) * 100)) : (unlocked ? 100 : 0);
          return `<div class="achieve-card ${unlocked ? 'achieve-done' : ''}">
            <div class="achieve-icon ${unlocked ? '' : 'achieve-locked-icon'}">${ach.icon}</div>
            <div class="achieve-info">
              <div class="achieve-name">${ach.name} ${unlocked ? '✅' : ''}</div>
              <div class="achieve-desc">${ach.desc}</div>
              ${!unlocked ? `
                <div class="achieve-prog-bar"><div class="achieve-prog-fill" style="width:${pct}%"></div></div>
                <div class="achieve-prog-text">${cur >= req.val ? req.val : cur}/${req.val ?? 1}</div>
              ` : `<div class="achieve-reward-line">Reward: ${Object.entries(ach.reward).map(([r,a])=>`${RESOURCES[r]?.icon}${a}`).join(' ')}</div>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  // ── Panel: Stats ──────────────────────────────────────────
  _renderStats() {
    const el    = document.getElementById('panel-stats');
    const state = this.state.data;
    const s     = state.stats;
    const t     = s.playTimeSec;
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60);
    const builtCount = Object.keys(state.buildings).length;
    const heroCount  = Object.values(state.heroes).filter(h => h.unlocked).length;
    const invCount   = Object.values(state.inventory).reduce((a,b) => a+b, 0);
    const statCards = [
      { icon: '⏰', label: 'Waktu Bermain',      val: h > 0 ? `${h}j ${m}m` : `${m}m` },
      { icon: '🌾', label: 'Total Gandum Panen', val: this._fmt(s.totalWheatHarvested) },
      { icon: '💰', label: 'Total Emas Diraih',  val: this._fmt(s.totalGoldEarned) },
      { icon: '⚔️', label: 'Quest Selesai',      val: s.totalQuestsCompleted },
      { icon: '🏰', label: 'Bangunan Dibangun',  val: builtCount },
      { icon: '👤', label: 'Hero Terbuka',       val: heroCount },
      { icon: '🎒', label: 'Item di Inventori',  val: invCount },
      { icon: '🔨', label: 'Item Dibuat',        val: s.itemsCrafted },
      { icon: '🗡️', label: 'Pertempuran Menang', val: s.battlesWon },
      { icon: '💀', label: 'Pertempuran Kalah',  val: s.battlesLost },
      { icon: '🎰', label: 'Total Spin Gacha',   val: s.gachaSpins },
      { icon: '🔄', label: 'Total Prestige',     val: s.totalPrestige },
      { icon: '🔥', label: 'Login Streak Max',   val: state.dailyBonus.maxStreak ?? 0 },
      { icon: '💎', label: 'Prestige Level',     val: state.prestigeLevel },
    ];
    el.innerHTML = `
      <div class="panel-header"><h2>📊 Statistik</h2><p class="panel-sub">Rekam jejakmu di Indofarm</p></div>
      <div class="stats-grid">
        ${statCards.map(c => `
          <div class="stat-card">
            <div class="stat-icon">${c.icon}</div>
            <div class="stat-val">${c.val}</div>
            <div class="stat-label">${c.label}</div>
          </div>
        `).join('')}
      </div>
      <div class="section-title">💎 Resource Saat Ini</div>
      <div class="res-stat-list">
        ${Object.entries(RESOURCES).map(([id, def]) => `
          <div class="res-stat-row">
            <span class="res-stat-icon">${def.icon}</span>
            <span class="res-stat-name">${def.name}</span>
            <div class="res-stat-bar-wrap">
              <div class="res-stat-bar">
                <div class="res-stat-fill" style="width:${Math.min(100, ((state.resources[id]??0)/state.maxResources[id])*100)}%;background:${def.color}"></div>
              </div>
            </div>
            <span class="res-stat-val">${this._fmt(state.resources[id]??0)}/${this._fmt(state.maxResources[id])}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Panel: Settings ───────────────────────────────────────
  _renderSettings() {
    const el    = document.getElementById('panel-settings');
    const state = this.state.data;
    const s     = state.settings;
    const user  = state.cloudUser;
    const hero  = state.selectedHero;

    el.innerHTML = `
      <div class="panel-header"><h2>⚙️ Pengaturan</h2><p class="panel-sub">Preferensi & opsi game</p></div>

      <div class="section-title">👤 Akun</div>
      ${user
        ? `<div class="account-card">
             <img src="${user.photoURL || ''}" class="acct-avatar" onerror="this.style.display='none'">
             <div class="acct-info">
               <div class="acct-name">${user.displayName || 'Petualang'}</div>
               <div class="acct-email">${user.email || ''}</div>
               <div class="acct-cloud-badge">☁️ Cloud Save Aktif</div>
             </div>
           </div>
           <div class="settings-list" style="margin-top:10px">
             <div class="setting-item">
               <div class="setting-info"><div class="setting-name">☁️ Sinkron Cloud</div><div class="setting-desc">Upload progres ke Google Cloud sekarang</div></div>
               <button class="btn-accent btn-sm" id="btn-cloud-save" ontouchstart="">☁️ Sync</button>
             </div>
             <div class="setting-item">
               <div class="setting-info"><div class="setting-name">🚪 Logout</div><div class="setting-desc">Keluar dari akun Google</div></div>
               <button class="btn-danger btn-sm" id="btn-logout" ontouchstart="">Logout</button>
             </div>
           </div>`
        : `<div class="account-card">
             <span style="font-size:2rem">🎮</span>
             <div style="flex:1;margin-left:12px;">
               <div class="acct-name">Mode Tamu</div>
               <div class="acct-email">Progres hanya tersimpan di perangkat ini.</div>
               <div style="font-size:0.7rem;color:#484f58;margin-top:4px;">Login Google untuk cloud save & sinkron antar perangkat.</div>
             </div>
           </div>`
      }

      ${hero ? `
      <div class="section-title">⚔️ Tokoh Utama</div>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">${this._getHeroName(hero)}</div>
            <div class="setting-desc">Dipilih di lobby sebagai pemimpin pasukan</div>
          </div>
          <span class="setting-val" style="font-size:1.4rem">${this._getHeroIcon(hero)}</span>
        </div>
      </div>` : ''}

      <div class="section-title">🔊 Audio</div>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info"><div class="setting-name">🔊 Suara Efek</div><div class="setting-desc">Suara saat aksi dalam game</div></div>
          <div class="toggle-wrap"><div class="toggle ${s.soundOn ? 'toggle-on' : ''}" id="tog-sound"></div></div>
        </div>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-name">🎵 Musik</div><div class="setting-desc">Musik latar belakang game</div></div>
          <div class="toggle-wrap"><div class="toggle ${s.musicOn ? 'toggle-on' : ''}" id="tog-music"></div></div>
        </div>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-name">🔔 Notifikasi</div><div class="setting-desc">Pengingat bonus & quest selesai</div></div>
          <div class="toggle-wrap"><div class="toggle ${s.notifOn ? 'toggle-on' : ''}" id="tog-notif"></div></div>
        </div>
      </div>

      <div class="section-title">💾 Data Game</div>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info"><div class="setting-name">💾 Simpan Lokal</div><div class="setting-desc">Simpan progres ke perangkat sekarang</div></div>
          <button class="btn-primary btn-sm" id="btn-manual-save" ontouchstart="">💾 Simpan</button>
        </div>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-name">ℹ️ Versi Game</div><div class="setting-desc">IndoFarm Adventure v2.0</div></div>
          <span class="setting-val">v2.0</span>
        </div>
      </div>

      <div class="section-title">⚠️ Zona Berbahaya</div>
      <div class="settings-list">
        <div class="setting-item danger-zone">
          <div class="setting-info"><div class="setting-name">🗑️ Reset Game</div><div class="setting-desc">Hapus semua progres. Tidak bisa dibatalkan!</div></div>
          <button class="btn-danger btn-sm" id="btn-reset" ontouchstart="">Reset</button>
        </div>
      </div>

      <div class="section-title">📖 Tentang Game</div>
      <div class="about-card">
        <div class="about-title">🏰 INDOFARM ADVENTURE</div>
        <div class="about-sub">Game Idle Farm RPG Android v2.0</div>
        <div class="about-info">Developer: kdsmedia<br>Engine: Three.js + Capacitor.js<br>Auth: Firebase (Google Sign-In)<br>Cloud: Firestore (free tier)<br>Ads: AdMob Rewarded (no-skip)<br>Asset: KayKit · Stylized Nature · Medieval Village<br>Platform: Android 7.0+</div>
      </div>
    `;

    ['sound','music','notif'].forEach(key => {
      document.getElementById(`tog-${key}`)?.addEventListener('click', function() {
        this.classList.toggle('toggle-on');
        state.settings[`${key}On`] = this.classList.contains('toggle-on');
      });
    });
    document.getElementById('btn-manual-save')?.addEventListener('click', () => {
      this.state.save();
      this.showToast('💾 Tersimpan!', 'success');
    });
    document.getElementById('btn-cloud-save')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-cloud-save');
      if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
      try {
        const { FirebaseService } = await import('./firebase.js');
        const ok = await FirebaseService.saveToCloud(state);
        this.showToast(ok ? '☁️ Tersimpan ke cloud!' : '⚠️ Cloud save gagal', ok ? 'success' : 'error');
      } catch (_) { this.showToast('⚠️ Cloud save gagal', 'error'); }
      if (btn) { btn.disabled = false; btn.textContent = '☁️ Sync'; }
    });
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      const { FirebaseService } = await import('./firebase.js');
      await FirebaseService.signOut();
      state.cloudUser = null;
      this.state.save();
      this.showToast('👋 Logged out', 'info');
      this._renderSettings();
    });
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      this._openModal(`
        <h3>🗑️ Reset Game</h3>
        <p class="modal-warn">⚠️ Semua progres akan dihapus permanen. Yakin?</p>
        <div class="modal-btns">
          <button class="btn-danger" id="confirm-reset" ontouchstart="">Ya, Hapus Semua</button>
          <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
        </div>
      `);
      document.getElementById('confirm-reset')?.addEventListener('click', () => {
        this.state.hardReset();
        this._closeModal();
        this.showToast('🗑️ Game direset!', 'info');
        location.reload();
      });
      document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
    });
  }

  // Helper: get hero icon & name from selected hero id
  _getHeroIcon(heroId) {
    const icons = { barbarian:'🪓', knight:'🛡️', mage:'🔮', ranger:'🏹', rogue:'🗡️', rogue_hooded:'🥷' };
    return icons[heroId] ?? '⚔️';
  }
  _getHeroName(heroId) {
    const names = { barbarian:'Barbarian', knight:'Ksatria', mage:'Penyihir', ranger:'Pemburu', rogue:'Pencuri', rogue_hooded:'Rogue Bertopeng' };
    return names[heroId] ?? heroId;
  }

  // ── Offline Dialog ────────────────────────────────────────
  showOfflineDialog(offlineGain, effectiveSec) {
    const h = Math.floor(effectiveSec / 3600), m = Math.floor((effectiveSec % 3600) / 60);
    const timeStr = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
    const gainRows = Object.entries(offlineGain).filter(([,a]) => a > 0)
      .map(([r, a]) => `<div class="offline-row">${RESOURCES[r]?.icon ?? r} +${this._fmt(a)} ${RESOURCES[r]?.name ?? r}</div>`)
      .join('');
    this._openModal(`
      <h3>⏰ Selamat Datang Kembali!</h3>
      <p class="modal-sub">Kamu pergi selama <b>${timeStr}</b></p>
      <div class="offline-gains">${gainRows || '<div class="empty-msg">Belum ada bangunan produksi.</div>'}</div>
      <button class="btn-primary" id="modal-ok" ontouchstart="">Klaim!</button>
    `);
    document.getElementById('modal-ok')?.addEventListener('click', () => this._closeModal());
  }

  // ── Achievement Check & Popup ─────────────────────────────
  _checkAchievements() {
    const newOnes = AchievementSystem.check(this.state.data);
    newOnes.forEach(ach => this._popAchievement(ach));
  }

  _popAchievement(ach) {
    const el = document.getElementById('achieve-pop');
    if (!el) return;
    el.innerHTML = `<div class="achieve-pop-inner">🏆 <b>${ach.name}</b> terbuka! ${Object.entries(ach.reward).map(([r,a])=>`+${a}${RESOURCES[r]?.icon??r}`).join(' ')}</div>`;
    el.classList.add('achieve-pop-show');
    setTimeout(() => el.classList.remove('achieve-pop-show'), 3500);
  }

  // ── Toast ─────────────────────────────────────────────────
  showToast(msg, type = 'info') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'toast-show toast-' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.className = ''; }, 2800);
  }

  // ── Modal ─────────────────────────────────────────────────
  _openModal(html) {
    const backdrop = document.getElementById('modal-backdrop');
    const box      = document.getElementById('modal-box');
    if (!backdrop || !box) return;
    box.innerHTML = html;
    backdrop.style.display = 'block';
    box.style.display = 'flex';
    backdrop.onclick = () => this._closeModal();
  }

  _closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const box      = document.getElementById('modal-box');
    if (backdrop) backdrop.style.display = 'none';
    if (box) { box.style.display = 'none'; box.innerHTML = ''; }
  }

  // ── Helpers ───────────────────────────────────────────────
  _fmt(n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n/1000).toFixed(1) + 'K';
    return n.toString();
  }

  _etaText(sec) {
    if (sec <= 0) return '✅';
    sec = Math.ceil(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}j ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}d`;
  }

  _costRow(costs, state) {
    if (!costs) return '';
    return Object.entries(costs).map(([r, a]) => {
      const have = state?.resources[r] ?? 0;
      const ok   = have >= a;
      return `<span class="cost-item ${ok ? '' : 'cost-lack'}">${RESOURCES[r]?.icon ?? r}${this._fmt(a)}</span>`;
    }).join('');
  }

  _prodText(def) {
    const parts = [];
    if (def.production) for (const [r, rate] of Object.entries(def.production)) {
      if (rate > 0) parts.push(`+${rate}/s ${RESOURCES[r]?.icon ?? r}`);
    }
    if (def.bonus) for (const [b, v] of Object.entries(def.bonus)) {
      parts.push(`+${Math.round(v*100)}% ${b}`);
    }
    return parts.join(' · ') || '';
  }

  onStateChange() {
    if (this._onStateChangeCb) this._onStateChangeCb();
  }

  set onStateChange(cb) { this._onStateChangeCb = cb; }
  get onStateChange()   { return this._onStateChangeCb; }
}
