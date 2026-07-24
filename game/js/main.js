// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Entry Point & Game Loop (Full Edition)
//  Flow: Lobby → Auth → Char Select → Boot Game
// ═══════════════════════════════════════════════════════════════

import { GameState }    from './state.js';
import { WorldEngine }  from './engine.js';
import { GameUI }       from './ui.js';
import { LobbyManager } from './lobby.js';
import { FirebaseService } from './firebase.js';
import { AdMobService } from './admob.js';
import { BattleSim }    from './battlesim.js';
import {
  ResourceSystem, FarmSystem, QuestSystem,
  CraftSystem, ArmySystem, AchievementSystem, DailySystem,
} from './systems.js';
import { CONFIG, CROPS, BUILDINGS } from './data.js';

// ── Global State ───────────────────────────────────────────────
const state = new GameState();

let ui      = null;
let engine  = null;
let tickCnt = 0;

// ── Step 1: Show Lobby (Splash → Login → Char Select) ─────────
const lobby = new LobbyManager(async ({ heroId, user }) => {
  // Save selected hero & cloud user to state
  state.load();
  state.data.selectedHero = heroId;
  state.data.cloudUser    = user
    ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }
    : null;

  // If logged in, attempt to merge cloud save
  if (user && FirebaseService.isConfigured) {
    try {
      const cloud = await FirebaseService.loadFromCloud();
      if (cloud) {
        _mergeCloudSave(state, cloud);
        state.data.selectedHero = heroId; // keep lobby choice
      }
    } catch (_) { /* offline — use local save */ }
  }

  state.save();
  await boot();
});

lobby.show();

// Initialize AdMob (silently, won't block game)
AdMobService.init().catch(() => {});

// ── Step 2: Boot Game ─────────────────────────────────────────
async function boot() {
  setLoadingProgress(5, 'Menginisialisasi...');

  // Build UI skeleton
  ui = new GameUI(state, null, onStateChange, { BattleSim, AdMobService });
  ui.init();

  // Init 3D engine
  const canvas = document.getElementById('game-canvas');
  engine = new WorldEngine(canvas);
  ui.engine = engine;

  setLoadingProgress(30, 'Memuat dunia 3D...');
  await engine.init();

  engine.onReady(() => {
    setLoadingProgress(100, 'Siap!');
    setTimeout(hideLoading, 500);
  });

  setLoadingProgress(60, 'Sinkronisasi data...');
  engine.syncState(state.data, CROPS, BUILDINGS);
  engine.setSelectedHero(state.data.selectedHero);

  setLoadingProgress(85, 'Menghitung progres offline...');

  // Offline progress
  const offlineGain = state.getOfflineGain();
  if (offlineGain && offlineGain.effectiveSec > 30) {
    const gained = ResourceSystem.applyOffline(state.data, offlineGain.effectiveSec);
    state.data.stats.playTimeSec = (state.data.stats.playTimeSec ?? 0) + Math.floor(offlineGain.effectiveSec);
    state.clearOfflineGain();
    ui.showOfflineDialog(gained, offlineGain.effectiveSec);
  }

  // Daily bonus nudge
  _checkDailyBonusOnBoot();

  ui.renderAll();
  startGameLoop();
  initCapacitor();

  // Auto cloud save every 5 minutes if logged in
  if (state.data.cloudUser) {
    setInterval(_cloudSave, 5 * 60 * 1000);
  }
}

// ── Daily Bonus Nudge ────────────────────────────────────────
function _checkDailyBonusOnBoot() {
  if (DailySystem.canClaim(state.data)) {
    setTimeout(() => {
      ui?.showToast('🎁 Bonus harian tersedia! Buka tab Bonus.', 'info');
    }, 2500);
  }
}

// ── Cloud Save ────────────────────────────────────────────────
async function _cloudSave() {
  if (!state.data.cloudUser) return;
  const ok = await FirebaseService.saveToCloud(state.data);
  if (ok) ui?.showToast('☁️ Tersimpan ke cloud!', 'info');
}

