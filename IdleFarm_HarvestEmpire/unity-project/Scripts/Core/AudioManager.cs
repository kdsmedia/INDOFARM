using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace IdleFarm.Core
{
    /// <summary>
    /// Mengelola semua audio game: BGM (background music) dan SFX (sound effects).
    /// Volume tersimpan di PlayerPrefs dan bisa diubah dari Pengaturan.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        [SerializeField] private AudioSource bgmSource;
        [SerializeField] private AudioSource sfxSource;

        [Header("BGM Clips")]
        [SerializeField] private AudioClip bgmMain;
        [SerializeField] private AudioClip bgmEvent;

        [Header("SFX Global")]
        [SerializeField] private AudioClip sfxButtonClick;
        [SerializeField] private AudioClip sfxLevelUp;
        [SerializeField] private AudioClip sfxCoinCollect;
        [SerializeField] private AudioClip sfxUnlock;

        // Volume settings (disimpan ke PlayerPrefs)
        private const string PREF_BGM_VOL = "IdleFarm_BGMVol";
        private const string PREF_SFX_VOL = "IdleFarm_SFXVol";
        private const string PREF_MUTE    = "IdleFarm_Mute";

        private float _bgmVolume = 0.7f;
        private float _sfxVolume = 1.0f;
        private bool  _isMuted   = false;

        public float BgmVolume => _bgmVolume;
        public float SfxVolume => _sfxVolume;
        public bool  IsMuted   => _isMuted;

        // Pool SFX agar tidak overload audio source tunggal
        private Queue<AudioSource> _sfxPool = new Queue<AudioSource>();
        private const int SFX_POOL_SIZE = 8;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            LoadSettings();
            BuildSFXPool();
            PlayBGM(bgmMain);

            // Subscribe ke event game
            Economy.CoinManager.Instance.OnCoinsEarned   += (amt, pos) => PlaySFX(sfxCoinCollect);
            Upgrade.UpgradeSystem.Instance.OnUpgradePerformed += (id, lvl) => PlaySFX(sfxLevelUp);
            Events.SeasonalEventSystem.Instance.OnEventStarted += _ => FadeIntoBGM(bgmEvent);
            Events.SeasonalEventSystem.Instance.OnEventEnded   += () => FadeIntoBGM(bgmMain);
        }

        // ──────────────────────────────────────────────
        #region BGM

        public void PlayBGM(AudioClip clip)
        {
            if (clip == null || bgmSource == null) return;
            bgmSource.clip   = clip;
            bgmSource.loop   = true;
            bgmSource.volume = _isMuted ? 0 : _bgmVolume;
            bgmSource.Play();
        }

        public void FadeIntoBGM(AudioClip clip, float fadeDuration = 1.5f)
        {
            if (this == null) return;
            StartCoroutine(FadeBGMCoroutine(clip, fadeDuration));
        }

        private IEnumerator FadeBGMCoroutine(AudioClip newClip, float duration)
        {
            // Fade out
            float t = 0;
            float startVol = bgmSource.volume;
            while (t < duration / 2f)
            {
                t += Time.deltaTime;
                bgmSource.volume = Mathf.Lerp(startVol, 0, t / (duration / 2f));
                yield return null;
            }

            PlayBGM(newClip);

            // Fade in
            t = 0;
            while (t < duration / 2f)
            {
                t += Time.deltaTime;
                bgmSource.volume = Mathf.Lerp(0, _isMuted ? 0 : _bgmVolume, t / (duration / 2f));
                yield return null;
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region SFX

        public void PlaySFX(AudioClip clip)
        {
            if (clip == null || _isMuted) return;

            // Gunakan pool jika ada, fallback ke PlayClipAtPoint
            if (_sfxPool.Count > 0)
            {
                var src = _sfxPool.Dequeue();
                src.volume = _sfxVolume;
                src.clip   = clip;
                src.Play();
                StartCoroutine(ReturnToPoolAfterPlay(src, clip.length));
            }
            else
            {
                sfxSource?.PlayOneShot(clip, _sfxVolume);
            }
        }

        public void PlayButtonClick() => PlaySFX(sfxButtonClick);
        public void PlayUnlock()      => PlaySFX(sfxUnlock);

        private IEnumerator ReturnToPoolAfterPlay(AudioSource src, float delay)
        {
            yield return new WaitForSeconds(delay + 0.1f);
            src.Stop();
            _sfxPool.Enqueue(src);
        }

        private void BuildSFXPool()
        {
            for (int i = 0; i < SFX_POOL_SIZE; i++)
            {
                var go  = new GameObject($"SFX_Pool_{i}");
                go.transform.SetParent(transform);
                var src = go.AddComponent<AudioSource>();
                src.playOnAwake = false;
                _sfxPool.Enqueue(src);
            }
        }

        #endregion

        // ──────────────────────────────────────────────
        #region Settings

        public void SetBgmVolume(float vol)
        {
            _bgmVolume = Mathf.Clamp01(vol);
            if (bgmSource != null && !_isMuted)
                bgmSource.volume = _bgmVolume;
            PlayerPrefs.SetFloat(PREF_BGM_VOL, _bgmVolume);
            PlayerPrefs.Save();
        }

        public void SetSfxVolume(float vol)
        {
            _sfxVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(PREF_SFX_VOL, _sfxVolume);
            PlayerPrefs.Save();
        }

        public void SetMute(bool mute)
        {
            _isMuted = mute;
            if (bgmSource != null) bgmSource.volume = mute ? 0 : _bgmVolume;
            PlayerPrefs.SetInt(PREF_MUTE, mute ? 1 : 0);
            PlayerPrefs.Save();
        }

        private void LoadSettings()
        {
            _bgmVolume = PlayerPrefs.GetFloat(PREF_BGM_VOL, 0.7f);
            _sfxVolume = PlayerPrefs.GetFloat(PREF_SFX_VOL, 1.0f);
            _isMuted   = PlayerPrefs.GetInt(PREF_MUTE, 0) == 1;
        }

        #endregion
    }
}
