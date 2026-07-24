# Asset audit

Audit terakhir: jalankan `python tools/audit_assets.py` dari root project.

## Status

- Semua asset UI memiliki pasangan PNG dan SVG dengan nama dasar yang sama.
- Pemeriksaan signature dasar PNG/JPEG, struktur SVG, metadata glTF, dan header GLB berjalan tanpa package tambahan.
- Tidak ada asset kosong atau rusak yang ditemukan pada audit terakhir.
- Asset pack asli tidak dihapus atau dipindahkan.

## Struktur pack

| Pack | Isi utama | Jumlah file |
| --- | --- | ---: |
| `BoxesBanners` | panel, banner, text box | 48 |
| `ButtonsIcons` | tombol ikon | 96 |
| `ButtonsText` | tombol teks, toggle, input | 120 |
| `Icons` | ikon HUD dan navigasi | 160 |
| `Sliders` | slider dan scrollbar | 122 |
| `KayKit_Adventurers_2.0_FREE` | karakter, senjata, animasi, texture | 246 |
| `Medieval_Village_MegaKit` | bangunan dan prop medieval | 935 |
| `Modular Character Outfits - Fantasy[Standard]` | outfit dan karakter modular | 119 |
| `Stylized_Nature_MegaKit` | pohon, tanaman, batu, alam | 452 |

Jumlah di atas menghitung seluruh format sumber/export yang ada di masing-masing
pack. Karena itu angkanya lebih besar daripada jumlah model yang dipakai game.

## Rapihan nama

Empat typo yang jelas sekarang memiliki nama baku dalam pasangan PNG/SVG:

- `Banner_WhiteOutline` (sebelumnya `Banner_WhiteOutine`)
- `ButtonText_Green_OnOffButton` (sebelumnya `ButtonText_Geen_OnOffButton`)
- `ButtonText_Small_Round` (sebelumnya `ButtonText_Small_ROund`)
- `Icon_Large_StarGrey_SeethroughOutline` (sebelumnya `Icon_Large_StarSrey_SeethroughOutline`)

Nama lama sengaja dipertahankan untuk kompatibilitas dengan referensi lama. Nama
baku dapat dipakai untuk asset baru.

## Catatan penting

Texture yang sama pada folder `glTF` dan `Textures`, atau beberapa export outfit,
merupakan salinan dari format/export berbeda dan bukan indikasi file rusak. Jangan
menghapusnya tanpa memeriksa referensi `.gltf`, `.bin`, dan engine yang akan dipakai.
