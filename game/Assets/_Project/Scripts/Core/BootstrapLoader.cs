using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace IdleFarm.Core
{
    /// <summary>
    /// Script untuk scene Bootstrap (scene index 0).
    /// Tugasnya: tampilkan splash screen, preload aset global, lalu load MainGame.
    /// Scene Bootstrap harus sangat ringan — tidak ada gameplay di sini.
    /// </summary>
    public class BootstrapLoader : MonoBehaviour
    {
        [Header("UI Splash")]
        [SerializeField] private Image  splashLogo;
        [SerializeField] private Slider loadingBar;
        [SerializeField] private TMPro.TextMeshProUGUI loadingText;
        [SerializeField] private CanvasGroup splashGroup;

        [Header("Konfigurasi")]
        [SerializeField] private float minSplashDuration = 2f;  // detik tampil minimum
        [SerializeField] private string mainGameSceneName = "MainGame";

        private void Start()
        {
            Application.targetFrameRate = 60;
            Screen.sleepTimeout = SleepTimeout.NeverSleep; // Jangan matikan layar saat bermain

            StartCoroutine(LoadMainGame());
        }

        private IEnumerator LoadMainGame()
        {
            float startTime = Time.time;

            // Animasi logo masuk
            if (splashGroup != null)
            {
                splashGroup.alpha = 0f;
                float t = 0f;
                while (t < 0.8f)
                {
                    t += Time.deltaTime;
                    splashGroup.alpha = t / 0.8f;
                    yield return null;
                }
                splashGroup.alpha = 1f;
            }

            // Mulai load async
            var op = SceneManager.LoadSceneAsync(mainGameSceneName);
            op.allowSceneActivation = false;

            if (loadingText != null) loadingText.text = "Memuat...";

            while (!op.isDone)
            {
                float progress = Mathf.Clamp01(op.progress / 0.9f);

                if (loadingBar != null) loadingBar.value = progress;
                if (loadingText != null) loadingText.text = $"Memuat... {(int)(progress * 100)}%";

                // Tunggu setidaknya minSplashDuration sebelum pindah scene
                bool splashTimeReached = (Time.time - startTime) >= minSplashDuration;
                if (op.progress >= 0.9f && splashTimeReached)
                {
                    op.allowSceneActivation = true;
                }

                yield return null;
            }
        }
    }
}
