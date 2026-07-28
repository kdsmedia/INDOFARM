# Idle Farm: Harvest Empire — Paket Proyek Unity

## Cara Menggunakan Paket Ini

1. Buat proyek Unity baru (versi **2022.3 LTS** atau lebih baru, pipeline **URP**)
2. Ikuti struktur folder di `ProjectStructure.md` untuk menata Assets
3. Salin semua file `.cs` dari folder `Scripts/` ke dalam `Assets/Scripts/` di Unity
4. Baca `GDD_IdleFarm_HarvestEmpire.md` sebagai referensi desain selama pengembangan
5. Isi ScriptableObject (CropData, UpgradeData) sesuai tabel di `GDD` bagian 10

## Dependensi Eksternal yang Perlu Diinstal (via Package Manager)

| Package | Sumber | Kegunaan |
|---|---|---|
| Google AdMob | External (google-admob-unity) | Rewarded & Interstitial Ads |
| Unity Ads (opsional cadangan) | Unity Registry | Fallback ads |
| Newtonsoft Json | Unity Registry (com.unity.nuget.newtonsoft-json) | Serialisasi save data |
| DoTween (HOTween v2) | Asset Store (gratis) | Animasi UI & tween |
| TextMeshPro | Unity Registry (built-in) | Teks UI berkualitas tinggi |

## Struktur File Dokumen

```
unity-project/
├── README.md                          ← file ini
├── GDD_IdleFarm_HarvestEmpire.md      ← Game Design Document lengkap
├── ProjectStructure.md                ← Blueprint folder Unity
└── Scripts/
    ├── Core/
    │   ├── GameManager.cs
    │   ├── SaveSystem.cs
    │   └── RemoteConfigManager.cs
    ├── Economy/
    │   ├── CoinManager.cs
    │   └── EconomyConfig.cs
    ├── Farm/
    │   ├── FarmPlot.cs
    │   ├── FarmManager.cs
    │   └── CropData.cs
    ├── Workers/
    │   ├── Worker.cs
    │   └── WorkerManager.cs
    ├── Managers/
    │   └── ManagerNPC.cs
    ├── Upgrade/
    │   └── UpgradeSystem.cs
    ├── Monetization/
    │   ├── AdMobManager.cs
    │   └── OfflineIncomeCalculator.cs
    ├── UI/
    │   ├── UIManager.cs
    │   ├── HUDController.cs
    │   ├── ShopPanel.cs
    │   └── OfflineIncomePopup.cs
    ├── Events/
    │   ├── DailyMissionSystem.cs
    │   └── SeasonalEventSystem.cs
    ├── Meta/
    │   ├── AchievementSystem.cs
    │   └── LeaderboardManager.cs
    └── Data/
        ├── CropDatabase.cs
        └── UpgradeDatabase.cs
```

## Versi Unity yang Direkomendasikan

- **Minimum:** Unity 2022.3.x LTS
- **Render Pipeline:** Universal Render Pipeline (URP)
- **Target Platform:** Android API 24+ / iOS 15+
- **Scripting Backend:** IL2CPP
- **Architecture:** ARM64 (Android), ARM64 (iOS)
