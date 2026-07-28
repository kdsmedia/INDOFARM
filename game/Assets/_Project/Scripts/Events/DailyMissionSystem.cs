using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Events
{
    /// <summary>
    /// Mengelola misi harian dan mingguan.
    /// Misi direset otomatis setiap hari/minggu berdasarkan tanggal.
    /// </summary>
    public class DailyMissionSystem : MonoBehaviour
    {
        public static DailyMissionSystem Instance { get; private set; }

        [Header("Daftar Template Misi Harian")]
        [SerializeField] private MissionTemplate[] dailyMissionTemplates;

        [Header("Daftar Template Misi Mingguan")]
        [SerializeField] private MissionTemplate[] weeklyMissionTemplates;

        // Misi aktif saat ini
        private List<MissionInstance> _activeDailyMissions  = new List<MissionInstance>();
        private List<MissionInstance> _activeWeeklyMissions = new List<MissionInstance>();

        public event Action<MissionInstance> OnMissionCompleted;
        public event Action<MissionInstance> OnMissionClaimed;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        // ──────────────────────────────────────────────
        #region Init & Reset

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            CheckAndResetDailyMissions(saveData);
            GenerateMissionsIfNeeded();

            Debug.Log($"[DailyMission] Diinisialisasi. {_activeDailyMissions.Count} misi harian aktif.");
        }

        private void CheckAndResetDailyMissions(Core.SaveData saveData)
        {
            string today = DateTime.UtcNow.ToString("yyyy-MM-dd");

            if (saveData.missions.lastResetDate != today)
            {
                // Reset misi harian
                _activeDailyMissions.Clear();
                saveData.missions.completedDaily = new string[0];
                saveData.missions.claimedDaily   = new string[0];
                saveData.missions.lastResetDate  = today;

                Debug.Log("[DailyMission] Misi harian direset untuk hari baru.");
            }
            else
            {
                // Load state misi yang ada
                RestoreMissionState(saveData);
            }
        }

        private void GenerateMissionsIfNeeded()
        {
            if (_activeDailyMissions.Count == 0 && dailyMissionTemplates != null)
            {
                // Pilih 3–5 misi acak dari template
                var shuffled = new List<MissionTemplate>(dailyMissionTemplates);
                ShuffleList(shuffled);

                int count = Mathf.Min(4, shuffled.Count);
                for (int i = 0; i < count; i++)
                    _activeDailyMissions.Add(new MissionInstance(shuffled[i]));
            }
        }

        private void RestoreMissionState(Core.SaveData saveData)
        {
            GenerateMissionsIfNeeded();

            // Tandai misi yang sudah selesai/diklaim
            foreach (var m in _activeDailyMissions)
            {
                if (Array.Exists(saveData.missions.completedDaily, id => id == m.Id))
                    m.SetCompleted();
                if (Array.Exists(saveData.missions.claimedDaily, id => id == m.Id))
                    m.SetClaimed();
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Progress

        /// <summary>
        /// Catat progress untuk jenis misi tertentu.
        /// Dipanggil dari sistem lain saat event terjadi (mis. panen, upgrade, dll).
        /// </summary>
        public void RecordProgress(MissionType type, int amount = 1)
        {
            bool anyCompleted = false;

            foreach (var mission in _activeDailyMissions)
            {
                if (mission.Template.missionType == type && !mission.IsCompleted)
                {
                    mission.AddProgress(amount);

                    if (mission.IsCompleted)
                    {
                        OnMissionCompleted?.Invoke(mission);
                        anyCompleted = true;
                        SaveMissionState();
                    }
                }
            }

            if (anyCompleted)
                UI.UIManager.Instance?.ShowToast("Misi selesai! Klaim hadiahmu.");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Klaim Hadiah

        public bool ClaimMissionReward(string missionId)
        {
            var mission = _activeDailyMissions.Find(m => m.Id == missionId);
            if (mission == null || !mission.IsCompleted || mission.IsClaimed) return false;

            mission.SetClaimed();
            Economy.CoinManager.Instance.AddCoins(mission.Template.rewardCoins);
            OnMissionClaimed?.Invoke(mission);
            SaveMissionState();

            UI.UIManager.Instance?.ShowToast($"+{Economy.CoinManager.FormatCoins(mission.Template.rewardCoins)} Koin dari misi!");
            return true;
        }

        public bool HasUnclaimedCompletedMission()
        {
            return _activeDailyMissions.Exists(m => m.IsCompleted && !m.IsClaimed);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Query

        public List<MissionInstance> GetDailyMissions()  => _activeDailyMissions;
        public List<MissionInstance> GetWeeklyMissions() => _activeWeeklyMissions;

        #endregion

        // ──────────────────────────────────────────────
        #region Save

        private void SaveMissionState()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();

            var completed = new List<string>();
            var claimed   = new List<string>();

            foreach (var m in _activeDailyMissions)
            {
                if (m.IsCompleted) completed.Add(m.Id);
                if (m.IsClaimed)   claimed.Add(m.Id);
            }

            saveData.missions.completedDaily = completed.ToArray();
            saveData.missions.claimedDaily   = claimed.ToArray();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Util

        private void ShuffleList<T>(List<T> list)
        {
            var rng = new System.Random();
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }

        #endregion
    }

    // ──────────────────────────────────────────────
    // Data Types

    public enum MissionType
    {
        Harvest,          // Panen X kali
        HarvestCrop,      // Panen tanaman tertentu X kali
        SpendCoins,       // Belanjakan X Koin
        UpgradeAny,       // Lakukan upgrade X kali
        HireWorker,       // Rekrut pekerja
        EarnCoins,        // Kumpulkan X Koin
        WatchAd,          // Tonton X iklan
        VisitGuild,       // Kunjungi kebun anggota koperasi
    }

    [Serializable]
    public class MissionTemplate
    {
        public string      missionId;
        public string      missionName;
        [TextArea(1, 2)]
        public string      description;
        public MissionType missionType;
        public int         targetAmount;
        public double      rewardCoins;
        public Sprite      icon;
    }

    public class MissionInstance
    {
        public MissionTemplate Template    { get; private set; }
        public string          Id          => Template.missionId;
        public int             Progress    { get; private set; }
        public bool            IsCompleted { get; private set; }
        public bool            IsClaimed   { get; private set; }

        public float ProgressPercent => Template.targetAmount > 0
            ? Mathf.Clamp01((float)Progress / Template.targetAmount)
            : 0f;

        public MissionInstance(MissionTemplate template)
        {
            Template = template;
        }

        public void AddProgress(int amount)
        {
            if (IsCompleted) return;
            Progress += amount;
            if (Progress >= Template.targetAmount)
            {
                Progress = Template.targetAmount;
                IsCompleted = true;
            }
        }

        public void SetCompleted() { Progress = Template.targetAmount; IsCompleted = true; }
        public void SetClaimed()   { IsClaimed = true; }
    }
}
