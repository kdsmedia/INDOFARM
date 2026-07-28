using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IdleFarm.UI
{
    /// <summary>
    /// Mengontrol HUD utama: tampilan koin, level, tombol navigasi.
    /// Pasang pada prefab HUD.prefab.
    /// </summary>
    public class HUDController : MonoBehaviour
    {
        [Header("Tampilan Koin")]
        [SerializeField] private TextMeshProUGUI coinText;
        [SerializeField] private Animator        coinAnimator;

        [Header("Tampilan Level")]
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Image           xpBar;

        [Header("Tombol NavBar")]
        [SerializeField] private Button btnShop;
        [SerializeField] private Button btnMissions;
        [SerializeField] private Button btnEvents;
        [SerializeField] private Button btnSettings;
        [SerializeField] private Button btnLeaderboard;
        [SerializeField] private Button btnProfile;

        [Header("Indikator Misi Aktif")]
        [SerializeField] private GameObject missionBadge;

        [Header("Indikator Event Aktif")]
        [SerializeField] private GameObject eventBadge;
        [SerializeField] private TextMeshProUGUI eventCountdown;

        private static readonly int ANIM_COIN_ADD = Animator.StringToHash("CoinAdded");

        public void Initialize()
        {
            // Pasang listener tombol
            btnShop?.onClick.AddListener(UIManager.Instance.OpenShop);
            btnMissions?.onClick.AddListener(UIManager.Instance.OpenMissions);
            btnEvents?.onClick.AddListener(UIManager.Instance.OpenEvents);
            btnSettings?.onClick.AddListener(UIManager.Instance.OpenSettings);
            btnLeaderboard?.onClick.AddListener(UIManager.Instance.OpenLeaderboard);
            btnProfile?.onClick.AddListener(UIManager.Instance.OpenProfile);

            // Update tampilan awal
            UpdateCoinDisplay(Economy.CoinManager.Instance.Coins);

            // Subscribe event
            Events.DailyMissionSystem.Instance.OnMissionCompleted += _ => RefreshMissionBadge();

            Debug.Log("[HUDController] Diinisialisasi.");
        }

        // ──────────────────────────────────────────────

        public void UpdateCoinDisplay(double coins)
        {
            if (coinText != null)
                coinText.text = Economy.CoinManager.FormatCoins(coins) + " Koin";

            if (coinAnimator != null)
                coinAnimator.SetTrigger(ANIM_COIN_ADD);
        }

        public void UpdateLevelDisplay(int level, float xpProgress)
        {
            if (levelText != null) levelText.text = $"Lv.{level}";
            if (xpBar != null)     xpBar.fillAmount = Mathf.Clamp01(xpProgress);
        }

        private void RefreshMissionBadge()
        {
            bool hasUnclaimedMission = Events.DailyMissionSystem.Instance.HasUnclaimedCompletedMission();
            if (missionBadge != null) missionBadge.SetActive(hasUnclaimedMission);
        }

        private void Update()
        {
            // Update countdown event jika ada event aktif
            if (eventCountdown != null && Events.SeasonalEventSystem.Instance != null)
            {
                var remaining = Events.SeasonalEventSystem.Instance.GetTimeRemaining();
                if (remaining.HasValue && remaining.Value.TotalSeconds > 0)
                {
                    eventCountdown.text = FormatTimeRemaining(remaining.Value);
                    if (eventBadge != null) eventBadge.SetActive(true);
                }
                else
                {
                    if (eventBadge != null) eventBadge.SetActive(false);
                }
            }
        }

        private string FormatTimeRemaining(System.TimeSpan time)
        {
            if (time.TotalHours >= 24)
                return $"{(int)time.TotalDays}h {time.Hours}j";
            if (time.TotalHours >= 1)
                return $"{(int)time.TotalHours}j {time.Minutes}m";
            return $"{time.Minutes}m {time.Seconds}d";
        }
    }
}
