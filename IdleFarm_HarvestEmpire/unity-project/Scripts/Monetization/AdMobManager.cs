using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Monetization
{
    /// <summary>
    /// Mengelola semua iklan AdMob: Rewarded dan Interstitial.
    /// Semua rewarded ads 100% opsional dan dipicu oleh pemain.
    ///
    /// SETUP:
    /// 1. Import Google Mobile Ads Unity Plugin dari GitHub:
    ///    https://github.com/googleads/googleads-mobile-unity/releases
    /// 2. Masukkan App ID AdMob di AndroidManifest.xml dan Info.plist
    /// 3. Ganti placeholder Ad Unit ID di bawah dengan ID asli dari AdMob Console
    /// </summary>
    public class AdMobManager : MonoBehaviour
    {
        public static AdMobManager Instance { get; private set; }

        // ── GANTI DENGAN AD UNIT ID ASLI DARI ADMOB CONSOLE ──
        [Header("Ad Unit IDs (ganti dengan ID asli dari AdMob)")]
        [SerializeField] private string rewardedAdUnitId_Android     = "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY";
        [SerializeField] private string rewardedAdUnitId_iOS         = "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ";
        [SerializeField] private string interstitialAdUnitId_Android = "ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA";
        [SerializeField] private string interstitialAdUnitId_iOS     = "ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB";

        // Untuk testing, gunakan ID test resmi Google:
        // Rewarded Android test:     ca-app-pub-3940256099942544/5224354917
        // Rewarded iOS test:         ca-app-pub-3940256099942544/1712485313
        // Interstitial Android test: ca-app-pub-3940256099942544/1033173712
        // Interstitial iOS test:     ca-app-pub-3940256099942544/4411468910

        [Header("Batas Frekuensi Interstitial")]
        [SerializeField] private float interstitialCooldownSeconds = 300f; // 5 menit

        private bool   _isRewardedReady      = false;
        private bool   _isInterstitialReady  = false;
        private float  _lastInterstitialTime = -999f;

        // Callback untuk rewarded ad
        private Action _onRewardGranted;
        private Action _onRewardFailed;

        // Counter harian untuk rewarded ads
        private Dictionary<string, int> _dailyAdCount = new Dictionary<string, int>();
        private const int MAX_DAILY_REWARDED = 5; // per placement

        public bool IsRewardedReady => _isRewardedReady;

        public event Action OnRewardedAdLoaded;
        public event Action OnRewardedAdFailed;

        // ──────────────────────────────────────────────
        #region Inisialisasi

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void Initialize()
        {
            // ── UNCOMMENT SAAT GOOGLE MOBILE ADS SDK DIINSTAL ──
            // MobileAds.Initialize(initStatus =>
            // {
            //     Debug.Log("[AdMob] SDK diinisialisasi.");
            //     LoadRewardedAd();
            //     LoadInterstitialAd();
            // });

            // ── PLACEHOLDER (hapus saat SDK terpasang) ──
            Debug.Log("[AdMobManager] Placeholder: SDK belum diinstal. Pasang Google Mobile Ads Unity Plugin.");
            _isRewardedReady = true; // Simulasi untuk testing di Editor
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Load Ads

        private void LoadRewardedAd()
        {
            // ── IMPLEMENTASI ADMOB SDK ──
            // string adUnitId = Application.platform == RuntimePlatform.IPhonePlayer
            //     ? rewardedAdUnitId_iOS : rewardedAdUnitId_Android;
            //
            // var adRequest = new AdRequest();
            // RewardedAd.Load(adUnitId, adRequest, (RewardedAd ad, LoadAdError error) =>
            // {
            //     if (error != null || ad == null) { _isRewardedReady = false; return; }
            //     _rewardedAd = ad;
            //     _isRewardedReady = true;
            //     OnRewardedAdLoaded?.Invoke();
            //
            //     ad.OnAdFullScreenContentClosed += LoadRewardedAd; // auto-reload
            // });
        }

        private void LoadInterstitialAd()
        {
            // ── IMPLEMENTASI ADMOB SDK ──
            // string adUnitId = Application.platform == RuntimePlatform.IPhonePlayer
            //     ? interstitialAdUnitId_iOS : interstitialAdUnitId_Android;
            //
            // var adRequest = new AdRequest();
            // InterstitialAd.Load(adUnitId, adRequest, (InterstitialAd ad, LoadAdError error) =>
            // {
            //     if (error != null) { _isInterstitialReady = false; return; }
            //     _interstitialAd = ad;
            //     _isInterstitialReady = true;
            //
            //     ad.OnAdFullScreenContentClosed += LoadInterstitialAd;
            // });
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Tampilkan Rewarded Ad

        /// <summary>
        /// Tampilkan rewarded ad. onGranted dipanggil jika pemain berhasil menonton.
        /// onFailed dipanggil jika iklan tidak tersedia atau ditutup sebelum selesai.
        /// </summary>
        public void ShowRewardedAd(string placementId, Action onGranted, Action onFailed = null)
        {
            // Cek batas harian
            if (GetDailyAdCount(placementId) >= MAX_DAILY_REWARDED)
            {
                Debug.Log($"[AdMob] Batas harian rewarded ad '{placementId}' tercapai.");
                onFailed?.Invoke();
                return;
            }

            if (!_isRewardedReady)
            {
                Debug.Log("[AdMob] Rewarded ad belum siap.");
                onFailed?.Invoke();
                return;
            }

            _onRewardGranted = () =>
            {
                IncrementDailyAdCount(placementId);
                onGranted?.Invoke();
                LoadRewardedAd(); // Muat iklan berikutnya
            };
            _onRewardFailed = onFailed;

            // ── IMPLEMENTASI ADMOB SDK ──
            // _rewardedAd.Show(reward =>
            // {
            //     _onRewardGranted?.Invoke();
            // });

            // ── PLACEHOLDER: Simulasi reward langsung di Editor ──
            #if UNITY_EDITOR
            Debug.Log($"[AdMob EDITOR] Simulasi reward untuk placement: {placementId}");
            _onRewardGranted?.Invoke();
            #endif
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Tampilkan Interstitial Ad

        /// <summary>
        /// Tampilkan interstitial di titik transisi alami.
        /// Hanya tampil jika cooldown sudah habis.
        /// </summary>
        public bool TryShowInterstitial()
        {
            if (Time.time - _lastInterstitialTime < interstitialCooldownSeconds) return false;
            if (!_isInterstitialReady) return false;

            _lastInterstitialTime = Time.time;

            // ── IMPLEMENTASI ADMOB SDK ──
            // _interstitialAd.Show();

            Debug.Log("[AdMob] Interstitial ditampilkan.");
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Batas Harian

        private int GetDailyAdCount(string placementId)
        {
            _dailyAdCount.TryGetValue(placementId, out int count);
            return count;
        }

        private void IncrementDailyAdCount(string placementId)
        {
            _dailyAdCount.TryGetValue(placementId, out int count);
            _dailyAdCount[placementId] = count + 1;
        }

        // Reset harian (panggil saat midnight atau login baru hari)
        public void ResetDailyAdCounts()
        {
            _dailyAdCount.Clear();
            Debug.Log("[AdMob] Counter harian direset.");
        }

        #endregion
    }
}
