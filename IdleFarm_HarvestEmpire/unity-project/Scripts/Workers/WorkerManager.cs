using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Workers
{
    /// <summary>
    /// Mengelola semua pekerja: rekrut, level up, aktivasi, dan save/load.
    /// </summary>
    public class WorkerManager : MonoBehaviour
    {
        public static WorkerManager Instance { get; private set; }

        [Header("Prefab")]
        [SerializeField] private Worker workerPrefab;

        [Header("Spawn Points per Area")]
        [SerializeField] private WorkerSpawnConfig[] spawnConfigs;

        [Header("Ekonomi")]
        [SerializeField] private Economy.EconomyConfig economyConfig;

        private Dictionary<string, Worker> _activeWorkers = new Dictionary<string, Worker>();

        public event System.Action<int, int> OnWorkerHired;    // area, slot
        public event System.Action<int, int> OnWorkerLevelUp;  // area, slot

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();

            if (saveData.workers != null)
            {
                foreach (var wd in saveData.workers)
                {
                    if (wd.isHired) SpawnWorker(wd.areaIndex, wd.slotIndex, wd.level);
                }
            }

            Debug.Log($"[WorkerManager] Diinisialisasi. {_activeWorkers.Count} pekerja aktif.");
        }

        // ──────────────────────────────────────────────
        #region Rekrut

        public bool TryHireWorker(int areaIndex, int slotIndex)
        {
            string key = WorkerKey(areaIndex, slotIndex);
            if (_activeWorkers.ContainsKey(key))
            {
                Debug.LogWarning($"[WorkerManager] Slot {slotIndex} Area {areaIndex} sudah terisi.");
                return false;
            }

            double cost = GetHireCost(slotIndex);
            if (!Economy.CoinManager.Instance.SpendCoins(cost))
            {
                Debug.Log("[WorkerManager] Koin tidak cukup untuk rekrut pekerja.");
                return false;
            }

            SpawnWorker(areaIndex, slotIndex, 1);
            SaveWorkers();
            OnWorkerHired?.Invoke(areaIndex, slotIndex);

            Debug.Log($"[WorkerManager] Pekerja rekrut: Area {areaIndex}, Slot {slotIndex}.");
            return true;
        }

        private Worker SpawnWorker(int areaIndex, int slotIndex, int level)
        {
            Vector3 spawnPos = GetSpawnPosition(areaIndex, slotIndex);
            Worker w = Instantiate(workerPrefab, spawnPos, Quaternion.identity, transform);
            w.Initialize(areaIndex, slotIndex, level);
            w.gameObject.name = $"Worker_Area{areaIndex}_Slot{slotIndex}";

            // Aktifkan otomatis hanya jika Manager area tersebut aktif
            bool managerActive = Managers.ManagerNPC.IsManagerActive(areaIndex);
            if (managerActive) w.Activate();

            string key = WorkerKey(areaIndex, slotIndex);
            _activeWorkers[key] = w;
            return w;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Level Up

        public bool TryLevelUpWorker(int areaIndex, int slotIndex)
        {
            string key = WorkerKey(areaIndex, slotIndex);
            if (!_activeWorkers.TryGetValue(key, out Worker w)) return false;

            double cost = GetLevelUpCost(w.level);
            if (!Economy.CoinManager.Instance.SpendCoins(cost)) return false;

            w.level++;
            SaveWorkers();
            OnWorkerLevelUp?.Invoke(areaIndex, slotIndex);
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Aktivasi (dipanggil saat Manager diaktifkan)

        public void ActivateWorkersForArea(int areaIndex)
        {
            foreach (var kv in _activeWorkers)
                if (kv.Value.areaIndex == areaIndex) kv.Value.Activate();
        }

        public void DeactivateWorkersForArea(int areaIndex)
        {
            foreach (var kv in _activeWorkers)
                if (kv.Value.areaIndex == areaIndex) kv.Value.Deactivate();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Helper & Query

        public bool IsWorkerHired(int areaIndex, int slotIndex)
            => _activeWorkers.ContainsKey(WorkerKey(areaIndex, slotIndex));

        public Worker GetWorker(int areaIndex, int slotIndex)
        {
            _activeWorkers.TryGetValue(WorkerKey(areaIndex, slotIndex), out Worker w);
            return w;
        }

        public double GetHireCost(int slotIndex)
        {
            return slotIndex switch
            {
                1 => economyConfig.workerSlot1Cost,
                2 => economyConfig.workerSlot2Cost,
                3 => economyConfig.workerSlot3Cost,
                _ => economyConfig.workerSlot3Cost * 2
            };
        }

        public double GetLevelUpCost(int currentLevel)
            => 500 * Mathf.Pow(1.5f, currentLevel - 1);

        private string WorkerKey(int area, int slot) => $"{area}_{slot}";

        private Vector3 GetSpawnPosition(int areaIndex, int slotIndex)
        {
            if (spawnConfigs == null) return Vector3.zero;
            foreach (var sc in spawnConfigs)
            {
                if (sc.areaIndex == areaIndex && sc.slotIndex == slotIndex)
                    return sc.spawnPoint.position;
            }
            return Vector3.zero;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save / Load

        private void SaveWorkers()
        {
            var list = new List<Core.WorkerSaveData>();
            foreach (var kv in _activeWorkers)
            {
                list.Add(new Core.WorkerSaveData
                {
                    areaIndex = kv.Value.areaIndex,
                    slotIndex = kv.Value.slotIndex,
                    isHired   = true,
                    level     = kv.Value.level
                });
            }
            Core.SaveSystem.Instance.GetSaveData().workers = list.ToArray();
        }

        public void ResetForPrestige()
        {
            foreach (var kv in _activeWorkers) Destroy(kv.Value.gameObject);
            _activeWorkers.Clear();
            Core.SaveSystem.Instance.GetSaveData().workers = new Core.WorkerSaveData[0];
        }

        #endregion
    }

    [System.Serializable]
    public class WorkerSpawnConfig
    {
        public int       areaIndex;
        public int       slotIndex;
        public Transform spawnPoint;
    }
}
