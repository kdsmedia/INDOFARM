using System;
using UnityEngine;

namespace IdleFarm.Farm
{
    /// <summary>
    /// Mengelola satu petak lahan: state, timer tumbuh, visual 3D, dan interaksi tap.
    /// Pasang script ini pada prefab FarmPlot.prefab.
    /// </summary>
    public class FarmPlot : MonoBehaviour
    {
        public enum PlotState { Empty, Growing, Ready, Locked }

        [Header("Konfigurasi")]
        public int areaIndex;
        public int plotIndex;

        [Header("Visual Posisi Tanaman")]
        [SerializeField] private Transform cropAnchor;  // titik tanaman ditempatkan

        [Header("Efek Visual")]
        [SerializeField] private GameObject readyIndicator;   // efek berkedip saat siap panen
        [SerializeField] private GameObject lockedOverlay;    // overlay kunci jika area belum buka
        [SerializeField] private ParticleSystem harvestEffect;

        // State internal
        private PlotState _state = PlotState.Empty;
        private CropData  _currentCrop;
        private float     _growTimer;
        private float     _totalGrowTime;
        private GameObject _currentCropObject;

        public PlotState State => _state;
        public CropData  CurrentCrop => _currentCrop;
        public float     GrowProgress => _totalGrowTime > 0 ? _growTimer / _totalGrowTime : 0f;

        // Events
        public event Action<FarmPlot> OnReadyToHarvest;
        public event Action<FarmPlot, double> OnHarvested;

        // ──────────────────────────────────────────────
        #region Unity Lifecycle

