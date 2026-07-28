using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola tracking analytics game menggunakan Unity Analytics / Firebase Analytics.
    /// Event penting: instalasi, tutorial, retensi, titik drop-off, iklan.
    /// </summary>
    public class AnalyticsManager : MonoBehaviour
    {
        public static AnalyticsManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        // ──────────────────────────────────────────────
        #region Event Definitions

        // Nama event — gunakan snake_case konsisten
        public const string EVT_TUTORIAL_STEP         = "tutorial_step";
        public const string EVT_TUTORIAL_COMPLETE      = "tutorial_complete";
        public const string EVT_TUTORIAL_SKIP          = "tutorial_skip";
        public const string EVT_FIRST_HARVEST          = "first_harvest";
        public const string EVT_FIRST_UPGRADE          = "first_upgrade";
        public const string EVT_AREA_UNLOCKED          = "area_unlocked";
        public const string EVT_WORKER_HIRED           = "worker_hired";
        public const string EVT_MANAGER_ACTIVATED      = "manager_activated";
        public const string EVT_PRESTIGE               = "prestige_performed";
        public const string EVT_AD_WATCHED             = "ad_watched";
        public const string EVT_AD_SKIPPED             = "ad_skipped";
        public const string EVT_AD_FAILED              = "ad_failed";
        public const string EVT_EVENT_JOINED           = "seasonal_event_joined";
        public const string EVT_EVENT_REWARD_CLAIMED   = "event_reward_claimed";
        public const string EVT_GUILD_JOINED           = "guild_joined";
        public const string EVT_SESSION_START          = "session_start";
        public const string EVT_SESSION_END            = "session_end";
        public const string EVT_ACHIEVEMENT_UNLOCKED   = "achievement_unlocked";
        public const string EVT_OFFLINE_INCOME_CLAIMED = "offline_income_claimed";

        #endregion

        // ──────────────────────────────────────────────
        #region Log Event

        /// <summary>
        /// Log event analytics. Parameter adalah Dictionary string/object.
        /// </summary>
        public void LogEvent(string eventName, Dictionary<string, object> parameters = null)
        {
            // ── IMPLEMENTASI UNITY ANALYTICS ──
            // var eventParams = parameters != null
            //     ? parameters.Select(kv => new Unity.Services.Analytics.Parameter(kv.Key, kv.Value.ToString())).ToArray()
            //     : null;
            // AnalyticsService.Instance.RecordEvent(eventName);

            // ── IMPLEMENTASI FIREBASE ANALYTICS (alternatif) ──
            // if (parameters != null)
            //     FirebaseAnalytics.LogEvent(eventName, /* convert dict to params */);
            // else
            //     FirebaseAnalytics.LogEvent(eventName);

            // ── PLACEHOLDER ──
            if (parameters != null)
            {
                var sb = new System.Text.StringBuilder();
                foreach (var kv in parameters) sb.Append($"{kv.Key}={kv.Value}, ");
                Debug.Log($"[Analytics] {eventName} | {sb}");
            }
            else
            {
                Debug.Log($"[Analytics] {eventName}");
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Convenience Methods

        public void LogTutorialStep(int step)
            => LogEvent(EVT_TUTORIAL_STEP, new Dictionary<string, object> { ["step"] = step });

        public void LogAdWatched(string placement)
            => LogEvent(EVT_AD_WATCHED, new Dictionary<string, object> { ["placement"] = placement });

        public void LogAdFailed(string placement, string reason)
            => LogEvent(EVT_AD_FAILED, new Dictionary<string, object>
                { ["placement"] = placement, ["reason"] = reason });

        public void LogAreaUnlocked(int areaIndex)
            => LogEvent(EVT_AREA_UNLOCKED, new Dictionary<string, object> { ["area"] = areaIndex });

        public void LogPrestige(int prestigeCount, float multiplier)
            => LogEvent(EVT_PRESTIGE, new Dictionary<string, object>
                { ["count"] = prestigeCount, ["multiplier"] = multiplier });

        public void LogOfflineIncomeClaimed(double amount, bool withAd, double durationMinutes)
            => LogEvent(EVT_OFFLINE_INCOME_CLAIMED, new Dictionary<string, object>
                { ["amount"] = amount, ["with_ad"] = withAd, ["duration_minutes"] = durationMinutes });

        public void LogSessionStart()
            => LogEvent(EVT_SESSION_START, new Dictionary<string, object>
                { ["time_utc"] = System.DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm") });

        public void LogSessionEnd(float sessionDurationSeconds)
            => LogEvent(EVT_SESSION_END, new Dictionary<string, object>
                { ["duration_seconds"] = sessionDurationSeconds });

        #endregion
    }
}
