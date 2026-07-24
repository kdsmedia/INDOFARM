"""Asset browser — UI Assets · KayKit Adventurers · Stylized Nature · Medieval Village."""

import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ── UI Asset pack ─────────────────────────────────────────────────────────────
UI_ASSET_DIRS = ["BoxesBanners", "ButtonsIcons", "ButtonsText", "Icons", "Sliders"]
UI_CATEGORY_LABELS = {
    "BoxesBanners": "Boxes & Banners",
    "ButtonsIcons": "Icon Buttons",
    "ButtonsText":  "Text Buttons",
    "Icons":        "Icons",
    "Sliders":      "Sliders",
}

def collect_ui_assets():
    assets = {}
    for folder in UI_ASSET_DIRS:
        pngs, svgs = [], []
        if os.path.isdir(folder):
            for f in sorted(os.listdir(folder)):
                if f.lower().endswith(".png"):
                    pngs.append(f)
            svg_dir = os.path.join(folder, "SVG")
            if os.path.isdir(svg_dir):
                for f in sorted(os.listdir(svg_dir)):
                    if f.lower().endswith(".svg"):
                        svgs.append(f)
        assets[folder] = {"label": UI_CATEGORY_LABELS[folder], "png": pngs, "svg": svgs}
    return assets

# ── KayKit Adventurers pack ───────────────────────────────────────────────────
KK_ROOT = "KayKit_Adventurers_2.0_FREE"

def collect_kaykit():
    samples, textures, chars, weapons, anims = [], [], [], [], []
    samples_dir = os.path.join(KK_ROOT, "Samples")
    if os.path.isdir(samples_dir):
        samples = sorted(f for f in os.listdir(samples_dir) if f.lower().endswith(".png"))
    tex_dir = os.path.join(KK_ROOT, "Textures")
    if os.path.isdir(tex_dir):
        textures = sorted(f for f in os.listdir(tex_dir) if f.lower().endswith(".png"))
    chars_dir = os.path.join(KK_ROOT, "Characters", "gltf")
    if os.path.isdir(chars_dir):
        chars = sorted(f for f in os.listdir(chars_dir) if f.lower().endswith(".glb"))
    weapons_dir = os.path.join(KK_ROOT, "Assets", "gltf")
    if os.path.isdir(weapons_dir):
        weapons = sorted(f for f in os.listdir(weapons_dir) if f.lower().endswith(".gltf"))
    anims_dir = os.path.join(KK_ROOT, "Animations", "gltf", "Rig_Medium")
    if os.path.isdir(anims_dir):
        anims = sorted(f for f in os.listdir(anims_dir) if f.lower().endswith(".glb"))
    return {"samples": samples, "textures": textures,
            "characters": chars, "weapons": weapons, "animations": anims}

# ── Stylized Nature MegaKit ───────────────────────────────────────────────────
NAT_ROOT  = "Stylized_Nature_MegaKit"
NAT_GLTF  = os.path.join(NAT_ROOT, "glTF")

TREE_PREFIXES   = ("CommonTree", "DeadTree", "TwistedTree", "Pine")
PLANT_PREFIXES  = ("Bush", "Clover", "Fern", "Flower", "Grass", "Mushroom", "Plant", "Petal")
ROCK_PREFIXES   = ("Pebble", "Rock", "RockPath")

def collect_nature():
    trees, plants, rocks, textures, previews = [], [], [], [], []

    if os.path.isdir(NAT_GLTF):
        for f in sorted(os.listdir(NAT_GLTF)):
            if f.lower().endswith(".gltf"):
                if any(f.startswith(p) for p in TREE_PREFIXES):
                    trees.append(f)
                elif any(f.startswith(p) for p in PLANT_PREFIXES):
                    plants.append(f)
                elif any(f.startswith(p) for p in ROCK_PREFIXES):
                    rocks.append(f)

    tex_dir = os.path.join(NAT_ROOT, "Textures")
    if os.path.isdir(tex_dir):
        textures = sorted(f for f in os.listdir(tex_dir) if f.lower().endswith(".png"))

    if os.path.isdir(NAT_ROOT):
        previews = sorted(f for f in os.listdir(NAT_ROOT) if f.lower().endswith(".jpg"))

    return {"trees": trees, "plants": plants, "rocks": rocks,
            "textures": textures, "previews": previews}

