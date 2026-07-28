using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Data
{
    /// <summary>
    /// Database seluruh upgrade yang tersedia dalam game.
    /// Pasang pada GameObject di scene, isi UpgradeDataList dari Inspector.
    /// </summary>
    public class UpgradeDatabase : MonoBehaviour
    {
        public static UpgradeDatabase Instance { get; private set; }

        [Header("Semua Data Upgrade")]
        [SerializeField] private List<UpgradeData> upgradeDataList = new List<UpgradeData>();

        private Dictionary<string, UpgradeData> _upgradeById = new Dictionary<string, UpgradeData>();

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            BuildLookup();
        }

        private void BuildLookup()
        {
            _upgradeById.Clear();
            foreach (var ud in upgradeDataList)
            {
                if (ud != null) _upgradeById[ud.upgradeId] = ud;
            }
            Debug.Log($"[UpgradeDatabase] {_upgradeById.Count} upgrade dimuat.");
        }

        public UpgradeData GetUpgrade(string upgradeId)
        {
            _upgradeById.TryGetValue(upgradeId, out var data);
            return data;
        }

        public List<UpgradeData> GetAllUpgrades() => new List<UpgradeData>(upgradeDataList);
    }

    // ──────────────────────────────────────────────

    /// <summary>
    /// ScriptableObject data untuk satu jenis upgrade.
    /// Buat asset: klik kanan → Create → IdleFarm → Upgrade Data
    /// </summary>
    [CreateAssetMenu(menuName = "IdleFarm/Upgrade Data", fileName = "SD_Upgrade_New")]
    public class UpgradeData : ScriptableObject
    {
        [Header("Identitas")]
        public string upgradeId;        // "GROW_SPEED", "SELL_VALUE", dll
        public string upgradeName;      // "Kecepatan Tumbuh"
        [TextArea(1, 3)]
        public string description;      // Deskripsi efek
        public Sprite icon;

        [Header("Balancing")]
        public double baseCost            = 100;    // Harga level 1
        public float  priceGrowthFactor   = 1.15f;  // Faktor kenaikan harga
        public int    maxLevel            = 50;
        public string effectDescription;  // Template teks: "-{0}% waktu tumbuh"

        [Header("Kategori")]
        public UpgradeCategory category;

        // ──────────────────────────────────────────────
        #region Helper

        /// <summary>Teks efek yang diformat dengan nilai numerik level saat ini.</summary>
        public string GetEffectText(int currentLevel)
        {
            if (string.IsNullOrEmpty(effectDescription)) return "";
            return string.Format(effectDescription, currentLevel);
        }

        /// <summary>Harga upgrade pada level tertentu.</summary>
        public double GetCostAtLevel(int level, Economy.EconomyConfig config)
            => config.CalculateUpgradePrice(baseCost, priceGrowthFactor, level);

        #endregion
    }

    public enum UpgradeCategory
    {
        Farm,       // Kecepatan tumbuh, nilai jual
        Worker,     // Kecepatan pekerja
        Storage,    // Kapasitas gudang
        Offline,    // Tarif offline income
    }
}