        private void Update()
        {
            if (_state != PlotState.Growing) return;

            _growTimer += Time.deltaTime;
            UpdateCropVisual();

            if (_growTimer >= _totalGrowTime)
            {
                SetState(PlotState.Ready);
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Tanam & Panen

        /// <summary>
        /// Mulai menanam tanaman. Dipanggil oleh player tap atau Worker.
        /// </summary>
        public bool Plant(CropData crop)
        {
            if (_state != PlotState.Empty) return false;
            if (crop == null) return false;

            // Cek biaya benih
            if (crop.seedCost > 0 && !Economy.CoinManager.Instance.SpendCoins(crop.seedCost))
            {
                Debug.Log($"[FarmPlot] Koin tidak cukup untuk benih {crop.cropName}.");
                return false;
            }

            _currentCrop = crop;

            // Hitung waktu tumbuh dengan upgrade
            float reduction = Upgrade.UpgradeSystem.Instance?.GetGrowSpeedReduction() ?? 0f;
            _totalGrowTime = crop.GetActualGrowTime(reduction);
            _growTimer = 0f;

            SetState(PlotState.Growing);
            SpawnCropModel(crop.prefabStage1);

            if (crop.plantSound != null)
                AudioSource.PlayClipAtPoint(crop.plantSound, transform.position);

            SaveProgress();
            return true;
        }

        /// <summary>
        /// Panen tanaman. Dipanggil oleh player tap atau Worker.
        /// Kembalikan nilai koin yang didapat.
        /// </summary>
        public double Harvest()
        {
            if (_state != PlotState.Ready) return 0;
            if (_currentCrop == null) return 0;

            double earnedCoins = _currentCrop.baseSellValue;
            Economy.CoinManager.Instance.AddCoins(earnedCoins, transform.position);

            // Efek visual panen
            PlayHarvestEffects();

            OnHarvested?.Invoke(this, earnedCoins);

            // Reset lahan
            ClearPlot();
            return earnedCoins;
        }

        /// <summary>
        /// Skip timer (setelah menonton rewarded ad).
        /// </summary>
        public void SkipGrowTimer()
        {
            if (_state != PlotState.Growing) return;
            _growTimer = _totalGrowTime;
            SetState(PlotState.Ready);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region State

        private void SetState(PlotState newState)
        {
            _state = newState;

            if (readyIndicator != null)
                readyIndicator.SetActive(_state == PlotState.Ready);

            if (_state == PlotState.Ready)
                OnReadyToHarvest?.Invoke(this);
        }

        private void ClearPlot()
        {
            if (_currentCropObject != null)
            {
                Destroy(_currentCropObject);
                _currentCropObject = null;
            }
            _currentCrop = null;
            _growTimer = 0f;
            _totalGrowTime = 0f;
            SetState(PlotState.Empty);
        }

        public void SetLocked(bool locked)
        {
            _state = locked ? PlotState.Locked : PlotState.Empty;
            if (lockedOverlay != null) lockedOverlay.SetActive(locked);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Visual

        private void UpdateCropVisual()
        {
            if (_currentCrop == null) return;
            float progress = GrowProgress;

            // Ganti model sesuai stage progress
            GameObject targetPrefab = _currentCrop.GetPrefabForProgress(progress);

            if (_currentCropObject == null ||
                _currentCropObject.name != targetPrefab.name + "(Clone)")
            {
                SpawnCropModel(targetPrefab);
            }
        }

        private void SpawnCropModel(GameObject prefab)
        {
            if (prefab == null) return;
            if (_currentCropObject != null) Destroy(_currentCropObject);

            _currentCropObject = Instantiate(prefab, cropAnchor.position, cropAnchor.rotation, cropAnchor);
        }

        private void PlayHarvestEffects()
        {
            if (_currentCrop?.harvestParticlePrefab != null)
            {
                var fx = Instantiate(_currentCrop.harvestParticlePrefab,
                    transform.position + Vector3.up, Quaternion.identity);
                Destroy(fx.gameObject, 3f);
            }

            if (_currentCrop?.harvestSound != null)
                AudioSource.PlayClipAtPoint(_currentCrop.harvestSound, transform.position);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save/Load

        /// <summary>
        /// Simpan progress plot ke SaveData.
        /// </summary>
        public void SaveProgress()
        {
            // Implementasi: cari atau buat PlotSaveData yang sesuai di SaveSystem
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            // (Logika lengkap diimplementasikan di FarmManager saat SaveGame)
        }

        /// <summary>
        /// Restore state plot dari SaveData saat load game.
        /// </summary>
        public void RestoreFromSave(Core.PlotSaveData data)
        {
            if (data == null || string.IsNullOrEmpty(data.cropId)) return;

            // Ambil CropData dari database
            _currentCrop = Data.CropDatabase.Instance.GetCropById(data.cropId);
            if (_currentCrop == null) return;

            float reduction = Upgrade.UpgradeSystem.Instance?.GetGrowSpeedReduction() ?? 0f;
            _totalGrowTime = _currentCrop.GetActualGrowTime(reduction);

            // Hitung progress berdasarkan waktu yang sudah berlalu
            long plantedBinary = data.plantTimeBinary;
            DateTime plantedTime = DateTime.FromBinary(plantedBinary);
            float elapsed = (float)(DateTime.UtcNow - plantedTime).TotalSeconds;

            _growTimer = Mathf.Min(elapsed, _totalGrowTime);

            if (_growTimer >= _totalGrowTime)
                SetState(PlotState.Ready);
            else
                SetState(PlotState.Growing);

            SpawnCropModel(_currentCrop.GetPrefabForProgress(GrowProgress));
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Input (Player Tap)

        private void OnMouseDown()
        {
            HandleTap();
        }

        public void HandleTap()
        {
            switch (_state)
            {
                case PlotState.Empty:
                    UI.UIManager.Instance?.ShowCropSelector(this);
                    break;

                case PlotState.Ready:
                    Harvest();
                    break;

                case PlotState.Growing:
                    UI.UIManager.Instance?.ShowSkipTimerOption(this);
                    break;

                case PlotState.Locked:
                    UI.UIManager.Instance?.ShowAreaUnlockPrompt(areaIndex);
                    break;
            }
        }

        #endregion
    }
}
