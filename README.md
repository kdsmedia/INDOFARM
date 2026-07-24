# INDOFARM ADVENTURE

## Aplikasi Game Android Native

INDOFARM ADVENTURE adalah game idle farm RPG medieval untuk Android dengan package:

```text
com.altomedia.indofarm
```

Game ini didistribusikan sebagai APK Android melalui Capacitor. Tidak ada produk
web terpisah, katalog aset, atau mode permainan non-Android. Folder `game/`
adalah bundle internal yang dimasukkan ke APK oleh Capacitor.

## Fitur Game

- Dunia 3D top-down menggunakan Three.js dan GLTF animation rig.
- Pertanian, produksi kayu/batu, bangunan, pasar, crafting, inventori, dan gacha.
- Quest berurutan dari Sarang Goblin sampai Sarang Naga Merah.
- Enam pahlawan dengan kemampuan produksi, statistik, equipment, dan quest power.
- Rekrutmen pasukan, perang kerajaan, simulasi pertempuran, peta zona, achievement,
  upgrade, daily bonus, dan prestige.
- Firebase Authentication Google Sign-In dan Firestore cloud save melalui layanan
  native Android.
- Rewarded AdMob native dengan reward hanya diberikan setelah iklan selesai.
- Penyimpanan lokal, cloud merge berbasis timestamp, offline progress, dan
  penyimpanan otomatis saat aplikasi masuk background.

## Teknologi Android

| Komponen | Teknologi |
|---|---|
| Android app shell | Capacitor 6 |
| Rendering game | Three.js 0.164 + WebGL |
| Authentication | Firebase Auth + Capacitor Google Auth |
| Cloud save | Firebase Firestore |
| Rewarded ads | Capacitor AdMob |
| Native app ID | `com.altomedia.indofarm` |
| Target output | APK release |

## Build APK

Prasyarat:

- Node.js dan npm
- Java/JDK
- Android SDK dan Android SDK Platform sesuai konfigurasi Gradle
- `google-services.json` di root proyek
- Plugin Capacitor native terpasang melalui npm
- Keystore release untuk signing APK

Perintah:

```bash
npm install
npm run android:sync
npm run android:build
```

APK release dibuat oleh Gradle di:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Untuk membuka proyek native di Android Studio:

```bash
npm run android:open
```

## Konfigurasi Layanan

### Firebase dan Google Sign-In

1. Pastikan package Android adalah `com.altomedia.indofarm`.
2. Aktifkan Google Sign-In dan Firestore pada project Firebase.
3. Pastikan OAuth client Android memakai SHA-1/SHA-256 keystore release.
4. Letakkan `google-services.json` pada lokasi yang dibutuhkan proyek Android.
5. Uji login, save, load, dan merge cloud pada perangkat Android.

### AdMob

Gunakan test ad unit saat development. Ganti ke production ad unit hanya untuk
build rilis dan pastikan consent, privacy policy, batas iklan, serta penanganan
iklan gagal sudah diuji.

## Struktur Bundle Game

```text
game/
  index.html
  css/style.css
  js/main.js
  js/engine.js
  js/lobby.js
  js/ui.js
  js/state.js
  js/systems.js
  js/firebase.js
  js/admob.js
  js/battlesim.js
  js/data.js
  icons/
```

## Verifikasi Sebelum Rilis

- Build debug dan release berhasil.
- APK terpasang pada Android 7.0 hingga versi Android terbaru yang ditargetkan.
- Login Google dan cloud save berjalan.
- Reward iklan tidak diberikan dua kali dan gagal dengan aman.
- Save saat background/close memulihkan progres.
- Quest gating, farm, crafting, recruitment, battle, prestige, dan offline
  progress lolos regression test.
- Keystore release, version code, icon, splash screen, dan privacy policy sudah
  benar sebelum distribusi.