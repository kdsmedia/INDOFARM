# IndoFarm Adventure — Android APK

INDOFARM ADVENTURE adalah game idle farm RPG medieval yang didistribusikan
sebagai APK Android dengan package `com.altomedia.indofarm`.

## Arsitektur

- Capacitor 6 sebagai shell aplikasi Android.
- Bundle `game/` dimasukkan ke APK sebagai runtime game internal.
- Three.js dan GLTF digunakan untuk dunia 3D dan animasi.
- Firebase Auth/Firestore dipakai untuk login dan cloud save.
- AdMob Capacitor dipakai untuk rewarded ads.
- Tidak ada server aplikasi, katalog aset, atau distribusi aplikasi terpisah.

## Build

```bash
npm install
npm run android:sync
npm run android:build
```

Build release membutuhkan Java, Android SDK/Gradle, dependency Capacitor,
`google-services.json`, dan keystore release.

## User preferences

- Proyek ini harus tetap Android APK-only.
- Jangan menambahkan server aplikasi, katalog aset, manifest mandiri,
  workflow layanan, atau mode distribusi non-Android.
- Pertahankan package ID `com.altomedia.indofarm`.