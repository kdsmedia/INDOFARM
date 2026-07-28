# STRUKTUR FOLDER PROYEK UNITY
# Idle Farm: Harvest Empire

## Cara Setup Proyek Baru

1. Buka **Unity Hub** → New Project → **3D (URP)** → Unity 2022.3 LTS
2. Beri nama proyek: `IdleFarm_HarvestEmpire`
3. Buat struktur folder berikut di dalam `Assets/`

---

## Blueprint Folder Assets/

```
Assets/
│
├── _Project/                          ← Semua aset proyek (hindari taruh langsung di Assets/)
│   │
│   ├── Art/
│   │   ├── Characters/
│   │   │   ├── Farmer/
│   │   │   │   ├── Models/            ← File .fbx karakter petani
│   │   │   │   ├── Animations/        ← AnimationClip (.anim)
│   │   │   │   ├── Materials/
│   │   │   │   └── Textures/
│   │   │   └── Workers/               ← Model & animasi pekerja NPC
│   │   │
│   │   ├── Environment/
│   │   │   ├── Farm/
│   │   │   │   ├── Terrain/           ← Terrain data & texture splatmaps
│   │   │   │   ├── Props/             ← Pagar, pohon dekoratif, batu, dll
│   │   │   │   ├── Buildings/         ← Gudang, kandang, rumah petani
│   │   │   │   └── Areas/             ← Prefab per area (Area1, Area2, …)
│   │   │   └── Skybox/
│   │   │
│   │   ├── Crops/
│   │   │   ├── Models/                ← .fbx tiap tanaman (3 stage: bibit, tumbuh, siap)
│   │   │   ├── Materials/
│   │   │   ├── Textures/
│   │   │   └── Prefabs/               ← Prefab per tanaman per stage
│   │   │       ├── Corn_Stage1.prefab
│   │   │       ├── Corn_Stage2.prefab
│   │   │       ├── Corn_Stage3.prefab
│   │   │       └── …
│   │   │
│   │   ├── VFX/
│   │   │   ├── Harvest/               ← Efek partikel saat panen
│   │   │   ├── LevelUp/               ← Efek naik level
│   │   │   ├── Coins/                 ← Efek koin beterbangan
│   │   │   ├── Weather/               ← Hujan, sinar matahari, angin
│   │   │   └── Events/                ← Efek khusus event musiman
│   │   │
│   │   └── UI/
│   │       ├── Icons/
│   │       │   ├── Crops/             ← Ikon 2D tiap tanaman
│   │       │   ├── Upgrades/
│   │       │   ├── Achievements/
│   │       │   └── Misc/
│   │       ├── Sprites/               ← Sprite tombol, panel, border
│   │       ├── Fonts/                 ← Font lokal (Bahasa Indonesia)
│   │       └── Backgrounds/
│   │
│   ├── Audio/
│   │   ├── BGM/                       ← Musik latar per area/event
│   │   ├── SFX/
│   │   │   ├── Farm/                  ← Suara tanam, panen, air
│   │   │   ├── UI/                    ← Klik tombol, popup, notif
│   │   │   ├── Characters/            ← Suara karakter
│   │   │   └── Ambient/               ← Suara lingkungan (burung, angin)
│   │   └── Voice/                     ← Jika ada voice acting karakter
│   │
│   ├── Prefabs/
│   │   ├── Farm/
│   │   │   ├── FarmPlot.prefab        ← Prefab satu petak lahan
│   │   │   ├── FarmArea.prefab        ← Prefab satu area (isi 4–12 plot)
│   │   │   └── FarmManager.prefab     ← GameManager level farm
│   │   ├── Characters/
│   │   │   ├── Farmer_Player.prefab
│   │   │   ├── Worker_01.prefab
│   │   │   └── Manager_NPC.prefab
│   │   ├── UI/
│   │   │   ├── Popups/
│   │   │   │   ├── OfflineIncomePopup.prefab
│   │   │   │   ├── LevelUpPopup.prefab
│   │   │   │   ├── RewardPopup.prefab
│   │   │   │   └── ConfirmPopup.prefab
│   │   │   ├── Panels/
│   │   │   │   ├── ShopPanel.prefab
│   │   │   │   ├── MissionPanel.prefab
│   │   │   │   ├── EventPanel.prefab
│   │   │   │   └── SettingsPanel.prefab
│   │   │   └── HUD.prefab
│   │   └── Managers/
│   │       ├── GameManager.prefab
│   │       ├── AudioManager.prefab
│   │       ├── UIManager.prefab
│   │       └── AdMobManager.prefab
│   │
│   ├── ScriptableObjects/
│   │   ├── Crops/                     ← CropData asset per tanaman
│   │   │   ├── SD_Corn.asset
│   │   │   ├── SD_Wheat.asset
│   │   │   └── …
│   │   ├── Upgrades/                  ← UpgradeData asset per upgrade
│   │   │   ├── SD_GrowSpeed.asset
│   │   │   └── …
│   │   ├── Workers/                   ← WorkerData asset
│   │   ├── Managers/                  ← ManagerData asset
│   │   └── Events/                    ← EventData asset per event
│   │
│   ├── Scripts/                       ← (Isi dari folder Scripts/ paket ini)
│   │   ├── Core/
│   │   ├── Economy/
│   │   ├── Farm/
│   │   ├── Workers/
│   │   ├── Managers/
│   │   ├── Upgrade/
│   │   ├── Monetization/
│   │   ├── UI/
│   │   ├── Events/
│   │   ├── Meta/
│   │   └── Data/
│   │
│   ├── Scenes/
│   │   ├── Bootstrap.unity            ← Scene pertama, load async
│   │   ├── MainGame.unity             ← Scene utama farm
│   │   └── Events/
│   │       └── HarvestFestival.unity  ← Scene event khusus (opsional)
│   │
│   └── Settings/
│       ├── URPAsset_Low.asset         ← Setting grafis low
│       ├── URPAsset_Medium.asset
│       ├── URPAsset_High.asset
│       └── InputSystem.inputactions
│
├── Plugins/                           ← SDK eksternal
│   ├── GoogleMobileAds/               ← AdMob SDK
│   └── Newtonsoft.Json/
│
└── StreamingAssets/                   ← File yang dikemas apa adanya
    └── Events/                        ← Definisi event dalam JSON
        ├── current_events.json
        └── event_calendar.json
```