// ── Cloud Save Merge ─────────────────────────────────────────
function _mergeCloudSave(localState, cloud) {
  // Merge cloud data into local state (cloud wins for progress fields)
  const d = localState.data;
  const c = cloud;

  // Compare totalGoldEarned to decide which is "ahead"
  const localSavedAt = Number(d.lastSave ?? 0);
  const cloudSavedAt = Number(c.lastSave ?? c.savedAtMs ?? c.savedAt?.toMillis?.() ?? 0);
  const localGold = d.stats?.totalGoldEarned ?? 0;
  const cloudGold = c.stats?.totalGoldEarned ?? 0;
  const cloudIsAhead = cloudSavedAt > localSavedAt
    || (!cloudSavedAt && cloudGold > localGold);

  if (cloudIsAhead) {
    // Cloud is further ahead — use cloud data
    Object.assign(d.resources,       c.resources       ?? {});
    Object.assign(d.buildings,       c.buildings       ?? {});
    Object.assign(d.upgrades,        c.upgrades        ?? {});
    d.farm = c.farm ?? d.farm;
    d.completedQuests = c.completedQuests ?? d.completedQuests;
    d.crafting = c.crafting ?? d.crafting;
    d.armyRecruiting = c.armyRecruiting ?? d.armyRecruiting;
    d.lastBattleResult = c.lastBattleResult ?? d.lastBattleResult;
    d.gacha = c.gacha ?? d.gacha;
    Object.assign(d.inventory,       c.inventory       ?? {});
    Object.assign(d.army,            c.army            ?? {});
    Object.assign(d.achievements,    c.achievements    ?? {});
    Object.assign(d.stats,           c.stats           ?? {});
    Object.assign(d.dailyBonus,      c.dailyBonus      ?? {});
    Object.assign(d.prestigeBonuses, c.prestigeBonuses ?? {});
    d.prestigeLevel  = c.prestigeLevel  ?? d.prestigeLevel;
    d.prestigePoints = c.prestigePoints ?? d.prestigePoints;
    d.dragonSlain = c.dragonSlain ?? d.dragonSlain;

    // Merge heroes (keep higher XP)
    for (const [id, ch] of Object.entries(c.heroes ?? {})) {
      if (!d.heroes[id]) { d.heroes[id] = ch; continue; }
      if ((ch.xp ?? 0) > (d.heroes[id].xp ?? 0)) {
        Object.assign(d.heroes[id], ch);
        d.heroes[id].task = 'idle';
      }
    }
    console.log('[Cloud] Menggunakan data cloud (lebih maju)');
  } else {
    console.log('[Cloud] Menggunakan data lokal (lebih maju)');
  }
}

// ── Game Loop (1 detik) ───────────────────────────────────────
function startGameLoop() {
  setInterval(tick, CONFIG.TICK_INTERVAL);
}

function tick() {
  const data = state.data;
  tickCnt++;

  ResourceSystem.tick(data);
  FarmSystem.tick(data);

  const doneQuests = QuestSystem.tick(data);
  if (doneQuests.length > 0) {
    if (ui?.activePanel === 'quest') ui.renderPanel('quest');
    ui?.showToast('✅ Quest selesai! Buka tab Quest untuk klaim.', 'success');
  }

  const doneCrafts = CraftSystem.tick(data);
  if (doneCrafts.length > 0) {
    if (ui?.activePanel === 'crafting') ui.renderPanel('crafting');
    ui?.showToast('🔨 Item selesai dibuat!', 'success');
  }

  ArmySystem.tick(data);

  if (tickCnt % 5 === 0) {
    const newAchs = AchievementSystem.check(data);
    newAchs.forEach(ach => ui?.showToast(`🏆 Pencapaian: ${ach.name}!`, 'success'));
  }

  ui?._renderHUD();

  if (tickCnt % 3 === 0) {
    ui?.renderPanel(ui.activePanel);
    engine?.syncState(data, CROPS, BUILDINGS);
  }

  // Advance the gameplay clock exactly once per game-loop tick.
  data.stats.playTimeSec = (data.stats.playTimeSec ?? 0) + 1;
  state.saveIfNeeded();
}

// ── State Change Callback ─────────────────────────────────────
function onStateChange() {
  engine?.syncState(state.data, CROPS, BUILDINGS);
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
        if (!isActive) {
          state.save();
          if (state.data.cloudUser) _cloudSave();
        }
      });
    }
  } catch (_) { /* native lifecycle plugin is optional during development */ }
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
