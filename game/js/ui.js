// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — UI Manager (Mobile-first, Touch Android)
// ═══════════════════════════════════════════════════════════════

import { RESOURCES, BUILDINGS, CROPS, QUESTS, HEROES, UPGRADES, PRESTIGE_BONUSES, xpToNextLevel } from './data.js';
import { FarmSystem, BuildSystem, QuestSystem, HeroSystem, UpgradeSystem, PrestigeSystem } from './systems.js';

export class GameUI {
  constructor(state, engine, onStateChange) {
    this.state         = state;
    this.engine        = engine;
    this.onStateChange = onStateChange;  // callback setelah state berubah
    this.activePanel   = 'farm';
    this.selectedPlot  = null;
    this.toast         = null;
  }

  init() {
    this._buildSkeleton();
    this._bindNavTabs();
    this._bindSearch();
    this.renderAll();
  }

  // ── Skeleton HTML ─────────────────────────────────────────────
  _buildSkeleton() {
    document.getElementById('app').innerHTML = `
      <!-- HUD Sumber Daya -->
      <div id="hud">
        <div class="hud-resources" id="hud-resources"></div>
        <div class="hud-right">
          <span id="hud-time" class="hud-time"></span>
          <button class="hud-save" id="btn-save" ontouchstart="">💾</button>
        </div>
      </div>

      <!-- Dunia 3D -->
      <div id="world-wrap">
        <canvas id="game-canvas"></canvas>
        <div id="world-overlay">
          <div id="loading-bar"><div id="loading-fill"></div></div>
          <div id="loading-text">Memuat dunia...</div>
        </div>
      </div>

      <!-- Panel Konten -->
      <div id="panel-wrap">
        <div id="panel-farm"     class="panel active"></div>
        <div id="panel-build"    class="panel"></div>
        <div id="panel-quest"    class="panel"></div>
        <div id="panel-heroes"   class="panel"></div>
        <div id="panel-upgrade"  class="panel"></div>
        <div id="panel-prestige" class="panel"></div>
      </div>

      <!-- Tab Bar Bawah (Android-style) -->
      <nav id="tab-bar">
        <button class="tab-btn active" data-panel="farm"     ontouchstart="">🌾<span>Farm</span></button>
        <button class="tab-btn"        data-panel="build"    ontouchstart="">🏰<span>Bangun</span></button>
        <button class="tab-btn"        data-panel="quest"    ontouchstart="">⚔️<span>Quest</span></button>
        <button class="tab-btn"        data-panel="heroes"   ontouchstart="">👤<span>Hero</span></button>
        <button class="tab-btn"        data-panel="upgrade"  ontouchstart="">⬆️<span>Upgrade</span></button>
        <button class="tab-btn"        data-panel="prestige" ontouchstart="">🔄<span>Prestige</span></button>
      </nav>

      <!-- Toast Notifikasi -->
      <div id="toast"></div>

      <!-- Modal Backdrop -->
      <div id="modal-backdrop" style="display:none"></div>
      <div id="modal-box" style="display:none"></div>
    `;

    document.getElementById('btn-save').addEventListener('click', () => {
      this.state.save();
      this.showToast('💾 Game tersimpan!', 'success');
    });
  }

