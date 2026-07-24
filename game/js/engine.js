// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Three.js World Engine
//  + AnimationMixer untuk animasi berjalan karakter
//  + Highlight karakter yang dipilih sebagai pemimpin
// ═══════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader }     from 'three/addons/loaders/GLTFLoader.js';
import { NATURE_MODELS, HEROES, CROPS } from './data.js';

const ANIM_RIG         = '/KayKit_Adventurers_2.0_FREE/Animations/gltf/Rig_Medium/Rig_Medium_MovementBasic.glb';
const ANIM_RIG_GENERAL = '/KayKit_Adventurers_2.0_FREE/Animations/gltf/Rig_Medium/Rig_Medium_General.glb';

// ── Waypoints tepat di atas jalan desa ────────────────────────
const VILLAGE_WAYPOINTS = [
  { x:-8,   z:-2.5 }, // 0  ujung barat jalan utama
  { x:-5,   z:-2.5 }, // 1
  { x:-2,   z:-2.5 }, // 2
  { x: 0,   z:-2.5 }, // 3
  { x: 2,   z:-2.5 }, // 4
  { x: 3.5, z:-2.5 }, // 5  ← persimpangan
  { x: 6,   z:-2.5 }, // 6
  { x: 8,   z:-2.5 }, // 7  ujung timur
  { x: 3.5, z: 4   }, // 8  utara (jalan vertikal)
  { x: 3.5, z: 1   }, // 9
  { x: 3.5, z:-1   }, // 10
  { x: 3.5, z:-5   }, // 11
  { x: 3.5, z:-7   }, // 12 selatan
  { x:-4,   z: 3   }, // 13 area ladang
  { x:-6,   z: 1   }, // 14 area hutan
  { x: 1,   z:-1   }, // 15 pusat desa
  { x:-2,   z:-4   }, // 16 area bangunan
];

// Rute yang bisa dipilih tiap karakter (indeks ke VILLAGE_WAYPOINTS)
const HERO_ROUTES = [
  [0,1,2,3,4,5,6,7,6,5,4,3,2,1],          // jalan utama bolak-balik
  [8,9,10,5,11,12,11,5,10,9,8],            // jalan vertikal
  [13,14,2,3,15,5,3,2,14,13],              // loop ladang
  [5,10,9,8,9,10,5,11,16,5],              // loop bangunan
  [0,2,3,15,4,5,9,8,9,5,6,5,16,3,1],     // jalan jauh
  [14,13,2,15,3,5,9,10,5,3,2,13],         // tengah-desa
];

// Posisi dunia untuk zona quest
const QUEST_ZONES = {
  forest:   { x: 7,  z: 2   },
  mine:     { x: 7,  z:-1   },
  dungeon:  { x:-8,  z:-5   },
  farmland: { x:-4,  z: 4   },
  village:  { x: 1,  z:-3   },
  default:  { x: 5,  z: 4   },
};

// Mapping aktivitas → nama clip animasi (prioritas dari kiri)
const ACTIVITY_CLIPS = {
  walk:    ['Walking_A','Walking_B','Walking_C'],
  run:     ['Running_A','Running_B','Walking_A'],
  idle:    ['Idle_A','Idle_B'],
  harvest: ['Interact','Use_Item','Walking_A'],
  mine:    ['Interact','Use_Item','Walking_A'],
  craft:   ['Interact','Use_Item','Idle_A'],
  hit:     ['Hit_A','Hit_B'],
  death:   ['Death_A','Death_B'],
  spawn:   ['Spawn_Ground','Spawn_Air'],
};

export class WorldEngine {
  constructor(canvas) {
    this.canvas    = canvas;
    this.scene     = null;
    this.camera    = null;
    this.renderer  = null;
    this.loader    = new GLTFLoader();
    this.clock     = new THREE.Clock();

    // Tracked objects
    this.heroMeshes    = {};   // heroId → hero object
    this.farmMeshes    = [];
    this.treeMeshes    = [];
    this.buildingObjs  = {};
    this.leaderRing    = null;

    this._ready        = false;
    this._loadQueue    = 0;
    this._onReady      = null;
    this._selectedHero = null;

    // Animation clips keyed by clip name
    this._clips        = {};   // clipName → THREE.AnimationClip
    this._rigLoaded    = false;
    this._genRigLoaded = false;

    // Battle 3D state
    this._battleActive  = false;
    this._battleHeroes  = [];  // temp hero objects placed in battle scene
  }

