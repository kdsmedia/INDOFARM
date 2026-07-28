# GAME DESIGN DOCUMENT
# Idle Farm: Harvest Empire
**Versi:** 1.0 Final  
**Platform:** Android / iOS  
**Engine:** Unity 2022.3 LTS + URP  
**Genre:** Idle / Incremental Farming Simulation  
**Bahasa:** Indonesia (primer), Inggris (sekunder)

---

## DAFTAR ISI

1. [Visi & Konsep](#1-visi--konsep)
2. [Loop Gameplay Inti](#2-loop-gameplay-inti)
3. [Sistem Pertanian (Farm System)](#3-sistem-pertanian)
4. [Sistem Pekerja & Manager](#4-sistem-pekerja--manager)
5. [Sistem Upgrade](#5-sistem-upgrade)
6. [Sistem Ekonomi & Balancing](#6-sistem-ekonomi--balancing)
7. [Sistem Monetisasi (AdMob — Tanpa IAP)](#7-sistem-monetisasi)
8. [Sistem Offline Income](#8-sistem-offline-income)
9. [Peta Alur Layar](#9-peta-alur-layar)
10. [Sistem Meta (Achievement, Leaderboard, Guild)](#10-sistem-meta)
11. [Live-Ops & Kalender Event](#11-live-ops--kalender-event)
12. [Tabel Data Referensi](#12-tabel-data-referensi)
13. [Spesifikasi Teknis](#13-spesifikasi-teknis)
14. [Aksesibilitas](#14-aksesibilitas)
15. [Kepatuhan Legal & ASO](#15-kepatuhan-legal--aso)

---

## 1. VISI & KONSEP

### Tagline
**"Bangun Kerajaan Pertanianmu Sendiri!"**

### Elevator Pitch
Idle Farm: Harvest Empire adalah game farming idle kasual untuk mobile di mana pemain membangun pertanian dari lahan kosong menjadi kerajaan agrikultur yang sibuk dan menguntungkan. Pemain menanam, memanen, merekrut pekerja, dan mengotomatisasi operasi — bahkan saat aplikasi ditutup. Progres terasa nyata dan memuaskan tanpa perlu membayar sepeser pun.

### Nilai Unik
- **100% bebas IAP** — seluruh konten bisa dicapai hanya dengan bermain
- **Automasi bertahap** — dari bertani manual ke kerajaan yang berjalan sendiri
- **Identitas lokal Indonesia** — bahasa, karakter, dan konteks budaya pertanian Indonesia
- **Sesi singkat tapi bermakna** — dirancang untuk dibuka 3–7 menit beberapa kali sehari

### Target Pemain
- Usia: 13–45 tahun
- Profil: Pemain kasual yang menyukai progres, tidak ingin dipaksa bayar
- Kebiasaan: Buka game saat santai (perjalanan, istirahat kerja, sebelum tidur)

---

## 2. LOOP GAMEPLAY INTI

### Loop Utama (Core Loop)
```
Tanam Bibit → Tunggu Tumbuh → Panen → Jual ke Gudang → Kumpulkan Koin
     ↑                                                          ↓
     └─────────────── Upgrade Lahan / Beli Bibit Baru ─────────┘
```

### Loop Sekunder (Meta Loop)
```
Kumpulkan Koin → Buka Area Baru → Rekrut Pekerja → Aktifkan Manager
                                                           ↓
                              Operasi Jalan Otomatis ← Automasi Penuh
```

### Loop Harian (Retention Loop)
```
Login → Klaim Hadiah Harian → Cek Offline Income → Selesaikan Misi Harian
     → Kunjungi Event Aktif → Upgrade Terpilih → Tutup App → (Kembali Esok)
```

### Loop Prestige (Long-term Loop)
```
Capai Milestone Akhir Area → Prestige/Reset → Dapat Multiplier Permanen
                                                      ↓
                              Mulai Ulang Lebih Cepat dengan Bonus Prestige
```

---

## 3. SISTEM PERTANIAN

### 3.1 Area & Lahan

| Area | Nama | Lahan Tersedia | Biaya Buka |
|---|---|---|---|
| 1 | Ladang Awal | 4 lahan | Gratis |
| 2 | Kebun Tengah | 6 lahan | 5.000 Koin |
| 3 | Sawah Besar | 8 lahan | 50.000 Koin |
| 4 | Perkebunan Buah | 10 lahan | 500.000 Koin |
| 5 | Ladang Premium | 12 lahan | 5.000.000 Koin |

### 3.2 Siklus Tanam

**Status Lahan:**
1. `EMPTY` — lahan kosong, tap untuk memilih bibit
2. `GROWING` — tanaman tumbuh, timer berjalan
3. `READY` — siap panen, efek visual berkedip
4. `HARVESTED` — baru dipanen, kembali ke EMPTY otomatis

**Interaksi Pemain:**
- **Tap lahan kosong** → buka panel pilih tanaman
- **Tap lahan READY** → panen manual (jika belum ada pekerja)
- **Pekerja aktif** → panen dan tanam ulang otomatis
- **Manager aktif** → seluruh siklus berjalan tanpa tap sama sekali

### 3.3 Tanaman & Properti

Setiap tanaman memiliki:
- `cropName` — nama dalam Bahasa Indonesia
- `growTime` — waktu tumbuh dasar (detik)
- `seedCost` — biaya benih (Koin)
- `baseValue` — nilai jual dasar (Koin)
- `unlockArea` — area tempat tanaman pertama kali tersedia
- `spriteIcon` — sprite 2D untuk UI
- `3DModel` — prefab 3D untuk tampilan di lahan
- `harvestParticle` — efek partikel saat dipanen

---

## 4. SISTEM PEKERJA & MANAGER

### 4.1 Pekerja (Worker)

**Fungsi:** Memanen lahan yang sudah siap dan menanam ulang secara otomatis.

**Properti Pekerja:**
- `workerName` — nama karakter
- `speed` — kecepatan bergerak antar lahan
- `capacity` — jumlah hasil yang bisa dibawa sekaligus
- `assignedArea` — area yang dilayani
- `level` — level pekerja (ditingkatkan dengan Koin)

**Batasan:**
- 1 pekerja per area di awal; bisa dibuka hingga 3 pekerja per area
- Pekerja hanya beroperasi di area yang ditugaskan
- Tanpa Manager, pekerja butuh di-assign manual ke area

**Biaya Rekrut Pekerja:**

| Slot | Biaya |
|---|---|
| Pekerja ke-1 | 500 Koin |
| Pekerja ke-2 | 5.000 Koin |
| Pekerja ke-3 | 50.000 Koin |

### 4.2 Manager (NPC Otomasi)

**Fungsi:** Mengaktifkan otomasi penuh untuk satu area — pekerja terus bekerja tanpa perlu tap sama sekali dari pemain.

**Properti Manager:**
- `managerName` — nama karakter unik
- `managedArea` — area yang dikelola
- `bonusPassive` — bonus tambahan saat aktif (mis. +5% pendapatan area)
- `activationCost` — biaya aktivasi (Koin)

**Catatan:** Manager tidak punya level; cukup diaktifkan sekali per area.

---

## 5. SISTEM UPGRADE

### 5.1 Jenis Upgrade

| ID Upgrade | Nama | Efek per Level | Rumus Harga |
|---|---|---|---|
| `GROW_SPEED` | Kecepatan Tumbuh | -2% waktu tumbuh | 100 × 1.15^level |
| `SELL_VALUE` | Nilai Jual | +3% harga jual | 150 × 1.15^level |
| `WORKER_SPEED` | Kecepatan Pekerja | -3% waktu jalan | 200 × 1.18^level |
| `WAREHOUSE_CAP` | Kapasitas Gudang | +10 slot | 250 × 1.20^level |
| `OFFLINE_RATE` | Tarif Offline | +5% income offline | 500 × 1.25^level |

### 5.2 Rumus Harga Upgrade

```
Harga(level) = hargaDasar × faktorKenaikan ^ level
```

Contoh: Upgrade `GROW_SPEED` level 5:
```
100 × 1.15^5 = 100 × 2.011 ≈ 201 Koin
```

### 5.3 Rumus Unlock Area

```
Harga Buka Area = hargaDasarArea × 1.6 ^ (nomorArea - 1)
```

---

## 6. SISTEM EKONOMI & BALANCING

### 6.1 Mata Uang Tunggal: Koin

**Sumber Pemasukan Koin:**
- Menjual hasil panen (sumber utama)
- Klaim hadiah login harian
- Menyelesaikan misi harian/mingguan
- Membuka peti hadiah dari event
- Klaim offline income
- Menonton rewarded ad (percepatan/bonus)
- Milestone pencapaian (achievement reward)

**Pengeluaran Koin:**
- Membeli bibit tanaman
- Merekrut pekerja
- Mengaktifkan manager
- Membeli upgrade
- Membuka area baru

### 6.2 Kurva Progres

| Fase | Durasi | Karakteristik |
|---|---|---|
| Early Game | Hari 1–3 | Progres cepat, 5–15 menit per keputusan besar |
| Mid Game | Hari 4–14 | Upgrade strategis, butuh menabung beberapa menit–jam |
| Late Game | Minggu 3+ | Kurva tajam, mendorong Prestige atau grinding event |
| Post-Prestige | Siklus ulang | Lebih cepat dengan multiplier permanen |

### 6.3 Desain Sesi

- **Durasi sesi ideal:** 3–7 menit per kunjungan
- **Frekuensi ideal:** 3–8 kali per hari
- **Tanaman awal (detik–menit):** untuk sesi singkat, kepuasan instan
- **Tanaman menengah (15 menit–2 jam):** mendorong kembali nanti
- **Tanaman lanjutan (2–8 jam):** mendorong kebiasaan cek pagi/malam

### 6.4 Sistem Prestige

- Tersedia setelah seluruh area dibuka dan milestone tertentu dicapai
- Reset: semua lahan, Koin, dan upgrade kembali ke awal
- Hadiah permanen: `Multiplier Prestige` (+X% pendapatan dasar, ditumpuk tiap prestige)
- Siklus ke-2 dan seterusnya jauh lebih cepat karena multiplier

---

## 7. SISTEM MONETISASI

> **TIDAK ADA IAP (In-App Purchase)** dalam bentuk apapun.  
> Satu-satunya sumber pendapatan aplikasi: **Google AdMob Rewarded Ads** (opsional/sukarela).

### 7.1 Placement Rewarded Ad

| Tombol | Reward | Label UI |
|---|---|---|
| Gandakan Offline Income | ×2 hasil offline | "Tonton Iklan untuk 2× Lipat" |
| Percepat Waktu Tumbuh | Skip timer tanaman aktif | "Tonton Iklan untuk Selesaikan Sekarang" |
| Gandakan Isi Peti | ×2–4 isi peti hadiah | "Tonton Iklan untuk Isi Lebih Banyak" |
| Bonus Hadiah Harian | Hadiah ekstra hari ini | "Tonton Iklan untuk Hadiah Ekstra" |
| Buka Slot Pekerja Cepat | Buka slot tanpa menabung penuh | "Tonton Iklan untuk Buka Lebih Cepat" |

**Aturan Rewarded Ad:**
- Selalu 100% opsional — pemain SELALU punya jalur gratis (lebih lambat)
- Iklan tidak muncul otomatis; hanya dipicu saat pemain menekan tombol terkait
- Setiap placement rewarded bisa dipakai maksimum 3–5× per hari

### 7.2 Interstitial Ad (Opsional, Dibatasi Ketat)

- Hanya muncul di titik transisi alami (kembali dari background setelah 15+ menit)
- Frekuensi maksimum: 1 kali per 5 menit
- Tidak ada opsi "Remove Ads" berbayar karena tidak ada IAP

### 7.3 Prinsip Anti Pay-to-Win
- Semua pemain setara karena tidak ada jalur pembayaran uang asli
- Pemain yang menonton lebih banyak iklan hanya lebih cepat, bukan bisa mencapai konten eksklusif
- Tidak ada konten yang hanya bisa diakses dengan uang asli

---

## 8. SISTEM OFFLINE INCOME

### 8.1 Cara Kerja

- Saat aplikasi ditutup, sistem mencatat timestamp `lastCloseTime`
- Saat dibuka kembali, hitung `offlineDuration = now - lastCloseTime`
- Hitung pendapatan offline: `offlineIncome = baseRatePerSecond × offlineDuration × offlineMultiplier`
- Tampilkan popup "Selamat Datang Kembali!" dengan rincian income
- Pemain bisa langsung klaim, atau tonton iklan untuk mendapat 2×

### 8.2 Batasan Offline Income

- Maksimum akumulasi offline: 8 jam (mencegah pemain "AFK" terlalu lama tanpa kembali)
- `offlineMultiplier` awal: 0.5 (50% dari rate online) — bisa ditingkatkan via upgrade `OFFLINE_RATE`
- Dengan upgrade penuh, maksimum offline multiplier: 1.0 (100% rate online)

### 8.3 Formula

```csharp
float offlineDuration = Mathf.Min(seconds, MAX_OFFLINE_SECONDS); // cap 8 jam
float income = baseRatePerSecond * offlineDuration * offlineMultiplier;
// Jika pemain tonton iklan: income *= 2f;
```

---

## 9. PETA ALUR LAYAR

### 9.1 Hierarki Layar

```
Splash/Loading Screen
    └── Home Screen (Farm Utama)
            ├── Panel Tanam (tap lahan)
            ├── Panel Upgrade Lahan
            ├── Panel Pekerja
            ├── Panel Manager
            ├── Panel Gudang/Jual
            ├── Toko
            │   ├── Tab Koin (upgrade, unlock area)
            │   └── Tab Event (item event sementara)
            ├── Misi
            │   ├── Tab Harian
            │   ├── Tab Mingguan
            │   ├── Tab Achievement
            │   └── Tab Event
            ├── Event
            │   ├── Halaman Event Aktif
            │   ├── Papan Hadiah Event
            │   └── Countdown Berakhir
            ├── Pengaturan
            │   ├── Volume Musik / SFX
            │   ├── Ukuran Teks
            │   ├── Bahasa
            │   ├── Notifikasi
            │   ├── Akun / Login
            │   ├── Kebijakan Privasi
            │   ├── Bantuan / FAQ
            │   └── Hapus Akun
            ├── Peringkat / Leaderboard
            │   ├── Mingguan
            │   └── Guild/Koperasi
            └── Profil Pemain
                    ├── Statistik
                    ├── Koleksi Badge
                    └── Avatar/Kosmetik
```

### 9.2 Popup Global

Popup berikut bisa muncul di atas layar manapun:
- `OfflineIncomePopup` — saat membuka app setelah offline
- `LevelUpPopup` — saat lahan/upgrade naik level
- `RewardPopup` — saat membuka peti/menyelesaikan misi
- `ConfirmPurchasePopup` — konfirmasi sebelum pembelian besar
- `ErrorPopup` — pesan error jaringan/iklan tidak tersedia

### 9.3 Prinsip Navigasi

- Farm Utama selalu bisa dicapai maksimum **1–2 tap** dari layar manapun
- Tombol "Home" (ikon rumah/kebun) selalu terlihat di UI global
- Tidak ada layar yang membutuhkan lebih dari 3 tap dari Home

---

## 10. SISTEM META

### 10.1 Achievement / Badge

**Kategori Achievement:**

| Kategori | Contoh Achievement | Reward |
|---|---|---|
| Pertanian | Panen pertama, Panen 1.000 kali | Badge + Koin |
| Ekonomi | Kumpulkan 10.000 Koin, Jadi Jutawan | Badge + Bonus Multiplier |
| Eksplorasi | Buka semua area | Badge + Skin Lahan Eksklusif |
| Sosial | Bergabung ke Koperasi | Badge + Koin |
| Prestige | Prestige pertama, Prestige ke-5 | Badge + Multiplier Eksklusif |

### 10.2 Leaderboard / Peringkat

- **Periode:** Reset tiap Senin pukul 00:00 WIB
- **Metrik:** Total Koin dikumpulkan dalam minggu berjalan
- **Matchmaking:** Pemain dikelompokkan dengan yang punya progres serupa (tier-based)
- **Hadiah Akhir Minggu:** Top 1 = badge eksklusif + Koin besar; Top 2–10 = Koin; Top 11–50 = Koin kecil

### 10.3 Sistem Guild (Koperasi Tani)

- **Kapasitas:** 10–30 anggota per koperasi
- **Target Bersama:** Kontribusi panen ke "Gudang Koperasi" untuk buka hadiah kelompok
- **Kunjungan Kebun:** Kunjungi kebun anggota → beri 1 "Boost Singkat" per kunjungan (+10% produksi 30 menit)
- **Reset Koperasi:** Target baru tiap minggu

### 10.4 Koleksi Kosmetik

Item berikut tidak memengaruhi kekuatan ekonomi (non-power cosmetic):
- Skin karakter petani (baju adat daerah, pakaian musim)
- Tema lahan musiman (musim hujan, lebaran, natal)
- Variasi warna bangunan gudang/kandang
- Cara dapat: reward achievement, hadiah event, tonton iklan (bukan beli dengan uang asli)

---

## 11. LIVE-OPS & KALENDER EVENT

### 11.1 Jenis Event

| Tipe Event | Frekuensi | Durasi | Contoh |
|---|---|---|---|
| Event Musiman Besar | 2–4 minggu sekali | 7–14 hari | Festival Panen Raya |
| Event Mini | Setiap minggu | 3–5 hari | Hari Petani, Flash Event |
| Event Login Streak | Terus-menerus | Harian | Bonus login 7 hari berturut |

### 11.2 Komponen Event Musiman

- Misi khusus event (mis. "Panen Jagung 50 kali selama event")
- Mata uang event sementara (mis. "Bintang Festival") yang hilang saat event berakhir
- Toko event — tukar mata uang event dengan hadiah eksklusif
- Papan hadiah bertingkat (milestone track): semakin banyak kontribusi, semakin besar hadiah
- Leaderboard event terpisah (opsional)

### 11.3 Kalender Konten Minimum

| Minggu | Konten Baru |
|---|---|
| Setiap minggu | 1 mini event atau tanaman baru atau kosmetik baru |
| Setiap 2–4 minggu | 1 event musiman besar |
| Setiap 1–2 bulan | Update konten mayor (area baru atau sistem baru) |

### 11.4 Notifikasi Push

- "Event hampir berakhir! Masih ada X jam tersisa."
- "Tanamanmu sudah siap panen!"
- "Hadiah login harian sudah bisa diklaim."

---

## 12. TABEL DATA REFERENSI

### 12.1 Tabel Tanaman Lengkap

| Nama | ID | Waktu Tumbuh | Biaya Benih | Nilai Jual | Area |
|---|---|---|---|---|---|
| Jagung | corn | 10 detik | 0 (gratis) | 5 Koin | Area 1 |
| Gandum | wheat | 30 detik | 10 Koin | 15 Koin | Area 1 |
| Wortel | carrot | 1 menit | 30 Koin | 55 Koin | Area 1 |
| Tomat | tomato | 2 menit | 50 Koin | 80 Koin | Area 2 |
| Cabai | chili | 5 menit | 120 Koin | 200 Koin | Area 2 |
| Bawang | onion | 10 menit | 200 Koin | 380 Koin | Area 2 |
| Labu | pumpkin | 15 menit | 300 Koin | 600 Koin | Area 3 |
| Bayam | spinach | 30 menit | 500 Koin | 1.100 Koin | Area 3 |
| Padi | rice | 1 jam | 1.000 Koin | 2.500 Koin | Area 3 |
| Anggur | grape | 2 jam | 2.000 Koin | 5.000 Koin | Area 4 |
| Durian | durian | 4 jam | 5.000 Koin | 14.000 Koin | Area 4 |
| Manggis | mangosteen | 8 jam | 10.000 Koin | 32.000 Koin | Area 5 |

### 12.2 Tabel Upgrade Lengkap

| ID | Nama | Efek/Level | Harga Dasar | Faktor | Max Level |
|---|---|---|---|---|---|
| GROW_SPEED | Kecepatan Tumbuh | -2% waktu tumbuh | 100 | ×1.15 | 50 |
| SELL_VALUE | Nilai Jual | +3% harga jual | 150 | ×1.15 | 50 |
| WORKER_SPEED | Kecepatan Pekerja | -3% waktu jalan | 200 | ×1.18 | 30 |
| WAREHOUSE_CAP | Kapasitas Gudang | +10 slot | 250 | ×1.20 | 20 |
| OFFLINE_RATE | Tarif Offline | +5% income offline | 500 | ×1.25 | 20 |

### 12.3 Tabel Manager

| Nama Manager | Area | Biaya Aktivasi | Bonus Pasif |
|---|---|---|---|
| Pak Budi | Area 1 | 2.000 Koin | +5% income Area 1 |
| Bu Sari | Area 2 | 20.000 Koin | +5% income Area 2 |
| Mas Joko | Area 3 | 200.000 Koin | +5% income Area 3 |
| Nona Ayu | Area 4 | 2.000.000 Koin | +5% income Area 4 |
| Prof. Tani | Area 5 | 20.000.000 Koin | +10% semua area |

---

## 13. SPESIFIKASI TEKNIS

### 13.1 Tech Stack

| Komponen | Teknologi |
|---|---|
| Engine | Unity 2022.3 LTS |
| Render Pipeline | Universal Render Pipeline (URP) |
| Bahasa Skrip | C# (.NET Standard 2.1) |
| Serialisasi Data | Newtonsoft JSON + PlayerPrefs (lokal) |
| Cloud Save | Unity Cloud Save (via Unity Gaming Services) |
| Analytics | Unity Analytics + Firebase Analytics |
| Ads | Google AdMob SDK (Rewarded + Interstitial) |
| Remote Config | Unity Remote Config |
| Animasi UI | DOTween Pro |
| Teks UI | TextMeshPro |
| Notifikasi | Unity Mobile Notifications |

### 13.2 Target Platform

| Platform | Min OS | Arsitektur | Build |
|---|---|---|---|
| Android | API 24 (Android 7.0) | ARM64, ARMv7 | IL2CPP |
| iOS | iOS 15 | ARM64 | IL2CPP |

### 13.3 Performa Target

| Perangkat | Target FPS |
|---|---|
| Low-end (RAM 2GB) | 30 FPS stabil |
| Mid-range (RAM 4GB) | 60 FPS |
| High-end (RAM 8GB+) | 60 FPS + efek tambahan |

### 13.4 Ukuran Aplikasi

- Download awal: maksimum **80 MB**
- Aset event/musiman: diunduh on-demand saat event aktif
- Total terinstal lengkap: ~200–300 MB

### 13.5 Backend & Anti-Cheat

- Validasi saldo Koin di sisi server untuk mencegah manipulasi lokal
- Timestamp offline income diverifikasi server (mencegah manipulasi jam perangkat)
- Rate-limit API untuk mencegah farming otomatis

---

## 14. AKSESIBILITAS

| Fitur | Spesifikasi |
|---|---|
| Ukuran Teks | 3 pilihan: Kecil / Sedang (default) / Besar |
| Kontras Warna | Status "Siap Panen" ditandai ikon + warna (tidak hanya warna) |
| Mode Buta Warna | Uji simulasi deuteranopia & protanopia |
| Volume | Kontrol musik & SFX terpisah; opsi senyap penuh |
| Skip Tutorial | Tersedia di Pengaturan → Bantuan jika ingin diulang |
| Target Sentuh | Tombol minimal 44×44 dp agar ramah semua usia |

---

## 15. KEPATUHAN LEGAL & ASO

### 15.1 Rating & Klasifikasi

- Target rating: **Semua Umur / 3+** (PEGI 3, ESRB Everyone)
- Ajukan via IARC di Google Play Console dan App Store Connect

### 15.2 Kebijakan Privasi

- Wajib tersedia dan dapat diakses dari **Pengaturan → Kebijakan Privasi**
- Jelaskan: data analytics yang dikumpulkan, data iklan AdMob, cloud save
- Ikuti regulasi: GDPR (Eropa), COPPA (AS — untuk usia <13), UU PDP Indonesia

### 15.3 Kepatuhan Iklan Anak

- Konfigurasi AdMob: aktifkan **"Designed for Families"** jika menarget anak-anak
- Gunakan non-personalized ads jika ada indikasi pengguna di bawah 13 tahun

### 15.4 Transparansi Loot/Gacha

- Setiap peti berhadiah acak **wajib menampilkan tabel persentase** sebelum dibuka
- Contoh: "Hadiah Langka: 5% | Hadiah Biasa: 75% | Hadiah Umum: 20%"

### 15.5 Elemen ASO (App Store Optimization)

**Judul:** Idle Farm: Harvest Empire - Game Tani  
**Subtitle:** Bangun Kerajaan Pertanianmu!  

**Deskripsi Singkat (80 karakter):**  
Game pertanian idle seru — tanam, panen, dan bangun kerajaan tanimu!

**Kata Kunci Prioritas:**  
`game tani, idle farm, farming game, pertanian, harvest, kebun, idle game indonesia`

**Screenshot Wajib (5–8 gambar):**
1. Farm ramai dengan banyak lahan aktif (visual impak)
2. Momen panen dengan efek partikel
3. Panel upgrade dengan progression jelas
4. Event musiman dengan UI khusus
5. Tampilan 3D farm dari sudut sinematik
6. Popup offline income (tunjukkan "kembali dapat banyak!")
7. Layar misi/achievement

**Video Preview (15–30 detik):**  
Detik 0–3: Hook visual (farm ramai, panen berlimpah)  
Detik 4–12: Loop gameplay inti (tanam → tumbuh → panen → upgrade)  
Detik 13–20: Fitur automasi (pekerja & manager bergerak sendiri)  
Detik 21–30: CTA ("Mulai Gratis — Tanpa Batas, Tanpa Bayar!")