# ── Medieval Village MegaKit ─────────────────────────────────────────────────
MED_ROOT = "Medieval_Village_MegaKit/Standard"
MED_GLTF = os.path.join(MED_ROOT, "glTF")

MED_CATS = {
    "walls":    ("Wall_",),
    "roofs":    ("Roof_",),
    "doors":    ("Door_", "DoorFrame_", "Window_", "WindowShutters_"),
    "stairs":   ("Stair_", "Stairs_"),
    "props":    ("Prop_",),
    "structure":("Balcony_", "Corner_", "Floor_", "HoleCover_", "Overhang_"),
}

def collect_medieval():
    result = {k: [] for k in MED_CATS}
    textures, previews = [], []

    if os.path.isdir(MED_GLTF):
        for f in sorted(os.listdir(MED_GLTF)):
            if f.lower().endswith(".gltf"):
                for cat, prefixes in MED_CATS.items():
                    if any(f.startswith(p) for p in prefixes):
                        result[cat].append(f)
                        break

    tex_dir = os.path.join(MED_ROOT, "Textures")
    if os.path.isdir(tex_dir):
        textures = sorted(f for f in os.listdir(tex_dir) if f.lower().endswith(".png"))

    if os.path.isdir(MED_ROOT):
        previews = sorted(f for f in os.listdir(MED_ROOT) if f.lower().endswith(".jpg"))

    result["textures"] = textures
    result["previews"] = previews
    return result

# ── HTML ──────────────────────────────────────────────────────────────────────
HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game Asset Browser</title>
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
<style>
:root{
  --bg:#1a1a2e;--surface:#16213e;--card:#0f3460;
  --accent:#e94560;--accent2:#f5a623;--green:#2e7d32;--nat:#2d6a4f;
  --text:#eaeaea;--muted:#8892a4;--r:10px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;min-height:100vh}

/* ── header ── */
header{
  background:var(--surface);border-bottom:2px solid var(--card);
  padding:14px 24px;display:flex;align-items:center;gap:14px;
  position:sticky;top:0;z-index:100;flex-wrap:wrap;
}
header h1{font-size:1.2rem;font-weight:700;color:var(--accent2);white-space:nowrap}
.total{color:var(--muted);font-size:.82rem;white-space:nowrap}
#search{
  background:var(--card);border:1px solid #2a3a5c;color:var(--text);
  padding:7px 14px;border-radius:20px;font-size:.88rem;width:200px;outline:none;
}
#search:focus{border-color:var(--accent)}

