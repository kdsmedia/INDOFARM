using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Data
{
    /// <summary>
    /// Database seluruh tanaman dalam game.
    /// Pasang script ini pada GameObject di scene, lalu isi CropDataList di Inspector.
    /// Referensi semua CropData ScriptableObject ke dalam list ini.
    /// </summary>
    public class CropDatabase : MonoBehaviour
    {
        public static CropDatabase Instance { get; private set; }

        [Header("Semua Data Tanaman (isi dari ScriptableObject)")]
        [SerializeField] private List<Farm.CropData> cropDataList = new List<Farm.CropData>();

        // Lookup cepat by ID
        private Dictionary<string, Farm.CropData> _cropById = new Dictionary<string, Farm.CropData>();

        // Tanaman default per area (tanaman terbaik yang tersedia di area tersebut)
        private Dictionary<int, Farm.CropData> _defaultCropByArea = new Dictionary<int, Farm.CropData>();

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;

            BuildLookup();
        }

        private void BuildLookup()
        {
            _cropById.Clear();
            _defaultCropByArea.Clear();

            foreach (var crop in cropDataList)
            {
                if (crop == null) continue;
                _cropById[crop.cropId] = crop;

                // Simpan tanaman dengan nilai jual tertinggi per area sebagai default
                int area = crop.unlockAreaIndex;
                if (!_defaultCropByArea.ContainsKey(area) ||
                    crop.baseSellValue > _defaultCropByArea[area].baseSellValue)
                {
                    _defaultCropByArea[area] = crop;
                }
            }

            Debug.Log($"[CropDatabase] {_cropById.Count} tanaman dimuat.");
        }

        // ──────────────────────────────────────────────
        #region Query

        public Farm.CropData GetCropById(string cropId)
        {
            _cropById.TryGetValue(cropId, out var crop);
            return crop;
        }

        /// <summary>Ambil semua tanaman yang tersedia di area tertentu (area ≤ areaIndex).</summary>
        public List<Farm.CropData> GetCropsForArea(int areaIndex)
        {
            var result = new List<Farm.CropData>();
            foreach (var crop in cropDataList)
            {
                if (crop != null && crop.unlockAreaIndex <= areaIndex)
                    result.Add(crop);
            }
            // Urutkan: tanaman dengan nilai lebih tinggi di akhir
            result.Sort((a, b) => a.baseSellValue.CompareTo(b.baseSellValue));
            return result;
        }

        /// <summary>Tanaman default untuk pekerja: tanaman terbaik di area tersebut.</summary>
        public Farm.CropData GetDefaultCropForArea(int areaIndex)
        {
            // Coba area yang sama dulu, jika tidak ada, cari area di bawahnya
            for (int a = areaIndex; a >= 1; a--)
            {
                if (_defaultCropByArea.TryGetValue(a, out var crop))
                    return crop;
            }
            // Fallback: tanaman pertama
            return cropDataList.Count > 0 ? cropDataList[0] : null;
        }

        public List<Farm.CropData> GetAllCrops() => new List<Farm.CropData>(cropDataList);

        #endregion
    }
}
