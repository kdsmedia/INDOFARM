using System;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Singleton utama yang mengelola state game, inisialisasi sistem,
    /// dan koordinasi antar manager.
    /// Letakkan GameManager prefab di scene Bootstrap dan set DontDestroyOnLoad.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Referensi Manager")]
        [SerializeField] private Economy.CoinManager coinManager;
        [SerializeField] private Farm.FarmManager farmManager;
        [SerializeField] private Workers.WorkerManager workerManager;
        [SerializeField] private Upgrade.UpgradeSystem upgradeSystem;
        [SerializeField] private Monetization.AdMobManager adMobManager;
        [SerializeField] private Monetization.OfflineIncomeCalculator offlineCalc;
        [SerializeField] private Meta.AchievementSystem achievementSystem;
        [SerializeField] private Events.DailyMissionSystem dailyMissionSystem;
        [SerializeField] private UI.UIManager uiManager;

        [Header("Status Game")]
        [SerializeField] private bool isInitialized = false;

        // Event global
        public static event Action OnGameInitialized;
        public static event Action OnGameSaved;
        public static event Action OnPrestige;

        // ──────────────────────────────────────────────
        #region Unity Lifecycle

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            InitializeGame();
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus)
            {
                // App masuk background — catat waktu tutup
                SaveSystem.Instance.SetLastCloseTime(DateTime.UtcNow);
                SaveGame();
            }
            else
            {
                // App kembali ke foreground — hitung offline income
                offlineCalc.CalculateAndShowOfflineIncome();
            }
        }

        private void OnApplicationQuit()
        {
            SaveSystem.Instance.SetLastCloseTime(DateTime.UtcNow);
            SaveGame();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Inisialisasi

        private void InitializeGame()
        {
            // Urutan inisialisasi penting: data dulu, lalu gameplay, lalu UI
            SaveSystem.Instance.LoadGame();

            coinManager.Initialize();
            farmManager.Initialize();
            workerManager.Initialize();
            upgradeSystem.Initialize();
            achievementSystem.Initialize();
            dailyMissionSystem.Initialize();
            adMobManager.Initialize();

            // Hitung offline income setelah semua sistem siap
            offlineCalc.CalculateAndShowOfflineIncome();

            // UI terakhir karena butuh data dari sistem lain
            uiManager.Initialize();

            isInitialized = true;
            OnGameInitialized?.Invoke();

            Debug.Log("[GameManager] Game berhasil diinisialisasi.");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save / Load

        /// <summary>
        /// Simpan semua data game ke SaveSystem.
        /// Dipanggil otomatis saat pause/quit, dan bisa dipanggil manual.
        /// </summary>
        public void SaveGame()
        {
            if (!isInitialized) return;

            SaveSystem.Instance.SaveGame();
            OnGameSaved?.Invoke();
            Debug.Log("[GameManager] Game disimpan.");
        }

        // Auto-save setiap 60 detik
        private float autoSaveTimer = 0f;
        private const float AUTO_SAVE_INTERVAL = 60f;

        private void Update()
        {
            if (!isInitialized) return;

            autoSaveTimer += Time.deltaTime;
            if (autoSaveTimer >= AUTO_SAVE_INTERVAL)
            {
                autoSaveTimer = 0f;
                SaveGame();
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Prestige

        /// <summary>
        /// Melakukan reset prestige: reset semua progres, beri multiplier permanen.
        /// Hanya bisa dipanggil setelah kondisi prestige terpenuhi.
        /// </summary>
        public void DoPrestige()
        {
            if (!CanPrestige())
            {
                Debug.LogWarning("[GameManager] Kondisi prestige belum terpenuhi.");
                return;
            }

            int currentPrestigeCount = SaveSystem.Instance.GetPrestigeCount();
            float prestigeMultiplier = CalculatePrestigeMultiplier(currentPrestigeCount + 1);

            // Simpan multiplier permanen sebelum reset
            SaveSystem.Instance.SetPrestigeMultiplier(prestigeMultiplier);
            SaveSystem.Instance.SetPrestigeCount(currentPrestigeCount + 1);

            // Reset semua progres (bukan data permanen)
            coinManager.ResetForPrestige();
            farmManager.ResetForPrestige();
            workerManager.ResetForPrestige();
            upgradeSystem.ResetForPrestige();

            SaveGame();
            OnPrestige?.Invoke();

            Debug.Log($"[GameManager] Prestige ke-{currentPrestigeCount + 1} dilakukan. Multiplier: {prestigeMultiplier:F2}x");
        }

        private bool CanPrestige()
        {
            // Contoh kondisi: semua area harus terbuka
            return farmManager.AllAreasUnlocked();
        }

        /// <summary>
        /// Hitung multiplier prestige. Setiap prestige menambah +10% dari base.
        /// Contoh: Prestige 1 = 1.1x, Prestige 2 = 1.2x, Prestige 5 = 1.5x
        /// </summary>
        private float CalculatePrestigeMultiplier(int prestigeCount)
        {
            return 1f + (prestigeCount * 0.10f);
        }

        #endregion
    }
}