---

## Scene Setup: MainGame.unity

### Hierarki GameObject di Scene

```
MainGame (Scene)
│
├── [MANAGERS]                         ← Semua singleton manager
│   ├── GameManager
│   ├── CoinManager
│   ├── FarmManager
│   ├── WorkerManager
│   ├── UpgradeSystem
│   ├── AchievementSystem
│   ├── DailyMissionSystem
│   ├── SeasonalEventSystem
│   ├── AdMobManager
│   ├── AudioManager
│   ├── UIManager
│   └── SaveSystem
│
├── [CAMERA]
│   ├── Main Camera
│   └── UI Camera
│
├── [ENVIRONMENT]
│   ├── DirectionalLight (Sun)
│   ├── Terrain
│   ├── SkyboxController
│   └── AmbientParticles (dust, birds)
│
├── [FARM]
│   ├── Area_01
│   │   ├── Plot_01
│   │   ├── Plot_02
│   │   ├── Plot_03
│   │   └── Plot_04
│   ├── Area_02 (locked)
│   ├── Area_03 (locked)
│   ├── Area_04 (locked)
│   └── Area_05 (locked)
│
├── [CHARACTERS]
│   ├── Player_Farmer
│   └── Workers (populated at runtime)
│
├── [UI]                               ← Canvas (Screen Space - Overlay)
│   ├── HUD
│   │   ├── CoinDisplay
│   │   ├── LevelDisplay
│   │   └── NavBar (Shop, Mission, Event, Settings)
│   ├── Popups
│   │   ├── OfflineIncomePopup
│   │   ├── LevelUpPopup
│   │   └── ConfirmPopup
│   └── Panels
│       ├── ShopPanel
│       ├── MissionPanel
│       ├── EventPanel
│       └── SettingsPanel
│
└── [VFX]
    ├── HarvestParticlePool
    └── CoinFlyPool
```

---

## Layer & Tag Setup

### Tags yang Perlu Dibuat

```
FarmPlot
Worker
Manager
Interactable
UI
Collectible
```

### Layers yang Perlu Dibuat

```
Default      (0)
UI           (5)
Farm         (8)   ← Lahan & crop
Character    (9)   ← Player & NPC
Ignore       (31)
```

---

## Project Settings Penting

### Player Settings
```
Company Name: [Nama Studio]
Product Name: Idle Farm: Harvest Empire
Bundle ID: com.[namaStudio].idlefarm
Version: 1.0.0

Android:
  Minimum API: 24
  Target API: 33 (atau terbaru)
  Scripting Backend: IL2CPP
  Architecture: ARMv7 + ARM64
  
iOS:
  Target SDK: Device SDK
  Architecture: ARM64
```

### Quality Settings (URP)
```
Low:    URP Asset_Low   → shadow off, post-process minimal
Medium: URP Asset_Med   → shadow medium, bloom on
High:   URP Asset_High  → shadow high, semua post-process on
```

### Time Settings
```
Fixed Timestep: 0.02 (50 Hz)
Maximum Allowed Timestep: 0.1
```
