# IndoFarm Adventure — Asset Browser & Game

Browser asset dan fondasi game idle RPG Android. Jalankan `python server.py` untuk
membuka browser asset di `/` dan prototype game di `/game/`.

## Pack yang tersedia

### 🖼 UI Assets (538 aset)
Elemen UI 2D flat dalam PNG + SVG:
- **BoxesBanners** — banner, kotak, text box
- **ButtonsIcons** — icon button (circle/rounded/square, multi warna)
- **ButtonsText** — text button, toggle on/off, input teks, premade button
- **Icons** — hati, bintang, koin, audio, menu, kontrol UI
- **Sliders** — wide dan slim slider berbagai gaya

### ⚔️ KayKit Adventurers 2.0 FREE (52 aset)
Pack karakter & item 3D:
- **Characters** — 6 model `.glb` (Barbarian, Knight, Mage, Ranger, Rogue, Rogue Hooded)
- **Weapons & Items** — ~30 model `.gltf` (pedang, kapak, perisai, busur, dll.)
- **Animations** — 2 rig animasi `.glb` (General, MovementBasic)
- **Textures** — 5 texture karakter PNG
- **Samples** — 8 preview PNG

### 🌿 Stylized Nature MegaKit (92 aset)
Pack alam 3D stylized:
- **Trees** — 20 model `.gltf` (CommonTree, DeadTree, TwistedTree, Pine — masing-masing 5 varian)
- **Plants & Ground** — 24 model `.gltf` (Bush, Clover, Fern, Flower, Grass, Mushroom, Plant, Petal)
- **Rocks & Paths** — 25 model `.gltf` (Pebble Round/Square, Rock Medium, RockPath Round/Square)
- **Textures** — 20 texture PNG (bark, daun, rumput, batu, dll.)
- **Previews** — 4 preview JPG

### 🏰 Medieval Village MegaKit (936 file sumber/export)
Bangunan medieval dalam export glTF, FBX, OBJ, material, binary, dan texture.

### 🧥 Modular Character Outfits (121 file sumber/export)
Outfit karakter modular dalam export glTF/FBX dan texture.

## Audit asset

Gunakan `python tools/audit_assets.py` untuk memeriksa jumlah file, format, file
duplikat berdasarkan hash, dan validitas dasar image/SVG/glTF/GLB. Laporan terakhir
tersimpan di `ASSET_AUDIT.md` dan `asset-audit.json`.

Empat typo nama asset UI telah diberi nama baku; nama lama tetap dipertahankan agar
referensi lama tidak rusak. Detailnya ada di `ASSET_AUDIT.md`.

## Cara menjalankan

```
python server.py
```

Port 5000. Tidak perlu package eksternal — hanya Python stdlib.  
Model 3D dirender via `<model-viewer>` dari Google (CDN).

## User preferences

_Belum ada._
