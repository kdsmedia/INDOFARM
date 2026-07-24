# 🏰 INDOFARM ADVENTURE
### Game Idle Farm RPG — Android (APK) · v2.0

> Game idle farm adventure bertemakan dunia medieval dengan nuansa IndoFantasy.  
> Platform: **Android APK** — dikembangkan dengan Three.js + Capacitor.js  
> Backend: **Firebase Auth + Firestore** · Ads: **AdMob Rewarded (no-skip)**

---

## 🎯 Visi & Konsep

**INDOFARM ADVENTURE** adalah game idle RPG **Android** dengan tampilan **2D Top-Down** bergaya Stardew Valley yang menggunakan render 3D langsung via Three.js. Pemain membangun desa medieval, menugaskan pahlawan ke berbagai pekerjaan, dan mengirim mereka ke petualangan.

### Loop Gameplay Utama
```
🌾 FARM → 🪵 RESOURCE → 🏰 BUILD → ⚔️ QUEST → ⬆️ UPGRADE → 🔄 PRESTIGE
```

---

## 📱 Tech Stack

| Layer | Teknologi |
|---|---|
| **Game Engine** | Three.js 0.164 + WebGL |
| **Animasi** | Three.js AnimationMixer + GLTF Walk Rig |
| **UI** | Vanilla JS DOM · Cinzel + Inter font |
| **Auth** | Firebase v10 Modular · Google Sign-In |
| **Cloud Save** | Firestore (free tier: 1GB, 50K reads/day) |
| **Ads** | AdMob Rewarded Video (no-skip, 30 detik) |
| **Native Shell** | Capacitor.js v6 → APK Android |
| **Asset Server** | Python HTTP (server.py) |

---

## 🎮 20 Layar / Panel Game

| # | Layar | Keterangan |
|---|---|---|
| 1 | **Splash Screen** | Loading animasi + bintang |
| 2 | **Login (Google)** | Firebase Auth · Google Sign-In |
| 3 | **Pilih Karakter** | 6 karakter KayKit 3D interaktif |
| 4 | **Dunia 3D** | Three.js top-down dengan animasi berjalan |
| 5 | **Farm** 🌾 | Bertani — tanam & panen 5 jenis tanaman |
| 6 | **Bangun** 🏰 | 10 bangunan — produksi, ekonomi, militer |
| 7 | **Quest** ⚔️ | 9 quest + petualangan pahlawan |
| 8 | **Pahlawan** 👤 | 6 hero · task assignment · equipment |
| 9 | **Inventori** 🎒 | Item, senjata, armor, aksesori |
| 10 | **Kerajinan** 🔨 | 13 resep crafting · mengolah bahan |
| 11 | **Pasar** 🏪 | Jual beli & berdagang |
| 12 | **Gacha** 🎰 | Spin bonus item (14 item pool) |
| 13 | **Bonus Harian** 🎁 | Streak 7 hari + AdReward no-skip |
| 14 | **Perang** 🗡️ | Rekrut pasukan · serang 5 kerajaan |
| 15 | **Simulasi Tempur** 💥 | Visual battle animasi nyata |
| 16 | **Peta** 🗺️ | 10 zona wilayah |
| 17 | **Upgrade** ⬆️ | 12 upgrade permanen |
| 18 | **Prestige** 🔄 | Reset dengan 5 bonus abadi |
| 19 | **Capaian** 🏆 | 18 achievement |
| 20 | **Setting** ⚙️ | Akun · cloud sync · reset |

---

## 👤 6 Karakter Pahlawan (KayKit Adventurers 2.0)

| Karakter | Spesial | ATK | DEF | HP |
|---|---|---|---|---|
| 🪓 **Barbarian** | Kayu +80%, Batu +50% | 15 | 8 | 200 |
| 🛡️ **Ksatria** | Quest Power ×2.0 | 12 | 20 | 250 |
| 🔮 **Penyihir** | Permata ×2.0, Emas +30% | 25 | 5 | 120 |
| 🏹 **Pemburu** | Gandum ×2.5, Farm ×2.0 | 18 | 10 | 160 |
| 🗡️ **Pencuri** | Emas ×2.5 | 20 | 7 | 140 |
| 🥷 **Rogue Bertopeng** | Emas ×3.0, Permata +50% 🔒 | 28 | 12 | 180 |

---

