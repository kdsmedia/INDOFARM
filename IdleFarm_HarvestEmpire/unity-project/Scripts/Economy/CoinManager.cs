using System;
using UnityEngine;

namespace IdleFarm.Economy
{
    /// <summary>
    /// Mengelola satu-satunya mata uang dalam game: Koin.
    /// Semua penambahan dan pengurangan Koin wajib melalui class ini.
    /// </summary>
    public class CoinManager : MonoBehaviour
    {
        public static CoinManager Instance { get; private set; }

        // Koin disimpan sebagai double untuk mendukung angka sangat besar (late game)
        private double _coins = 0;

        public double Coins
        {
            get => _coins;
            private set
            {
                _coins = Math.Max(0, value);
                OnCoinsChanged?.Invoke(_coins);
            }
        }

        // Event yang didengarkan UI untuk update tampilan
        public event Action<double> OnCoinsChanged;
        public event Action<double, Vector3> OnCoinsEarned;   // jumlah + posisi world (untuk animasi fly)

        private Core.RemoteConfigManager remoteConfig;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            _coins = saveData.coins;
            remoteConfig = Core.RemoteConfigManager.Instance;

            OnCoinsChanged?.Invoke(_coins);
            Debug.Log($"[CoinManager] Diinisialisasi. Koin: {_coins:N0}");
        }

        // ──────────────────────────────────────────────
        #region Tambah / Kurang Koin

        /// <summary>
        /// Tambahkan Koin. Gunakan posisi worldPos untuk animasi koin terbang ke HUD.
        /// </summary>
        public void AddCoins(double amount, Vector3 worldPos = default)
        {
            if (amount <= 0) return;

            // Terapkan multiplier sell value dari upgrade
            float sellMult = Upgrade.UpgradeSystem.Instance != null
                ? Upgrade.UpgradeSystem.Instance.GetSellValueMultiplier()
                : 1f;

            // Terapkan multiplier prestige permanen
            float prestigeMult = Core.SaveSystem.Instance.GetPrestigeMultiplier();

            // Terapkan multiplier dari remote config (event bonus, dll)
            float remoteMult = remoteConfig != null ? remoteConfig.SellValueMultiplier : 1f;

            double finalAmount = amount * sellMult * prestigeMult * remoteMult;
            Coins += finalAmount;

            // Simpan ke save data
            Core.SaveSystem.Instance.GetSaveData().coins = _coins;

            OnCoinsEarned?.Invoke(finalAmount, worldPos);
        }

        /// <summary>
        /// Kurangi Koin. Kembalikan true jika berhasil, false jika tidak cukup.
        /// </summary>
        public bool SpendCoins(double amount)
        {
            if (amount <= 0) return true;
            if (!CanAfford(amount)) return false;

            Coins -= amount;
            Core.SaveSystem.Instance.GetSaveData().coins = _coins;
            return true;
        }

        public bool CanAfford(double amount) => _coins >= amount;

        #endregion

        // ──────────────────────────────────────────────
        #region Prestige & Reset

        public void ResetForPrestige()
        {
            Coins = 0;
            Core.SaveSystem.Instance.GetSaveData().coins = 0;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Format Angka untuk UI

        /// <summary>
        /// Format angka besar menjadi teks singkat: 1.2K, 3.5M, 2.1B, dst.
        /// </summary>
        public static string FormatCoins(double amount)
        {
            if (amount >= 1_000_000_000_000) return $"{amount / 1_000_000_000_000:F1}T";
            if (amount >= 1_000_000_000)     return $"{amount / 1_000_000_000:F1}B";
            if (amount >= 1_000_000)         return $"{amount / 1_000_000:F1}M";
            if (amount >= 1_000)             return $"{amount / 1_000:F1}K";
            return $"{(long)amount}";
        }

        #endregion
    }
}
