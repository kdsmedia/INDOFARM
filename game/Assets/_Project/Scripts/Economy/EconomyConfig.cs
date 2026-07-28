using UnityEngine;

namespace IdleFarm.Economy
{
    /// <summary>
    /// ScriptableObject berisi semua konstanta ekonomi global.
    /// Buat asset: klik kanan di Project → Create → IdleFarm → EconomyConfig
    /// </summary>
    [CreateAssetMenu(menuName = "IdleFarm/Economy Config", fileName = "EconomyConfig")]
    public class EconomyConfig : ScriptableObject
    {
        [Header("Offline Income")]
        [Tooltip("Persentase rate income saat offline (0.5 = 50% dari rate online)")]
        [Range(0.1f, 1.0f)]
        public float baseOfflineMultiplier = 0.5f;

        [Tooltip("Maksimum jam akumulasi offline")]
        public int maxOfflineHours = 8;

        [Header("Multiplier Rewarded Ad")]
        [Tooltip("Multiplier saat menonton iklan untuk gandakan offline income")]
        public float rewardAdOfflineMultiplier = 2f;

        [Tooltip("Multiplier saat menonton iklan untuk gandakan isi peti")]
        public float rewardAdChestMultiplier = 2f;

        [Header("Formula Upgrade")]
        [Tooltip("Faktor kenaikan harga upgrade kecepatan tumbuh")]
        public float growSpeedPriceFactor = 1.15f;

        [Tooltip("Faktor kenaikan harga upgrade nilai jual")]
        public float sellValuePriceFactor = 1.15f;

        [Tooltip("Faktor kenaikan harga upgrade kecepatan pekerja")]
        public float workerSpeedPriceFactor = 1.18f;

        [Tooltip("Faktor kenaikan harga upgrade kapasitas gudang")]
        public float warehousePriceFactor = 1.20f;

        [Tooltip("Faktor kenaikan harga upgrade tarif offline")]
        public float offlineRatePriceFactor = 1.25f;

        [Header("Formula Area Unlock")]
        [Tooltip("Faktor kenaikan harga buka area")]
        public float areaUnlockPriceFactor = 1.6f;

        [Header("Worker Recruit Cost")]
        public double workerSlot1Cost = 500;
        public double workerSlot2Cost = 5000;
        public double workerSlot3Cost = 50000;

        [Header("Prestige")]
        [Tooltip("Persentase penambahan multiplier per prestige (+10% = 0.10)")]
        public float prestigeMultiplierStep = 0.10f;

        [Header("Leaderboard")]
        [Tooltip("Hari reset leaderboard mingguan (0=Minggu, 1=Senin, dst)")]
        public int leaderboardResetDayOfWeek = 1; // Senin

        // ──────────────────────────────────────────────
        #region Helper Kalkulasi

        /// <summary>
        /// Hitung harga upgrade berdasarkan harga dasar, faktor, dan level saat ini.
        /// Rumus: hargaDasar × faktor ^ level
        /// </summary>
        public double CalculateUpgradePrice(double basePrice, float factor, int currentLevel)
        {
            return basePrice * System.Math.Pow(factor, currentLevel);
        }

        /// <summary>
        /// Hitung harga buka area.
        /// Rumus: hargaDasar × areaUnlockPriceFactor ^ (areaIndex - 1)
        /// </summary>
        public double CalculateAreaUnlockPrice(double baseAreaPrice, int areaIndex)
        {
            if (areaIndex <= 1) return 0; // Area 1 gratis
            return baseAreaPrice * System.Math.Pow(areaUnlockPriceFactor, areaIndex - 1);
        }

        #endregion
    }
}