/* ── pack switcher ── */
.pack-bar{display:flex;gap:6px;padding:14px 24px 0;border-bottom:2px solid var(--card);flex-wrap:wrap}
.pack-btn{
  padding:8px 20px;border:none;border-radius:var(--r) var(--r) 0 0;
  background:var(--card);color:var(--muted);cursor:pointer;
  font-size:.88rem;font-weight:600;transition:all .15s;
}
.pack-btn.active{background:var(--accent2);color:#000}
.pack-btn.nat.active{background:#52b788;color:#000}
.pack-btn.med.active{background:#c9a84c;color:#000}

/* ── tabs ── */
.tabs{display:flex;gap:4px;padding:12px 24px 0;flex-wrap:wrap}
.tab{
  background:transparent;border:none;color:var(--muted);
  padding:8px 16px;border-radius:var(--r) var(--r) 0 0;
  cursor:pointer;font-size:.85rem;font-weight:500;
  border-bottom:3px solid transparent;transition:all .15s;
}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent2);border-bottom-color:var(--accent2);background:var(--surface)}
.nat-pack .tab.active{color:#52b788;border-bottom-color:#52b788}
.med-pack .tab.active{color:#c9a84c;border-bottom-color:#c9a84c}

/* ── toolbar ── */
.toolbar{
  display:flex;align-items:center;gap:10px;
  padding:12px 24px;background:var(--surface);flex-wrap:wrap;
}
.toolbar label{font-size:.82rem;color:var(--muted)}
.toggle-group{display:flex;gap:4px}
.fmt-btn{
  background:var(--card);border:1px solid #2a3a5c;color:var(--muted);
  padding:4px 12px;border-radius:6px;cursor:pointer;font-size:.78rem;font-weight:600;
  transition:all .15s;
}
.fmt-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}
.count{margin-left:auto;font-size:.8rem;color:var(--muted)}

/* ── grids ── */
main{padding:20px 24px}
.section{display:none}
.section.visible{display:block}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.grid.wide{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.grid.wider{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.char-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}

/* ── image cards ── */
.asset-card{
  background:var(--surface);border:1px solid var(--card);border-radius:var(--r);
  padding:10px;display:flex;flex-direction:column;align-items:center;gap:8px;
  cursor:pointer;transition:transform .15s,border-color .15s;position:relative;
}
.asset-card:hover{transform:translateY(-2px);border-color:var(--accent2)}
.asset-card img{width:100%;height:90px;object-fit:contain;border-radius:6px}
.asset-card.preview img{height:120px;object-fit:cover}
.asset-card .name{font-size:.68rem;color:var(--muted);text-align:center;word-break:break-word;line-height:1.3}

/* ── badges ── */
.badge{
  position:absolute;top:6px;right:6px;
  font-size:.58rem;font-weight:700;padding:2px 5px;
  border-radius:4px;text-transform:uppercase;
}
.badge.png{background:var(--accent);color:#fff}
.badge.svg{background:var(--green);color:#fff}
.badge.glb{background:#1565c0;color:#fff}
.badge.gltf{background:#6a1b9a;color:#fff}
.badge.tex{background:#4e342e;color:#fff}
.badge.anim{background:#00695c;color:#fff}
.badge.nat{background:var(--nat);color:#fff}
.badge.jpg{background:#5d4037;color:#fff}
.badge.med{background:#78350f;color:#fff}

/* ── 3D model cards ── */
.model-card{
  background:var(--surface);border:1px solid var(--card);border-radius:var(--r);
  padding:10px;display:flex;flex-direction:column;align-items:center;gap:8px;
  position:relative;transition:border-color .15s;
}
.model-card:hover{border-color:var(--accent2)}
model-viewer{
  width:100%;height:180px;border-radius:6px;
  --progress-bar-color:var(--accent2);
}
.model-card .name{font-size:.7rem;color:var(--muted);text-align:center;line-height:1.3}

/* ── character cards ── */
.char-card{
  background:var(--surface);border:1px solid var(--card);border-radius:var(--r);
  overflow:hidden;transition:border-color .15s;
}
.char-card:hover{border-color:var(--accent2)}
.char-card model-viewer{width:100%;height:220px;background:#0b1a30}
.char-info{padding:10px 12px}
.char-info .name{font-size:.85rem;font-weight:600;color:var(--text)}
.char-info .sub{font-size:.72rem;color:var(--muted);margin-top:2px}

/* ── empty ── */
.empty{color:var(--muted);padding:48px 0;text-align:center;font-size:.9rem}

/* ── lightbox ── */
#lightbox{
  display:none;position:fixed;inset:0;
  background:rgba(0,0,0,.88);z-index:999;
  align-items:center;justify-content:center;flex-direction:column;gap:14px;
}
#lightbox.open{display:flex}
#lb-img-wrap img{max-width:80vw;max-height:68vh;border-radius:var(--r);background:#222}
#lb-name{color:var(--text);font-size:1rem;font-weight:600}
#lb-path{color:var(--muted);font-size:.78rem}
#lb-close{
  position:absolute;top:20px;right:24px;
  background:var(--accent);border:none;color:#fff;
  font-size:1.3rem;width:36px;height:36px;border-radius:50%;
  cursor:pointer;line-height:36px;text-align:center;
}
</style>
</head>
<body>

<header>
  <h1>🎮 Game Asset Browser</h1>
  <span class="total" id="total-count"></span>
  <div style="margin-left:auto">
    <input id="search" type="text" placeholder="Search…">
  </div>
</header>

<!-- Pack switcher -->
<div class="pack-bar">
  <button class="pack-btn active"  data-pack="ui">🖼 UI Assets</button>
  <button class="pack-btn"         data-pack="kaykit">⚔️ KayKit Adventurers 2.0</button>
  <button class="pack-btn nat"     data-pack="nature">🌿 Stylized Nature MegaKit</button>
  <button class="pack-btn med"     data-pack="medieval">🏰 Medieval Village MegaKit</button>
</div>

<!-- ══ UI PACK ══ -->
<div id="ui-pack">
  <nav class="tabs" id="ui-tabs"></nav>
  <div class="toolbar">
    <label>Format:</label>
    <div class="toggle-group">
      <button class="fmt-btn active" data-fmt="png">PNG</button>
      <button class="fmt-btn"        data-fmt="svg">SVG</button>
    </div>
    <span class="count" id="ui-count"></span>
  </div>
  <main id="ui-main"></main>
</div>

<!-- ══ KAYKIT PACK ══ -->
<div id="kaykit-pack" style="display:none">
  <nav class="tabs" id="kk-tabs">
    <button class="tab active" data-kk="characters">🧙 Characters</button>
    <button class="tab"        data-kk="weapons">⚔️ Weapons & Items</button>
    <button class="tab"        data-kk="animations">🎬 Animations</button>
    <button class="tab"        data-kk="textures">🎨 Textures</button>
    <button class="tab"        data-kk="samples">🖼 Samples</button>
  </nav>
  <div class="toolbar"><span class="count" id="kk-count"></span></div>
  <main id="kk-main">
    <div id="kk-characters" class="section visible"></div>
    <div id="kk-weapons"    class="section"></div>
    <div id="kk-animations" class="section"></div>
    <div id="kk-textures"   class="section"></div>
    <div id="kk-samples"    class="section"></div>
  </main>
</div>

<!-- ══ NATURE PACK ══ -->
<div id="nature-pack" class="nat-pack" style="display:none">
  <nav class="tabs" id="nat-tabs">
    <button class="tab active" data-nat="trees">🌲 Trees</button>
    <button class="tab"        data-nat="plants">🌿 Plants & Ground</button>
    <button class="tab"        data-nat="rocks">🪨 Rocks & Paths</button>
    <button class="tab"        data-nat="textures">🎨 Textures</button>
    <button class="tab"        data-nat="previews">🖼 Previews</button>
  </nav>
  <div class="toolbar"><span class="count" id="nat-count"></span></div>
  <main id="nat-main">
    <div id="nat-trees"    class="section visible"></div>
    <div id="nat-plants"   class="section"></div>
    <div id="nat-rocks"    class="section"></div>
    <div id="nat-textures" class="section"></div>
    <div id="nat-previews" class="section"></div>
  </main>
</div>

<!-- ══ MEDIEVAL PACK ══ -->
<div id="medieval-pack" class="med-pack" style="display:none">
  <nav class="tabs" id="med-tabs">
    <button class="tab active" data-med="walls">🧱 Walls</button>
    <button class="tab"        data-med="roofs">🏠 Roofs</button>
    <button class="tab"        data-med="doors">🚪 Doors & Windows</button>
    <button class="tab"        data-med="stairs">🪜 Stairs</button>
    <button class="tab"        data-med="props">🪵 Props</button>
    <button class="tab"        data-med="structure">🏗 Structure</button>
    <button class="tab"        data-med="textures">🎨 Textures</button>
    <button class="tab"        data-med="previews">🖼 Preview</button>
  </nav>
  <div class="toolbar"><span class="count" id="med-count"></span></div>
  <main id="med-main">
    <div id="med-walls"     class="section visible"></div>
    <div id="med-roofs"     class="section"></div>
    <div id="med-doors"     class="section"></div>
    <div id="med-stairs"    class="section"></div>
    <div id="med-props"     class="section"></div>
    <div id="med-structure" class="section"></div>
    <div id="med-textures"  class="section"></div>
    <div id="med-previews"  class="section"></div>
  </main>
</div>

<!-- Lightbox -->
<div id="lightbox">
  <button id="lb-close">✕</button>
  <div id="lb-img-wrap"></div>
  <div id="lb-name"></div>
  <div id="lb-path"></div>
</div>

<script>
const UI_DATA  = __UI_DATA__;
const KK_DATA  = __KK_DATA__;
const NAT_DATA = __NAT_DATA__;
const MED_DATA = __MED_DATA__;
const KK_ROOT  = "KayKit_Adventurers_2.0_FREE";
const NAT_ROOT = "Stylized_Nature_MegaKit";
const MED_ROOT = "Medieval_Village_MegaKit/Standard";

// ── state ────────────────────────────────────────────────────────────────────
let activePack   = 'ui';
let activeUITab  = Object.keys(UI_DATA)[0];
let activeFmt    = 'png';
let activeKKTab  = 'characters';
let activeNatTab = 'trees';
let activeMedTab = 'walls';
let query = '';

// ── totals ────────────────────────────────────────────────────────────────────
let uiTotal = 0;
Object.values(UI_DATA).forEach(d => { uiTotal += d.png.length + d.svg.length; });
const kkTotal  = KK_DATA.characters.length + KK_DATA.weapons.length +
                 KK_DATA.animations.length + KK_DATA.textures.length + KK_DATA.samples.length;
const natTotal = NAT_DATA.trees.length + NAT_DATA.plants.length + NAT_DATA.rocks.length +
                 NAT_DATA.textures.length + NAT_DATA.previews.length;
const medTotal = MED_DATA.walls.length + MED_DATA.roofs.length + MED_DATA.doors.length +
                 MED_DATA.stairs.length + MED_DATA.props.length + MED_DATA.structure.length +
                 MED_DATA.textures.length + MED_DATA.previews.length;
document.getElementById('total-count').textContent =
  (uiTotal + kkTotal + natTotal + medTotal) + ' assets across 4 packs';

// ── pack switcher ─────────────────────────────────────────────────────────────
document.querySelectorAll('.pack-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activePack = btn.dataset.pack;
    document.querySelectorAll('.pack-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('ui-pack').style.display       = activePack === 'ui'       ? '' : 'none';
    document.getElementById('kaykit-pack').style.display   = activePack === 'kaykit'   ? '' : 'none';
    document.getElementById('nature-pack').style.display   = activePack === 'nature'   ? '' : 'none';
    document.getElementById('medieval-pack').style.display = activePack === 'medieval' ? '' : 'none';
    if (activePack === 'ui')       renderUI();
    if (activePack === 'kaykit')   renderKK();
    if (activePack === 'nature')   renderNat();
    if (activePack === 'medieval') renderMed();
  });
});

// ── search ────────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', e => {
  query = e.target.value.toLowerCase();
  if (activePack === 'ui')       renderUI();
  if (activePack === 'kaykit')   renderKK();
  if (activePack === 'nature')   renderNat();
  if (activePack === 'medieval') renderMed();
});

// ═══════════════════════════  UI PACK  ═══════════════════════════════════════
const uiTabsEl = document.getElementById('ui-tabs');
Object.keys(UI_DATA).forEach(folder => {
  const btn = document.createElement('button');
  btn.className = 'tab' + (folder === activeUITab ? ' active' : '');
  btn.textContent = UI_DATA[folder].label;
  btn.dataset.folder = folder;
  btn.addEventListener('click', () => { activeUITab = folder; renderUI(); });
  uiTabsEl.appendChild(btn);
});
const uiMain = document.getElementById('ui-main');
Object.keys(UI_DATA).forEach(folder => {
  const sec = document.createElement('div');
  sec.className = 'section'; sec.id = 'ui-sec-' + folder;
  sec.appendChild(Object.assign(document.createElement('div'), {className:'grid'}));
  uiMain.appendChild(sec);
});
document.querySelectorAll('.fmt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFmt = btn.dataset.fmt;
    document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderUI();
  });
});
function renderUI() {
  document.querySelectorAll('#ui-tabs .tab').forEach(t =>
    t.classList.toggle('active', t.dataset.folder === activeUITab));
  document.querySelectorAll('#ui-main .section').forEach(s => s.classList.remove('visible'));
  const sec = document.getElementById('ui-sec-' + activeUITab);
  sec.classList.add('visible');
  const grid = sec.querySelector('.grid'); grid.innerHTML = '';
  const files = (activeFmt === 'png' ? UI_DATA[activeUITab].png : UI_DATA[activeUITab].svg)
    .filter(f => f.toLowerCase().includes(query));
  if (!files.length) { grid.appendChild(emptyEl(query ? `No results for "${query}"` : `No ${activeFmt.toUpperCase()} files here.`)); }
  else files.forEach(name => grid.appendChild(
    makeImgCard(name, `${activeUITab}/${activeFmt === 'svg' ? 'SVG/' : ''}${name}`, activeFmt)));
  document.getElementById('ui-count').textContent = files.length + ' shown';
}

// ═══════════════════════════  KAYKIT PACK  ═══════════════════════════════════
document.querySelectorAll('#kk-tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeKKTab = btn.dataset.kk;
    document.querySelectorAll('#kk-tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderKK();
  });
});
function renderKK() {
  document.querySelectorAll('#kk-main .section').forEach(s => s.classList.remove('visible'));
  const sec = document.getElementById('kk-' + activeKKTab);
  sec.classList.add('visible'); sec.innerHTML = '';
  const items = KK_DATA[activeKKTab].filter(f => f.toLowerCase().includes(query));
  document.getElementById('kk-count').textContent = items.length + ' shown';
  if (!items.length) { sec.appendChild(emptyEl(query ? `No results for "${query}"` : 'Nothing here.')); return; }

  if (activeKKTab === 'characters') {
    const grid = mkEl('div', 'char-grid');
    items.forEach(name => grid.appendChild(makeCharCard(name, `${KK_ROOT}/Characters/gltf/${name}`)));
    sec.appendChild(grid);
  } else if (activeKKTab === 'weapons') {
    const grid = mkEl('div', 'grid wide');
    items.forEach(name => grid.appendChild(makeModelCard(name, `${KK_ROOT}/Assets/gltf/${name}`, 'gltf')));
    sec.appendChild(grid);
  } else if (activeKKTab === 'animations') {
    const grid = mkEl('div', 'grid wide');
    items.forEach(name => grid.appendChild(makeModelCard(name, `${KK_ROOT}/Animations/gltf/Rig_Medium/${name}`, 'anim')));
    sec.appendChild(grid);
  } else if (activeKKTab === 'textures') {
    const grid = mkEl('div', 'grid');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${KK_ROOT}/Textures/${name}`, 'tex')));
    sec.appendChild(grid);
  } else if (activeKKTab === 'samples') {
    const grid = mkEl('div', 'grid');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${KK_ROOT}/Samples/${name}`, 'png')));
    sec.appendChild(grid);
  }
}

