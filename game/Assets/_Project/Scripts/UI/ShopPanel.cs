using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IdleFarm.UI
{
    /// <summary>
    /// Panel Toko: menampilkan daftar upgrade dan tombol beli.
    /// Tab Koin (upgrade, unlock area) adalah satu-satunya tab karena tidak ada IAP.
    /// </summary>
    public class ShopPanel : MonoBehaviour
    {
        [Header("Tab Buttons")]
        [SerializeField] private Button btnTabUpgrade;
        [SerializeField] private Button btnTabArea;
        [SerializeField] private Button btnTabWorker;

        [Header("Konten")]
        [SerializeField] private Transform upgradeListParent;
        [SerializeField] private Transform areaListParent;
        [SerializeField] private Transform workerListParent;

        [Header("Prefab Item")]
        [SerializeField] private GameObject upgradeItemPrefab;
        [SerializeField] private GameObject areaItemPrefab;
        [SerializeField] private GameObject workerItemPrefab;

        [Header("Panel Konten")]
        [SerializeField] private GameObject upgradePanel;
        [SerializeField] private GameObject areaPanel;
        [SerializeField] private GameObject workerPanel;

        [Header("Tombol Tutup")]
        [SerializeField] private Button btnClose;

        private void OnEnable()
        {
            // Refresh setiap kali panel dibuka
            RefreshAll();
        }

        private void Start()
        {
            btnTabUpgrade?.onClick.AddListener(() => SwitchTab(0));
            btnTabArea?.onClick.AddListener(()    => SwitchTab(1));
            btnTabWorker?.onClick.AddListener(()  => SwitchTab(2));
            btnClose?.onClick.AddListener(UIManager.Instance.CloseCurrentPanel);

            SwitchTab(0);
        }

        // ──────────────────────────────────────────────

        private void SwitchTab(int tabIndex)
        {
            upgradePanel?.SetActive(tabIndex == 0);
            areaPanel?.SetActive(tabIndex == 1);
            workerPanel?.SetActive(tabIndex == 2);

            if (tabIndex == 0) RefreshUpgrades();
            if (tabIndex == 1) RefreshAreas();
            if (tabIndex == 2) RefreshWorkers();
        }

        private void RefreshAll()
        {
            RefreshUpgrades();
        }

        // ──────────────────────────────────────────────
        #region Upgrade List

        private void RefreshUpgrades()
        {
            if (upgradeListParent == null || upgradeItemPrefab == null) return;

            // Bersihkan item lama
            foreach (Transform child in upgradeListParent)
                Destroy(child.gameObject);

            var allUpgrades = Data.UpgradeDatabase.Instance?.GetAllUpgrades();
            if (allUpgrades == null) return;

            foreach (var upgradeData in allUpgrades)
            {
                var item = Instantiate(upgradeItemPrefab, upgradeListParent);
                var ui   = item.GetComponent<UpgradeItemUI>();
                if (ui == null) continue;

                int    currentLevel = Upgrade.UpgradeSystem.Instance.GetLevel(upgradeData.upgradeId);
                double cost         = Upgrade.UpgradeSystem.Instance.GetUpgradeCost(upgradeData.upgradeId, currentLevel);
                bool   isMax        = Upgrade.UpgradeSystem.Instance.IsMaxLevel(upgradeData.upgradeId);
                bool   canAfford    = Economy.CoinManager.Instance.CanAfford(cost);

                ui.Setup(
                    upgradeData.upgradeName,
                    upgradeData.GetEffectText(currentLevel + 1),
                    currentLevel,
                    upgradeData.maxLevel,
                    Economy.CoinManager.FormatCoins(cost),
                    canAfford && !isMax,
                    isMax,
                    () => OnUpgradeClicked(upgradeData.upgradeId)
                );
            }
        }

        private void OnUpgradeClicked(string upgradeId)
        {
            bool success = Upgrade.UpgradeSystem.Instance.TryUpgrade(upgradeId);
            if (success) RefreshUpgrades();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Area List

        private void RefreshAreas()
        {
            // TODO: Implementasi daftar area yang bisa dibuka
            // Mirip dengan RefreshUpgrades tapi untuk area
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Worker List

        private void RefreshWorkers()
        {
            // TODO: Implementasi daftar slot pekerja per area
        }

        #endregion
    }

    // ──────────────────────────────────────────────
    // Component item upgrade dalam list

    /// <summary>
    /// Satu baris item upgrade dalam daftar toko.
    /// Pasang pada prefab UpgradeItem.prefab.
    /// </summary>
    public class UpgradeItemUI : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI nameText;
        [SerializeField] private TextMeshProUGUI effectText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI costText;
        [SerializeField] private Button          buyButton;
        [SerializeField] private TextMeshProUGUI buyButtonText;
        [SerializeField] private Image           progressBar;

        public void Setup(
            string name, string effect,
            int currentLevel, int maxLevel,
            string costStr,
            bool canBuy, bool isMax,
            System.Action onBuyClicked)
        {
            if (nameText   != null) nameText.text   = name;
            if (effectText != null) effectText.text = effect;
            if (levelText  != null) levelText.text  = isMax
                ? "MAKS"
                : $"Lv.{currentLevel} / {maxLevel}";

            if (costText != null) costText.text = isMax ? "-" : $"{costStr} Koin";

            if (buyButton != null)
            {
                buyButton.interactable = canBuy;
                buyButton.onClick.RemoveAllListeners();
                if (canBuy) buyButton.onClick.AddListener(() => onBuyClicked());
            }

            if (buyButtonText != null)
                buyButtonText.text = isMax ? "Maks" : "Upgrade";

            if (progressBar != null)
                progressBar.fillAmount = maxLevel > 0 ? (float)currentLevel / maxLevel : 1f;
        }
    }
}
