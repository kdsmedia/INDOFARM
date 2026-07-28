using System;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Events
{
    /// <summary>
    /// Mengelola event musiman berkala: timer, mata uang event, reward track, dan live-ops.
    /// Event didefinisikan via JSON di StreamingAssets/Events/current_events.json
    /// </summary>
    public class SeasonalEventSystem : MonoBehaviour
    {
        public static SeasonalEventSystem Instance { get; private set; }

        [Header("Event Aktif (diisi saat runtime dari JSON/Remote Config)")]
        [SerializeField] private SeasonalEventData currentEvent;

        [Header("Template Event (fallback jika tidak ada server)")]
        [SerializeField] private SeasonalEventData[] localEventTemplates;

        // State runtime
        private bool   _isEventActive        = false;
        private double _eventCurrencyBalance  = 0;

        public bool   IsEventActive         => _isEventActive;
        public string EventCurrencyName     => currentEvent?.currencyName ?? "Bintang";
        public double EventCurrencyBalance  => _eventCurrencyBalance;

        public event Action<string>         OnEventStarted;
        public event Action                 OnEventEnded;
        public event Action<double>         OnEventCurrencyEarned;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        private void Start()
        {
            LoadCurrentEvent();
            CheckEventStatus();
            InvokeRepeating(nameof(CheckEventStatus), 60f, 60f);
        }

        // ──────────────────────────────────────────────
        #region Load Event

        private void LoadCurrentEvent()
        {
            // TODO: Muat dari Remote Config atau StreamingAssets/Events/current_events.json
            // Contoh struktur JSON:
            // {
            //   "eventId": "harvest_festival_2024",
            //   "eventName": "Festival Panen Raya",
            //   "currencyName": "Bintang Festival",
            //   "startTimeISO": "2024-09-01T00:00:00Z",
            //   "endTimeISO":   "2024-09-14T23:59:59Z",
            //   "rewards": [ ... ]
            // }

            // Gunakan template lokal sebagai fallback
            if (currentEvent == null && localEventTemplates != null && localEventTemplates.Length > 0)
                currentEvent = localEventTemplates[0];
        }

        private void CheckEventStatus()
        {
            if (currentEvent == null)
            {
                _isEventActive = false;
                return;
            }

            bool wasActive = _isEventActive;
            _isEventActive = DateTime.UtcNow >= currentEvent.StartTime &&
                             DateTime.UtcNow <= currentEvent.EndTime;

            if (!wasActive && _isEventActive)
            {
                OnEventStarted?.Invoke(currentEvent.eventName);
                Debug.Log($"[SeasonalEvent] Event dimulai: {currentEvent.eventName}");
            }
            else if (wasActive && !_isEventActive)
            {
                OnEventEnded?.Invoke();
                Debug.Log("[SeasonalEvent] Event berakhir.");
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Mata Uang Event

        public void EarnEventCurrency(double amount)
        {
            if (!_isEventActive) return;
            _eventCurrencyBalance += amount;
            OnEventCurrencyEarned?.Invoke(_eventCurrencyBalance);
        }

        public bool SpendEventCurrency(double amount)
        {
            if (_eventCurrencyBalance < amount) return false;
            _eventCurrencyBalance -= amount;
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Reward Track

        public List<EventRewardTier> GetRewardTiers()
            => currentEvent?.rewardTiers ?? new List<EventRewardTier>();

        public EventRewardTier GetCurrentTier()
        {
            if (currentEvent?.rewardTiers == null) return null;

            EventRewardTier current = null;
            foreach (var tier in currentEvent.rewardTiers)
            {
                if (_eventCurrencyBalance >= tier.requiredAmount)
                    current = tier;
            }
            return current;
        }

        public bool ClaimTierReward(string tierId)
        {
            var tier = currentEvent?.rewardTiers?.Find(t => t.tierId == tierId);
            if (tier == null || tier.isClaimed) return false;
            if (_eventCurrencyBalance < tier.requiredAmount) return false;

            tier.isClaimed = true;
            Economy.CoinManager.Instance.AddCoins(tier.rewardCoins);

            UI.UIManager.Instance?.ShowToast(
                $"Hadiah tier event diklaim! +{Economy.CoinManager.FormatCoins(tier.rewardCoins)} Koin");
            return true;
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Timer

        public TimeSpan? GetTimeRemaining()
        {
            if (!_isEventActive || currentEvent == null) return null;
            var remaining = currentEvent.EndTime - DateTime.UtcNow;
            return remaining.TotalSeconds > 0 ? remaining : (TimeSpan?)null;
        }

        #endregion
    }

    // ──────────────────────────────────────────────
    // Data Types

    [CreateAssetMenu(menuName = "IdleFarm/Seasonal Event Data", fileName = "EventData_New")]
    public class SeasonalEventData : ScriptableObject
    {
        public string eventId;
        public string eventName;
        public string currencyName;
        public Sprite eventBannerSprite;

        [Tooltip("ISO 8601 format: 2024-09-01T00:00:00Z")]
        public string startTimeISO;
        public string endTimeISO;

        public List<EventRewardTier> rewardTiers = new List<EventRewardTier>();

        public DateTime StartTime => DateTime.Parse(startTimeISO,
            null, System.Globalization.DateTimeStyles.RoundtripKind);

        public DateTime EndTime => DateTime.Parse(endTimeISO,
            null, System.Globalization.DateTimeStyles.RoundtripKind);
    }

    [Serializable]
    public class EventRewardTier
    {
        public string tierId;
        public string tierName;
        public double requiredAmount; // mata uang event yang dibutuhkan
        public double rewardCoins;
        public Sprite rewardIcon;
        public bool   isClaimed;
    }
}
