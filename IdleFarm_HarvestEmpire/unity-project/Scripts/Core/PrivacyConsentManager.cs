using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola persetujuan privasi (GDPR/UU PDP) dan consent untuk AdMob.
    /// Tampilkan dialog saat pertama kali app dibuka.
    /// Simpan pilihan pemain agar tidak ditampilkan lagi.
    /// </summary>
    public class PrivacyConsentManager : MonoBehaviour
    {
        public static PrivacyConsentManager Instance { get; private set; }

        private const string PREF_CONSENT_GIVEN  = "IdleFarm_ConsentGiven";
        private const string PREF_CONSENT_DATE   = "IdleFarm_ConsentDate";
        private const string PREF_ADS_PERSONALIZED = "IdleFarm_AdsPersonalized";

        [Header("UI Dialog Consent")]
        [SerializeField] private GameObject consentDialog;
        [SerializeField] private Button     btnAcceptAll;
        [SerializeField] private Button     btnAcceptRequired;
        [SerializeField] private Button     btnPrivacyPolicy;
        [SerializeField] private TextMeshProUGUI consentBodyText;

        public bool HasConsented        => PlayerPrefs.GetInt(PREF_CONSENT_GIVEN, 0) == 1;
        public bool AdsPersonalized     => PlayerPrefs.GetInt(PREF_ADS_PERSONALIZED, 0) == 1;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            if (!HasConsented)
                ShowConsentDialog();
            else
                InitializeAdsWithConsent();
        }

        // ──────────────────────────────────────────────
        #region Dialog

        private void ShowConsentDialog()
        {
            if (consentDialog == null) return;

            if (consentBodyText != null)
                consentBodyText.text =
                    "Idle Farm menggunakan data analitik dan iklan untuk memberikan pengalaman terbaik.\n\n" +
                    "Kamu bisa memilih jenis iklan yang ditampilkan:\n" +
                    "• Terima Semua: iklan yang relevan berdasarkan minatmu\n" +
                    "• Hanya Wajib: iklan tidak dipersonalisasi\n\n" +
                    "Lihat Kebijakan Privasi untuk detail lengkap.";

            btnAcceptAll?.onClick.AddListener(AcceptAllConsent);
            btnAcceptRequired?.onClick.AddListener(AcceptRequiredOnly);
            btnPrivacyPolicy?.onClick.AddListener(OpenPrivacyPolicy);

            consentDialog.SetActive(true);
        }

        private void AcceptAllConsent()
        {
            SaveConsent(personalized: true);
            consentDialog?.SetActive(false);
            InitializeAdsWithConsent();
        }

        private void AcceptRequiredOnly()
        {
            SaveConsent(personalized: false);
            consentDialog?.SetActive(false);
            InitializeAdsWithConsent();
        }

        private void OpenPrivacyPolicy()
        {
            // Ganti URL ini dengan URL kebijakan privasi aplikasi kamu
            Application.OpenURL("https://example.com/privacy-policy");
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save & Apply

        private void SaveConsent(bool personalized)
        {
            PlayerPrefs.SetInt(PREF_CONSENT_GIVEN,    1);
            PlayerPrefs.SetInt(PREF_ADS_PERSONALIZED, personalized ? 1 : 0);
            PlayerPrefs.SetString(PREF_CONSENT_DATE,  System.DateTime.UtcNow.ToString("yyyy-MM-dd"));
            PlayerPrefs.Save();
        }

        private void InitializeAdsWithConsent()
        {
            // ── IMPLEMENTASI ADMOB CONSENT ──
            // Jika tidak dipersonalisasi, konfigurasi AdMob untuk non-personalized:
            // var extras = new Dictionary<string, string> { ["npa"] = "1" };
            // var request = new AdRequest.Builder().AddNetworkExtrasBundle(typeof(AdMobAdapter), extras).Build();

            Debug.Log($"[Privacy] Consent aktif. Personalized ads: {AdsPersonalized}");

            // Lanjut inisialisasi AdMob
            Monetization.AdMobManager.Instance?.Initialize();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Delete Account

        /// <summary>
        /// Hapus semua data pemain atas permintaan (GDPR Right to Erasure / UU PDP).
        /// Dipanggil dari Pengaturan → Hapus Akun.
        /// </summary>
        public void DeleteAllPlayerData()
        {
            PlayerPrefs.DeleteAll();
            PlayerPrefs.Save();

            // Reset cloud save jika ada
            // await CloudSaveService.Instance.DeleteAllKeysAsync();

            Debug.Log("[Privacy] Semua data pemain dihapus.");

            // Restart app ke state awal
            UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }

        #endregion
    }
}
