using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Upgrade
{
    /// <summary>
    /// Mengelola semua upgrade game: level tracking, kalkulasi harga, dan efek.
    /// Satu instance global, akses via UpgradeSystem.Instance.
    /// </summary>
    public class UpgradeSystem : MonoBehaviour
    {
        public static UpgradeSystem Instance { get; private set; }

        [Header("Database Upgrade")]
        [SerializeField] private Data.UpgradeDatabase upgradeDatabase;

        [Header("Ekonomi Config")]
        [SerializeField] private Economy.EconomyConfig economyConfig;

        // Level setiap upgrade
        private Dictionary<string, int> _upgradeLevels = new Dictionary<string, int>();

        public event System.Action<string, int> OnUpgradePerformed; // upgradeId, newLevel

        // ──────────────────────────────────────────────

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();

            if (saveData.upgrades != null)
            {
                foreach (var ud in saveData.upgrades)
                    _upgradeLevels[ud.upgradeId] = ud.level;
            }

            Debug.Log($"[UpgradeSystem] Diinisialisasi. {_upgradeLevels.Count} upgrade dimuat.");
        }

        // ──────────────────────────────────────────────
        #region Upgrade Action

        /// <summary>
        /// Coba lakukan upgrade. Kembalikan true jika berhasil.
        /// </summary>
        public bool TryUpgrade(string upgradeId)
        {
            var data = upgradeDatabase?.GetUpgrade(upgradeId);
            if (data == null)
            {
                Debug.LogWarning($"[UpgradeSystem] Upgrade ID tidak ditemukan: {upgradeId}");
                return false;
            }

            int currentLevel = GetLevel(upgradeId);

            if (currentLevel >= data.maxLevel)
            {
                Debug.Log($"[UpgradeSystem] Upgrade {upgradeId} sudah max level ({data.maxLevel}).");
                return false;
            }

            double cost = GetUpgradeCost(upgradeId, currentLevel);
            if (!Economy.CoinManager.Instance.SpendCoins(cost))
            {
                Debug.Log($"[UpgradeSystem] Koin tidak cukup untuk upgrade {upgradeId}.");
                return false;
            }

            int newLevel = currentLevel + 1;
            _upgradeLevels[upgradeId] = newLevel;

            SaveUpgrades();
            OnUpgradePerformed?.Invoke(upgradeId, newLevel);

            Debug.Log($"[UpgradeSystem] {data.upgradeName} → Level {newLevel}");
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Query Level & Cost

        public int GetLevel(string upgradeId)
        {
            _upgradeLevels.TryGetValue(upgradeId, out int level);
            return level;
        }

        public double GetUpgradeCost(string upgradeId, int currentLevel)
        {
            var data = upgradeDatabase?.GetUpgrade(upgradeId);
            if (data == null) return 0;

            return economyConfig.CalculateUpgradePrice(
                data.baseCost, data.priceGrowthFactor, currentLevel);
        }

        public bool IsMaxLevel(string upgradeId)
        {
            var data = upgradeDatabase?.GetUpgrade(upgradeId);
            if (data == null) return true;
            return GetLevel(upgradeId) >= data.maxLevel;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Multiplier Getters (dipakai oleh sistem lain)

        /// <summary>Pengurangan waktu tumbuh total (0.0–0.90 = 0%–90% lebih cepat).</summary>
        public float GetGrowSpeedReduction()
        {
            int level = GetLevel("GROW_SPEED");
            return Mathf.Clamp(level * 0.02f, 0f, 0.90f);
        }

        /// <summary>Multiplier nilai jual total (1.0 = normal, 1.3 = 30% lebih mahal).</summary>
        public float GetSellValueMultiplier()
        {
            int level = GetLevel("SELL_VALUE");
            return 1f + (level * 0.03f);
        }

        /// <summary>Pengurangan waktu jalan pekerja (0.0–0.90).</summary>
        public float GetWorkerSpeedReduction()
        {
            int level = GetLevel("WORKER_SPEED");
            return Mathf.Clamp(level * 0.03f, 0f, 0.90f);
        }

        /// <summary>Kapasitas gudang total (slot).</summary>
        public int GetWarehouseCapacity()
        {
            int level = GetLevel("WAREHOUSE_CAP");
            return 50 + (level * 10);
        }

        /// <summary>Multiplier offline income total.</summary>
        public float GetOfflineRateMultiplier()
        {
            int level = GetLevel("OFFLINE_RATE");
            float baseMultiplier = Core.RemoteConfigManager.Instance?.OfflineMultiplier ?? 0.5f;
            return Mathf.Min(baseMultiplier + (level * 0.05f), 1.0f);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save / Load

        private void SaveUpgrades()
        {
            var list = new List<Core.UpgradeSaveData>();
            foreach (var kv in _upgradeLevels)
            {
                list.Add(new Core.UpgradeSaveData
                {
                    upgradeId = kv.Key,
                    level     = kv.Value
                });
            }
            Core.SaveSystem.Instance.GetSaveData().upgrades = list.ToArray();
        }

        public void ResetForPrestige()
        {
            _upgradeLevels.Clear();
            Core.SaveSystem.Instance.GetSaveData().upgrades = new Core.UpgradeSaveData[0];
        }

        #endregion
    }
}
