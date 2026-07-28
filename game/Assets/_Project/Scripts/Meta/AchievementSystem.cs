using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Meta
{
    /// <summary>
    /// Mengelola semua achievement/pencapaian permanen.
    /// Achievement tidak reset saat prestige — tetap tersimpan selamanya.
    /// </summary>
    public class AchievementSystem : MonoBehaviour
    {
        public static AchievementSystem Instance { get; private set; }

        [Header("Database Achievement")]
        [SerializeField] private AchievementDefinition[] allAchievements;

        private HashSet<string> _unlockedIds = new HashSet<string>();
        private Dictionary<string, double> _progressCounters = new Dictionary<string, double>();

        public event Action<AchievementDefinition> OnAchievementUnlocked;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        // ──────────────────────────────────────────────
        #region Init

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();

            if (saveData.achievements?.unlockedIds != null)
            {
                foreach (var id in saveData.achievements.unlockedIds)
                    _unlockedIds.Add(id);
            }

            Debug.Log($"[AchievementSystem] Diinisialisasi. {_unlockedIds.Count} achievement sudah terbuka.");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Track Progress

        /// <summary>
        /// Catat progress untuk achievement dengan stat tertentu.
        /// Contoh: RecordStat("total_harvests", 1);
        /// </summary>
        public void RecordStat(string statKey, double amount = 1)
        {
            _progressCounters.TryGetValue(statKey, out double current);
            _progressCounters[statKey] = current + amount;

            CheckAchievementsForStat(statKey, _progressCounters[statKey]);
        }

        private void CheckAchievementsForStat(string statKey, double currentValue)
        {
            if (allAchievements == null) return;

            foreach (var def in allAchievements)
            {
                if (def.statKey != statKey) continue;
                if (_unlockedIds.Contains(def.achievementId)) continue;
                if (currentValue >= def.targetValue) UnlockAchievement(def);
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Unlock

        private void UnlockAchievement(AchievementDefinition def)
        {
            _unlockedIds.Add(def.achievementId);

            // Beri reward koin
            if (def.rewardCoins > 0)
                Economy.CoinManager.Instance.AddCoins(def.rewardCoins);

            // Simpan
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            var list = new List<string>(saveData.achievements.unlockedIds ?? new string[0]);
            list.Add(def.achievementId);
            saveData.achievements.unlockedIds = list.ToArray();

            OnAchievementUnlocked?.Invoke(def);

            // Tampilkan notifikasi
            UI.UIManager.Instance?.ShowToast($"Achievement terbuka: {def.achievementName}!");
            Debug.Log($"[Achievement] Terbuka: {def.achievementName}");
        }

        public bool IsUnlocked(string achievementId) => _unlockedIds.Contains(achievementId);
        public List<AchievementDefinition> GetAll()  => new List<AchievementDefinition>(allAchievements ?? new AchievementDefinition[0]);
        public HashSet<string>             GetUnlockedIds() => _unlockedIds;

        #endregion
    }

    // ──────────────────────────────────────────────
    // Data Types

    [CreateAssetMenu(menuName = "IdleFarm/Achievement Definition", fileName = "Ach_New")]
    public class AchievementDefinition : ScriptableObject
    {
        public string achievementId;
        public string achievementName;
        [TextArea(1, 3)]
        public string description;
        public string statKey;           // cocok dengan kunci di RecordStat()
        public double targetValue;       // nilai target untuk unlock
        public double rewardCoins;
        public Sprite badgeSprite;

        [Header("Kategori")]
        public AchievementCategory category;
    }

    public enum AchievementCategory
    {
        Farming,    // Tanam, panen
        Economy,    // Kumpulkan koin
        Exploration,// Buka area
        Social,     // Guild, kunjungi
        Prestige,   // Reset/prestige
        Event,      // Selesaikan event
    }
}
