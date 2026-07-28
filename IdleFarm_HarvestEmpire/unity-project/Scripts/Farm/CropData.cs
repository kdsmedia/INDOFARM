using UnityEngine;

namespace IdleFarm.Farm
{
    /// <summary>
    /// ScriptableObject data untuk satu jenis tanaman.
    /// Buat asset: klik kanan → Create → IdleFarm → Crop Data
    /// Buat satu asset per tanaman (SD_Corn, SD_Wheat, dst).
    /// </summary>
    [CreateAssetMenu(menuName = "IdleFarm/Crop Data", fileName = "SD_NewCrop")]
    public class CropData : ScriptableObject
    {
        [Header("Identitas")]
        public string cropId;               // ID unik: "corn", "wheat", dll
        public string cropName;             // Nama tampilan: "Jagung", "Gandum"
        public Sprite iconSprite;           // Ikon 2D untuk UI

        [Header("Prefab 3D (Stage)")]
        [Tooltip("Stage 1: bibit baru ditanam")]
        public GameObject prefabStage1;
        [Tooltip("Stage 2: sedang tumbuh")]
        public GameObject prefabStage2;
        [Tooltip("Stage 3: siap dipanen")]
        public GameObject prefabStage3;

        [Header("Ekonomi")]
        [Tooltip("Waktu tumbuh dasar dalam detik (sebelum upgrade)")]
        public float baseGrowTimeSeconds = 10f;

        [Tooltip("Biaya benih (0 = gratis)")]
        public double seedCost = 0;

        [Tooltip("Nilai jual dasar per panen (sebelum upgrade/multiplier)")]
        public double baseSellValue = 5;

        [Header("Unlock")]
        [Tooltip("Area minimum yang harus dibuka untuk menanam ini")]
        public int unlockAreaIndex = 1;

        [Header("Visual & Audio")]
        public ParticleSystem harvestParticlePrefab;
        public AudioClip       harvestSound;
        public AudioClip       plantSound;

        [Header("Deskripsi")]
        [TextArea(2, 4)]
        public string description;

        // ──────────────────────────────────────────────
        #region Helper

        /// <summary>
        /// Kembalikan prefab yang sesuai dengan progress tumbuh (0-1).
        /// 0–0.33: Stage 1 | 0.33–0.66: Stage 2 | 0.66–1.0: Stage 3
        /// </summary>
        public GameObject GetPrefabForProgress(float progress)
        {
            if (progress < 0.33f) return prefabStage1;
            if (progress < 0.66f) return prefabStage2;
            return prefabStage3;
        }

        /// <summary>
        /// Hitung waktu tumbuh dengan memperhitungkan upgrade kecepatan.
        /// growSpeedReduction: pengurangan persentase dari upgrade (mis. 0.10 = 10% lebih cepat)
        /// </summary>
        public float GetActualGrowTime(float growSpeedReduction)
        {
            float reduction = Mathf.Clamp(growSpeedReduction, 0f, 0.90f);
            return baseGrowTimeSeconds * (1f - reduction);
        }

        #endregion
    }
}
