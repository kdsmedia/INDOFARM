// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Firebase Auth + Firestore Cloud Save
//  Menggunakan Firebase v10 Modular SDK (CDN ESM)
//  Free tier: 1GB Firestore, 50K reads/day, 20K writes/day
// ═══════════════════════════════════════════════════════════════

import { initializeApp }           from 'firebase/app';
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithCredential,
  signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';

// ── Firebase Web Config ────────────────────────────────────────
// Ambil dari Firebase Console → Project Settings → Your Apps → Web App → Config
// CATATAN: ini adalah FIREBASE WEB CONFIG, berbeda dengan google-services.json Android.
// google-services.json dipakai oleh Capacitor/native, config ini untuk web/Firestore.
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDBM_PPd7uEAyGg8d2ILQ1bTx3A6KKFjBk",
  authDomain:        "altomedia-8f793.firebaseapp.com",
  databaseURL:       "https://altomedia-8f793-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "altomedia-8f793",
  storageBucket:     "altomedia-8f793.firebasestorage.app",
  messagingSenderId: "327513974065",
  appId:             "1:327513974065:web:1a6b38d87b136eb191bc10",
  measurementId:     "G-H2YR84K1FQ",
};

// Deteksi apakah config sudah diisi
const IS_CONFIGURED = !FIREBASE_CONFIG.apiKey.includes('PLACEHOLDER');

let _app  = null;
let _auth = null;
let _db   = null;

function _tryInit() {
  if (!IS_CONFIGURED) return;
  try {
    _app  = initializeApp(FIREBASE_CONFIG);
    _auth = getAuth(_app);
    _db   = getFirestore(_app);
    console.log('[Firebase] Initialized ✓');
  } catch (e) {
    console.warn('[Firebase] Init gagal:', e.message);
  }
}

_tryInit();

// ── Firebase Service ───────────────────────────────────────────
export const FirebaseService = {
  get isConfigured() { return IS_CONFIGURED && !!_auth; },
  currentUser: null,

  // Google Sign-In
  // - Android (Capacitor): pakai @capacitor-community/google-auth → signInWithCredential
  // - Browser/dev: pakai signInWithPopup sebagai fallback pengembangan
  async signInWithGoogle() {
    if (!_auth) return { ok: false, msg: 'Firebase belum dikonfigurasi.' };
    // Cek apakah berjalan di native Android via Capacitor
    const isNative = typeof window !== 'undefined'
      && window.Capacitor?.isNativePlatform?.();
    if (isNative) {
      return this._signInNative();
    }
    return this._signInWebFallback();
  },

  // Native Android: gunakan Capacitor Google Auth plugin
  async _signInNative() {
    try {
      const { GoogleAuth } = await import('@capacitor-community/google-auth');
      await GoogleAuth.initialize();
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication?.idToken;
      if (!idToken) return { ok: false, msg: 'Gagal mendapat token dari Google.' };
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(_auth, credential);
      this.currentUser = result.user;
      return { ok: true, user: result.user };
    } catch (e) {
      if (e.code === 'auth/network-request-failed') return { ok: false, msg: 'Tidak ada koneksi internet.' };
      if (String(e).includes('cancel') || String(e).includes('12501')) {
        return { ok: false, msg: 'Login dibatalkan.' };
      }
      console.warn('[Firebase] Native sign-in error:', e);
      return { ok: false, msg: 'Login gagal. Pastikan Google Play Services tersedia.' };
    }
  },

  // Browser/dev fallback (hanya untuk testing di browser, bukan APK)
  async _signInWebFallback() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(_auth, provider);
      this.currentUser = result.user;
      return { ok: true, user: result.user };
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return { ok: false, msg: 'Login dibatalkan.' };
      }
      if (e.code === 'auth/network-request-failed') return { ok: false, msg: 'Tidak ada koneksi internet.' };
      if (e.code === 'auth/unauthorized-domain') {
        return { ok: false, msg: 'Login Google hanya tersedia di aplikasi Android. Buka via APK.' };
      }
      return { ok: false, msg: e.message };
    }
  },

  // Sign Out
  async signOut() {
    if (!_auth) return;
    try { await signOut(_auth); } catch (_) {}
    this.currentUser = null;
  },

  // Listen to auth state changes
  onAuthChange(callback) {
    if (!_auth) { callback(null); return () => {}; }
    return onAuthStateChanged(_auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  },

  // Save progress to Firestore (cloud save)
  // Hanya data penting yang disimpan (bukan state 3D penuh)
  async saveToCloud(saveData) {
    const uid = this.currentUser?.uid;
    if (!_db || !uid) return false;
    try {
      const slim = {
        resources:       saveData.resources        ?? {},
        maxResources:    saveData.maxResources      ?? {},
        farm:            { unlockedCrops: saveData.farm?.unlockedCrops ?? ['wheat'] },
        buildings:       saveData.buildings         ?? {},
        heroes:          this._slimHeroes(saveData.heroes),
        upgrades:        saveData.upgrades          ?? {},
        inventory:       saveData.inventory         ?? {},
        army:            saveData.army              ?? {},
        prestigeLevel:   saveData.prestigeLevel     ?? 0,
        prestigePoints:  saveData.prestigePoints    ?? 0,
        prestigeBonuses: saveData.prestigeBonuses   ?? {},
        achievements:    saveData.achievements      ?? {},
        stats:           saveData.stats             ?? {},
        dailyBonus:      saveData.dailyBonus        ?? {},
        selectedHero:    saveData.selectedHero      ?? 'barbarian',
        version:         saveData.version           ?? 3,
        savedAt:         serverTimestamp(),
      };
      await setDoc(doc(_db, 'saves', uid), slim);
      return true;
    } catch (e) {
      console.warn('[Firebase] Cloud save gagal:', e.message);
      return false;
    }
  },

  // Load progress from Firestore
  async loadFromCloud() {
    const uid = this.currentUser?.uid;
    if (!_db || !uid) return null;
    try {
      const snap = await getDoc(doc(_db, 'saves', uid));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.warn('[Firebase] Cloud load gagal:', e.message);
      return null;
    }
  },

  // Slim hero data (remove runtime fields)
  _slimHeroes(heroes) {
    if (!heroes) return {};
    const slim = {};
    for (const [id, h] of Object.entries(heroes)) {
      slim[id] = {
        unlocked: h.unlocked,
        level:    h.level    ?? 1,
        xp:       h.xp       ?? 0,
        equipped: h.equipped ?? {},
        task:     'idle', // reset task on cloud load
      };
    }
    return slim;
  },
};
