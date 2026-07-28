using System.Collections;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola tutorial onboarding untuk pemain baru.
    /// Tutorial bisa di-skip dari Pengaturan → Bantuan.
    /// Setiap langkah tutorial adalah highlight elemen UI tertentu + dialog teks.
    /// </summary>
    public class TutorialManager : MonoBehaviour
    {
        public static TutorialManager Instance { get; private set; }

        private const string PREF_TUTORIAL_DONE = "IdleFarm_TutorialDone";

        [Header("Referensi UI Tutorial")]
        [SerializeField] private GameObject tutorialOverlay;
        [SerializeField] private GameObject tutorialDialog;
        [SerializeField] private TMPro.TextMeshProUGUI dialogText;
        [SerializeField] private UnityEngine.UI.Button btnNext;
        [SerializeField] private UnityEngine.UI.Button btnSkip;
        [SerializeField] private GameObject highlightMask;  // visual sorot elemen

        private int   _currentStep = 0;
        private bool  _tutorialActive = false;

        // Langkah-langkah tutorial
        private readonly string[] TUTORIAL_STEPS =
        {
            "Selamat datang di Idle Farm! Kebunmu menunggu untuk dikelola.",
            "Tap petak tanah kosong ini untuk menanam benih pertamamu.",
            "Tunggu beberapa detik, lalu tap lagi saat tanaman berkilau untuk memanen!",
            "Koin hasil panen bisa dipakai untuk upgrade di Toko.",
            "Buka Toko (ikon bawah kanan) dan coba upgrade 'Kecepatan Tumbuh'.",
            "Kamu bisa rekrut Pekerja agar tanaman dipanen otomatis!",
            "Selamat! Kamu sudah menguasai dasar-dasarnya. Selamat bertani!",
        };

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        private void Start()
        {
            bool tutorialDone = PlayerPrefs.GetInt(PREF_TUTORIAL_DONE, 0) == 1;

            if (!tutorialDone)
                StartCoroutine(BeginTutorialAfterInit());
        }

        // ──────────────────────────────────────────────
        #region Tutorial Flow

        private IEnumerator BeginTutorialAfterInit()
        {
            // Tunggu sampai game selesai inisialisasi
            yield return new WaitUntil(() => GameManager.Instance != null);
            yield return new WaitForSeconds(1f);

            BeginTutorial();
        }

        public void BeginTutorial()
        {
            _tutorialActive = true;
            _currentStep    = 0;

            if (tutorialOverlay != null) tutorialOverlay.SetActive(true);

            btnNext?.onClick.AddListener(NextStep);
            btnSkip?.onClick.AddListener(SkipTutorial);

            ShowStep(_currentStep);
        }

        private void ShowStep(int step)
        {
            if (step >= TUTORIAL_STEPS.Length)
            {
                EndTutorial();
                return;
            }

            if (dialogText != null) dialogText.text = TUTORIAL_STEPS[step];

            // TODO: Sorot elemen UI yang relevan berdasarkan langkah
            HighlightElementForStep(step);
        }

        private void NextStep()
        {
            _currentStep++;
            ShowStep(_currentStep);
        }

        public void SkipTutorial()
        {
            EndTutorial();
        }

        private void EndTutorial()
        {
            _tutorialActive = false;
            if (tutorialOverlay != null) tutorialOverlay.SetActive(false);

            PlayerPrefs.SetInt(PREF_TUTORIAL_DONE, 1);
            PlayerPrefs.Save();

            btnNext?.onClick.RemoveAllListeners();
            btnSkip?.onClick.RemoveAllListeners();

            Debug.Log("[Tutorial] Selesai.");
        }

        /// <summary>Buka ulang tutorial dari Pengaturan → Bantuan.</summary>
        public void ReplayTutorial()
        {
            PlayerPrefs.SetInt(PREF_TUTORIAL_DONE, 0);
            BeginTutorial();
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Highlight

        private void HighlightElementForStep(int step)
        {
            // TODO: Gerakkan highlightMask ke posisi elemen UI yang relevan per langkah
            // Contoh: step 1 = sorot plot lahan pertama, step 4 = sorot tombol Toko
            if (highlightMask == null) return;
            // highlightMask.GetComponent<RectTransform>().position = GetHighlightPos(step);
        }

        #endregion
    }
}
