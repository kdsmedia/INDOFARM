using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Farm
{
    /// <summary>
    /// Mengelola semua area dan petak lahan di farm.
    /// Bertanggung jawab atas inisialisasi, save/load, dan unlock area.
    /// </summary>
    public class FarmManager : MonoBehaviour
    {
        public static FarmManager Instance { get; private set; }

        [Header("Konfigurasi Area")]
        [SerializeField] private AreaConfig[] areaConfigs;

        [Header("Referensi")]
        [SerializeField] private Economy.EconomyConfig economyConfig;

        // Data runtime
        private List<FarmArea> _areas = new List<FarmArea>();

        public event System.Action<int> OnAreaUnlocked;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();

            foreach (var config in areaConfigs)
            {
                bool isUnlocked = System.Array.Exists(saveData.unlockedAreas,
                    idx => idx == config.areaIndex);

                _areas.Add(new FarmArea(config, isUnlocked));
            }

            // Pastikan Area 1 selalu terbuka
            if (_areas.Count > 0) _areas[0].SetUnlocked(true);

            // Restore state plot dari save
            RestorePlotsFromSave(saveData);

            Debug.Log($"[FarmManager] Diinisialisasi. {_areas.Count} area dimuat.");
        }

        // ──────────────────────────────────────────────
        #region Unlock Area

        public bool TryUnlockArea(int areaIndex)
        {
            var area = GetArea(areaIndex);
            if (area == null || area.IsUnlocked) return false;

            double cost = economyConfig.CalculateAreaUnlockPrice(
                GetAreaBasePrice(areaIndex), areaIndex);

            if (!Economy.CoinManager.Instance.SpendCoins(cost))
            {
                Debug.Log($"[FarmManager] Koin tidak cukup untuk buka Area {areaIndex}.");
                return false;
            }

            area.SetUnlocked(true);
            SaveUnlockedAreas();
            OnAreaUnlocked?.Invoke(areaIndex);

            Debug.Log($"[FarmManager] Area {areaIndex} berhasil dibuka.");
            return true;
        }

        public double GetAreaUnlockCost(int areaIndex)
            => economyConfig.CalculateAreaUnlockPrice(GetAreaBasePrice(areaIndex), areaIndex);

        private double GetAreaBasePrice(int areaIndex)
        {
            // Harga dasar per area — sesuaikan dengan GDD tabel area
            double[] basePrices = { 0, 5000, 50000, 500000, 5000000 };
            int idx = Mathf.Clamp(areaIndex - 1, 0, basePrices.Length - 1);
            return basePrices[idx];
        }

        public bool AllAreasUnlocked()
        {
            foreach (var area in _areas)
                if (!area.IsUnlocked) return false;
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Query

        public FarmArea GetArea(int areaIndex)
            => _areas.Find(a => a.Config.areaIndex == areaIndex);

        public List<FarmPlot> GetAllReadyPlots()
        {
            var result = new List<FarmPlot>();
            foreach (var area in _areas)
            {
                if (!area.IsUnlocked) continue;
                result.AddRange(area.GetReadyPlots());
            }
            return result;
        }

        public List<FarmPlot> GetAllEmptyPlots()
        {
            var result = new List<FarmPlot>();
            foreach (var area in _areas)
            {
                if (!area.IsUnlocked) continue;
                result.AddRange(area.GetEmptyPlots());
            }
            return result;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save / Load

        private void RestorePlotsFromSave(Core.SaveData saveData)
        {
            if (saveData.plots == null) return;

            foreach (var plotData in saveData.plots)
            {
                var area = GetArea(plotData.areaIndex);
                var plot = area?.GetPlot(plotData.plotIndex);
                plot?.RestoreFromSave(plotData);
            }
        }

        private void SaveUnlockedAreas()
        {
            var unlockedList = new List<int>();
            foreach (var area in _areas)
                if (area.IsUnlocked) unlockedList.Add(area.Config.areaIndex);

            Core.SaveSystem.Instance.GetSaveData().unlockedAreas = unlockedList.ToArray();
        }

        public void ResetForPrestige()
        {
            // Reset semua plot, pertahankan area unlock
            foreach (var area in _areas)
                area.ResetAllPlots();
        }

        #endregion
    }

    // ──────────────────────────────────────────────
    /// <summary>Data konfigurasi satu area (diisi via Inspector).</summary>
    [System.Serializable]
    public class AreaConfig
    {
        public int        areaIndex;
        public string     areaName;
        public GameObject areaRoot;    // root GameObject area di scene
        public FarmPlot[] plots;       // referensi semua plot dalam area ini
    }

    /// <summary>Runtime state satu area.</summary>
    public class FarmArea
    {
        public AreaConfig Config     { get; private set; }
        public bool       IsUnlocked { get; private set; }

        public FarmArea(AreaConfig config, bool isUnlocked)
        {
            Config = config;
            IsUnlocked = isUnlocked;
            ApplyLockedVisual(!isUnlocked);
        }

        public void SetUnlocked(bool unlocked)
        {
            IsUnlocked = unlocked;
            ApplyLockedVisual(!unlocked);
        }

        public List<FarmPlot> GetReadyPlots()
        {
            var result = new List<FarmPlot>();
            if (Config.plots == null) return result;
            foreach (var p in Config.plots)
                if (p.State == FarmPlot.PlotState.Ready) result.Add(p);
            return result;
        }

        public List<FarmPlot> GetEmptyPlots()
        {
            var result = new List<FarmPlot>();
            if (Config.plots == null) return result;
            foreach (var p in Config.plots)
                if (p.State == FarmPlot.PlotState.Empty) result.Add(p);
            return result;
        }

        public FarmPlot GetPlot(int plotIndex)
        {
            if (Config.plots == null || plotIndex < 0 || plotIndex >= Config.plots.Length)
                return null;
            return Config.plots[plotIndex];
        }

        public void ResetAllPlots()
        {
            if (Config.plots == null) return;
            foreach (var p in Config.plots) p.HandleTap(); // trigger clear via state
        }

        private void ApplyLockedVisual(bool locked)
        {
            if (Config.plots == null) return;
            foreach (var p in Config.plots) p.SetLocked(locked);
        }
    }
}
