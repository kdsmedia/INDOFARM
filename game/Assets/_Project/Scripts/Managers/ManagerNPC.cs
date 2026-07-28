using UnityEngine;

namespace IdleFarm.Managers
{
    /// <summary>
    /// Manager NPC yang mengotomasi seluruh operasi satu area.
    /// Saat diaktifkan, semua Worker di area akan berjalan otomatis.
    /// Pasang script ini pada GameObject Manager di scene.
    /// </summary>
    public class ManagerNPC : MonoBehaviour
    {
        [Header("Data Manager")]
        public int    areaIndex;
        public string managerName;
        [Tooltip("Bonus pendapatan pasif saat manager aktif (0.05 = +5%)")]
        public float  passiveIncomeBonus = 0.05f;
        public double activationCost;

        [Header("Visual")]
        public Sprite portraitSprite;
        [SerializeField] private GameObject npcModel;
        [SerializeField] private Animator   animator;
        [SerializeField] private GameObject activeBadge;    // badge visual "aktif"

        private bool _isActive = false;
        public bool  IsActive => _isActive;

        // Simpan status aktif semua manager dengan static agar mudah dicek
        private static bool[] _managerActiveStates;
        private const int MAX_AREAS = 10;

        // ──────────────────────────────────────────────
        #region Init

        private void Awake()
        {
            if (_managerActiveStates == null)
                _managerActiveStates = new bool[MAX_AREAS];
        }

        public void Initialize()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            bool savedActive = saveData.managerActive != null &&
                               areaIndex < saveData.managerActive.Length &&
                               saveData.managerActive[areaIndex];

            if (savedActive) ActivateInternal(silent: true);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Aktivasi

        /// <summary>
        /// Coba aktifkan manager. Kurangi koin jika belum aktif.
        /// </summary>
        public bool TryActivate()
        {
            if (_isActive)
            {
                Debug.Log($"[ManagerNPC] {managerName} sudah aktif.");
                return false;
            }

            if (!Economy.CoinManager.Instance.SpendCoins(activationCost))
            {
                Debug.Log($"[ManagerNPC] Koin tidak cukup untuk aktifkan {managerName}.");
                return false;
            }

            ActivateInternal(silent: false);
            SaveManagerState();

            Debug.Log($"[ManagerNPC] {managerName} (Area {areaIndex}) diaktifkan.");
            return true;
        }

        private void ActivateInternal(bool silent)
        {
            _isActive = true;

            if (areaIndex < MAX_AREAS)
                _managerActiveStates[areaIndex] = true;

            // Aktifkan semua pekerja di area ini
            Workers.WorkerManager.Instance?.ActivateWorkersForArea(areaIndex);

            // Visual
            if (activeBadge != null) activeBadge.SetActive(true);
            if (npcModel   != null) npcModel.SetActive(true);
            if (animator   != null) animator.SetTrigger("Activate");

            if (!silent)
                UI.UIManager.Instance?.ShowManagerActivatedPopup(managerName, passiveIncomeBonus);
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Static Helper

        /// <summary>
        /// Cek apakah manager area tertentu aktif (dipakai oleh Worker).
        /// </summary>
        public static bool IsManagerActive(int areaIndex)
        {
            if (_managerActiveStates == null || areaIndex < 0 || areaIndex >= MAX_AREAS)
                return false;
            return _managerActiveStates[areaIndex];
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Save

        private void SaveManagerState()
        {
            var saveData = Core.SaveSystem.Instance.GetSaveData();
            if (saveData.managerActive == null || saveData.managerActive.Length < MAX_AREAS)
                saveData.managerActive = new bool[MAX_AREAS];

            saveData.managerActive[areaIndex] = _isActive;
        }

        #endregion
    }
}
