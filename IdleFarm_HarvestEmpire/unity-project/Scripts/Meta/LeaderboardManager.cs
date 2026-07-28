using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Meta
{
    /// <summary>
    /// Mengelola leaderboard mingguan berbasis pendapatan.
    /// Integrasi dengan Unity Leaderboards (Unity Gaming Services) atau backend kustom.
    /// </summary>
    public class LeaderboardManager : MonoBehaviour
    {
        public static LeaderboardManager Instance { get; private set; }

        [Header("Konfigurasi")]
        [SerializeField] private Economy.EconomyConfig economyConfig;
        [SerializeField] private string leaderboardId = "weekly_earnings";

        // Score minggu ini (dikumpulkan lokal, dikirim saat online)
        private double _weeklyScore = 0;

        // Cache entry leaderboard
        private List<LeaderboardEntry> _cachedEntries = new List<LeaderboardEntry>();
        private bool _isFetching = false;

        public event Action<List<LeaderboardEntry>> OnLeaderboardFetched;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        private void Start()
        {
            CheckWeeklyReset();
            // Kirim score pending jika ada koneksi
            SubmitScoreAsync();
        }

        // ──────────────────────────────────────────────
        #region Score

        /// <summary>
        /// Tambahkan ke skor mingguan saat pemain mendapat koin.
        /// Dipanggil dari CoinManager.OnCoinsEarned atau FarmPlot.OnHarvested.
        /// </summary>
        public void AddWeeklyScore(double amount)
        {
            _weeklyScore += amount;
            PlayerPrefs.SetString("LB_WeeklyScore", _weeklyScore.ToString());
            PlayerPrefs.Save();
        }

        private void CheckWeeklyReset()
        {
            string savedWeek = PlayerPrefs.GetString("LB_WeekKey", "");
            string currentWeek = GetWeekKey();

            if (savedWeek != currentWeek)
            {
                // Minggu baru — reset score
                _weeklyScore = 0;
                PlayerPrefs.SetString("LB_WeekKey",     currentWeek);
                PlayerPrefs.SetString("LB_WeeklyScore", "0");
                PlayerPrefs.Save();
                Debug.Log("[Leaderboard] Skor mingguan direset untuk minggu baru.");
            }
            else
            {
                // Muat skor yang tersimpan
                string saved = PlayerPrefs.GetString("LB_WeeklyScore", "0");
                double.TryParse(saved, out _weeklyScore);
            }
        }

        private string GetWeekKey()
        {
            // Format: "YYYY-WW" (tahun-nomor minggu)
            var now = DateTime.UtcNow;
            int weekNum = System.Globalization.CultureInfo.InvariantCulture
                .Calendar.GetWeekOfYear(now,
                    System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                    DayOfWeek.Monday);
            return $"{now.Year}-{weekNum:D2}";
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Submit & Fetch

        /// <summary>
        /// Kirim skor ke server leaderboard.
        /// Implementasi dengan Unity Leaderboards SDK.
        /// </summary>
        public async void SubmitScoreAsync()
        {
            // ── IMPLEMENTASI UNITY LEADERBOARDS ──
            // await LeaderboardsService.Instance.AddPlayerScoreAsync(
            //     leaderboardId,
            //     _weeklyScore
            // );
            // Debug.Log($"[Leaderboard] Skor {_weeklyScore:N0} dikirim.");

            // ── PLACEHOLDER ──
            await System.Threading.Tasks.Task.Delay(100);
            Debug.Log($"[Leaderboard] Placeholder submit skor: {_weeklyScore:N0}");
        }

        /// <summary>
        /// Ambil data leaderboard dari server.
        /// </summary>
        public async void FetchLeaderboardAsync()
        {
            if (_isFetching) return;
            _isFetching = true;

            // ── IMPLEMENTASI UNITY LEADERBOARDS ──
            // var result = await LeaderboardsService.Instance.GetScoresAsync(leaderboardId);
            // var entries = result.Results.Select(r => new LeaderboardEntry
            // {
            //     rank         = r.Rank,
            //     playerName   = r.PlayerName,
            //     score        = r.Score,
            //     playerId     = r.PlayerId
            // }).ToList();
            // _cachedEntries = entries;
            // OnLeaderboardFetched?.Invoke(_cachedEntries);

            // ── PLACEHOLDER: Buat data dummy ──
            _cachedEntries = GenerateDummyEntries();
            OnLeaderboardFetched?.Invoke(_cachedEntries);

            _isFetching = false;
        }

        public List<LeaderboardEntry> GetCachedEntries() => _cachedEntries;

        private List<LeaderboardEntry> GenerateDummyEntries()
        {
            return new List<LeaderboardEntry>
            {
                new LeaderboardEntry { rank = 1, playerName = "PetaniJaya",   score = 9_500_000 },
                new LeaderboardEntry { rank = 2, playerName = "SawahMas",     score = 8_200_000 },
                new LeaderboardEntry { rank = 3, playerName = "KebunRakyat",  score = 7_100_000 },
                new LeaderboardEntry { rank = 4, playerName = "LadangEmas",   score = 5_900_000 },
                new LeaderboardEntry { rank = 5, playerName = "Kamu",         score = (long)_weeklyScore, isLocalPlayer = true },
            };
        }

        #endregion
    }

    // ──────────────────────────────────────────────

    [Serializable]
    public class LeaderboardEntry
    {
        public int    rank;
        public string playerName;
        public double score;
        public string playerId;
        public bool   isLocalPlayer;
    }
}
