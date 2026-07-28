using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola panel Pengaturan: volume, teks, bahasa, notifikasi, akun.
    /// Pasang pada prefab SettingsPanel.prefab.
    /// </summary>
    public class SettingsManager : MonoBehaviour
    {
        public static SettingsManager Instance { get; private set; }

        private const string PREF_TEXT_SIZE  = "IdleFarm_TextSize"; // 0=kecil, 1=sedang, 2=besar
        private const string PREF_LANGUAGE   = "IdleFarm_Language"; // "id" / "en"
        private const string PREF_NOTIF      = "IdleFarm_Notif";

        [Header("Slider Volume")]
        [SerializeField] private Slider sliderBGM;
        [SerializeField] private Slider sliderSFX;
        [SerializeField] private Toggle toggleMute;

        [Header("Ukuran Teks")]
        [SerializeField] private Button btnTextSmall;
        [SerializeField] private Button btnTextMedium;
        [SerializeField] private Button btnTextLarge;

        [Header("Notifikasi")]
        [SerializeField] private Toggle toggleNotification;

        [Header("Tombol Aksi")]
        [SerializeField] private Button btnPrivacyPolicy;
        [SerializeField] private Button btnDeleteAccount;
        [SerializeField] private Button btnReplayTutorial;
        [SerializeField] private Button btnClose;

        [Header("Versi")]
        [SerializeField] private TextMeshProUGUI versionText;

        private void Start()
        {
            SetupUI();
            LoadSettings();
        }

        private void SetupUI()
        {
            sliderBGM?.onValueChanged.AddListener(AudioManager.Instance.SetBgmVolume);
            sliderSFX?.onValueChanged.AddListener(AudioManager.Instance.SetSfxVolume);
            toggleMute?.onValueChanged.AddListener(AudioManager.Instance.SetMute);

            btnTextSmall?.onClick.AddListener(()  => SetTextSize(0));
            btnTextMedium?.onClick.AddListener(() => SetTextSize(1));
            btnTextLarge?.onClick.AddListener(()  => SetTextSize(2));

            toggleNotification?.onValueChanged.AddListener(SetNotificationsEnabled);

            btnPrivacyPolicy?.onClick.AddListener(() =>
                Application.OpenURL("https://example.com/privacy-policy"));

            btnDeleteAccount?.onClick.AddListener(() =>
                UI.UIManager.Instance?.ShowConfirm(
                    "Hapus Akun?",
                    "Semua data akan dihapus permanen dan tidak bisa dikembalikan.",
                    "Ya, Hapus",
                    () => PrivacyConsentManager.Instance?.DeleteAllPlayerData(),
                    "Batal", null
                )
            );

            btnReplayTutorial?.onClick.AddListener(() =>
            {
                TutorialManager.Instance?.ReplayTutorial();
                UI.UIManager.Instance?.CloseCurrentPanel();
            });

            btnClose?.onClick.AddListener(UI.UIManager.Instance.CloseCurrentPanel);

            if (versionText != null)
                versionText.text = $"v{Application.version}";
        }

        private void LoadSettings()
        {
            if (sliderBGM != null)
                sliderBGM.value = AudioManager.Instance?.BgmVolume ?? 0.7f;
            if (sliderSFX != null)
                sliderSFX.value = AudioManager.Instance?.SfxVolume ?? 1f;
            if (toggleMute != null)
                toggleMute.isOn = AudioManager.Instance?.IsMuted ?? false;
            if (toggleNotification != null)
                toggleNotification.isOn = PlayerPrefs.GetInt(PREF_NOTIF, 1) == 1;
        }

        // ──────────────────────────────────────────────

        private void SetTextSize(int size)
        {
            PlayerPrefs.SetInt(PREF_TEXT_SIZE, size);
            PlayerPrefs.Save();

            // Terapkan ke semua TextMeshPro di scene
            float scaleFactor = size switch { 0 => 0.85f, 2 => 1.20f, _ => 1f };
            var allTexts = FindObjectsOfType<TextMeshProUGUI>();
            foreach (var t in allTexts)
            {
                // Terapkan hanya untuk teks dengan tag "ScalableText"
                // (Tandai TextMeshPro yang perlu ikut skala dengan tag ini di Inspector)
                if (t.CompareTag("ScalableText"))
                    t.transform.localScale = Vector3.one * scaleFactor;
            }
        }

        private void SetNotificationsEnabled(bool enabled)
        {
            PlayerPrefs.SetInt(PREF_NOTIF, enabled ? 1 : 0);
            PlayerPrefs.Save();

            if (!enabled)
                NotificationManager.Instance?.CancelAllNotifications();
        }
    }
}