## 🔥 Fitur Utama v2.0

### ☁️ Firebase Auth + Firestore
- **Google Sign-In** gratis via Firebase Authentication
- **Cloud Save** via Firestore (free tier) — progres tersimpan di akun Google
- Merge otomatis local vs cloud (ambil yang lebih maju)
- Sinkron 5 menit sekali & saat menutup app

### 📺 AdMob (No-Skip)
- **Rewarded Video** untuk Bonus Harian & Item Gratis
- Durasi 30 detik — wajib menonton penuh, tidak bisa di-skip
- Native Android via `@capacitor-community/admob`
- Browser: simulasi iklan visual (tidak perlu APK untuk test)

### ⚔️ Visual Battle Simulation
- Tampilan pertempuran animasi dengan pasukan bergerak
- Log pertempuran real-time baris per baris
- Efek visual: 💥 ⚡ 🔥 saat clash
- Kemenangan/kekalahan dengan animasi flash

### 🚶 Animasi Karakter Berjalan
- Three.js `AnimationMixer` dengan GLTF walk rig
- Karakter GLTF built-in animation diputar otomatis
- **Pemimpin terpilih**: ukuran lebih besar, cincin emas berputar
- Semua hero berpatroli di zona masing-masing

### 🏰 Gameplay Lengkap
- **Bertani**: 5 tanaman (Gandum, Wortel, Labu, Jagung, Beri)
- **Menambang**: Tambang Batu otomatis
- **Menebang**: Penggergajian otomatis
- **Mengolah**: 13 resep crafting
- **Quest**: 9 misi (Goblin → Naga Merah)
- **Pertahanan**: Barak + pasukan (Prajurit, Pemanah, Kavaleri, Penyihir)
- **Berdagang**: Pasar desa + jalur dagang
- **Membangun**: 10 jenis bangunan
- **Upgrade**: 12 peningkatan permanen
- **Prestige**: 5 bonus abadi lintas reset

---

## 🚀 Cara Menjalankan

```bash
# Asset Browser & Game Preview
python server.py
# → Buka http://localhost:5000/         (Asset Browser)
# → Buka http://localhost:5000/game/    (Game)
```

### Setup Firebase (Opsional — untuk cloud save)
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan: **Authentication → Google Sign-In** & **Firestore Database**
3. Copy Web Config ke `game/js/firebase.js` → `FIREBASE_CONFIG`

### Setup AdMob (Untuk APK Android)
1. Daftarkan app di [AdMob Console](https://admob.google.com)
2. Buat Rewarded Ad Unit IDs
3. Isi `game/js/admob.js` → `AD_UNITS`
4. Tambah `google-services.json` ke `android/app/`

### Build APK
```bash
npx cap sync android
npx cap open android
# Build via Android Studio → Generate Signed APK
```

---

## 🗂️ Struktur File Penting

```
game/
  index.html           # Entry point + Firebase importmap
  js/
    main.js            # Boot + game loop + auth flow
    firebase.js        # Firebase Auth + Firestore ← ISI CONFIG
    admob.js           # AdMob rewarded video ← ISI AD UNIT ID
    lobby.js           # Splash + Login + Character Select
    battlesim.js       # Visual battle simulation
    engine.js          # Three.js 3D world + AnimationMixer
    ui.js              # 16 panels UI
    state.js           # State management + cloud merge
    systems.js         # Semua game systems
    data.js            # Data & config
  css/
    style.css          # Game styles + Lobby + BattleSim + AdMob
```

---

## 📋 Roadmap

- [x] 16 panel gameplay lengkap
- [x] Three.js 3D world + AnimationMixer
- [x] Firebase Auth (Google Sign-In)
- [x] Firestore cloud save (free tier)
- [x] AdMob rewarded video (no-skip)
- [x] Lobby + character selection
- [x] Visual battle simulation
- [ ] Musik & sound effects
- [ ] Push notification (Capacitor)
- [ ] Lokalisasi (ID/EN)

---

## 👨‍💻 Info Project

| Item | Detail |
|---|---|
| Developer | kdsmedia |
| Repository | https://github.com/kdsmedia/INDOFARM |
| Target | Android 7.0+ |
| Engine | Three.js + Capacitor.js |
| Auth | Firebase v10 |
| Aset | CC BY 4.0 |

*Last updated: Juli 2026 — v2.0 Full Edition*
