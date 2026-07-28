# Idle Farm: Harvest Empire

Game mobile idle farming berbasis Unity 2022.3 LTS + URP.  
Platform target: **Android** (AAB) & **iOS** (IPA).

---

## Struktur Repo

```
/
├── game/                          ← Unity project root (siap di-build)
│   ├── Assets/_Project/
│   │   ├── Scripts/               ← Semua C# scripts (33 file, sudah di-copy)
│   │   ├── Art/                   ← Folder art (diisi oleh setup_assets.sh)
│   │   ├── Prefabs/               ← Buat manual di Unity Editor
│   │   ├── ScriptableObjects/     ← Buat manual di Unity Editor
│   │   └── Scenes/                ← Buat manual di Unity Editor
│   ├── Assets/StreamingAssets/Events/  ← JSON event data
│   ├── Packages/manifest.json     ← URP, TMP, NewtonsoftJSON, dll
│   └── ProjectSettings/           ← Platform settings (Android API 24+, iOS 15+)
│
├── .github/workflows/unity-build.yml  ← CI/CD: auto-build Android + iOS
│
├── setup_assets.sh                ← Copy semua art asset ke dalam Unity project
├── AssetMapping.md                ← Peta lengkap sumber → tujuan setiap asset
├── GITHUB_SECRETS.md              ← Panduan setup secrets untuk GitHub Actions
│
├── BoxesBanners/                  ← Sumber: UI boxes & banners (PNG+SVG)
├── ButtonsIcons/                  ← Sumber: Icon buttons (PNG+SVG)
├── ButtonsText/                   ← Sumber: Text buttons & toggles (PNG+SVG)
├── Icons/                         ← Sumber: HUD icons (PNG+SVG)
├── Sliders/                       ← Sumber: Scroll bars & sliders (PNG+SVG)
├── KayKit_Adventurers_2.0_FREE/   ← Sumber: Karakter FBX + animasi
├── Modular Character Outfits.../  ← Sumber: Outfit modular peasant & ranger
├── Medieval_Village_MegaKit/      ← Sumber: Bangunan 3D medieval (FBX+glTF)
├── Stylized_Nature_MegaKit/       ← Sumber: Pohon, batu, tanaman (FBX+glTF)
└── IdleFarm_HarvestEmpire/        ← Dokumen GDD, ProjectStructure, Checklist
```

---

## Cara Setup & Build

### 1. Pertama kali (lokal)
```bash
# Copy semua art asset ke Unity project:
bash setup_assets.sh

# Buka game/ di Unity Hub → Unity 2022.3.20f1 (URP)
# Unity akan generate .meta files — commit hasilnya ke GitHub
```

### 2. Build otomatis via GitHub Actions
```bash
# Push ke branch main → build Android + iOS langsung berjalan otomatis
git push origin main
```

Lihat **`GITHUB_SECRETS.md`** untuk panduan lengkap setup secrets GitHub.

### 3. Trigger build manual
GitHub Repo → Actions → "Unity Build" → Run workflow

---

## Yang Masih Perlu Dilakukan di Unity Editor

- [ ] Generate `.meta` files (buka project sekali di Unity)
- [ ] Setup URP Asset (Low/Medium/High) via Edit → Project Settings → Graphics
- [ ] Buat Scene Bootstrap.unity & MainGame.unity
- [ ] Buat Prefabs: FarmPlot, FarmArea, karakter, UI panels & popups
- [ ] Isi ScriptableObjects: CropData (12 tanaman), UpgradeData (5 upgrade)
- [ ] Install Google AdMob SDK & DOTween dari Asset Store
- [ ] Isi Bundle ID di Player Settings → `com.yourstudio.idlefarm`

---

## Referensi Dokumen

| File | Isi |
|---|---|
| `IdleFarm_HarvestEmpire/unity-project/GDD_IdleFarm_HarvestEmpire.md` | Game Design Document lengkap |
| `IdleFarm_HarvestEmpire/unity-project/ProjectStructure.md` | Blueprint folder Unity |
| `IdleFarm_HarvestEmpire/unity-project/Checklist_SubmitStore.md` | Checklist submit ke Play Store / App Store |
| `AssetMapping.md` | Peta sumber asset → folder Unity |
| `GITHUB_SECRETS.md` | Cara setup secrets untuk CI/CD |

---

## User Preferences

- Engine: Unity 2022.3 LTS + URP
- Platform: Android (utama) + iOS
- Build: Otomatis via GitHub Actions
- Bahasa game: Bahasa Indonesia (primer)
