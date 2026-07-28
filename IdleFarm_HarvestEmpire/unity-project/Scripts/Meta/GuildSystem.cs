using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Meta
{
    /// <summary>
    /// Sistem Guild (Koperasi Tani): bergabung ke grup kecil, kontribusi bersama,
    /// dan kunjungi kebun anggota lain untuk saling memberi boost.
    /// Membutuhkan koneksi server. Gunakan placeholder offline untuk testing.
    /// </summary>
    public class GuildSystem : MonoBehaviour
    {
        public static GuildSystem Instance { get; private set; }

        private const string PREF_GUILD_ID   = "IdleFarm_GuildId";
        private const string PREF_GUILD_NAME = "IdleFarm_GuildName";

        private GuildData  _currentGuild;
        private bool       _isInGuild = false;
        private DateTime   _lastVisitTime;
        private const int  MAX_VISITS_PER_DAY = 5;
        private int        _visitsToday = 0;

        public bool IsInGuild  => _isInGuild;
        public GuildData Guild => _currentGuild;

        public event Action<double>  OnGuildContributed;
        public event Action<string>  OnMemberVisited;   // nama anggota
        public event Action<GuildData> OnGuildDataRefreshed;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        private void Start()
        {
            string savedGuildId = PlayerPrefs.GetString(PREF_GUILD_ID, "");
            if (!string.IsNullOrEmpty(savedGuildId))
                LoadGuildDataAsync(savedGuildId);
        }

        // ──────────────────────────────────────────────
        #region Bergabung / Tinggalkan

        public async void JoinGuildAsync(string guildId)
        {
            // ── IMPLEMENTASI SERVER ──
            // var result = await ServerAPI.JoinGuild(guildId, localPlayerId);
            // if (result.success) { ... }

            // ── PLACEHOLDER ──
            await System.Threading.Tasks.Task.Delay(500);
            _currentGuild = CreateDummyGuild(guildId);
            _isInGuild    = true;

            PlayerPrefs.SetString(PREF_GUILD_ID,   guildId);
            PlayerPrefs.SetString(PREF_GUILD_NAME, _currentGuild.guildName);
            PlayerPrefs.Save();

            OnGuildDataRefreshed?.Invoke(_currentGuild);
            Debug.Log($"[Guild] Bergabung ke koperasi: {_currentGuild.guildName}");
        }

        public void LeaveGuild()
        {
            if (!_isInGuild) return;

            _isInGuild    = false;
            _currentGuild = null;

            PlayerPrefs.DeleteKey(PREF_GUILD_ID);
            PlayerPrefs.DeleteKey(PREF_GUILD_NAME);
            PlayerPrefs.Save();

            // ── SERVER: Kirim request leave guild ──
            Debug.Log("[Guild] Keluar dari koperasi.");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Kontribusi & Target Bersama

        /// <summary>
        /// Kontribusikan hasil panen ke target bersama koperasi.
        /// Dipanggil otomatis setiap kali panen (opsional, bisa diset manual).
        /// </summary>
        public void ContributeToGuild(double coinAmount)
        {
            if (!_isInGuild || _currentGuild == null) return;

            double contribution = coinAmount * 0.05; // 5% dari panen dikontribusikan
            _currentGuild.currentContribution += contribution;

            // ── SERVER: Kirim kontribusi ke server ──
            OnGuildContributed?.Invoke(contribution);
        }

        public bool HasReachedWeeklyTarget()
            => _currentGuild != null && _currentGuild.currentContribution >= _currentGuild.weeklyTarget;

        public void ClaimGuildReward()
        {
            if (_currentGuild == null || !HasReachedWeeklyTarget()) return;

            Economy.CoinManager.Instance.AddCoins(_currentGuild.weeklyRewardCoins);
            _currentGuild.currentContribution = 0;

            UI.UIManager.Instance?.ShowToast(
                $"Hadiah koperasi diklaim! +{Economy.CoinManager.FormatCoins(_currentGuild.weeklyRewardCoins)} Koin");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Kunjungi Kebun Anggota

        /// <summary>
        /// Kunjungi kebun anggota lain. Beri boost kecil (+10% produksi 30 menit).
        /// Maksimum 5 kunjungan per hari.
        /// </summary>
        public bool VisitMemberFarm(string memberId)
        {
            if (_visitsToday >= MAX_VISITS_PER_DAY)
            {
                UI.UIManager.Instance?.ShowToast("Kunjungan hari ini sudah habis (maks 5/hari).");
                return false;
            }

            // ── SERVER: Kirim kunjungan ke server, beri boost ke member ──

            _visitsToday++;
            OnMemberVisited?.Invoke(memberId);

            // Beri boost ringan ke pemain yang mengunjungi
            // (reward kunjungan: koin kecil sebagai terima kasih)
            Economy.CoinManager.Instance.AddCoins(100);

            UI.UIManager.Instance?.ShowToast("Kunjungan berhasil! +100 Koin & boost dikirim ke anggota.");
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Load & Helper

        private async void LoadGuildDataAsync(string guildId)
        {
            // ── SERVER: Fetch guild data ──
            await System.Threading.Tasks.Task.Delay(300);
            _currentGuild = CreateDummyGuild(guildId);
            _isInGuild    = true;
            OnGuildDataRefreshed?.Invoke(_currentGuild);
        }

        private GuildData CreateDummyGuild(string guildId)
        {
            return new GuildData
            {
                guildId              = guildId,
                guildName            = "Koperasi Tani Maju",
                memberCount          = 15,
                weeklyTarget         = 1_000_000,
                currentContribution  = 350_000,
                weeklyRewardCoins    = 500_000,
                members              = new List<GuildMember>
                {
                    new GuildMember { playerId = "p1", playerName = "Pak Budi",    weeklyScore = 120_000 },
                    new GuildMember { playerId = "p2", playerName = "Bu Sari",     weeklyScore = 95_000  },
                    new GuildMember { playerId = "p3", playerName = "Mas Joko",    weeklyScore = 135_000 },
                    new GuildMember { playerId = "local", playerName = "Kamu",     weeklyScore = 0, isLocal = true },
                }
            };
        }

        #endregion
    }

    // ──────────────────────────────────────────────

    [Serializable]
    public class GuildData
    {
        public string          guildId;
        public string          guildName;
        public int             memberCount;
        public double          weeklyTarget;
        public double          currentContribution;
        public double          weeklyRewardCoins;
        public List<GuildMember> members = new List<GuildMember>();
    }

    [Serializable]
    public class GuildMember
    {
        public string playerId;
        public string playerName;
        public double weeklyScore;
        public bool   isLocal;
    }
}
