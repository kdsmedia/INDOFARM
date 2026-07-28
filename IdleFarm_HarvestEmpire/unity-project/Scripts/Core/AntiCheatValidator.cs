using System;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Validasi dasar anti-cheat di sisi klien.
    /// Untuk perlindungan penuh, validasi kritis HARUS dilakukan di server.
    ///
    /// Cek yang dilakukan lokal:
    /// 1. Deteksi manipulasi timestamp (jam perangkat dimundurkan)
    /// 2. Rate-limit income per detik (nilai tidak wajar)
    /// 3. Konsistensi saldo koin (cek hash sederhana)
    /// </summary>
    public class AntiCheatValidator : MonoBehaviour
    {
        public static AntiCheatValidator Instance { get; private set; }

        private const string PREF_LAST_VALID_TIME    = "IdleFarm_LastValidTime";
        private const string PREF_COIN_HASH          = "IdleFarm_CoinHash";
        private const double MAX_INCOME_PER_SECOND   = 1_000_000_000; // Batas wajar income/detik

        private DateTime _lastRecordedTime;
        private bool     _clockTampered = false;

        public bool IsClockTampered => _clockTampered;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            LoadLastValidTime();
            ValidateClock();
            InvokeRepeating(nameof(PeriodicValidation), 30f, 30f);
        }

        // ──────────────────────────────────────────────
        #region Clock Validation

        private void LoadLastValidTime()
        {
            string raw = PlayerPrefs.GetString(PREF_LAST_VALID_TIME, "");
            if (!string.IsNullOrEmpty(raw) && long.TryParse(raw, out long binary))
                _lastRecordedTime = DateTime.FromBinary(binary);
            else
                _lastRecordedTime = DateTime.UtcNow;
        }

        private void ValidateClock()
        {
            DateTime now = DateTime.UtcNow;

            // Jika jam saat ini lebih awal dari jam terakhir tercatat → kemungkinan manipulasi
            if (now < _lastRecordedTime - TimeSpan.FromMinutes(5))
            {
                _clockTampered = true;
                Debug.LogWarning("[AntiCheat] Kemungkinan manipulasi jam terdeteksi.");
                OnTamperingDetected("clock_manipulation");
            }
            else
            {
                _clockTampered = false;
                // Perbarui timestamp valid
                _lastRecordedTime = now;
                PlayerPrefs.SetString(PREF_LAST_VALID_TIME, now.ToBinary().ToString());
                PlayerPrefs.Save();
            }
        }

        private void PeriodicValidation()
        {
            ValidateClock();
            ValidateCoinBalance();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Income Rate Validation

        /// <summary>
        /// Validasi apakah penambahan income dalam satu aksi masih wajar.
        /// Panggil sebelum AddCoins di CoinManager.
        /// </summary>
        public bool ValidateIncomeAmount(double amount, float deltaTime)
        {
            if (deltaTime <= 0) return true;

            double ratePerSecond = amount / deltaTime;
            if (ratePerSecond > MAX_INCOME_PER_SECOND)
            {
                Debug.LogWarning($"[AntiCheat] Income tidak wajar: {ratePerSecond:N0}/detik");
                OnTamperingDetected("income_rate_exceeded");
                return false;
            }
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Coin Balance Hash

        /// <summary>
        /// Simpan hash saldo koin untuk mendeteksi modifikasi langsung di memori.
        /// Ini adalah perlindungan ringan — tidak pengganti server-side validation.
        /// </summary>
        public void SaveCoinHash(double coins)
        {
            int hash = (int)(coins % 999983) ^ 0x5A3C; // hash sederhana
            PlayerPrefs.SetInt(PREF_COIN_HASH, hash);
            PlayerPrefs.Save();
        }

        private void ValidateCoinBalance()
        {
            if (Economy.CoinManager.Instance == null) return;

            double coins = Economy.CoinManager.Instance.Coins;
            int expectedHash = (int)(coins % 999983) ^ 0x5A3C;
            int savedHash    = PlayerPrefs.GetInt(PREF_COIN_HASH, expectedHash);

            if (savedHash != expectedHash)
            {
                Debug.LogWarning("[AntiCheat] Ketidakcocokan hash saldo koin.");
                // Jangan langsung ban — laporkan ke server untuk investigasi
                OnTamperingDetected("coin_hash_mismatch");
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Response

        private void OnTamperingDetected(string reason)
        {
            // TODO: Kirim event ke analytics untuk review manual
            // AnalyticsManager.LogEvent("anti_cheat_triggered", new Dictionary<string, object> { ["reason"] = reason });

            // Catatan: Jangan langsung ban atau reset data berdasarkan deteksi klien saja.
            // Keputusan ban dilakukan di server setelah verifikasi silang.
            Debug.LogWarning($"[AntiCheat] Laporan dikirim ke server: {reason}");
        }

        #endregion
    }
}
