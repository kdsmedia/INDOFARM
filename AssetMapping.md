# Asset Mapping — Idle Farm: Harvest Empire

Dokumen ini menjelaskan dari mana setiap sumber asset berasal dan ke folder Unity mana asset tersebut disalin oleh `setup_assets.sh`.

---

## Cara Menggunakan

```bash
# Jalankan sekali sebelum membuka project di Unity atau sebelum build:
bash setup_assets.sh
```

Script ini dijalankan **otomatis** oleh GitHub Actions sebelum setiap build.

---

## Peta Asset → Unity Folder

### UI Sprites & Icons

| Sumber (repo root) | Tujuan (`game/Assets/_Project/...`) | Konten |
|---|---|---|
| `BoxesBanners/` | `Art/UI/Sprites/Boxes/` | Panel box, banner, text box — PNG + SVG, berbagai warna |
| `ButtonsIcons/` | `Art/UI/Sprites/Buttons/` | Icon button besar/kecil — circle, rounded, square |
| `ButtonsText/` | `Art/UI/Sprites/Buttons/` | Text button, toggle on/off, text field, premade button |
| `Sliders/` | `Art/UI/Sprites/Sliders/` | Scroll bar & slider — PNG + SVG |
| `Icons/` | `Art/UI/Icons/Misc/` | HUD icon: hati, bintang, koin, kunci, audio, menu, dll |

### Karakter 3D

| Sumber | Tujuan | Konten |
|---|---|---|
| `KayKit_Adventurers_2.0_FREE/Assets/fbx/` | `Art/Characters/Workers/Models/` `Art/Characters/Farmer/Models/` | Model karakter FBX (barbarian, knight, mage, ranger, rogue) + tekstur |
| `KayKit_Adventurers_2.0_FREE/Animations/fbx/` | `Art/Characters/Workers/Animations/` `Art/Characters/Farmer/Animations/` | Animasi FBX (general & movement) dengan Rig_Medium |
| `Modular Character Outfits - Fantasy[Standard]/Exports/FBX (Unity)/Modular Parts/` | `Art/Characters/Outfits/Peasant/` | Outfit petani modular: Male/Female Peasant (Arms, Body, Feet, Legs) |
| `Modular Character Outfits - Fantasy[Standard]/Exports/FBX (Unity)/Outfits/` | `Art/Characters/Outfits/Ranger/` | Outfit ranger lengkap: Male/Female Peasant & Ranger |

### Environment 3D

| Sumber | Tujuan | Konten |
|---|---|---|
| `Medieval_Village_MegaKit/Standard/FBX/` | `Art/Environment/Farm/Buildings/` | Bangunan desa medieval: dinding, pintu, jendela, atap, tangga |
| `Medieval_Village_MegaKit/Standard/Textures/` | `Art/Environment/Farm/Buildings/` | Tekstur bangunan medieval (diffuse + normal) |
| `Stylized_Nature_MegaKit/FBX/` | `Art/Environment/Nature/Trees/` | Pohon, semak, bunga, pakis, batu, jalur batu |
| `Stylized_Nature_MegaKit/Textures/` | `Art/Environment/Nature/Trees/` | Tekstur nature stylized |

---

## Folder yang Perlu Diisi Manual di Unity

Folder berikut harus diisi di Unity Editor karena membutuhkan pembuatan Prefab, ScriptableObject, atau Scene:

| Folder | Yang Perlu Dibuat |
|---|---|
| `Art/Crops/Models/` | Model 3D tanaman (3 stage: bibit, tumbuh, siap panen) |
| `Art/Crops/Prefabs/` | Prefab per tanaman per stage (Corn_Stage1.prefab, dst) |
| `Art/VFX/` | Particle system: panen, level up, koin, cuaca |
| `Art/Audio/BGM/` | File musik latar (`.mp3`/`.ogg`) |
| `Art/Audio/SFX/` | Sound effect tanam, panen, UI, dll |
| `Prefabs/Farm/` | FarmPlot.prefab, FarmArea.prefab, FarmManager.prefab |
| `Prefabs/Characters/` | Farmer_Player.prefab, Worker_01.prefab, Manager_NPC.prefab |
| `Prefabs/UI/Popups/` | OfflineIncomePopup.prefab, LevelUpPopup.prefab, dst |
| `Prefabs/UI/Panels/` | ShopPanel.prefab, MissionPanel.prefab, dst |
| `ScriptableObjects/Crops/` | SD_Corn.asset, SD_Wheat.asset, dst (isi dari GDD Tabel 12.1) |
| `ScriptableObjects/Upgrades/` | SD_GrowSpeed.asset, dst (isi dari GDD Tabel 12.2) |
| `Scenes/` | Bootstrap.unity, MainGame.unity |
| `Settings/` | URPAsset_Low/Medium/High.asset (dari URP Wizard) |

---

## Package Eksternal (Install via Unity Package Manager)

| Package | Registry / Sumber | Kegunaan |
|---|---|---|
| Google AdMob | [google-admob-unity GitHub](https://github.com/googleads/googleads-mobile-unity) | Rewarded & Interstitial Ads |
| DOTween (HOTween v2) | Unity Asset Store (gratis) | Animasi UI |
| `com.unity.nuget.newtonsoft-json` | Unity Registry | Sudah di manifest.json |
| `com.unity.textmeshpro` | Unity Registry | Sudah di manifest.json |
| `com.unity.mobile.notifications` | Unity Registry | Sudah di manifest.json |
| `com.unity.render-pipelines.universal` | Unity Registry | Sudah di manifest.json |

---

## Format File per Platform

| Format | Digunakan untuk | Kompatibel |
|---|---|---|
| `.fbx` | Model 3D & animasi karakter | Unity (preferensi) |
| `.gltf` / `.glb` | Model 3D environment | Unity via importer |
| `.obj` / `.mtl` | Model 3D alternatif | Unity |
| `.png` | Sprite UI & tekstur | Unity |
| `.svg` | Sprite UI vektor | Perlu plugin (Unity Vector Graphics) |
