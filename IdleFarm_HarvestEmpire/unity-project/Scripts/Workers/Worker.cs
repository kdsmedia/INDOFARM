using System.Collections;
using UnityEngine;

namespace IdleFarm.Workers
{
    /// <summary>
    /// Pekerja NPC yang bergerak di area tertentu untuk memanen dan menanam.
    /// Pasang script ini pada prefab Worker.prefab.
    /// </summary>
    public class Worker : MonoBehaviour
    {
        [Header("Konfigurasi")]
        public int    areaIndex;
        public int    slotIndex;
        public int    level = 1;

        [Header("Pergerakan")]
        [SerializeField] private float baseSpeed = 3f;
        [SerializeField] private float baseHarvestTime = 1f;

        [Header("Referensi Komponen")]
        [SerializeField] private Animator animator;
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip   walkSound;
        [SerializeField] private AudioClip   harvestSound;

        private bool       _isActive      = false;
        private Farm.FarmPlot _targetPlot = null;
        private Coroutine  _workCoroutine;

        // Animasi hash
        private static readonly int ANIM_WALK    = Animator.StringToHash("IsWalking");
        private static readonly int ANIM_HARVEST = Animator.StringToHash("Harvest");

        // ──────────────────────────────────────────────
        #region Inisialisasi

        public void Initialize(int area, int slot, int savedLevel)
        {
            areaIndex = area;
            slotIndex = slot;
            level     = savedLevel;
        }

        public void Activate()
        {
            _isActive = true;
            if (_workCoroutine != null) StopCoroutine(_workCoroutine);
            _workCoroutine = StartCoroutine(WorkLoop());
        }

        public void Deactivate()
        {
            _isActive = false;
            if (_workCoroutine != null) StopCoroutine(_workCoroutine);
            SetAnimation(false);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Work Loop

        private IEnumerator WorkLoop()
        {
            while (_isActive)
            {
                // 1. Cari plot siap panen di area ini
                _targetPlot = FindReadyPlot();

                if (_targetPlot != null)
                {
                    // 2. Jalan ke plot
                    yield return StartCoroutine(MoveToPlot(_targetPlot));

                    // 3. Panen
                    yield return StartCoroutine(DoHarvest(_targetPlot));

                    // 4. Tanam ulang dengan tanaman yang sama (atau default)
                    var cropToPlant = GetDefaultCropForArea();
                    if (cropToPlant != null)
                    {
                        yield return StartCoroutine(DoPlant(_targetPlot, cropToPlant));
                    }
                }
                else
                {
                    // Tidak ada yang perlu dipanen, tunggu sebentar
                    yield return new WaitForSeconds(1.5f);
                }
            }
        }

        private IEnumerator MoveToPlot(Farm.FarmPlot plot)
        {
            SetAnimation(true);
            float speed = GetActualSpeed();

            while (Vector3.Distance(transform.position, plot.transform.position) > 0.2f)
            {
                transform.position = Vector3.MoveTowards(
                    transform.position,
                    plot.transform.position,
                    speed * Time.deltaTime);

                // Rotasi ke arah gerak
                Vector3 dir = (plot.transform.position - transform.position).normalized;
                if (dir != Vector3.zero)
                    transform.rotation = Quaternion.LookRotation(dir);

                yield return null;
            }

            SetAnimation(false);
        }

        private IEnumerator DoHarvest(Farm.FarmPlot plot)
        {
            // Animasi panen
            if (animator != null) animator.SetTrigger(ANIM_HARVEST);
            if (audioSource != null && harvestSound != null)
                audioSource.PlayOneShot(harvestSound);

            yield return new WaitForSeconds(baseHarvestTime);

            if (plot.State == Farm.FarmPlot.PlotState.Ready)
                plot.Harvest();
        }

        private IEnumerator DoPlant(Farm.FarmPlot plot, Farm.CropData crop)
        {
            yield return new WaitForSeconds(0.5f);

            if (plot.State == Farm.FarmPlot.PlotState.Empty)
                plot.Plant(crop);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Helper

        private Farm.FarmPlot FindReadyPlot()
        {
            var area = Farm.FarmManager.Instance?.GetArea(areaIndex);
            if (area == null) return null;

            var readyPlots = area.GetReadyPlots();
            if (readyPlots.Count == 0) return null;

            // Pilih plot terdekat
            Farm.FarmPlot closest  = null;
            float         minDist  = float.MaxValue;
            foreach (var p in readyPlots)
            {
                float d = Vector3.Distance(transform.position, p.transform.position);
                if (d < minDist) { minDist = d; closest = p; }
            }
            return closest;
        }

        private Farm.CropData GetDefaultCropForArea()
        {
            // Ambil tanaman terbaik yang tersedia di area ini
            // Implementasi: ambil dari CropDatabase berdasarkan areaIndex
            return Data.CropDatabase.Instance?.GetDefaultCropForArea(areaIndex);
        }

        private float GetActualSpeed()
        {
            float speedReduction = Upgrade.UpgradeSystem.Instance?.GetWorkerSpeedReduction() ?? 0f;
            return baseSpeed * (1f + speedReduction) * (1f + (level - 1) * 0.05f);
        }

        private void SetAnimation(bool isWalking)
        {
            if (animator != null) animator.SetBool(ANIM_WALK, isWalking);
        }

        #endregion
    }
}
