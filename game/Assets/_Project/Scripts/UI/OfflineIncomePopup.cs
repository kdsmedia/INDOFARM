using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IdleFarm.UI
{
    /// <summary>
    /// Popup "Selamat Datang Kembali" yang tampil saat pemain kembali membuka game.
    /// Menampilkan offline income dan pilihan klaim normal vs. 2× dengan iklan.
    /// </summary>
    public class OfflineIncomePopup : MonoBehaviour
    {
        [Header("Teks")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI durationText;
        [SerializeField] private TextMeshProUGUI incomeText;
        [SerializeField] private TextMeshProUGUI incomeDoubledText;

        [Header("Tombol")]
        [SerializeField] private Button btnClaimNormal;
        [SerializeField] private Button btnClaimWithAd;

        [Header("Animasi")]
        [SerializeField] private Animator popupAnimator;

        private double         _income;
        private Action<double> _onClaimNormal;
        private Action<double> _onClaimWithAd;

        private static readonly int ANIM_SHOW = Animator.StringToHash("Show");

        // ──────────────────────────────────────────────

        public void Setup(
            double income,
            TimeSpan offlineDuration,
            Action<double> onClaimNormal,
            Action<double> onClaimWithAd)
        {
            _income        = income;
            _onClaimNormal = onClaimNormal;
            _onClaimWithAd = onClaimWithAd;

            // Isi teks
            if (titleText != null)
                titleText.text = "Selamat Datang Kembali!";

            if (durationText != null)
                durationText.text = $"Kamu pergi selama {FormatDuration(offlineDuration)}";

            if (incomeText != null)
                incomeText.text = $"+{Economy.CoinManager.FormatCoins(income)} Koin";

            float adBonus = Core.RemoteConfigManager.Instance?.RewardAdBonus ?? 2f;
            if (incomeDoubledText != null)
                incomeDoubledText.text = $"Tonton Iklan untuk {adBonus}× Lipat\n+{Economy.CoinManager.FormatCoins(income * adBonus)} Koin";

            // Pasang listener tombol
            btnClaimNormal?.onClick.RemoveAllListeners();
            btnClaimNormal?.onClick.AddListener(ClaimNormal);

            btnClaimWithAd?.onClick.RemoveAllListeners();
            btnClaimWithAd?.onClick.AddListener(ClaimWithAd);

            // Cek apakah iklan tersedia
            bool adReady = Monetization.AdMobManager.Instance?.IsRewardedReady ?? false;
            btnClaimWithAd?.gameObject.SetActive(adReady);

            // Animasi masuk
            if (popupAnimator != null) popupAnimator.SetTrigger(ANIM_SHOW);

            gameObject.SetActive(true);
        }

        private void ClaimNormal()
        {
            _onClaimNormal?.Invoke(_income);
            Close();
        }

        private void ClaimWithAd()
        {
            // Tombol ini hanya muncul jika iklan tersedia
            _onClaimWithAd?.Invoke(_income);
            Close();
        }

        private void Close()
        {
            gameObject.SetActive(false);
        }

        private string FormatDuration(TimeSpan span)
        {
            if (span.TotalHours >= 1)
                return $"{(int)span.TotalHours} jam {span.Minutes} menit";
            if (span.TotalMinutes >= 1)
                return $"{(int)span.TotalMinutes} menit";
            return $"{(int)span.TotalSeconds} detik";
        }
    }
}
