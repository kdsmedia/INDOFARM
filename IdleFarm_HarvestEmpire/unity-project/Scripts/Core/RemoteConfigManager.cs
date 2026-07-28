using System;
using System.Threading.Tasks;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengambil konfigurasi balancing dari server (Unity Remote Config).
    /// Memungkinkan tim mengubah angka ekonomi tanpa update aplikasi.
    /// Jika fetch gagal, gunakan nilai default lokal.
    /// </summary>
    public class RemoteConfigManager : MonoBehaviour
    {
        public static RemoteConfigManager Instance { get; private set; }

        [Header("Nilai Default (fallback jika server tidak terjangkau)")]
        [SerializeField] private float defaultOfflineMultiplier    = 0.5f;
        [SerializeField] private float defaultGrowSpeedMultiplier  = 1.0f;
        [SerializeField] private float defaultSellValueMultiplier  = 1.0f;
        [SerializeField] private int   defaultMaxOfflineHours      = 8;
        [SerializeField] private float defaultRewardAdBonus        = 2.0f; // 2× lipat

        // Nilai aktif (diisi dari server atau default)
        public float OfflineMultiplier    { get; private set; }
        public float GrowSpeedMultiplier  { get; private set; }
        public float SellValueMultiplier  { get; private set; }
        public int   MaxOfflineHours      { get; private set; }
        public float RewardAdBonus        { get; private set; }

        public bool IsFetched { get; private set; } = false;

        public event Action OnConfigFetched;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            // Set nilai default sebelum fetch
            ApplyDefaults();
        }

        private async void Start()
        {
            await FetchConfigAsync();
        }

        private void ApplyDefaults()
        {
            OfflineMultiplier   = defaultOfflineMultiplier;
            GrowSpeedMultiplier = defaultGrowSpeedMultiplier;
            SellValueMultiplier = defaultSellValueMultiplier;
            MaxOfflineHours     = defaultMaxOfflineHours;
            RewardAdBonus       = defaultRewardAdBonus;
        }

        /// <summary>
        /// Fetch konfigurasi dari Unity Remote Config.
        /// Ganti implementasi ini sesuai SDK Remote Config yang dipakai.
        /// </summary>
        private async Task FetchConfigAsync()
        {
            // ── IMPLEMENTASI UNITY REMOTE CONFIG ──
            // Contoh penggunaan Unity Remote Config SDK:
            //
            // await RemoteConfigService.Instance.FetchConfigsAsync(
            //     new UserAttributes(),
            //     new AppAttributes()
            // );
            //
            // OfflineMultiplier   = RemoteConfigService.Instance.appConfig.GetFloat("offline_multiplier", defaultOfflineMultiplier);
            // GrowSpeedMultiplier = RemoteConfigService.Instance.appConfig.GetFloat("grow_speed_mult", defaultGrowSpeedMultiplier);
            // SellValueMultiplier = RemoteConfigService.Instance.appConfig.GetFloat("sell_value_mult", defaultSellValueMultiplier);
            // MaxOfflineHours     = RemoteConfigService.Instance.appConfig.GetInt("max_offline_hours", defaultMaxOfflineHours);
            // RewardAdBonus       = RemoteConfigService.Instance.appConfig.GetFloat("reward_ad_bonus", defaultRewardAdBonus);

            // ── PLACEHOLDER (hapus saat implementasi asli dipasang) ──
            await Task.Delay(500); // Simulasi network delay
            ApplyDefaults();       // Gunakan default karena belum ada server

            IsFetched = true;
            OnConfigFetched?.Invoke();
            Debug.Log("[RemoteConfig] Konfigurasi dimuat (nilai default/lokal).");
        }
    }
}
