using System;
using UnityEngine;
using Newtonsoft.Json;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola semua penyimpanan dan pembacaan data game.
    /// Menggunakan PlayerPrefs untuk lokal + Unity Cloud Save untuk sinkronisasi.
    /// </summary>
    public class SaveSystem : MonoBehaviour
    {
        public static SaveSystem Instance { get; private set; }

        // Kunci PlayerPrefs
        private const string KEY_SAVE_DATA   = "IdleFarm_SaveData";
        private const string KEY_LAST_CLOSE  = "IdleFarm_LastClose";
        private const string KEY_PRESTIGE    = "IdleFarm_Prestige";
        private const string KEY_PRESTIGE_MULT = "IdleFarm_PrestigeMult";

        private SaveData currentSave;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        // ──────────────────────────────────────────────
        #region Save / Load

        public void SaveGame()
        {
            if (currentSave == null) currentSave = new SaveData();

            string json = JsonConvert.SerializeObject(currentSave, Formatting.None);
            PlayerPrefs.SetString(KEY_SAVE_DATA, json);
            PlayerPrefs.Save();
        }

        public void LoadGame()
        {
            string json = PlayerPrefs.GetString(KEY_SAVE_DATA, string.Empty);
            if (!string.IsNullOrEmpty(json))
            {
                try
                {
                    currentSave = JsonConvert.DeserializeObject<SaveData>(json);
                    Debug.Log("[SaveSystem] Data berhasil dimuat.");
                }
                catch (Exception e)
                {
                    Debug.LogError($"[SaveSystem] Gagal parse save data: {e.Message}. Membuat save baru.");
                    currentSave = new SaveData();
                }
            }
            else
            {
                currentSave = new SaveData();
                Debug.Log("[SaveSystem] Tidak ada save data. Membuat baru.");
            }
        }

        public void DeleteSave()
        {
            PlayerPrefs.DeleteKey(KEY_SAVE_DATA);
            PlayerPrefs.DeleteKey(KEY_LAST_CLOSE);
            PlayerPrefs.DeleteKey(KEY_PRESTIGE);
            PlayerPrefs.DeleteKey(KEY_PRESTIGE_MULT);
            PlayerPrefs.Save();
            currentSave = new SaveData();
            Debug.Log("[SaveSystem] Save data dihapus.");
        }

        public SaveData GetSaveData() => currentSave ?? (currentSave = new SaveData());

        #endregion

        // ──────────────────────────────────────────────
        #region Offline Time

        public void SetLastCloseTime(DateTime time)
        {
            PlayerPrefs.SetString(KEY_LAST_CLOSE, time.ToBinary().ToString());
            PlayerPrefs.Save();
        }

        public DateTime GetLastCloseTime()
        {
            string raw = PlayerPrefs.GetString(KEY_LAST_CLOSE, string.Empty);
            if (string.IsNullOrEmpty(raw)) return DateTime.UtcNow;

            if (long.TryParse(raw, out long binary))
                return DateTime.FromBinary(binary);

            return DateTime.UtcNow;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Prestige

        public int GetPrestigeCount()
            => PlayerPrefs.GetInt(KEY_PRESTIGE, 0);

        public void SetPrestigeCount(int count)
        {
            PlayerPrefs.SetInt(KEY_PRESTIGE, count);
            PlayerPrefs.Save();
        }

        public float GetPrestigeMultiplier()
            => PlayerPrefs.GetFloat(KEY_PRESTIGE_MULT, 1f);

        public void SetPrestigeMultiplier(float mult)
        {
            PlayerPrefs.SetFloat(KEY_PRESTIGE_MULT, mult);
            PlayerPrefs.Save();
        }

        #endregion
    }

    // ──────────────────────────────────────────────
    // Data classes untuk serialisasi JSON

    [Serializable]
    public class SaveData
    {
        public double coins           = 0;
        public int[]  unlockedAreas   = new int[0];
        public PlotSaveData[]  plots  = new PlotSaveData[0];
        public UpgradeSaveData[] upgrades = new UpgradeSaveData[0];
        public WorkerSaveData[]  workers  = new WorkerSaveData[0];
        public bool[] managerActive   = new bool[0];
        public MissionSaveData missions  = new MissionSaveData();
        public AchievementSaveData achievements = new AchievementSaveData();
        public string lastSaveTime    = DateTime.UtcNow.ToBinary().ToString();
    }

    [Serializable]
    public class PlotSaveData
    {
        public int    areaIndex;
        public int    plotIndex;
        public string cropId;
        public float  growProgress;   // 0.0 – 1.0
        public long   plantTimeBinary;
    }

    [Serializable]
    public class UpgradeSaveData
    {
        public string upgradeId;
        public int    level;
    }

    [Serializable]
    public class WorkerSaveData
    {
        public int  areaIndex;
        public int  slotIndex;
        public bool isHired;
        public int  level;
    }

    [Serializable]
    public class MissionSaveData
    {
        public string   lastResetDate   = string.Empty;
        public string[] completedDaily  = new string[0];
        public string[] claimedDaily    = new string[0];
    }

    [Serializable]
    public class AchievementSaveData
    {
        public string[] unlockedIds     = new string[0];
    }
}
