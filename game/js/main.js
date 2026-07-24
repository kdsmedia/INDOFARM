// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Entry Point & Game Loop (Full Edition)
// ═══════════════════════════════════════════════════════════════

import { GameState }    from './state.js';
import { WorldEngine }  from './engine.js';
import { GameUI }       from './ui.js';
import {
  ResourceSystem, FarmSystem, QuestSystem,
  CraftSystem, ArmySystem, AchievementSystem, DailySystem,
} from './systems.js';
import { CONFIG, CROPS, BUILDINGS } from './data.js';

// ── Init State ─────────────────────────────────────────────────
const state = new GameState();
state.load();

// ── Init UI ────────────────────────────────────────────────────
const ui = new GameUI(state, null, onStateChange);
ui.init();

// ── Init Engine ────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const engine = new WorldEngine(canvas);
ui.engine = engine;

let tickCount = 0;

// ── Boot ───────────────────────────────────────────────────────
async function boot() {
  setLoadingProgress(5, 'Menginisialisasi...');

  await engine.init();
  setLoadingProgress(40, 'Memuat dunia 3D...');

  engine.onReady(() => {
    setLoadingProgress(100, 'Siap!');
    setTimeout(hideLoading, 500);
  });

  setLoadingProgress(70, 'Sinkronisasi data...');
  engine.syncState(state.data, CROPS, BUILDINGS);

  setLoadingProgress(90, 'Menghitung progres offline...');

  // Offline progress
  const offlineGain = state.getOfflineGain();
  if (offlineGain && offlineGain.effectiveSec > 30) {
    const gained = ResourceSystem.applyOffline(state.data, offlineGain.effectiveSec);
    state.clearOfflineGain();
    ui.showOfflineDialog(gained, offlineGain.effectiveSec);
  }

  // Check daily bonus on boot
  _checkDailyBonusOnBoot();

  ui.renderAll();
  startGameLoop();
}

// ── Daily Bonus Auto-Check ────────────────────────────────────
function _checkDailyBonusOnBoot() {
  if (DailySystem.canClaim(state.data)) {
    // Nudge user to claim (don't auto-claim)
    setTimeout(() => {
      ui.showToast('🎁 Bonus harian tersedia! Buka tab Bonus.', 'info');
    }, 2000);
  }
}

// ── Game Loop (1 detik) ───────────────────────────────────────
function startGameLoop() {
  setInterval(tick, CONFIG.TICK_INTERVAL);
}

function tick() {
  const data = state.data;
  tickCount++;

  // Core systems
  ResourceSystem.tick(data);
  FarmSystem.tick(data);

  // Quest completion check
  const doneQuests = QuestSystem.tick(data);
  if (doneQuests.length > 0) {
    if (ui.activePanel === 'quest') ui.renderPanel('quest');
    ui.showToast(`✅ Quest selesai! Buka tab Quest untuk klaim.`, 'success');
  }

  // Crafting completion
  const doneCrafts = CraftSystem.tick(data);
  if (doneCrafts.length > 0) {
    if (ui.activePanel === 'crafting') ui.renderPanel('crafting');
    ui.showToast(`🔨 Item selesai dibuat!`, 'success');
  }

  // Army recruiting
  ArmySystem.tick(data);

  // Achievement check every 5 ticks
  if (tickCount % 5 === 0) {
    const newAchs = AchievementSystem.check(data);
    newAchs.forEach(ach => {
      ui.showToast(`🏆 Pencapaian: ${ach.name}!`, 'success');
    });
  }

  // HUD update every tick
  ui._renderHUD();

  // Panel update every 3 ticks (battery-friendly)
  if (tickCount % 3 === 0) {
    ui.renderPanel(ui.activePanel);
    engine.syncState(state.data, CROPS, BUILDINGS);
  }

  // Play time stats
  data.stats.playTimeSec = data.stats.playTimeSec || 0;

  // Auto-save
  state.saveIfNeeded();
}

// ── State Change Callback ─────────────────────────────────────
function onStateChange() {
  engine.syncState(state.data, CROPS, BUILDINGS);
}

// ── Loading Helpers ───────────────────────────────────────────
function setLoadingProgress(pct, text) {
  const fill = document.getElementById('loading-fill');
  const txt  = document.getElementById('loading-text');
  if (fill) fill.style.width = pct + '%';
  if (txt)  txt.textContent  = text;
}

function hideLoading() {
  const overlay = document.getElementById('world-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
  }
}

// ── Capacitor Native Bridge (Android) ────────────────────────
async function initCapacitor() {
  try {
    const { App } = await import('@capacitor/app').catch(() => ({ App: null }));
    if (App) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) state.save();
      });
    }
  } catch (_) { /* berjalan tanpa Capacitor saat preview */ }
}

// ── Touch Optimizations ───────────────────────────────────────
document.addEventListener('touchstart', e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

let lastTap = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTap < 300) e.preventDefault();
  lastTap = now;
}, { passive: false });

// ── Start ─────────────────────────────────────────────────────
initCapacitor();
boot().catch(err => {
  console.error('Boot error:', err);
  const txt = document.getElementById('loading-text');
  if (txt) txt.textContent = '⚠️ Gagal memuat. Coba refresh.';
});
