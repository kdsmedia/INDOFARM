# GitHub Secrets yang Diperlukan untuk Auto-Build

Sebelum build berjalan di GitHub Actions, tambahkan secrets berikut di:
**GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

---

## 🔑 Unity License (WAJIB)

Ada dua cara mendapatkan UNITY_LICENSE:

### Cara A — Personal License (gratis)
1. Install [unity-activate-personal](https://github.com/game-ci/unity-activate#personal-license):
   ```
   # Di mesin lokal kamu, jalankan:
   docker run --rm -it \
     -e UNITY_EMAIL="emailkamu@example.com" \
     -e UNITY_PASSWORD="password_unity" \
     unityci/editor:ubuntu-2022.3.20f1-base-3 \
     unity-editor -batchmode -quit -logFile /dev/stdout \
     -createManualActivationFile -username "$UNITY_EMAIL" -password "$UNITY_PASSWORD"
   ```
2. Upload file `.alf` ke https://license.unity3d.com/manual
3. Download file `.ulf`, isi isinya sebagai secret `UNITY_LICENSE`

### Cara B — Menggunakan action otomatis
Kunjungi: https://game.ci/docs/github/activation

| Secret | Nilai |
|---|---|
| `UNITY_LICENSE` | Isi file `.ulf` (lihat panduan di atas) |
| `UNITY_EMAIL` | Email akun Unity kamu |
| `UNITY_PASSWORD` | Password akun Unity kamu |

---

## 🤖 Android Signing (untuk build release)

Diperlukan agar AAB bisa diupload ke Google Play.

```bash
# Buat keystore baru (jalankan sekali):
keytool -genkey -v -keystore idlefarm.keystore \
  -alias idlefarm -keyalg RSA -keysize 2048 -validity 10000

# Encode ke base64 untuk disimpan sebagai secret:
base64 -w 0 idlefarm.keystore
```

| Secret | Nilai |
|---|---|
| `ANDROID_KEYSTORE_NAME` | `idlefarm.keystore` |
| `ANDROID_KEYSTORE_BASE64` | Output perintah `base64` di atas |
| `ANDROID_KEYSTORE_PASS` | Password keystore kamu |
| `ANDROID_KEYALIAS_NAME` | `idlefarm` (alias yang kamu buat) |
| `ANDROID_KEYALIAS_PASS` | Password alias kamu |

---

## 📱 iOS Signing (opsional — butuh Apple Developer Account)

Diperlukan hanya jika ingin membuat IPA siap submit ke App Store.
Panduan lengkap: https://game.ci/docs/github/ios-signing

| Secret | Keterangan |
|---|---|
| `IOS_APPLE_ID` | Apple ID (email) developer kamu |
| `IOS_APPLE_TEAM_ID` | Team ID dari Apple Developer Console |

---

## ✅ Checklist Sebelum Push ke GitHub

- [ ] Semua secrets di atas sudah ditambahkan
- [ ] `main` branch sudah dikonfigurasi di repo GitHub
- [ ] Jalankan `bash setup_assets.sh` sekali untuk verifikasi lokal
- [ ] Buka folder `game/` di Unity 2022.3 LTS untuk generate `.meta` files
- [ ] Commit semua perubahan termasuk `.meta` files yang dihasilkan Unity

---

## 🚀 Trigger Build Manual

Setelah setup, bisa trigger build kapanpun dari:
**GitHub Repo → Actions → Unity Build → Run workflow**

Pilih target: `Android`, `iOS`, atau `All`.
