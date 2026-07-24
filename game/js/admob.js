// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — AdMob Integration
//  - Native Android: via @capacitor-community/admob
//  - Browser: simulasi iklan (no-skip, 30 detik)
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
    console.log('[AdMob] Native tidak tersedia — mode simulasi aktif');
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
    // Browser: simulasi iklan dengan UI no-skip
    return this._simulateAd(type);
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

  // Simulasi iklan no-skip — harus nonton 30 detik penuh
  _simulateAd(type) {
    return new Promise((resolve) => {
      const DURATION = 30;

      const overlay = document.createElement('div');
      overlay.id = 'ad-overlay';
      overlay.innerHTML = `
        <div class="ad-modal">
          <div class="ad-header">
            <span class="ad-badge">AD</span>
            <span class="ad-policy">Tonton penuh untuk reward</span>
          </div>

          <div class="ad-body">
            <div class="ad-brand-logo">🏰</div>
            <div class="ad-brand-name">IndoFarm Adventure</div>
            <div class="ad-brand-tag">Game Idle Farm RPG Terbaik Indonesia</div>

            <div class="ad-showcase">
              <div class="ad-showcase-items">
                <div class="ad-item-anim">🌾 Bertani</div>
                <div class="ad-arrow">→</div>
                <div class="ad-item-anim">🏰 Membangun</div>
                <div class="ad-arrow">→</div>
                <div class="ad-item-anim">⚔️ Bertempur</div>
                <div class="ad-arrow">→</div>
                <div class="ad-item-anim">👑 Menang!</div>
              </div>
            </div>

            <div class="ad-reward-preview">
              ${type === 'daily_reward'
                ? '🎁 Reward: <b>Bonus Harian Spesial</b>'
                : '🆓 Reward: <b>Item Gratis untuk Petualanganmu</b>'}
            </div>
          </div>

          <div class="ad-footer">
            <div class="ad-timer-wrap">
              <svg viewBox="0 0 44 44" class="ad-timer-svg">
                <circle class="ad-timer-bg"   cx="22" cy="22" r="18"/>
                <circle class="ad-timer-ring" cx="22" cy="22" r="18"
                  id="ad-ring" style="stroke-dasharray:${2*Math.PI*18};stroke-dashoffset:0"/>
              </svg>
              <span class="ad-timer-num" id="ad-num">${DURATION}</span>
            </div>
            <div class="ad-timer-label">detik tersisa</div>
          </div>

          <button class="ad-claim-btn" id="ad-claim" disabled>
            ⏳ Menonton Iklan...
          </button>
        </div>
      `;
      document.body.appendChild(overlay);

      const ring    = document.getElementById('ad-ring');
      const numEl   = document.getElementById('ad-num');
      const claimEl = document.getElementById('ad-claim');
      const circ    = 2 * Math.PI * 18;
      let   rem     = DURATION;

      const iv = setInterval(() => {
        rem--;
        if (numEl)  numEl.textContent = rem;
        if (ring)   ring.style.strokeDashoffset = circ * (1 - rem / DURATION);
        if (rem <= 0) {
          clearInterval(iv);
          if (claimEl) {
            claimEl.disabled = false;
            claimEl.textContent = '🎁 Klaim Reward Sekarang!';
            claimEl.classList.add('ad-claim-ready');
          }
        }
      }, 1000);

      claimEl?.addEventListener('click', () => {
        if (claimEl.disabled) return;
        overlay.remove();
        resolve({ ok: true, earned: true });
      });
    });
  },
};
