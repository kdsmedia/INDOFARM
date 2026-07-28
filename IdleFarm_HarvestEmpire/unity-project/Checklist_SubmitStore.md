# CHECKLIST SUBMIT KE APP STORE / PLAY STORE
# Idle Farm: Harvest Empire

Gunakan checklist ini sebelum submit build ke Google Play Console dan App Store Connect.

---

## ✅ TEKNIS

- [ ] Build IL2CPP, ARM64 aktif (Android + iOS)
- [ ] Minimum API Android 24, iOS 15
- [ ] Ukuran APK/IPA ≤ 80 MB (gunakan asset delivery untuk event content)
- [ ] Uji di perangkat low-end (RAM 2GB) — target 30 FPS stabil
- [ ] Uji di perangkat mid-range (RAM 4GB) — target 60 FPS
- [ ] Tidak ada crash pada scene Bootstrap → MainGame
- [ ] Save/Load berfungsi: data tersimpan saat close, muncul saat buka ulang
- [ ] Offline income dihitung dengan benar setelah perangkat dimatikan
- [ ] Tombol Back Android (Escape) berfungsi di semua layar
- [ ] Orientasi layar terkunci Portrait

## ✅ ADMOB

- [ ] App ID AdMob sudah dimasukkan ke AndroidManifest.xml dan Info.plist
- [ ] Ad Unit ID Rewarded (Android + iOS) sudah diganti dari placeholder ke ID asli
- [ ] Ad Unit ID Interstitial sudah diganti (jika dipakai)
- [ ] Test mode AdMob dimatikan sebelum submit live
- [ ] Rewarded ad muncul dan reward diberikan dengan benar
- [ ] Interstitial hanya muncul di titik transisi, cooldown berfungsi
- [ ] Semua tombol iklan berlabel jelas Bahasa Indonesia (mis. "Tonton Iklan untuk 2× Lipat")
- [ ] Jika target anak-anak: mode "Designed for Families" diaktifkan di AdMob Console

## ✅ PRIVASI & LEGAL

- [ ] Dialog Consent (GDPR/UU PDP) muncul saat pertama install
- [ ] Kebijakan Privasi bisa diakses dari Pengaturan → Kebijakan Privasi
- [ ] URL Kebijakan Privasi sudah diisi di PrivacyConsentManager.cs
- [ ] Fitur "Hapus Akun / Hapus Data" berfungsi (Pengaturan → Hapus Akun)
- [ ] Syarat & Ketentuan tersedia (bisa di halaman web yang sama dengan Privasi)
- [ ] Tabel persentase peluang ditampilkan untuk setiap peti berhadiah acak (jika ada)

## ✅ RATING & KLASIFIKASI

- [ ] Kuesioner IARC diisi di Google Play Console (Dasbor → Konten Aplikasi → Rating)
- [ ] Kuesioner IARC diisi di App Store Connect (App Information → Age Rating)
- [ ] Target rating: Semua Umur / 3+ / Everyone
- [ ] Tidak ada konten kekerasan, bahasa kasar, atau konten dewasa

## ✅ STORE LISTING (Google Play)

- [ ] Judul: "Idle Farm: Harvest Empire - Game Tani" (≤30 karakter tanpa subtitle)
- [ ] Deskripsi pendek (≤80 karakter) sudah diisi
- [ ] Deskripsi panjang (≤4000 karakter) sudah diisi dalam Bahasa Indonesia
- [ ] Ikon aplikasi 512×512 px (PNG, sesuai panduan Bagian 15.1 GDD)
- [ ] Feature graphic 1024×500 px (banner utama Play Store)
- [ ] Screenshot: minimal 2 gambar per ukuran layar (phone, tablet 7", tablet 10")
- [ ] Video preview (opsional tapi sangat disarankan): 15–30 detik, YouTube link
- [ ] Kategori: Games → Casual
- [ ] Tag: idle, farming, casual
- [ ] Email developer aktif

## ✅ STORE LISTING (App Store Connect)

- [ ] App Name: "Idle Farm: Harvest Empire"
- [ ] Subtitle (≤30 karakter): "Bangun Kerajaan Pertanianmu!"
- [ ] Deskripsi (≤4000 karakter) sudah diisi
- [ ] Keywords (≤100 karakter): "idle farm,tani,farming,harvest,kebun,pertanian,idle game"
- [ ] Screenshot iPhone 6.7" (minimal 3 gambar)
- [ ] Screenshot iPhone 5.5" (minimal 3 gambar)
- [ ] Screenshot iPad 12.9" (jika mendukung iPad)
- [ ] App Preview Video (opsional): 15–30 detik
- [ ] Primary Category: Games
- [ ] Secondary Category: Entertainment
- [ ] Support URL aktif
- [ ] Privacy Policy URL aktif

## ✅ AKSESIBILITAS

- [ ] Ukuran teks bisa diubah (Kecil/Sedang/Besar) di Pengaturan
- [ ] Status "Siap Panen" ditandai ikon/shape, bukan hanya warna
- [ ] Kontras warna UI lolos simulasi deuteranopia/protanopia
- [ ] Tombol minimal 44×44 dp
- [ ] Volume musik & SFX dapat diatur terpisah
- [ ] Opsi senyap penuh tersedia

## ✅ NOTIFIKASI

- [ ] Push notification berfungsi (tanaman siap, event hampir berakhir, hadiah harian)
- [ ] Pemain bisa menonaktifkan notifikasi dari Pengaturan
- [ ] Frekuensi notifikasi wajar (tidak spam)

## ✅ KONTEN

- [ ] Tutorial berfungsi untuk pemain baru
- [ ] Tutorial bisa di-skip dan diulang dari Pengaturan → Bantuan
- [ ] Semua teks UI dalam Bahasa Indonesia (untuk listing pasar Indonesia)
- [ ] Tidak ada teks "TODO" atau placeholder tersisa di build release
- [ ] Semua angka balancing sudah diuji via playtesting minimal 30 menit/siklus
- [ ] Event aktif saat launch sudah dikonfigurasi di current_events.json

---

## PANDUAN SUBMIT BUILD

### Google Play (AAB)
```
1. Unity → File → Build Settings → Android
2. Pastikan Build App Bundle (AAB) dicentang
3. Build → pilih lokasi output
4. Upload AAB ke Google Play Console → Internal Testing dulu
5. Uji 3–5 hari di internal, lalu Closed Testing, baru Production
```

### App Store (IPA via Xcode)
```
1. Unity → File → Build Settings → iOS → Build
2. Buka folder output di Xcode
3. Product → Archive
4. Distribute App → App Store Connect
5. Submit untuk review (biasanya 1–3 hari)
```

---

*Checklist ini berdasarkan kebijakan per Juli 2024. Selalu periksa kebijakan terbaru di developer.android.com dan developer.apple.com sebelum submit.*
