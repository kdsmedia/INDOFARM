using System;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola push notification lokal (Unity Mobile Notifications).
    /// Digunakan untuk mengingatkan pemain: tanaman siap, event hampir berakhir, hadiah harian.
    ///
    /// SETUP:
    /// 1. Install "Mobile Notifications" package dari Unity Package Manager
    ///    (com.unity.mobile.notifications)
    /// 2. Aktifkan permission notifikasi saat pertama kali app dibuka
    /// </summary>
    public class NotificationManager : MonoBehaviour
    {
        public static NotificationManager Instance { get; private set; }

        private const string CHANNEL_FARM    = "farm_notifications";
        private const string CHANNEL_EVENT   = "event_notifications";
        private const string CHANNEL_DAILY   = "daily_notifications";

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            RequestPermission();
            SetupChannels();
        }

        private void RequestPermission()
        {
            // ── IMPLEMENTASI UNITY MOBILE NOTIFICATIONS ──
            // #if UNITY_ANDROID
            // var channel = new AndroidNotificationChannel()
            // {
            //     Id = CHANNEL_FARM,
            //     Name = "Notifikasi Pertanian",
            //     Importance = Importance.Default,
            //     Description = "Notifikasi tanaman siap panen dan hadiah harian"
            // };
            // AndroidNotificationCenter.RegisterNotificationChannel(channel);
            // #endif
            //
            // #if UNITY_IOS
            // StartCoroutine(RequestIOSPermission());
            // #endif

            Debug.Log("[NotificationManager] Permission diminta (placeholder).");
        }

        private void SetupChannels()
        {
            // Buat channel Android untuk tiap kategori notifikasi
            // (Diisi saat Unity Mobile Notifications SDK terpasang)
        }

        // ──────────────────────────────────────────────
        #region Jadwalkan Notifikasi

        /// <summary>
        /// Jadwalkan notifikasi "Tanamanmu siap dipanen!" setelah X detik.
        /// </summary>
        public void ScheduleHarvestReady(float secondsUntilReady)
        {
            if (secondsUntilReady <= 0) return;

            ScheduleNotification(
                title:   "Tanamanmu Sudah Siap!",
                body:    "Kembali ke Idle Farm dan panen hasilnya sekarang.",
                channel: CHANNEL_FARM,
                delay:   TimeSpan.FromSeconds(secondsUntilReady)
            );
        }

        /// <summary>
        /// Jadwalkan notifikasi "Event hampir berakhir!" 2 jam sebelum event selesai.
        /// </summary>
        public void ScheduleEventEnding(DateTime eventEndTime)
        {
            var twoHoursBefore = eventEndTime - TimeSpan.FromHours(2);
            if (twoHoursBefore <= DateTime.Now) return;

            ScheduleNotification(
                title:   "Event Segera Berakhir!",
                body:    "Masih ada 2 jam untuk klaim hadiah event.",
                channel: CHANNEL_EVENT,
                delay:   twoHoursBefore - DateTime.Now
            );
        }

        /// <summary>
        /// Jadwalkan notifikasi hadiah login harian setiap hari pukul 08:00.
        /// </summary>
        public void ScheduleDailyReward()
        {
            var tomorrow8AM = DateTime.Today.AddDays(1).AddHours(8);
            ScheduleNotification(
                title:   "Hadiah Harian Tersedia!",
                body:    "Login hari ini untuk klaim hadiahmu di Idle Farm.",
                channel: CHANNEL_DAILY,
                delay:   tomorrow8AM - DateTime.Now
            );
        }

        private void ScheduleNotification(string title, string body, string channel, TimeSpan delay)
        {
            if (delay.TotalSeconds <= 0) return;

            // ── IMPLEMENTASI UNITY MOBILE NOTIFICATIONS ──
            // #if UNITY_ANDROID
            // var notification = new AndroidNotification
            // {
            //     Title       = title,
            //     Text        = body,
            //     FireTime    = DateTime.Now + delay,
            //     SmallIcon   = "icon_0",
            //     LargeIcon   = "icon_1"
            // };
            // AndroidNotificationCenter.SendNotification(notification, channel);
            // #endif
            //
            // #if UNITY_IOS
            // var timeTrigger = new iOSNotificationTimeIntervalTrigger()
            // {
            //     TimeInterval = delay,
            //     Repeats      = false
            // };
            // var notification = new iOSNotification()
            // {
            //     Title    = title,
            //     Body     = body,
            //     Trigger  = timeTrigger,
            // };
            // iOSNotificationCenter.ScheduleNotification(notification);
            // #endif

            Debug.Log($"[Notification] Dijadwalkan: '{title}' dalam {delay.TotalMinutes:F0} menit.");
        }

        #endregion

        // ──────────────────────────────────────────────

        /// <summary>
        /// Batalkan semua notifikasi pending (dipanggil saat app dibuka kembali).
        /// </summary>
        public void CancelAllNotifications()
        {
            // #if UNITY_ANDROID
            // AndroidNotificationCenter.CancelAllScheduledNotifications();
            // #elif UNITY_IOS
            // iOSNotificationCenter.RemoveAllScheduledNotifications();
            // #endif
            Debug.Log("[Notification] Semua notifikasi dibatalkan.");
        }
    }
}