// ═══════════════════════════  NATURE PACK  ════════════════════════════════════
document.querySelectorAll('#nat-tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeNatTab = btn.dataset.nat;
    document.querySelectorAll('#nat-tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderNat();
  });
});
function renderNat() {
  document.querySelectorAll('#nat-main .section').forEach(s => s.classList.remove('visible'));
  const sec = document.getElementById('nat-' + activeNatTab);
  sec.classList.add('visible'); sec.innerHTML = '';
  const items = NAT_DATA[activeNatTab].filter(f => f.toLowerCase().includes(query));
  document.getElementById('nat-count').textContent = items.length + ' shown';
  if (!items.length) { sec.appendChild(emptyEl(query ? `No results for "${query}"` : 'Nothing here.')); return; }

  if (activeNatTab === 'textures') {
    const grid = mkEl('div', 'grid');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${NAT_ROOT}/Textures/${name}`, 'tex')));
    sec.appendChild(grid);
  } else if (activeNatTab === 'previews') {
    const grid = mkEl('div', 'grid wide');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${NAT_ROOT}/${name}`, 'jpg', true)));
    sec.appendChild(grid);
  } else {
    // trees / plants / rocks  → gltf 3D viewer
    const grid = mkEl('div', 'grid wider');
    items.forEach(name => grid.appendChild(makeModelCard(name, `${NAT_ROOT}/glTF/${name}`, 'nat')));
    sec.appendChild(grid);
  }
}

