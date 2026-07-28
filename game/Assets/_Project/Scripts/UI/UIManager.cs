using System;
using System.Collections;
using UnityEngine;

namespace IdleFarm.UI
{
    /// <summary>
    /// Pusat kendali semua UI: membuka/menutup panel, menampilkan popup,
    /// dan menghubungkan event sistem ke tampilan layar.
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("HUD")]
        [SerializeField] private HUDController hud;

        [Header("Popup")]
        [SerializeField] private OfflineIncomePopup offlineIncomePopup;
        [SerializeField] private GameObject         levelUpPopup;
        [SerializeField] private GameObject         rewardPopup;
        [SerializeField] private GameObject         confirmPopup;

        [Header("Panel Utama")]
        [SerializeField] private GameObject shopPanel;
        [SerializeField] private GameObject missionPanel;
        [SerializeField] private GameObject eventPanel;
        [SerializeField] private GameObject settingsPanel;
        [SerializeField] private GameObject leaderboardPanel;
        [SerializeField] private GameObject profilePanel;

        [Header("Panel Farm")]
        [SerializeField] private GameObject cropSelectorPanel;
        [SerializeField] private GameObject workerPanel;
        [SerializeField] private GameObject upgradePanel;
        [SerializeField] private GameObject areaUnlockPanel;

        [Header("Overlay Gelap")]
        [SerializeField] private GameObject dimOverlay;

        private GameObject _currentOpenPanel;

        // ──────────────────────────────────────────────
        #region Init

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void Initialize()
        {
            // Subscribe ke events sistem
            Economy.CoinManager.Instance.OnCoinsChanged += hud.UpdateCoinDisplay;
            Upgrade.UpgradeSystem.Instance.OnUpgradePerformed += OnUpgradePerformed;
            Farm.FarmManager.Instance.OnAreaUnlocked += OnAreaUnlocked;

            hud.Initialize();
            CloseAllPanels();

            Debug.Log("[UIManager] Diinisialisasi.");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Panel Navigasi

        public void OpenShop()          => OpenPanel(shopPanel);
        public void OpenMissions()      => OpenPanel(missionPanel);
        public void OpenEvents()        => OpenPanel(eventPanel);
        public void OpenSettings()      => OpenPanel(settingsPanel);
        public void OpenLeaderboard()   => OpenPanel(leaderboardPanel);
        public void OpenProfile()       => OpenPanel(profilePanel);
        public void OpenWorkerPanel()   => OpenPanel(workerPanel);
        public void OpenUpgradePanel()  => OpenPanel(upgradePanel);

        private void OpenPanel(GameObject panel)
        {
            if (panel == null) return;
            if (_currentOpenPanel != null) _currentOpenPanel.SetActive(false);

            _currentOpenPanel = panel;
            panel.SetActive(true);

            if (dimOverlay != null) dimOverlay.SetActive(true);
        }

        public void CloseCurrentPanel()
        {
            if (_currentOpenPanel != null)
            {
                _currentOpenPanel.SetActive(false);
                _currentOpenPanel = null;
            }
            if (dimOverlay != null) dimOverlay.SetActive(false);
        }

        private void CloseAllPanels()
        {
            GameObject[] panels = {
                shopPanel, missionPanel, eventPanel, settingsPanel,
                leaderboardPanel, profilePanel, cropSelectorPanel,
                workerPanel, upgradePanel, areaUnlockPanel,
                levelUpPopup, rewardPopup, confirmPopup, dimOverlay
            };
            foreach (var p in panels)
                if (p != null) p.SetActive(false);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Popup Farm

        /// <summary>Tampilkan selector tanaman saat tap lahan kosong.</summary>
        public void ShowCropSelector(Farm.FarmPlot plot)
        {
            if (cropSelectorPanel == null) return;
            cropSelectorPanel.SetActive(true);

            // TODO: Kirim referensi plot ke CropSelectorPanel untuk handle pilihan
            // cropSelectorPanel.GetComponent<CropSelectorPanel>()?.Setup(plot);
        }

        /// <summary>Tampilkan opsi skip timer (tonton iklan) saat tap lahan yang sedang tumbuh.</summary>
        public void ShowSkipTimerOption(Farm.FarmPlot plot)
        {
            ShowConfirm(
                "Percepat Tumbuh?",
                "Tonton Iklan untuk langsung selesaikan waktu tumbuh.",
                "Tonton Iklan",
                () =>
                {
                    Monetization.AdMobManager.Instance?.ShowRewardedAd(
                        "skip_timer",
                        onGranted: () => plot.SkipGrowTimer(),
                        onFailed:  () => ShowToast("Iklan tidak tersedia saat ini.")
                    );
                },
                "Batal", null
            );
        }

        /// <summary>Tampilkan prompt untuk buka area.</summary>
        public void ShowAreaUnlockPrompt(int areaIndex)
        {
            double cost = Farm.FarmManager.Instance?.GetAreaUnlockCost(areaIndex) ?? 0;
            ShowConfirm(
                $"Buka Area {areaIndex}?",
                $"Biaya: {Economy.CoinManager.FormatCoins(cost)} Koin",
                "Buka Sekarang",
                () => Farm.FarmManager.Instance?.TryUnlockArea(areaIndex),
                "Batal", null
            );
        }

        /// <summary>Popup aktivasi manager berhasil.</summary>
        public void ShowManagerActivatedPopup(string managerName, float bonusPercent)
        {
            ShowToast($"{managerName} aktif! Area berjalan otomatis. Bonus +{bonusPercent * 100:F0}%");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Offline Income Popup

        public void ShowOfflineIncomePopup(
            double income,
            TimeSpan duration,
            Action<double> onClaim,
            Action<double> onClaimWithAd)
        {
            if (offlineIncomePopup == null) return;
            offlineIncomePopup.gameObject.SetActive(true);
            offlineIncomePopup.Setup(income, duration, onClaim, onClaimWithAd);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Confirm Dialog

        public void ShowConfirm(
            string title, string message,
            string confirmLabel, Action onConfirm,
            string cancelLabel,  Action onCancel)
        {
            if (confirmPopup == null) return;
            confirmPopup.SetActive(true);

            // TODO: Hubungkan ke ConfirmPopup component
            // confirmPopup.GetComponent<ConfirmPopup>()?.Setup(title, message, confirmLabel, onConfirm, cancelLabel, onCancel);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Toast / Notifikasi Kecil

        private Coroutine _toastCoroutine;
        [SerializeField] private TMPro.TextMeshProUGUI toastText;
        [SerializeField] private CanvasGroup          toastGroup;

        public void ShowToast(string message, float duration = 2.5f)
        {
            if (toastText == null) return;
            if (_toastCoroutine != null) StopCoroutine(_toastCoroutine);
            _toastCoroutine = StartCoroutine(ToastRoutine(message, duration));
        }

        private IEnumerator ToastRoutine(string message, float duration)
        {
            toastText.text = message;
            if (toastGroup != null) toastGroup.alpha = 1f;
            toastText.gameObject.SetActive(true);

            yield return new WaitForSeconds(duration - 0.5f);

            // Fade out
            float t = 0;
            while (t < 0.5f)
            {
                t += Time.deltaTime;
                if (toastGroup != null) toastGroup.alpha = 1f - (t / 0.5f);
                yield return null;
            }

            toastText.gameObject.SetActive(false);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Event Handlers

        private void OnUpgradePerformed(string upgradeId, int newLevel)
        {
            ShowToast($"Upgrade berhasil! Level {newLevel}");
        }

        private void OnAreaUnlocked(int areaIndex)
        {
            if (levelUpPopup != null)
            {
                levelUpPopup.SetActive(true);
                // TODO: Isi text level up popup
            }
            ShowToast($"Area {areaIndex} berhasil dibuka!");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Back Button (Android)

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (_currentOpenPanel != null)
                    CloseCurrentPanel();
                else
                    Application.Quit();
            }
        }

        #endregion
    }
}