  // ── Init ─────────────────────────────────────────────────────
  async init() {
    this._setupScene();
    this._setupCamera();
    this._setupRenderer();
    this._setupLights();
    this._buildGround();
    this._buildFarmGrid();
    this._buildRoads();
    this._buildZoneMarkers();
    this._setupResize();
    this._loadNatureDecorations();
    this._loadAnimRigs();   // load both Movement + General rigs
    this._startRenderLoop();
    return this;
  }

  onReady(cb) { this._onReady = cb; }

  setSelectedHero(heroId) {
    this._selectedHero = heroId;
    this._updateLeaderVisuals();
  }

  _checkReady() {
    this._loadQueue--;
    if (this._loadQueue <= 0) {
      this._ready = true;
      if (this._onReady) this._onReady();
    }
  }

  // ── Scene & Camera ────────────────────────────────────────────
  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.022);
  }

  _setupCamera() {
    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    const frust  = 11;
    this.camera  = new THREE.OrthographicCamera(
      -frust * aspect,  frust * aspect,
       frust,          -frust,
       0.1, 200
    );
    this.camera.position.set(0, 18, 14);
    this.camera.lookAt(0, 0, 0);
  }

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'default',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled  = true;
    this.renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  _setupLights() {
    const amb = new THREE.AmbientLight(0xfff4e0, 0.7);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xfff4c0, 1.4);
    sun.position.set(8, 20, 10);
    sun.castShadow           = true;
    sun.shadow.camera.left   = -20;
    sun.shadow.camera.right  =  20;
    sun.shadow.camera.top    =  20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias          = -0.001;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xc0d8ff, 0.4);
    fill.position.set(-6, 10, -8);
    this.scene.add(fill);
  }

  // ── Ground & Grid ─────────────────────────────────────────────
  _buildGround() {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshLambertMaterial({ color: 0x4a8c3f })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const dirt = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b6340 })
    );
    dirt.rotation.x = -Math.PI / 2;
    dirt.position.set(-2, 0.01, 2);
    this.scene.add(dirt);

    const rockGnd = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 10),
      new THREE.MeshLambertMaterial({ color: 0x7a7060 })
    );
    rockGnd.rotation.x = -Math.PI / 2;
    rockGnd.position.set(7, 0.01, -1);
    this.scene.add(rockGnd);

    const villGnd = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 6),
      new THREE.MeshLambertMaterial({ color: 0x6a6050 })
    );
    villGnd.rotation.x = -Math.PI / 2;
    villGnd.position.set(1, 0.01, -5.5);
    this.scene.add(villGnd);
  }

  _buildFarmGrid() {
    const geo = new THREE.BoxGeometry(1.85, 0.06, 1.85);
    const mat = new THREE.MeshLambertMaterial({ color: 0x5c3d0a });
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const m = new THREE.Mesh(geo, mat.clone());
        m.position.set(-4 + col * 2, 0.05, -0.5 + row * 2);
        m.receiveShadow = true;
        this.scene.add(m);
        this.farmMeshes.push(m);
      }
    }
    const furrowMat = new THREE.MeshLambertMaterial({ color: 0x3a2008 });
    const furrowGeo = new THREE.BoxGeometry(0.08, 0.07, 6.2);
    [-3, -1, 1].forEach(x => {
      const f = new THREE.Mesh(furrowGeo, furrowMat);
      f.position.set(x, 0.06, 1.5);
      this.scene.add(f);
    });
  }

  _buildRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0xb0956a });
    const r1 = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), roadMat);
    r1.rotation.x = -Math.PI / 2;
    r1.position.set(0, 0.015, -2.5);
    this.scene.add(r1);
    const r2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 12), roadMat);
    r2.rotation.x = -Math.PI / 2;
    r2.position.set(3.5, 0.015, -1);
    this.scene.add(r2);
  }

  _buildZoneMarkers() {
    const forestMat = new THREE.MeshLambertMaterial({ color: 0x2d5a1b });
    const forestGnd = new THREE.Mesh(new THREE.PlaneGeometry(7, 14), forestMat);
    forestGnd.rotation.x = -Math.PI / 2;
    forestGnd.position.set(-8, 0.01, -1);
    this.scene.add(forestGnd);
  }

  // ── Leader Ring ───────────────────────────────────────────────
  _makeLeaderRing() {
    const geo = new THREE.TorusGeometry(0.38, 0.06, 8, 24);
    const mat = new THREE.MeshLambertMaterial({
      color: 0xf5c518, emissive: 0xf5c518, emissiveIntensity: 0.6,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    this.scene.add(ring);
    return ring;
  }

  _updateLeaderVisuals() {
    // Remove old ring
    if (this.leaderRing) { this.scene.remove(this.leaderRing); this.leaderRing = null; }

    // Update leader flag on each hero
    for (const [id, h] of Object.entries(this.heroMeshes)) {
      h.isLeader = (id === this._selectedHero);
      // Restore normal scale
      h.group.scale.setScalar(id === this._selectedHero ? 0.72 : 0.55);
    }
  }

  // ── Animation Rigs ────────────────────────────────────────────
  _loadAnimRigs() {
    let pending = 2;
    const done = () => { if (--pending === 0) this._onAllRigsLoaded(); };

    // Movement rig: Walking_A/B/C, Running_A/B, Jump_*
    this.loader.load(ANIM_RIG, (gltf) => {
      gltf.animations.forEach(c => { this._clips[c.name] = c; });
      this._rigLoaded = true;
      done();
    }, null, () => { this._rigLoaded = true; done(); });

    // General rig: Idle_A/B, Hit_A/B, Death_A/B, Interact, Use_Item …
    this.loader.load(ANIM_RIG_GENERAL, (gltf) => {
      gltf.animations.forEach(c => { this._clips[c.name] = c; });
      this._genRigLoaded = true;
      done();
    }, null, () => { this._genRigLoaded = true; done(); });
  }

  _onAllRigsLoaded() {
    // Attach animations to any heroes already in the scene
    for (const h of Object.values(this.heroMeshes)) {
      if (!h.mixer) this._attachAllAnims(h);
    }
  }

  // Attach all available clips to a hero via AnimationMixer
  _attachAllAnims(heroObj) {
    if (!heroObj?.group || Object.keys(this._clips).length === 0) return;
    try {
      heroObj.mixer   = new THREE.AnimationMixer(heroObj.group);
      heroObj.actions = {};
      for (const [name, clip] of Object.entries(this._clips)) {
        const action = heroObj.mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        heroObj.actions[name] = action;
      }
      // Start with walk
      this._playClip(heroObj, 'walk');
    } catch (_) { /* model geometry not compatible */ }
  }

  // Play a clip category (walk/idle/run/harvest/hit/death) on a hero
  _playClip(heroObj, activity, crossfadeSec = 0.25) {
    const names = ACTIVITY_CLIPS[activity] ?? ACTIVITY_CLIPS.walk;
    const clip  = names.find(n => heroObj.actions?.[n]);
    if (!clip || !heroObj.actions) return;
    const next = heroObj.actions[clip];
    if (!next) return;
    if (heroObj._currentAction && heroObj._currentAction !== next) {
      heroObj._currentAction.fadeOut(crossfadeSec);
      next.reset().fadeIn(crossfadeSec).play();
    } else {
      next.reset().play();
    }
    heroObj._currentActivity = activity;
    heroObj._currentAction   = next;
  }

  // ── Nature Decorations ────────────────────────────────────────
  _loadNatureDecorations() {
    const treePositions = [
      { x: -9,   z: -6,  s: 1.0, r: 0   },
      { x: -7.5, z: -4,  s: 0.85,r: 1.2 },
      { x: -9.5, z: -2,  s: 1.1, r: 0.5 },
      { x: -7.8, z: 0.5, s: 0.9, r: 2.1 },
      { x: -9,   z: 3,   s: 1.0, r: 0.8 },
      { x: -8,   z: 5.5, s: 0.95,r: 1.5 },
      { x: -7.2, z: -8,  s: 1.2, r: 0.3 },
      { x: -9.2, z: -9,  s: 0.8, r: 2.5 },
      { x: -2,   z: -9,  s: 0.9, r: 0   },
      { x: 2,    z: -9,  s: 1.1, r: 1   },
      { x: 6,    z: -10, s: 0.8, r: 0.7 },
      { x: 9,    z: -8,  s: 1.0, r: 2   },
      { x: 10,   z: 3,   s: 0.9, r: 0.4 },
      { x: 10,   z: 6,   s: 1.0, r: 1.8 },
      { x: 4,    z: 7.5, s: 0.85,r: 0.6 },
      { x: 0,    z: 8.5, s: 1.0, r: 1.1 },
      { x: -4,   z: 8,   s: 0.9, r: 2.0 },
    ];
    const treeModels = NATURE_MODELS.trees;
    this._loadQueue += treePositions.length;

    treePositions.forEach((pos, i) => {
      const path = treeModels[i % treeModels.length];
      this.loader.load(path, (gltf) => {
        const tree = gltf.scene;
        tree.scale.setScalar(pos.s * 0.8);
        tree.position.set(pos.x, 0, pos.z);
        tree.rotation.y = pos.r;
        tree.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.scene.add(tree);
        this.treeMeshes.push(tree);
        this._checkReady();
      }, null, () => {
        const g = new THREE.Group();
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 0.5),
          new THREE.MeshLambertMaterial({ color: 0x5c3d1e })
        );
        trunk.position.y = 0.25;
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(0.5 * pos.s, 1.2 * pos.s, 7),
          new THREE.MeshLambertMaterial({ color: 0x2d7a2d })
        );
        crown.position.y = 0.5 + 0.6 * pos.s;
        g.add(trunk); g.add(crown);
        g.position.set(pos.x, 0, pos.z); g.rotation.y = pos.r;
        this.scene.add(g); this.treeMeshes.push(g);
        this._checkReady();
      });
    });

    const rockPositions = [
      { x: 6.5, z: -3.5, s: 0.7 }, { x: 8, z: -2.5, s: 0.9 },
      { x: 7,   z: -1,   s: 0.6 }, { x: 9, z: -4,   s: 0.8 },
      { x: 7.5, z: 0.5,  s: 0.55 },
    ];
    const rockModels = NATURE_MODELS.rocks;
    this._loadQueue += rockPositions.length;

    rockPositions.forEach((pos, i) => {
      this.loader.load(rockModels[i % rockModels.length], (gltf) => {
        const rock = gltf.scene;
        rock.scale.setScalar(pos.s);
        rock.position.set(pos.x, 0, pos.z);
        rock.rotation.y = Math.random() * Math.PI * 2;
        rock.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.scene.add(rock);
        this._checkReady();
      }, null, () => {
        const mesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.35 * pos.s, 0),
          new THREE.MeshLambertMaterial({ color: 0x7a7060 })
        );
        mesh.position.set(pos.x, 0.18 * pos.s, pos.z);
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.castShadow = true;
        this.scene.add(mesh);
        this._checkReady();
      });
    });

    if (this._loadQueue <= 0) { this._ready = true; if (this._onReady) this._onReady(); }
  }

  // ── Characters ────────────────────────────────────────────────
  loadHero(heroId, heroData) {
    if (this.heroMeshes[heroId]) return;
    const def = HEROES[heroId];
    if (!def) return;

    this.loader.load(def.model, (gltf) => {
      const group = gltf.scene;
      const isLeader = heroId === this._selectedHero;
      group.scale.setScalar(isLeader ? 0.72 : 0.55);
      group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.scene.add(group);

      const z         = def.worldZone;
      const routeIdx  = Object.keys(this.heroMeshes).length % HERO_ROUTES.length;
      const heroObj = {
        group,
        mixer:           null,
        actions:         {},
        _currentAction:  null,
        _currentActivity:'walk',
        baseX:           z.x,
        baseZ:           z.z,
        // Waypoint navigation
        route:           HERO_ROUTES[routeIdx],
        routeStep:       Math.floor(Math.random() * HERO_ROUTES[routeIdx].length),
        idleTimer:       0,
        // Quest
        onQuest:         false,
        questPos:        null,
        // Battle
        inBattle:        false,
        isLeader,
      };
      group.position.set(z.x, 0, z.z); // start at home position
      this.heroMeshes[heroId] = heroObj;

      // Attach rig animations if already loaded, otherwise they'll attach later
      if (Object.keys(this._clips).length > 0) {
        this._attachAllAnims(heroObj);
      }

      this._updateHeroVisibility(heroId, heroData);

      // Leader ring
      if (isLeader) { this._updateLeaderVisuals(); }
    }, null, () => {
      // Fallback capsule
      const g = new THREE.Group();
      const isLeader = heroId === this._selectedHero;
      const colorHex = parseInt((def.color || '#888').replace('#', ''), 16);
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.5, 4, 8),
        new THREE.MeshLambertMaterial({ color: colorHex })
      );
      body.position.y = 0.6;
      body.castShadow = true;
      g.add(body);

      // Leader crown on capsule
      if (isLeader) {
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.25, 5),
          new THREE.MeshLambertMaterial({ color: 0xf5c518, emissive: 0xf5c518, emissiveIntensity: 0.5 })
        );
        crown.position.y = 1.15;
        g.add(crown);
      }
      this.scene.add(g);
      const z        = def.worldZone;
      const routeIdx = Object.keys(this.heroMeshes).length % HERO_ROUTES.length;
      this.heroMeshes[heroId] = {
        group: g, mixer: null, actions: {}, _currentAction: null, _currentActivity: 'walk',
        baseX: z.x, baseZ: z.z,
        route: HERO_ROUTES[routeIdx],
        routeStep: Math.floor(Math.random() * HERO_ROUTES[routeIdx].length),
        idleTimer: 0, onQuest: false, questPos: null, inBattle: false, isLeader,
      };
      g.position.set(z.x, 0, z.z);
      this._updateHeroVisibility(heroId, heroData);
    });
  }

  // ── Hero Visibility & Activity ────────────────────────────────
  _updateHeroVisibility(heroId, heroState) {
    const h = this.heroMeshes[heroId];
    if (!h) return;
    const task = heroState?.task ?? 'idle';
    h.onQuest = (task === 'quest');
    h.group.visible = true; // always visible — quest heroes walk to quest zone

    if (task === 'quest') {
      // Find which quest zone the hero is in
      const qid  = heroState?.questId ?? 'default';
      h.questPos = QUEST_ZONES[qid] ?? QUEST_ZONES.default;
    } else {
      h.questPos = null;
    }

    // Switch animation based on task
    if (h.mixer) {
      const actMap = {
        idle: 'idle', farming: 'harvest', mining: 'mine',
        crafting: 'craft', quest: 'walk', default: 'walk',
      };
      this._playClip(h, actMap[task] ?? 'walk');
    }
  }

  // Public: manually set hero activity & clip
  setHeroActivity(heroId, activity) {
    const h = this.heroMeshes[heroId];
    if (h?.mixer) this._playClip(h, activity);
  }

  // ── Buildings ─────────────────────────────────────────────────
  placeBuilding(buildingId, buildingDef, level) {
    if (this.buildingObjs[buildingId]) {
      this._updateBuildingLevel(buildingId, level);
      return;
    }
    const pos  = buildingDef.worldPos;
    const colr = buildingDef.color;
    const shp  = buildingDef.shape;
    const group = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.15, 1.8),
      new THREE.MeshLambertMaterial({ color: 0x8a7060 })
    );
    base.position.y = 0.075; base.receiveShadow = true;
    group.add(base);

    let bodyGeo;
    switch (shp) {
      case 'flat':  bodyGeo = new THREE.BoxGeometry(1.6, 0.3, 1.6); break;
      case 'wide':  bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 1.4); break;
      case 'tower': bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 6); break;
      default:      bodyGeo = new THREE.BoxGeometry(1.4, 1.0, 1.4);
    }
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color: colr }));
    body.position.y = shp === 'flat' ? 0.3 : shp === 'tower' ? 1.05 : 0.65;
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);

    if (shp !== 'flat') {
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x8b2500 });
      const roof = shp === 'tower'
        ? new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 6), roofMat)
        : new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.7, 4), roofMat);
      roof.position.y = shp === 'tower' ? 2.35 : 1.5;
      if (shp !== 'tower') roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
    }

    const lvlSph = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0xf5c518, emissive: 0xf5c518, emissiveIntensity: 0.3 })
    );
    lvlSph.position.set(0.7, 2.0, 0.7);
    group.add(lvlSph);
    group.userData.lvlSph = lvlSph;

    group.position.set(pos.x, 0, pos.z);
    this.scene.add(group);
    this.buildingObjs[buildingId] = group;
  }

  removeBuilding(buildingId) {
    const obj = this.buildingObjs[buildingId];
    if (obj) { this.scene.remove(obj); delete this.buildingObjs[buildingId]; }
  }

  _updateBuildingLevel(buildingId, level) {
    const obj = this.buildingObjs[buildingId];
    if (!obj) return;
    const sph = obj.userData.lvlSph;
    if (sph) sph.scale.setScalar(0.08 + level * 0.04);
  }

  // ── Farm Plots ────────────────────────────────────────────────
  updateFarmPlotSync(index, plotState, cropDefs) {
    const mesh = this.farmMeshes[index];
    if (!mesh) return;
    if (!plotState.crop) { mesh.material.color.setHex(0x5c3d0a); return; }
    const cropDef = cropDefs[plotState.crop];
    const colors  = cropDef?.stageColors ?? [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0x5aaa2a, 0xf5c518];
    mesh.material.color.setHex(colors[Math.min(plotState.stage, colors.length - 1)]);
  }

  // ── Render Loop ───────────────────────────────────────────────
  _startRenderLoop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const delta = this.clock.getDelta();
      const t     = this.clock.elapsedTime;
      this._animateHeroes(t, delta);
      this._animateBuildingGlow(t);
      this._animateLeaderRing(t);
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  // ── Hero Animation — waypoint-based movement ─────────────────
  _animateHeroes(t, delta) {
    for (const [id, h] of Object.entries(this.heroMeshes)) {
      if (!h.group || h.inBattle) continue;

      // Always update mixer
      if (h.mixer) h.mixer.update(delta);

      // Footstep bob if no rig loaded
      if (!h.mixer) {
        h.group.position.y = Math.abs(Math.sin(t * 3)) * 0.05;
      } else {
        h.group.position.y = 0;
      }

      // ── Idle pause ──
      if (h.idleTimer > 0) {
        h.idleTimer -= delta;
        if (h.idleTimer <= 0) {
          h.idleTimer = 0;
          this._playClip(h, h.onQuest ? 'walk' : 'walk');
        }
        this._updateLeaderRing(h, t);
        continue;
      }

      // ── Determine target position ──
      let targetX, targetZ;
      const isLeader = id === this._selectedHero;

      if (h.onQuest && h.questPos) {
        // Quest hero: walk toward quest zone, then small patrol circle there
        const qx = h.questPos.x, qz = h.questPos.z;
        const distToZone = Math.hypot(h.group.position.x - qx, h.group.position.z - qz);
        if (distToZone < 1.5) {
          // At quest zone — patrol small circle
          targetX = qx + Math.cos(t * 0.4 + h.baseX) * 0.8;
          targetZ = qz + Math.sin(t * 0.4 + h.baseX) * 0.8;
        } else {
          targetX = qx;
          targetZ = qz;
        }
      } else {
        // Normal waypoint navigation on village paths
        const route = h.route ?? HERO_ROUTES[0];
        const wpIdx = route[h.routeStep % route.length];
        const wp    = VILLAGE_WAYPOINTS[wpIdx];
        if (!wp) { h.routeStep = 0; continue; }
        targetX = wp.x;
        targetZ = wp.z;

        // Check if reached waypoint
        const dist = Math.hypot(h.group.position.x - targetX, h.group.position.z - targetZ);
        if (dist < 0.2) {
          h.routeStep = (h.routeStep + 1) % route.length;
          // Occasionally pause to idle (10% chance at each waypoint)
          if (!isLeader && Math.random() < 0.10) {
            h.idleTimer = 0.8 + Math.random() * 1.5;
            this._playClip(h, 'idle', 0.2);
          }
          continue;
        }
      }

      // ── Move toward target ──
      const speed = isLeader ? 1.6 : 2.0;
      const dx    = targetX - h.group.position.x;
      const dz    = targetZ - h.group.position.z;
      const dist  = Math.hypot(dx, dz);
      const step  = Math.min(speed * delta, dist);

      h.group.position.x += (dx / dist) * step;
      h.group.position.z += (dz / dist) * step;

      // Face movement direction smoothly
      const targetAngle = Math.atan2(dx, dz);
      const da = targetAngle - h.group.rotation.y;
      const da2 = ((da + Math.PI) % (Math.PI * 2)) - Math.PI; // shortest rotation
      h.group.rotation.y += da2 * Math.min(delta * 8, 1);

      // Ensure walk animation is playing
      if (h._currentActivity !== 'walk' && h.idleTimer <= 0) {
        this._playClip(h, 'walk', 0.3);
      }

      this._updateLeaderRing(h, t);
    }
  }

  _updateLeaderRing(h, t) {
    if (h.isLeader && this.leaderRing) {
      this.leaderRing.position.x = h.group.position.x;
      this.leaderRing.position.z = h.group.position.z;
      this.leaderRing.rotation.z = t * 1.5;
    }
  }

  _animateBuildingGlow(t) {
    for (const obj of Object.values(this.buildingObjs)) {
      const sph = obj.userData.lvlSph;
      if (sph) sph.material.emissiveIntensity = 0.2 + 0.15 * Math.sin(t * 2);
    }
  }

  _animateLeaderRing(t) {
    if (this.leaderRing) {
      // Pulse glow
      this.leaderRing.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 3);
    }
  }

  // ── Resize ─────────────────────────────────────────────────────
  _setupResize() {
    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _onResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const frust  = 11;
    this.camera.left   = -frust * aspect;
    this.camera.right  =  frust * aspect;
    this.camera.top    =  frust;
    this.camera.bottom = -frust;
    this.camera.updateProjectionMatrix();
  }

  // ── Battle 3D System ─────────────────────────────────────────
  // Pindahkan semua hero unlocked ke posisi battle, jalankan animasi pertarungan
  // onDone dipanggil setelah selesai (berhasil/kalah)
  startBattle3D(heroIds, won, onDone) {
    if (this._battleActive) return;
    this._battleActive = true;

    const PLAYER_X = -3, ENEMY_X = 3, BATTLE_Z = -2.5;

    // Simpan posisi asli dan pindah ke posisi battle
    const participants = heroIds
      .map(id => this.heroMeshes[id])
      .filter(Boolean);

    participants.forEach((h, i) => {
      h.inBattle = true;
      h._preBattlePos = h.group.position.clone();
      h._preBattleRot = h.group.rotation.y;
      h.group.position.set(PLAYER_X - i * 0.6, 0, BATTLE_Z + (i % 2) * 0.5);
      h.group.rotation.y = Math.PI / 2; // hadap kanan (ke musuh)
    });

    // Buat musuh (capsule berwarna merah)
    const enemyCount = Math.max(1, Math.min(participants.length + 1, 4));
    const enemies    = [];
    for (let i = 0; i < enemyCount; i++) {
      const g   = new THREE.Group();
      const hex = [0xcc2222, 0xaa1111, 0xdd3322][i % 3];
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.5, 4, 8),
        new THREE.MeshLambertMaterial({ color: hex })
      );
      body.position.y = 0.6;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x880000 })
      );
      head.position.y = 1.1;
      // Horns
      [-.15, .15].forEach(ox => {
        const horn = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.2, 4),
          new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        horn.position.set(ox, 1.35, 0);
        g.add(horn);
      });
      g.add(body); g.add(head);
      g.position.set(ENEMY_X + i * 0.5, 0, BATTLE_Z + (i % 2) * 0.5);
      g.rotation.y = -Math.PI / 2; // hadap kiri (ke player)
      this.scene.add(g);
      enemies.push(g);
    }

    // ── Phase 1 (0ms): CHARGE — semua berlari ke tengah ─────────
    setTimeout(() => {
      participants.forEach(h => {
        if (h.mixer) this._playClip(h, 'run', 0.2);
      });
    }, 0);

    // ── Phase 2 (1200ms): CLASH — heroes dan musuh berbenturan ──
    let clashIv = null;
    setTimeout(() => {
      participants.forEach((h, i) => {
        h.group.position.x = -0.6 - i * 0.35;
        h.group.position.z = BATTLE_Z + (i % 2) * 0.4;
        if (h.mixer) this._playClip(h, 'hit', 0.15);
      });
      enemies.forEach((e, i) => {
        e.position.x = 0.5 + i * 0.35;
        e.position.z = BATTLE_Z + (i % 2) * 0.4;
      });

      // Getaran posisi selama pertempuran
      let shake = 0;
      clashIv = setInterval(() => {
        shake++;
        participants.forEach((h, i) => {
          h.group.position.x = -0.6 - i * 0.35 + (Math.random() - 0.5) * 0.12;
          h.group.position.z = BATTLE_Z + (i % 2) * 0.4 + (Math.random() - 0.5) * 0.08;
        });
        enemies.forEach((e, i) => {
          e.position.x = 0.5 + i * 0.35 + (Math.random() - 0.5) * 0.12;
          e.position.z = BATTLE_Z + (i % 2) * 0.4 + (Math.random() - 0.5) * 0.08;
        });
        // Jika kalah: hero mundur
        if (shake > 20 && !won) {
          participants.forEach(h => {
            h.group.position.x -= 0.03;
          });
        }
        // Musuh yang mati: scale down
        if (shake > 15 && won) {
          enemies.slice(0, Math.ceil(enemies.length * 0.6)).forEach(e => {
            e.scale.setScalar(Math.max(0.05, e.scale.x - 0.02));
          });
        }
      }, 80);
    }, 1200);

    // ── Phase 3 (4000ms): AKHIR — kembalikan hero ke posisi ─────
    setTimeout(() => {
      if (clashIv) clearInterval(clashIv);

      // Hapus musuh dengan fade out
      enemies.forEach(e => {
        let sc = e.scale.x;
        const iv = setInterval(() => {
          sc -= 0.05;
          e.scale.setScalar(Math.max(0, sc));
          if (sc <= 0) { clearInterval(iv); this.scene.remove(e); }
        }, 30);
      });

      // Hero animation: kemenangan atau kekalahan
      participants.forEach(h => {
        if (h.mixer) this._playClip(h, won ? 'spawn' : 'death', 0.3);
      });

      // ── Phase 4 (5500ms): Kembali ke posisi normal ───────────
      setTimeout(() => {
        participants.forEach(h => {
          h.inBattle = false;
          if (h._preBattlePos) {
            h.group.position.copy(h._preBattlePos);
            h.group.rotation.y = h._preBattleRot ?? 0;
          }
          if (h.mixer) this._playClip(h, 'walk', 0.4);
        });
        this._battleActive = false;
        onDone?.();
      }, 1500);
    }, 4000);
  }

  // ── World State Sync ──────────────────────────────────────────
  syncState(state, CROPS_DEF, BUILDINGS_DEF) {
    state.farm.plots.forEach((plot, i) => {
      this.updateFarmPlotSync(i, plot, CROPS_DEF);
    });
    for (const [bId, bState] of Object.entries(state.buildings)) {
      const def = BUILDINGS_DEF[bId];
      if (def) this.placeBuilding(bId, def, bState.level);
    }
    for (const [hId, hState] of Object.entries(state.heroes)) {
      if (hState.unlocked) {
        if (!this.heroMeshes[hId]) this.loadHero(hId, hState);
        else this._updateHeroVisibility(hId, hState);
      }
    }

    // Ensure leader ring exists for selected hero
    if (this._selectedHero && this.heroMeshes[this._selectedHero] && !this.leaderRing) {
      this.leaderRing = this._makeLeaderRing();
    }
  }
}