// ═══════════════════════════  MEDIEVAL PACK  ══════════════════════════════════
document.querySelectorAll('#med-tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeMedTab = btn.dataset.med;
    document.querySelectorAll('#med-tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderMed();
  });
});
function renderMed() {
  document.querySelectorAll('#med-main .section').forEach(s => s.classList.remove('visible'));
  const sec = document.getElementById('med-' + activeMedTab);
  sec.classList.add('visible'); sec.innerHTML = '';
  const items = MED_DATA[activeMedTab].filter(f => f.toLowerCase().includes(query));
  document.getElementById('med-count').textContent = items.length + ' shown';
  if (!items.length) { sec.appendChild(emptyEl(query ? `No results for "${query}"` : 'Nothing here.')); return; }

  if (activeMedTab === 'textures') {
    const grid = mkEl('div', 'grid');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${MED_ROOT}/Textures/${name}`, 'tex')));
    sec.appendChild(grid);
  } else if (activeMedTab === 'previews') {
    const grid = mkEl('div', 'grid wide');
    items.forEach(name => grid.appendChild(makeImgCard(name, `${MED_ROOT}/${name}`, 'jpg', true)));
    sec.appendChild(grid);
  } else {
    const grid = mkEl('div', 'grid wider');
    items.forEach(name => grid.appendChild(makeModelCard(name, `${MED_ROOT}/glTF/${name}`, 'med')));
    sec.appendChild(grid);
  }
}

// ── card builders ─────────────────────────────────────────────────────────────
function makeImgCard(name, path, fmt, isPreview = false) {
  const card = mkEl('div', 'asset-card' + (isPreview ? ' preview' : ''));
  card.innerHTML = `
    <span class="badge ${fmt}">${fmt.toUpperCase()}</span>
    <img src="${path}" alt="${name}" loading="lazy">
    <div class="name">${lbl(name)}</div>`;
  card.addEventListener('click', () => openLightbox(name, path));
  return card;
}
function makeModelCard(name, path, fmt) {
  const card = mkEl('div', 'model-card');
  const badge = (fmt === 'anim') ? 'ANIM' : 'GLTF';
  const bg    = fmt === 'nat' ? '#071a0f' : fmt === 'med' ? '#1a1200' : '#0b1a30';
  card.innerHTML = `
    <span class="badge ${fmt}">${badge}</span>
    <model-viewer src="${path}" auto-rotate camera-controls shadow-intensity="1"
      environment-image="neutral" tone-mapping="neutral"
      style="background:${bg}"></model-viewer>
    <div class="name">${lbl(name)}</div>`;
  return card;
}
function makeCharCard(name, path) {
  const card = mkEl('div', 'char-card');
  card.innerHTML = `
    <model-viewer src="${path}" auto-rotate camera-controls shadow-intensity="1"
      environment-image="neutral" tone-mapping="neutral"
      style="background:#0b1a30"></model-viewer>
    <div class="char-info">
      <div class="name">${lbl(name)}</div>
      <div class="sub">.glb · interactive 3D</div>
    </div>`;
  return card;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function lbl(name){ return name.replace(/\.[^.]+$/,'').replace(/_/g,' '); }
function mkEl(tag, cls){ const e=document.createElement(tag); e.className=cls; return e; }
function emptyEl(msg){ return Object.assign(document.createElement('div'),{className:'empty',textContent:msg}); }
function openLightbox(name, path) {
  document.getElementById('lb-img-wrap').innerHTML = `<img src="${path}" alt="${name}">`;
  document.getElementById('lb-name').textContent = lbl(name);
  document.getElementById('lb-path').textContent = path;
  document.getElementById('lightbox').classList.add('open');
}
document.getElementById('lb-close').addEventListener('click', () =>
  document.getElementById('lightbox').classList.remove('open'));
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox'))
    document.getElementById('lightbox').classList.remove('open');
});

renderUI();
</script>
</body>
</html>
"""

# ── server ────────────────────────────────────────────────────────────────────
MIME_TYPES = {
    '.js':    'application/javascript',
    '.mjs':   'application/javascript',
    '.css':   'text/css',
    '.html':  'text/html; charset=utf-8',
    '.json':  'application/json',
    '.png':   'image/png',
    '.jpg':   'image/jpeg',
    '.jpeg':  'image/jpeg',
    '.svg':   'image/svg+xml',
    '.glb':   'model/gltf-binary',
    '.gltf':  'model/gltf+json',
    '.bin':   'application/octet-stream',
    '.webp':  'image/webp',
    '.ico':   'image/x-icon',
}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # ── Asset browser (root) ──────────────────────────────
        if self.path in ('/', '/index.html'):
            ui  = collect_ui_assets()
            kk  = collect_kaykit()
            nat = collect_nature()
            med = collect_medieval()
            html = (HTML
                    .replace('__UI_DATA__',  json.dumps(ui))
                    .replace('__KK_DATA__',  json.dumps(kk))
                    .replace('__NAT_DATA__', json.dumps(nat))
                    .replace('__MED_DATA__', json.dumps(med)))
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(html.encode())

        # ── Game Android entry (redirect /game → /game/) ──────
        elif self.path == '/game':
            self.send_response(301)
            self.send_header('Location', '/game/')
            self.end_headers()

        # ── Game Android root ─────────────────────────────────
        elif self.path in ('/game/', '/game/index.html'):
            self._serve_file('game/index.html', 'text/html; charset=utf-8')

        # ── Game static files (JS, CSS, JSON, icons) ──────────
        elif self.path.startswith('/game/'):
            rel = self.path.lstrip('/')   # "game/js/main.js"
            self._serve_file(rel)

        # ── Everything else (asset packs, static) ─────────────
        else:
            super().do_GET()

    def _serve_file(self, path, content_type=None):
        try:
            ext = os.path.splitext(path)[1].lower()
            ct  = content_type or MIME_TYPES.get(ext, 'application/octet-stream')
            with open(path, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', ct)
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')

    def log_message(self, *a):
        pass

if __name__ == '__main__':
    port = 5000
    print(f'Server berjalan di port {port}')
    print(f'  Asset Browser : http://localhost:{port}/')
    print(f'  Game Android  : http://localhost:{port}/game/')
    HTTPServer(('0.0.0.0', port), Handler).serve_forever()