  // ── Nav Tabs ──────────────────────────────────────────────────
  _bindNavTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePanel = btn.dataset.panel;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + this.activePanel).classList.add('active');
        this.renderPanel(this.activePanel);
      });
    });
  }

  _bindSearch() { /* search placeholder */ }

  // ── Render All ────────────────────────────────────────────────
  renderAll() {
    this._renderHUD();
    this.renderPanel(this.activePanel);
    this._updateWorldSync();
  }

  renderPanel(name) {
    switch (name) {
      case 'farm':     this._renderFarm();     break;
      case 'build':    this._renderBuild();    break;
      case 'quest':    this._renderQuest();    break;
      case 'heroes':   this._renderHeroes();   break;
      case 'upgrade':  this._renderUpgrade();  break;
      case 'prestige': this._renderPrestige(); break;
    }
  }

  // ── HUD ───────────────────────────────────────────────────────
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

    // Play time
    const t = this.state.data.stats.playTimeSec;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const timeEl = document.getElementById('hud-time');
    if (timeEl) timeEl.textContent = h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  // ── Panel Farm ────────────────────────────────────────────────
  _renderFarm() {
    const el    = document.getElementById('panel-farm');
    const state = this.state.data;
    const plots = state.farm.plots;

    const stageLabel = ['🌑 Kosong', '🌱 Baru Tanam', '🌿 Tunas', '🌾 Tumbuh', '✨ Siap Panen!'];

    el.innerHTML = `
      <div class="panel-header">
        <h2>🌾 Ladang</h2>
        <p class="panel-sub">Tanam & panen untuk dapat gandum</p>
      </div>
      <div class="farm-grid" id="farm-grid">
        ${plots.map((plot, i) => this._farmPlotCard(plot, i, stageLabel)).join('')}
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

    // Events plot
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
            this.renderAll();
            this.onStateChange();
          }
        }
      });
    });

    // Events unlock crop
    el.querySelectorAll('[data-unlock-crop]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.dataset.unlockCrop;
        const r = FarmSystem.unlockCrop(state, cropId);
        if (r.ok) {
          this.showToast(`🌱 ${CROPS[cropId]?.name} berhasil dibuka!`, 'success');
          this.renderAll(); this.onStateChange();
        } else {
          this.showToast(r.msg ?? 'Sumber daya tidak cukup', 'error');
        }
      });
    });
  }

  _farmPlotCard(plot, i, stageLabel) {
    const harvestable = FarmSystem._isHarvestable(plot);
    const cropDef = plot.crop ? CROPS[plot.crop] : null;
    const pct     = cropDef ? Math.round((plot.stage / cropDef.stages) * 100) : 0;

    if (!plot.crop) {
      return `<div class="farm-plot empty" data-plot="${i}">
        <div class="plot-icon">➕</div>
        <div class="plot-label">Tanam</div>
      </div>`;
    }
    return `<div class="farm-plot ${harvestable ? 'harvestable pulse' : 'growing'}" data-plot="${i}">
      <div class="plot-icon">${cropDef?.icon ?? '🌾'}</div>
      <div class="plot-stage">${stageLabel[plot.stage] ?? ''}</div>
      <div class="plot-bar"><div class="plot-fill" style="width:${pct}%"></div></div>
      ${harvestable ? '<div class="plot-tap">Tap panen!</div>' : ''}
    </div>`;
  }

  _showPlantModal(plotIndex) {
    const state = this.state.data;
    const crops = state.farm.unlockedCrops.map(id => CROPS[id]).filter(Boolean);

    this._openModal(`
      <h3>🌱 Pilih Tanaman</h3>
      <div class="modal-crop-list">
        ${crops.map(c => `
          <button class="modal-crop-btn" ontouchstart="" data-crop="${Object.keys(CROPS).find(k => CROPS[k] === c)}">
            <span class="crop-modal-icon">${c.icon}</span>
            <div>
              <div class="crop-modal-name">${c.name}</div>
              <div class="crop-modal-info">⏱ ${c.stageDuration * c.stages}s — 🌾 ${c.yield}</div>
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
        } else {
          this.showToast(r.msg, 'error');
        }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel Build ───────────────────────────────────────────────
  _renderBuild() {
    const el    = document.getElementById('panel-build');
    const state = this.state.data;

    el.innerHTML = `
      <div class="panel-header">
        <h2>🏰 Bangunan</h2>
        <p class="panel-sub">Bangun & upgrade untuk tingkatkan produksi</p>
      </div>
      <div class="build-list">
        ${Object.entries(BUILDINGS).map(([id, def]) => {
          const bState = state.buildings[id];
          const built  = !!bState;
          const level  = bState?.level ?? 0;
          const maxed  = level >= def.maxLevel;
          const upgCost = built ? BuildSystem.upgradeCost(def, level) : null;
          const canBuild = !built && Object.entries(def.cost).every(([r,a]) => state.resources[r] >= a);
          const canUpg   = built && !maxed && BuildSystem.canAffordUpgrade(state, id);

          return `<div class="build-card ${built ? 'built' : ''}">
            <div class="build-icon">${def.icon}</div>
            <div class="build-info">
              <div class="build-name">${def.name}</div>
              <div class="build-desc">${def.description}</div>
              ${built ? `<div class="build-level">Level ${level}/${def.maxLevel}</div>` : ''}
              <div class="build-prod">${this._prodText(def)}</div>
            </div>
            <div class="build-action">
              ${!built ? `
                <div class="cost-row">${this._costRow(def.cost, state)}</div>
                <button class="btn-primary btn-sm ${canBuild ? '' : 'disabled'}" ontouchstart="" data-build="${id}">Bangun</button>
              ` : maxed ? `
                <div class="badge-maxed">MAX ⭐</div>
              ` : `
                <div class="cost-row">${this._costRow(upgCost, state)}</div>
                <button class="btn-accent btn-sm ${canUpg ? '' : 'disabled'}" ontouchstart="" data-upgrade="${id}">Upgrade ↑${level+1}</button>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

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

  // ── Panel Quest ───────────────────────────────────────────────
  _renderQuest() {
    const el    = document.getElementById('panel-quest');
    const state = this.state.data;

    el.innerHTML = `
      <div class="panel-header">
        <h2>⚔️ Quest</h2>
        <p class="panel-sub">Kirim pahlawan berpetualangan</p>
      </div>
      <div class="quest-list">
        ${QUESTS.map(q => {
          // Cek hero mana yang sedang quest ini
          const onQuest = Object.entries(state.heroes).find(
            ([,h]) => h.task === 'quest' && h.questId === q.id
          );
          const elapsed  = onQuest ? (Date.now() - onQuest[1].questStart) / 1000 : 0;
          const dur      = onQuest ? onQuest[1].questDuration : q.duration;
          const pct      = onQuest ? Math.min(100, (elapsed / dur) * 100) : 0;
          const done     = onQuest && elapsed >= dur;

          return `<div class="quest-card ${done ? 'quest-done' : ''}">
            <div class="quest-header">
              <span class="quest-icon">${q.icon}</span>
              <div>
                <div class="quest-name">${q.name}</div>
                <div class="quest-diff">${q.difficulty} · Min Level ${q.minLevel}</div>
              </div>
              ${q.isPrestige ? '<span class="badge-prestige">PRESTIGE</span>' : ''}
            </div>
            <div class="quest-desc">${q.description}</div>
            <div class="quest-reward">
              Reward: ${Object.entries(q.reward).map(([r,a]) => `${RESOURCES[r]?.icon ?? r}${a}`).join(' ')} · XP ${q.xpReward}
            </div>
            ${onQuest ? `
              <div class="quest-progress">
                <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
                <div class="quest-eta">${done ? '✅ Selesai!' : this._etaText(dur - elapsed)}</div>
              </div>
              ${done ? `<button class="btn-primary btn-sm" ontouchstart="" data-claim="${onQuest[0]}">🎁 Klaim</button>` : ''}
            ` : `
              <button class="btn-accent btn-sm" ontouchstart="" data-send-quest="${q.id}">Kirim Hero →</button>
            `}
          </div>`;
        }).join('')}
      </div>
    `;

    el.querySelectorAll('[data-send-quest]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showSendHeroModal(btn.dataset.sendQuest);
      });
    });
    el.querySelectorAll('[data-claim]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = QuestSystem.claim(state, btn.dataset.claim);
        if (r.ok) {
          const rewardStr = Object.entries(r.reward).map(([res,amt]) => `${RESOURCES[res]?.icon ?? res}${amt}`).join(' ');
          this.showToast(`🎁 Quest selesai! +${rewardStr}`, 'success');
          this.renderAll(); this.onStateChange();
        }
      });
    });
  }

  _showSendHeroModal(questId) {
    const state   = this.state.data;
    const questDef = QUESTS.find(q => q.id === questId);
    const heroes   = Object.entries(state.heroes)
      .filter(([,h]) => h.unlocked && h.task !== 'quest');

    this._openModal(`
      <h3>${questDef?.icon} Pilih Pahlawan</h3>
      <p class="modal-sub">untuk: ${questDef?.name}</p>
      <div class="modal-hero-list">
        ${heroes.length ? heroes.map(([id, h]) => {
          const def    = HEROES[id];
          const enough = h.level >= (questDef?.minLevel ?? 1);
          return `<button class="modal-hero-btn ${enough ? '' : 'disabled'}" ontouchstart="" data-hero="${id}">
            <span class="hero-modal-icon">${def.icon}</span>
            <div>
              <div class="hero-modal-name">${def.name}</div>
              <div class="hero-modal-lvl">Level ${h.level} ${enough ? '' : '(butuh '+questDef.minLevel+')'}</div>
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
          this.showToast(`⚔️ ${HEROES[btn.dataset.hero]?.name} berangkat!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
    document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
  }

  // ── Panel Heroes ──────────────────────────────────────────────
  _renderHeroes() {
    const el    = document.getElementById('panel-heroes');
    const state = this.state.data;

    el.innerHTML = `
      <div class="panel-header">
        <h2>👤 Pahlawan</h2>
        <p class="panel-sub">Tugaskan pahlawan untuk bonus produksi</p>
      </div>
      <div class="hero-list">
        ${Object.entries(HEROES).map(([id, def]) => {
          const h = state.heroes[id];
          if (!h.unlocked && !def.unlockCost) return '';
          const xpNext = xpToNextLevel(h.level);
          const xpPct  = h.unlocked ? Math.round((h.xp / xpNext) * 100) : 0;
          const onQuest = h.task === 'quest';

          return `<div class="hero-card ${h.unlocked ? '' : 'locked'}">
            <div class="hero-avatar" style="border-color:${def.color}">${def.icon}</div>
            <div class="hero-info">
              <div class="hero-name">${def.name}</div>
              <div class="hero-title">${def.title}</div>
              ${h.unlocked ? `
                <div class="hero-level">Lv.${h.level}
                  <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
                  <span class="xp-text">${h.xp}/${xpNext} XP</span>
                </div>
                <div class="hero-task-row">
                  Tugas: <b>${onQuest ? '⚔️ Quest — '+this._etaText((h.questDuration??0) - (Date.now()-h.questStart)/1000) : h.task}</b>
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
        const r = HeroSystem.assign(state, sel.dataset.hero, sel.value);
        if (r.ok) {
          this.renderAll(); this.onStateChange();
        }
      });
    });
    el.querySelectorAll('[data-unlock-hero]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = HeroSystem.unlock(state, btn.dataset.unlockHero);
        if (r.ok) {
          this.showToast(`🥷 ${HEROES[btn.dataset.unlockHero]?.name} berhasil dibuka!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg ?? 'Permata tidak cukup', 'error'); }
      });
    });
  }

  // ── Panel Upgrade ─────────────────────────────────────────────
  _renderUpgrade() {
    const el    = document.getElementById('panel-upgrade');
    const state = this.state.data;

    el.innerHTML = `
      <div class="panel-header">
        <h2>⬆️ Upgrade</h2>
        <p class="panel-sub">Tingkatkan efisiensi dan kapasitas</p>
      </div>
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
              <div class="upgrade-level">Level ${cur}/${u.maxLevel}</div>
            </div>
            <div class="upgrade-action">
              ${maxed
                ? '<div class="badge-maxed">MAX</div>'
                : `<div class="cost-row small">${this._costRow(cost, state)}</div>
                   <button class="btn-primary btn-sm ${can ? '' : 'disabled'}" ontouchstart="" data-upgrade-id="${u.id}">Beli</button>`
              }
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    el.querySelectorAll('[data-upgrade-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = UpgradeSystem.buy(state, btn.dataset.upgradeId);
        if (r.ok) {
          this.showToast(`⬆️ Upgrade berhasil!`, 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Panel Prestige ────────────────────────────────────────────
  _renderPrestige() {
    const el    = document.getElementById('panel-prestige');
    const state = this.state.data;
    const can   = PrestigeSystem.canPrestige(state);

    el.innerHTML = `
      <div class="panel-header">
        <h2>🔄 Prestige</h2>
        <p class="panel-sub">Reset & mulai lebih kuat. Level ${state.prestigeLevel}</p>
      </div>

      <div class="prestige-status ${can ? 'prestige-ready' : ''}">
        ${can
          ? '<div class="prestige-ready-text">✨ Kamu siap Prestige! Naga telah dikalahkan.</div>'
          : '<div class="prestige-req">🐉 Selesaikan Quest <b>Sarang Naga</b> untuk membuka Prestige.</div>'
        }
        <button class="btn-prestige ${can ? '' : 'disabled'}" ontouchstart="" id="btn-prestige">
          🔄 Lakukan Prestige
        </button>
        <div class="prestige-points">Poin Prestige: <b>${state.prestigePoints}</b> poin tersedia</div>
      </div>

      <div class="section-title">Bonus Prestige Permanen</div>
      <div class="prestige-bonus-list">
        ${PRESTIGE_BONUSES.map(b => {
          const cur = state.prestigeBonuses[b.id] ?? 0;
          const maxed = cur >= b.maxLevel;
          const can  = !maxed && state.prestigePoints >= b.cost;

          return `<div class="prestige-bonus-card">
            <div class="prestige-bonus-icon">${b.icon}</div>
            <div class="prestige-bonus-info">
              <div class="prestige-bonus-name">${b.name}</div>
              <div class="prestige-bonus-desc">${b.description}</div>
              <div class="prestige-bonus-level">Level ${cur}/${b.maxLevel}</div>
            </div>
            <div class="prestige-bonus-action">
              ${maxed
                ? '<div class="badge-maxed">MAX</div>'
                : `<div class="cost-prestige">${b.cost} poin</div>
                   <button class="btn-primary btn-sm ${can ? '' : 'disabled'}" ontouchstart="" data-buy-bonus="${b.id}">Beli</button>`
              }
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-prestige')?.addEventListener('click', () => {
      if (!can) return;
      this._openModal(`
        <h3>🔄 Konfirmasi Prestige</h3>
        <p class="modal-warn">⚠️ Semua bangunan, sumber daya, dan ladang akan direset.<br>Hero & upgrade tetap dipertahankan.</p>
        <div class="modal-btns">
          <button class="btn-prestige" id="confirm-prestige" ontouchstart="">Ya, Prestige!</button>
          <button class="btn-ghost" id="modal-cancel" ontouchstart="">Batal</button>
        </div>
      `);
      document.getElementById('confirm-prestige')?.addEventListener('click', () => {
        const r = PrestigeSystem.doPrestige(state);
        this._closeModal();
        if (r.ok) {
          this.showToast(`🌟 Prestige Level ${r.level}! Bonus permanen aktif.`, 'success');
          this.renderAll(); this.onStateChange();
        }
      });
      document.getElementById('modal-cancel')?.addEventListener('click', () => this._closeModal());
    });

    el.querySelectorAll('[data-buy-bonus]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        const r = PrestigeSystem.buyBonus(state, btn.dataset.buyBonus);
        if (r.ok) {
          this.showToast('🌟 Bonus prestige dibeli!', 'success');
          this.renderAll(); this.onStateChange();
        } else { this.showToast(r.msg, 'error'); }
      });
    });
  }

  // ── Offline Progress Dialog ────────────────────────────────────
  showOfflineDialog(offlineGain, effectiveSec) {
    const h = Math.floor(effectiveSec / 3600);
    const m = Math.floor((effectiveSec % 3600) / 60);
    const timeStr = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;

    const gainRows = Object.entries(offlineGain)
      .filter(([,a]) => a > 0)
      .map(([r, a]) => `<div class="offline-row">${RESOURCES[r]?.icon ?? r} +${this._fmt(a)} ${RESOURCES[r]?.name ?? r}</div>`)
      .join('');

    this._openModal(`
      <h3>⏰ Selamat Datang Kembali!</h3>
      <p class="modal-sub">Kamu pergi selama <b>${timeStr}</b></p>
      <div class="offline-gains">${gainRows || '<div class="empty-msg">Belum ada bangunan produksi.</div>'}</div>
      <button class="btn-primary" id="modal-ok" ontouchstart="">Klaim!</button>
    `);
    document.getElementById('modal-ok')?.addEventListener('click', () => {
      this._closeModal();
    });
  }

  // ── Toast ─────────────────────────────────────────────────────
  showToast(msg, type = 'info') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'toast-show toast-' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.className = ''; }, 2800);
  }

  // ── Modal ─────────────────────────────────────────────────────
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
    document.getElementById('modal-backdrop').style.display = 'none';
    document.getElementById('modal-box').style.display = 'none';
  }

  // ── World Sync ────────────────────────────────────────────────
  _updateWorldSync() {
    if (this.engine) {
      this.engine.syncState(this.state.data, CROPS, BUILDINGS);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  _fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  _etaText(sec) {
    if (sec <= 0) return 'Selesai!';
    const s = Math.ceil(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}m ${r}s` : `${s}s`;
  }

  _costRow(costs, state) {
    return Object.entries(costs).map(([r, a]) => {
      const has = (state.resources[r] ?? 0) >= a;
      return `<span class="cost-item ${has ? '' : 'cost-lack'}">${RESOURCES[r]?.icon ?? r}${this._fmt(a)}</span>`;
    }).join('');
  }

  _prodText(def) {
    const prods = Object.entries(def.production ?? {});
    if (!prods.length) return def.bonus ? `Bonus: ${Object.keys(def.bonus).join(', ')}` : '';
    return prods.map(([r, rate]) => `${RESOURCES[r]?.icon}${rate}/s`).join(' ');
  }
}
