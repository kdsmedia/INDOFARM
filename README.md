# 🏰 INDOFARM ADVENTURE
### Game Idle Farm RPG — Android (APK)

> Game idle farm adventure bertemakan dunia medieval dengan nuansa IndoFantasy.  
> Platform: **Android APK** — dikembangkan dengan Three.js + Capacitor.js  
> Aset: KayKit Characters, Stylized Nature, Medieval Village, UI Pack

---

## 📋 Daftar Isi
1. [Visi & Konsep](#-visi--konsep)
2. [Tech Stack Android](#-tech-stack-android)
3. [Aset yang Digunakan](#-aset-yang-digunakan)
4. [Sistem Gameplay](#-sistem-gameplay)
5. [Karakter & Pahlawan](#-karakter--pahlawan)
6. [Bangunan & Produksi](#-bangunan--produksi)
7. [Sistem Quest](#-sistem-quest)
8. [Sistem Prestige](#-sistem-prestige)
9. [Struktur File Project](#-struktur-file-project)
10. [Cara Build APK](#-cara-build-apk)
11. [Roadmap Pembangunan](#-roadmap-pembangunan)

---

## 🎯 Visi & Konsep

**INDOFARM ADVENTURE** adalah game idle RPG **Android** dengan tampilan **2D Top-Down** bergaya Stardew Valley yang menggunakan render 3D langsung via Three.js. Pemain membangun desa medieval, menugaskan pahlawan ke berbagai pekerjaan, dan mengirim mereka ke petualangan. Game berjalan 100% offline — progres tersimpan di perangkat Android pemain.

### Loop Gameplay Utama
```
🌾 FARM → 🪵 RESOURCE → 🏰 BUILD → ⚔️ QUEST → ⬆️ UPGRADE → 🔄 PRESTIGE
```

| Loop | Deskripsi |
|------|-----------|
| 🌾 **Farm** | Tanam & panen tanaman otomatis (idle) |
| 🪵 **Resource** | Kumpulkan kayu, batu, emas dari bangunan |
| 🏰 **Build** | Bangun & upgrade bangunan desa medieval |
| ⚔️ **Quest** | Kirim pahlawan berpetualangan, pulang dengan reward |
| ⬆️ **Upgrade** | Tingkatkan efisiensi produksi dan kekuatan pahlawan |
| 🔄 **Prestige** | Reset dengan bonus permanen, mulai lebih kuat |

---

## 📱 Tech Stack Android

```
┌─────────────────────────────────────────────────────┐
│                   Android APK                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │            Capacitor.js (Native Shell)         │  │
│  │  Membungkus game menjadi APK Android asli      │  │
│  │                                                │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │          Game Engine (WebGL)             │  │  │
│  │  │                                          │  │  │
│  │  │  Three.js   ←  GLTF/GLB 3D Models       │  │  │
│  │  │  Render 3D top-down via GPU Android      │  │  │
│  │  │                                          │  │  │
│  │  │  UI Layer   ←  PNG/SVG Asset Pack        │  │  │
│  │  │  HUD, Panel, Tombol — mobile-first       │  │  │
│  │  │                                          │  │  │
│  │  │  Capacitor Preferences API               │  │  │
│  │  │  Simpan game data ke storage Android     │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Mengapa Three.js + Capacitor untuk Android?
| Pertimbangan | Alasan |
|---|---|
| **Aset GLB/GLTF** | Three.js membaca format ini secara native — tanpa konversi |
| **GPU Android** | WebGL 2.0 berjalan di semua Android 7+ secara native |
| **Capacitor** | Menghasilkan APK/AAB resmi siap upload Google Play |
| **Idle Game** | Logika idle cocok diimplementasi di JS — ringan & efisien |
| **Aset 3D Langsung** | Tidak perlu bake/render ulang — model tampil langsung di game |

### Package & Versi
```json
{
  "@capacitor/core":    "^6.x",
  "@capacitor/android": "^6.x",
  "@capacitor/cli":     "^6.x",
  "three":              "^0.164.x"
}
```

---

## 🗂️ Aset yang Digunakan

### Pack 1 — UI Assets (538 aset)
```
ButtonsText/   → Tombol premade: Play, Exit, Menu (122 PNG)
ButtonsIcons/  → Tombol ikon berbagai warna (158 PNG)
BoxesBanners/  → Panel kartu, banner (46 PNG)
Icons/         → Ikon hati, bintang, kunci, koin (116 PNG)
Sliders/       → Progress bar, slider upgrade (96 PNG)
```
**Dipakai:** HUD resource, tombol panel, kartu bangunan, progress bar quest.

### Pack 2 — KayKit Adventurers 2.0 FREE (6 karakter 3D)
```
Barbarian.glb      → Hero penebang & penambang
Knight.glb         → Hero quest tank
Mage.glb           → Hero pencari permata
Ranger.glb         → Hero pertanian otomatis
Rogue.glb          → Hero pengumpul emas
Rogue_Hooded.glb   → Hero langka (unlock 10 permata)
```
**Dipakai:** Model 3D berjalan di dunia game, kartu hero di panel.

### Pack 3 — Stylized Nature MegaKit (68 model)
```
CommonTree_*.gltf  → Pohon zona hutan
Pine_*.gltf        → Pohon pinus
TwistedTree_*.gltf → Pohon hutan gelap
Rock_Medium_*.gltf → Batu zona tambang
Bush_*.gltf        → Semak dekorasi
RockPath_*.gltf    → Jalan batu antar zona
```
**Dipakai:** Dekorasi dunia 3D — hutan, tambang, jalan desa.

### Pack 4 — Medieval Village MegaKit (176 model)
```
Wall_Plaster_*     → Dinding bangunan desa
Roof_*             → Atap bangunan
Door_*             → Pintu
Window_*           → Jendela
Stair_*            → Tangga
Prop_*             → Properti dekorasi (pagar, tong, dll)
```
**Dipakai:** Komposisi visual bangunan (pasar, barak, kedai, perpustakaan).

---

## ⚙️ Sistem Gameplay

### Sumber Daya (Resources)
| Resource | Icon | Sumber | Digunakan untuk |
|----------|------|--------|-----------------|
| Gandum | 🌾 | Ladang, Ranger | Dijual ke pasar |
| Kayu | 🪵 | Sawmill + Barbarian | Bangun, upgrade |
| Batu | 🪨 | Tambang + Barbarian | Bangun, upgrade |
| Emas | 💰 | Pasar, Quest, Rogue | Unlock, upgrade |
| Permata | 💎 | Quest, Mage | Unlock hero, prestige |

**Formula Produksi:**
```
Produksi/detik = BaseRate × Level × HeroBonus × UpgradeBonus × PrestigeBonus
```

### Sistem Pertanian (Farm)
**9 plot ladang** (grid 3×3), masing-masing independen:
```
[0] Kosong → [1] Baru Ditanam → [2] Tunas → [3] Tumbuh → [4] Siap Panen
```

| Tanaman | Waktu Total | Hasil | Unlock |
|---------|-------------|-------|--------|
| 🌾 Gandum | 80 detik | 8 gandum | Default |
| 🥕 Wortel | 180 detik | 18 gandum | 30 emas |
| 🎃 Labu | 450 detik | 50 gandum | 120 emas |

**Auto-panen:** Tugaskan Ranger → panen otomatis saat matang.

---

## 🏰 Bangunan & Produksi

| Bangunan | Icon | Biaya Awal | Produksi | Max Level |
|----------|------|-----------|----------|-----------|
| Ladang Panen | 🌾 | 10 kayu | 0.08 gandum/s | 5 |
| Penggergajian | 🪵 | 15 batu + 5 emas | 0.05 kayu/s | 5 |
| Tambang Batu | 🪨 | 20 kayu + 5 emas | 0.05 batu/s | 5 |
| Pasar Desa | 🏪 | 30 kayu + 20 batu | 0.03 emas/s | 5 |
| Barak Prajurit | ⚔️ | 50 kayu + 30 batu | +20% reward quest/lvl | 5 |
| Kedai Pahlawan | 🍺 | 40 kayu + 20 emas | -15% durasi quest/lvl | 5 |
| Pandai Besi | 🔨 | 60 batu + 40 emas | 0.05 emas/s | 5 |
| Perpustakaan | 📚 | 80 kayu + 50 batu + 50 emas | +10% semua produksi/lvl | 3 |

**Formula Upgrade:** `Biaya = BiayaAwal × 2.0^level`

---

## 🦸 Karakter & Pahlawan

| Hero | Bonus Utama | Tugas Terbaik | Unlock |
|------|-------------|---------------|--------|
| 🪓 Barbarian | Kayu ×1.8, Batu ×1.5 | Menebang / Menambang | Default |
| 🛡️ Ksatria | Quest Power ×2.0 | Semua Quest | Default |
| 🔮 Penyihir | Permata ×2.0, Emas ×1.3 | Quest, Dagang | Default |
| 🏹 Pemburu | Gandum ×2.5, Farm ×2.0 | Bertani | Default |
| 🗡️ Pencuri | Emas ×2.5 | Berdagang | Default |
| 🥷 Rogue Bertopeng | Emas ×3.0, Permata ×1.5 | Quest, Dagang | 10 💎 |

### Tugas Hero
| Tugas | Icon | Bonus |
|-------|------|-------|
| Istirahat | 💤 | - |
| Bertani | 🌾 | Auto-panen + bonus gandum |
| Menebang | 🪓 | +bonus produksi kayu |
| Menambang | ⛏️ | +bonus produksi batu |
| Berdagang | 💰 | +bonus produksi emas |
| Menjaga | 🛡️ | +bonus reward semua quest |
| Quest | ⚔️ | Hero pergi berpetualangan |

---

## ⚔️ Sistem Quest

| Quest | Icon | Durasi | Reward | Min Level |
|-------|------|--------|--------|-----------|
| Sarang Goblin | 👺 | 60s | 15 emas | 1 |
| Binatang Hutan | 🐗 | 180s | 40 kayu + 20 emas | 2 |
| Perampok Jalan | 🦹 | 240s | 60 batu + 40 emas | 3 |
| Penjara Bawah Tanah | 🏰 | 360s | 80 emas + 3 💎 | 4 |
| Reruntuhan Kuno | 🗿 | 600s | 8 💎 + 100 emas | 6 |
| **Sarang Naga** | 🐉 | 1200s | **25 💎 + 500 emas** | 10 ⭐ |

> ⚠️ Quest Naga wajib selesai sebelum bisa **Prestige**.

---

## 🔄 Sistem Prestige

### Syarat: Selesaikan Quest Sarang Naga (hero level 10)

| Yang Direset | Yang Dipertahankan |
|---|---|
| ❌ Semua resource | ✅ Level prestige |
| ❌ Semua bangunan | ✅ Poin prestige & bonus |
| ❌ Plot ladang | ✅ Level & XP hero |
| ❌ Level hero (tapi tidak XP) | ✅ Upgrade yang dibeli |

### Bonus Prestige
| Bonus | Efek | Biaya/Level | Max |
|-------|------|-------------|-----|
| 🌟 Warisan Pertanian | +15% semua produksi | 1 poin | 10 |
| ⏰ Tanpa Batas Waktu | +2 jam offline progress | 1 poin | 6 |
| 💰 Modal Awal | +100 emas awal | 1 poin | 10 |
| 💎 Tambang Permata | +1 permata tiap quest | 2 poin | 5 |
| 🌾 Keajaiban Panen | Panen instan saat prestige | 3 poin | 1 |

---

## 📁 Struktur File Project

```
INDOFARM/
│
├── 📄 README.md                     ← Dokumen rencana pembangunan ini
├── 📄 package.json                  ← Dependencies Android (Three.js, Capacitor)
├── 📄 capacitor.config.json         ← Konfigurasi APK Android
├── 🐍 server.py                     ← Preview lokal saat development
│
├── 🎮 game/                         ← SOURCE CODE GAME ANDROID
│   ├── index.html                   ← Entry point utama game
│   ├── css/
│   │   └── style.css                ← UI mobile-first, dark medieval
│   └── js/
│       ├── data.js      ✅           ← Definisi data: resource, bangunan, quest, hero
│       ├── state.js     ✅           ← Manajemen state + save ke Android Storage
│       ├── engine.js    ✅           ← Three.js: dunia 3D, kamera, model, animasi
│       ├── systems.js   🔨           ← Logic: Farm, Build, Quest, Upgrade, Prestige
│       ├── ui.js        🔨           ← Semua panel UI: touch, gesture, animasi
│       └── main.js      🔨           ← Game loop + inisialisasi
│
├── 📦 android/                      ← Project Android Studio (hasil Capacitor)
│   └── app/src/main/
│       ├── AndroidManifest.xml      ← Izin Android (notifikasi, storage, dll)
│       └── assets/public/           ← Game dipaketkan di sini saat build APK
│
└── 🗂️ Aset Game
    ├── BoxesBanners/  ButtonsIcons/  ButtonsText/  Icons/  Sliders/
    ├── KayKit_Adventurers_2.0_FREE/    ← 6 karakter 3D (GLB)
    ├── Stylized_Nature_MegaKit/        ← 68 model alam (GLTF)
    └── Medieval_Village_MegaKit/       ← 176 model bangunan (GLTF)
```

**Status:** ✅ Selesai | 🔨 In Progress | 📋 Direncanakan

---

## 🔨 Cara Build APK Android

### Langkah 1: Install Dependencies
```bash
npm install
# → menginstall Three.js, Capacitor, dan semua package Android
```

### Langkah 2: Tambahkan Platform Android
```bash
npx cap add android
# → membuat folder android/ (project Android Studio)
```

### Langkah 3: Sync Aset ke Android
```bash
npx cap sync android
# → menyalin semua file game ke android/app/src/main/assets/
```

### Langkah 4: Build APK di Android Studio
```bash
npx cap open android
# → buka Android Studio
# → Pilih: Build → Generate Signed Bundle/APK → APK
# → Hasilkan: app-release.apk
```

### Atau Build APK via Terminal (tanpa Android Studio)
```bash
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

### Spesifikasi Minimum Android
| Spec | Minimum |
|------|---------|
| Android | 7.0 (API Level 24) |
| RAM | 2 GB |
| Storage | ± 150 MB (termasuk aset 3D) |
| GPU | Mendukung WebGL 2.0 (semua GPU Android 7+) |

> 💡 **Catatan:** Android Studio diperlukan untuk signing APK siap rilis ke Google Play.  
> Untuk testing, gunakan `assembleDebug` yang tidak butuh keystore.

---

## 🗺️ Roadmap Pembangunan Android

### ✅ FASE 0 — Fondasi & Persiapan
- [x] Asset Browser (885 aset, 4 pack terorganisir)
- [x] Definisi data game lengkap (`data.js`)
- [x] State management + save ke Android Storage (`state.js`)
- [x] Three.js 3D engine: dunia, kamera, model, animasi (`engine.js`)
- [x] `package.json` & `capacitor.config.json` untuk Android

### 🔨 FASE 1 — Core Game Android (IN PROGRESS)
- [ ] Logic game: Farm, Build, Quest, Upgrade, Prestige (`systems.js`)
- [ ] Semua panel UI — dioptimasi touch Android (`ui.js`)
- [ ] Game loop + inisialisasi Capacitor (`main.js`)
- [ ] HTML + CSS mobile-first (`index.html`, `style.css`)
- [ ] Preview lokal via `server.py` berfungsi penuh

### 📋 FASE 2 — Fitur Native Android
- [ ] **Touch gesture:** swipe antar panel, pinch zoom peta
- [ ] **Notifikasi push Android:** "Panen siap!", "Quest selesai!" (saat app ditutup)
- [ ] **Haptic feedback:** getaran saat panen, upgrade, prestige
- [ ] **Splash screen** branded IndoFarm (Capacitor SplashScreen)
- [ ] **Loading bar** saat load model 3D awal
- [ ] **Sound effect** Web Audio API (tebang, panen, quest)
- [ ] Tutorial interaktif first-run
- [ ] Achievements / lencana pencapaian

### 📋 FASE 3 — Build & Rilis ke Google Play
- [ ] App icon 1024×1024 (semua density: mdpi → xxxhdpi)
- [ ] Splash screen adaptive Android 12+
- [ ] Generate signing keystore untuk Play Store
- [ ] Build APK debug untuk QA testing perangkat nyata
- [ ] Build AAB (Android App Bundle) untuk Play Store
- [ ] Upload ke Google Play Console (Internal Testing → Production)
- [ ] Integrasi Google Play Billing (permata premium)

### 📋 FASE 4 — Konten Post-Launch
- [ ] Tanaman bertema Indo: Padi, Tebu, Cabai, Singkong
- [ ] Bangunan baru: Warung Makan, Padepokan, Surau
- [ ] Hero baru bertema Nusantara: Pendekar, Dukun, Saudagar
- [ ] Quest bertema Indo: Bajak Laut, Kerajaan Kuno, Hutan Borneo
- [ ] Sistem cuaca: Hujan (+panen), Kemarau (-panen), Badai (quest batal)
- [ ] 4 Musim yang mempengaruhi produksi
- [ ] Guild & Leaderboard (fitur sosial Android)

---

## 🎨 Desain Visual Android

### Palet Warna
```
Latar Utama   #0d1117   hitam gelap medieval
Surface Panel  #161b22   abu gelap
Kartu          #1c2333   biru gelap
Aksen Emas     #f5c518   resource & highlight
Aksen Hijau    #2ea043   sukses, panen
Aksen Merah    #f85149   bahaya, prestige
Teks Utama     #e6edf3   putih terang
Teks Muted     #7d8590   abu sekunder
```

### Standar UI Android Material
- Semua tombol minimum **48×48 dp** (standar Android accessibility)
- Font heading: **Cinzel** — kesan medieval & fantasi
- Font body: **Inter** — keterbacaan tinggi di layar kecil
- Navigasi: **Tab bar bawah** (Bottom Navigation — pola Android native)
- Panel konten: **Bottom Sheet** slide dari bawah ke atas
- Tidak ada hover — semua interaksi via **tap & swipe**
- Mendukung **dark mode** secara default

### Layout Layar Android (Portrait)
```
┌─────────────────────────┐
│  🌾123  🪵456  💰789   │  ← HUD Resource (status bar area)
├─────────────────────────┤
│                         │
│    Dunia 3D Top-Down    │  ← Three.js (45% tinggi layar)
│    Model karakter &     │
│    bangunan bergerak    │
│                         │
├─────────────────────────┤
│  Panel Aktif (konten)   │  ← Bottom Sheet (50% tinggi layar)
│  Farm / Build / Quest   │
│  Hero / Upgrade         │
├─────────────────────────┤
│ [🌾][🏰][⚔️][👤][⬆️][🔄] │  ← Tab Bar Bawah (navigasi)
└─────────────────────────┘
```

---

## 👨‍💻 Info Project

| Item | Detail |
|------|--------|
| Developer | kdsmedia |
| Repository | https://github.com/kdsmedia/INDOFARM |
| Target Platform | Android 7.0+ |
| Engine | Three.js + Capacitor.js |
| Aset KayKit | CC BY 4.0 |

---
*Last updated: Juli 2026 — Fase 1 (Core Game) in progress*
