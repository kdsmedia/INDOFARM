// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Three.js World Engine
//  + AnimationMixer untuk animasi berjalan karakter
//  + Highlight karakter yang dipilih sebagai pemimpin
// ═══════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader }     from 'three/addons/loaders/GLTFLoader.js';
import { NATURE_MODELS, HEROES, CROPS } from './data.js';

const ANIM_RIG = '/KayKit_Adventurers_2.0_FREE/Animations/gltf/Rig_Medium_MovementBasic.glb';

export class WorldEngine {
  constructor(canvas) {
    this.canvas    = canvas;
    this.scene     = null;
    this.camera    = null;
    this.renderer  = null;
    this.loader    = new GLTFLoader();
    this.clock     = new THREE.Clock();

    // Tracked objects
    this.heroMeshes    = {};   // heroId → { group, mixer, actions, baseX, baseZ, phase, onQuest, isLeader }
    this.farmMeshes    = [];
    this.treeMeshes    = [];
    this.buildingObjs  = {};
    this.leaderRing    = null; // golden ring under selected hero

    this._ready       = false;
    this._loadQueue   = 0;
    this._onReady     = null;
    this._selectedHero = null;

    // Shared animation clip (walk) loaded from rig file
    this._walkClip    = null;
    this._rigLoaded   = false;
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
    this._loadWalkRig();
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

  // ── Walk Rig ──────────────────────────────────────────────────
  _loadWalkRig() {
    this.loader.load(
      ANIM_RIG,
      (gltf) => {
        // Find the walk/movement clip
        if (gltf.animations.length > 0) {
          this._walkClip = gltf.animations[0];
        }
        this._rigLoaded = true;
        // Apply to any heroes already loaded
        for (const h of Object.values(this.heroMeshes)) {
          if (!h.mixer && this._walkClip) this._attachAnim(h);
        }
      },
      null,
      () => { this._rigLoaded = true; } // fallback — proceed without anim
    );
  }

  _attachAnim(heroObj) {
    if (!this._walkClip || !heroObj?.group) return;
    try {
      heroObj.mixer = new THREE.AnimationMixer(heroObj.group);
      const action  = heroObj.mixer.clipAction(this._walkClip);
      action.setLoop(THREE.LoopRepeat);
      action.play();
      heroObj.walkAction = action;
    } catch (_) { /* model may not be compatible */ }
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

      const z = def.worldZone;
      const heroObj = {
        group,
        mixer:      null,
        walkAction: null,
        baseX:      z.x,
        baseZ:      z.z,
        phase:      Math.random() * Math.PI * 2,
        onQuest:    false,
        isLeader,
      };
      this.heroMeshes[heroId] = heroObj;

      // Attach hero's own embedded animations first
      if (gltf.animations.length > 0) {
        heroObj.mixer = new THREE.AnimationMixer(group);
        const action  = heroObj.mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.play();
        heroObj.walkAction = action;
      } else if (this._walkClip) {
        this._attachAnim(heroObj);
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
      const z = def.worldZone;
      this.heroMeshes[heroId] = {
        group: g, mixer: null, walkAction: null,
        baseX: z.x, baseZ: z.z,
        phase: Math.random() * Math.PI * 2,
        onQuest: false, isLeader,
      };
      this._updateHeroVisibility(heroId, heroData);
    });
  }

  _updateHeroVisibility(heroId, heroState) {
    const h = this.heroMeshes[heroId];
    if (!h) return;
    const onQuest = heroState?.task === 'quest';
    h.onQuest = onQuest;
    h.group.visible = !onQuest;
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

  // ── Hero Animation ────────────────────────────────────────────
  _animateHeroes(t, delta) {
    for (const [id, h] of Object.entries(this.heroMeshes)) {
      if (!h.group.visible || h.onQuest) continue;

      // Update animation mixer (walk cycle from GLTF)
      if (h.mixer) h.mixer.update(delta);

      // Movement path
      const isLeader = id === this._selectedHero;
      const walkR    = isLeader ? 1.0 : 0.7;  // leader patrols wider area
      const walkS    = isLeader ? 0.3 : 0.4;  // leader walks slightly slower, more dignified

      const nx = h.baseX + Math.cos(t * walkS + h.phase) * walkR;
      const nz = h.baseZ + Math.sin(t * walkS + h.phase) * walkR;

      // Smoothly move
      h.group.position.x += (nx - h.group.position.x) * 0.1;
      h.group.position.z += (nz - h.group.position.z) * 0.1;

      // Realistic footstep bobbing (only if no mixer animation)
      if (!h.mixer) {
        h.group.position.y = Math.abs(Math.sin(t * walkS * 2 + h.phase)) * 0.06;
      } else {
        h.group.position.y = 0;
      }

      // Face direction of movement
      const dx = -Math.sin(t * walkS + h.phase);
      const dz =  Math.cos(t * walkS + h.phase);
      h.group.rotation.y = Math.atan2(dx, dz);

      // Leader: update ring position
      if (isLeader && this.leaderRing) {
        this.leaderRing.position.x = h.group.position.x;
        this.leaderRing.position.z = h.group.position.z;
        this.leaderRing.rotation.z = t * 1.5; // spin ring
      }
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
