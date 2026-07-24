// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — AdMob Integration
//  - Native Android: via @capacitor-community/admob
//  - Policy: NO-SKIP (pengguna HARUS menonton full untuk reward)
// ═══════════════════════════════════════════════════════════════

let _AdMob   = null;
let _native  = false;

// Ad Unit IDs — ganti dengan ID dari AdMob Console kamu
// Format: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
const AD_UNITS = {
  daily_reward:  'ca-app-pub-6881903056221433/2596636498',
  free_item:     'ca-app-pub-6881903056221433/2596636498',
  spin_gacha:    'ca-app-pub-6881903056221433/2596636498',
  // Test ID resmi Google (hanya untuk development):
  test_rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

async function _tryNativeInit() {
  try {
    const mod = await import('@capacitor-community/admob').catch(() => null);
    if (mod?.AdMob) {
      _AdMob  = mod.AdMob;
      _native = true;
      await _AdMob.initialize({ requestTrackingAuthorization: true });
      console.log('[AdMob] Native initialized ✓');
    }
  } catch (_) {
    console.warn('[AdMob] Native plugin tidak tersedia.');
  }
}

// ── AdMob Service ──────────────────────────────────────────────
export const AdMobService = {
  ready: false,

  async init() {
    await _tryNativeInit();
    this.ready = true;
  },

  // Tampilkan rewarded video ad
  // @param type  'daily_reward' | 'free_item'
  // @returns Promise<{ ok: boolean, earned: boolean }>
  async showRewarded(type = 'daily_reward') {
    if (_native && _AdMob) {
      return this._nativeRewarded(type);
    }
    return { ok: false, earned: false };
  },

  async _nativeRewarded(type) {
    try {
      const adId = AD_UNITS[type] ?? AD_UNITS.test_rewarded;
      await _AdMob.prepareRewardVideoAd({ adId, isTesting: false });
      const result = await _AdMob.showRewardVideoAd();
      const earned = result?.type === 'Rewarded';
      return { ok: true, earned };
    } catch (e) {
      console.warn('[AdMob] Native rewarded gagal:', e);
      return { ok: false, earned: false };
    }
  },

};
