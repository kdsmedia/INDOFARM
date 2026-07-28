using System;
using UnityEngine;

namespace IdleFarm.Monetization
{
    /// <summary>
    /// Menghitung pendapatan offline saat pemain kembali membuka app.
    /// Menampilkan popup dan memberi opsi 2x lipat via rewarded ad.
    /// </summary>
    public class OfflineIncomeCalculator : MonoBehaviour
    {
        [SerializeField] private Economy.EconomyConfig economyConfig;

        // Estimasi pendapatan per detik berdasarkan state farm saat ini
        // (nilai ini diperbarui berkala saat game berjalan)
        private double _baseIncomePerSecond = 0;

        private void Start()
        {
            // Update estimasi income per detik setiap menit
            InvokeRepeating(nameof(UpdateIncomeEstimate), 5f, 60f);
        }

        // ──────────────────────────────────────────────
        #region Kalkulasi

        public void CalculateAndShowOfflineIncome()
        {
            DateTime lastClose = Core.SaveSystem.Instance.GetLastCloseTime();
            TimeSpan offlineDuration = DateTime.UtcNow - lastClose;

            if (offlineDuration.TotalSeconds < 30)
            {
                // Terlalu singkat — tidak tampilkan popup
                return;
            }

            double offlineSeconds = Math.Min(
                offlineDuration.TotalSeconds,
                economyConfig.maxOfflineHours * 3600.0
            );

            double offlineMultiplier = Upgrade.UpgradeSystem.Instance != null
                ? Upgrade.UpgradeSystem.Instance.GetOfflineRateMultiplier()
                : economyConfig.baseOfflineMultiplier;

            double income = _baseIncomePerSecond * offlineSeconds * offlineMultiplier;

            if (income < 1) return; // Tidak signifikan

            // Tampilkan popup dengan opsi tonton iklan
            UI.UIManager.Instance?.ShowOfflineIncomePopup(income, offlineDuration, OnClaimNormal, OnClaimWithAd);

            Debug.Log($"[OfflineIncome] Durasi: {offlineDuration.TotalMinutes:F1} menit | Income: {Economy.CoinManager.FormatCoins(income)} Koin");
        }

        private void UpdateIncomeEstimate()
        {
            // Hitung estimasi income per detik dari semua plot aktif
            // Logika: jumlah semua (nilai jual tanaman / waktu tumbuh) per plot yang ditanami
            _baseIncomePerSecond = EstimateIncomePerSecond();
        }

        private double EstimateIncomePerSecond()
        {
            double total = 0;
            var farmMgr = Farm.FarmManager.Instance;
            if (farmMgr == null) return 0;

            float sellMult = Upgrade.UpgradeSystem.Instance?.GetSellValueMultiplier() ?? 1f;
            float speedRed = Upgrade.UpgradeSystem.Instance?.GetGrowSpeedReduction()  ?? 0f;

            // Iterasi semua area & plot
            for (int areaIdx = 1; areaIdx <= 5; areaIdx++)
            {
                var area = farmMgr.GetArea(areaIdx);
                if (area == null || !area.IsUnlocked) continue;

                if (area.Config?.plots == null) continue;
                foreach (var plot in area.Config.plots)
                {
                    if (plot?.CurrentCrop == null) continue;

                    double sellValue  = plot.CurrentCrop.baseSellValue * sellMult;
                    float  growTime   = plot.CurrentCrop.GetActualGrowTime(speedRed);
                    if (growTime > 0)
                        total += sellValue / growTime;
                }
            }

            return total;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Klaim

        private double _pendingIncome;

        private void OnClaimNormal(double income)
        {
            Economy.CoinManager.Instance.AddCoins(income);
            Debug.Log($"[OfflineIncome] Klaim normal: +{Economy.CoinManager.FormatCoins(income)} Koin");
        }

        private void OnClaimWithAd(double income)
        {
            _pendingIncome = income;

            AdMobManager.Instance?.ShowRewardedAd(
                "offline_income",
                onGranted: () =>
                {
                    float bonus = Core.RemoteConfigManager.Instance?.RewardAdBonus ?? 2f;
                    double boostedIncome = _pendingIncome * bonus;
                    Economy.CoinManager.Instance.AddCoins(boostedIncome);
                    Debug.Log($"[OfflineIncome] Klaim dengan iklan: +{Economy.CoinManager.FormatCoins(boostedIncome)} Koin ({bonus}× lipat)");
                },
                onFailed: () =>
                {
                    // Gagal tonton iklan → klaim normal saja
                    OnClaimNormal(_pendingIncome);
                }
            );
        }

        #endregion
    }
}
