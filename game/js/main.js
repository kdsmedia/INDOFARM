// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Entry Point & Game Loop (Android)
// ═══════════════════════════════════════════════════════════════

import { GameState }    from './state.js';
import { WorldEngine }  from './engine.js';
import { GameUI }       from './ui.js';
import { ResourceSystem, FarmSystem, QuestSystem } from './systems.js';
import { CONFIG, CROPS, BUILDINGS } from './data.js';

// ── Inisialisasi State ────────────────────────────────────────
const state = new GameState();
state.load();

// ── Init UI Dulu (membangun skeleton HTML) ────────────────────
const ui = new GameUI(state, null, onStateChange);
ui.init();   // ← menciptakan #game-canvas di DOM

// ── Sekarang ambil canvas & buat engine ──────────────────────
const canvas = document.getElementById('game-canvas');
const engine = new WorldEngine(canvas);
ui.engine    = engine;  // hubungkan ke UI

let tickCount = 0;

// ── Boot ──────────────────────────────────────────────────────
async function boot() {
  setLoadingProgress(5, 'Menginisialisasi...');

  // Init Three.js engine
  await engine.init();
  setLoadingProgress(40, 'Memuat dunia 3D...');

  // Engine siap → sembunyikan loading
  engine.onReady(() => {
    setLoadingProgress(100, 'Siap!');
    setTimeout(hideLoading, 500);
  });

  setLoadingProgress(70, 'Sinkronisasi data...');

  // Sync dunia dengan state awal
  engine.syncState(state.data, CROPS, BUILDINGS);

  setLoadingProgress(90, 'Menghitung progres offline...');

  // Offline progress
  const offlineGain = state.getOfflineGain();
  if (offlineGain && offlineGain.effectiveSec > 30) {
    const gained = ResourceSystem.applyOffline(state.data, offlineGain.effectiveSec);
    state.clearOfflineGain();
    ui.showOfflineDialog(gained, offlineGain.effectiveSec);
  }

  // Render UI awal
  ui.renderAll();

  // Mulai game loop
  startGameLoop();
}

// ── Game Loop (1 detik) ───────────────────────────────────────
function startGameLoop() {
  setInterval(tick, CONFIG.TICK_INTERVAL);
}

function tick() {
  const data = state.data;
  tickCount++;

  // Sistem produksi resource
  ResourceSystem.tick(data);

  // Sistem farm (pertumbuhan tanaman)
  FarmSystem.tick(data);

  // Cek quest selesai & update notifikasi
  const doneQuests = QuestSystem.tick(data);
  if (doneQuests.length > 0 && ui.activePanel === 'quest') {
    ui.renderPanel('quest');
  }

  // Update HUD resource setiap tick
  ui._renderHUD();

  // Update panel aktif setiap 3 detik (hemat baterai Android)
  if (tickCount % 3 === 0) {
    ui.renderPanel(ui.activePanel);
    engine.syncState(state.data, CROPS, BUILDINGS);
  }

  // Auto-save setiap CONFIG.SAVE_INTERVAL detik
  state.saveIfNeeded();
}

// ── Callback saat state berubah dari UI ──────────────────────
function onStateChange() {
  engine.syncState(state.data, CROPS, BUILDINGS);
}

// ── Loading Bar ───────────────────────────────────────────────
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

// ── Cegah Double-Tap Zoom (standar Android game) ─────────────
document.addEventListener('touchstart', e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

let lastTap = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTap < 300) e.preventDefault();
  lastTap = now;
}, { passive: false });

// ── Mulai ─────────────────────────────────────────────────────
initCapacitor();
boot().catch(err => {
  console.error('Boot error:', err);
  const txt = document.getElementById('loading-text');
  if (txt) txt.textContent = '⚠️ Gagal memuat. Coba refresh.';
});
