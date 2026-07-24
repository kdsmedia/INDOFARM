// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Three.js World Engine
// ═══════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { NATURE_MODELS, HEROES, CROPS } from './data.js';

export class WorldEngine {
  constructor(canvas) {
    this.canvas    = canvas;
    this.scene     = null;
    this.camera    = null;
    this.renderer  = null;
    this.loader    = new GLTFLoader();
    this.clock     = new THREE.Clock();

    // Tracked objects
    this.heroMeshes    = {};   // heroId → { group, baseX, baseZ, phase }
    this.farmMeshes    = [];   // index → mesh (9 plots)
    this.treeMeshes    = [];
    this.buildingObjs  = {};   // buildingId → mesh

    this._ready        = false;
    this._loadQueue    = 0;
    this._onReady      = null;
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
    this._startRenderLoop();
    return this;
  }

  onReady(cb) { this._onReady = cb; }

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
    this.scene.background = new THREE.Color(0x87ceeb);  // sky blue
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.022);
  }

  _setupCamera() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const frust  = 11;
    this.camera  = new THREE.OrthographicCamera(
      -frust * aspect, frust * aspect,
       frust,          -frust,
       0.1, 200
    );
    // Stardew-style angle: high above, slightly south-facing
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
    // Ambient
    const amb = new THREE.AmbientLight(0xfff4e0, 0.7);
    this.scene.add(amb);

    // Sun
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

    // Soft fill from opposite side
    const fill = new THREE.DirectionalLight(0xc0d8ff, 0.4);
    fill.position.set(-6, 10, -8);
    this.scene.add(fill);
  }

  // ── Ground & Grid ─────────────────────────────────────────────
  _buildGround() {
    // Main grass ground
    const geo = new THREE.PlaneGeometry(36, 36, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0x4a8c3f });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Dirt path below farm
    const dirtGeo = new THREE.PlaneGeometry(8, 8);
    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x8b6340 });
    const dirt = new THREE.Mesh(dirtGeo, dirtMat);
    dirt.rotation.x = -Math.PI / 2;
    dirt.position.set(-2, 0.01, 2);
    this.scene.add(dirt);

    // Rocky zone ground
    const rockGeo = new THREE.PlaneGeometry(7, 10);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7060 });
    const rockGround = new THREE.Mesh(rockGeo, rockMat);
    rockGround.rotation.x = -Math.PI / 2;
    rockGround.position.set(7, 0.01, -1);
    this.scene.add(rockGround);

    // Village cobblestone zone
    const villGeo = new THREE.PlaneGeometry(14, 6);
    const villMat = new THREE.MeshLambertMaterial({ color: 0x6a6050 });
    const villGround = new THREE.Mesh(villGeo, villMat);
    villGround.rotation.x = -Math.PI / 2;
    villGround.position.set(1, 0.01, -5.5);
    this.scene.add(villGround);
  }

  _buildFarmGrid() {
    // 9 farm plots (3×3), each 2×2 units, centered at (-2, 0, 2)
    const plotGeo = new THREE.BoxGeometry(1.85, 0.06, 1.85);
    const colors  = [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0x5aaa2a, 0xf5c518];
    const mat     = new THREE.MeshLambertMaterial({ color: colors[0] });

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const m = new THREE.Mesh(plotGeo, mat.clone());
        m.position.set(
          -4 + col * 2,   // x: -4, -2, 0
           0.05,
          -0.5 + row * 2  // z: -0.5, 1.5, 3.5  (inverted for camera)
        );
        m.receiveShadow = true;
        this.scene.add(m);
        this.farmMeshes.push(m);
      }
    }

    // Plow-line markings between plots
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
    // Horizontal road between farm and village
    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.015, -2.5);
    this.scene.add(road1);
    // Vertical road on right side
    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 12), roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.position.set(3.5, 0.015, -1);
    this.scene.add(road2);
  }

  _buildZoneMarkers() {
    // Forest zone base
    const forestMat = new THREE.MeshLambertMaterial({ color: 0x2d5a1b });
    const forestGnd = new THREE.Mesh(new THREE.PlaneGeometry(7, 14), forestMat);
    forestGnd.rotation.x = -Math.PI / 2;
    forestGnd.position.set(-8, 0.01, -1);
    this.scene.add(forestGnd);
  }

  // ── Nature Decorations ────────────────────────────────────────
  _loadNatureDecorations() {
    const treePositions = [
      // Forest zone (left)
      { x: -9, z: -6, s: 1.0, r: 0 },
      { x: -7.5, z: -4, s: 0.85, r: 1.2 },
      { x: -9.5, z: -2, s: 1.1, r: 0.5 },
      { x: -7.8, z: 0.5, s: 0.9, r: 2.1 },
      { x: -9, z: 3, s: 1.0, r: 0.8 },
      { x: -8, z: 5.5, s: 0.95, r: 1.5 },
      { x: -7.2, z: -8, s: 1.2, r: 0.3 },
      { x: -9.2, z: -9, s: 0.8, r: 2.5 },
      // Border trees (top and scattered)
      { x: -2, z: -9, s: 0.9, r: 0 },
      { x: 2,  z: -9, s: 1.1, r: 1 },
      { x: 6,  z: -10, s: 0.8, r: 0.7 },
      { x: 9,  z: -8, s: 1.0, r: 2 },
      // Right border
      { x: 10, z: 3, s: 0.9, r: 0.4 },
      { x: 10, z: 6, s: 1.0, r: 1.8 },
      // Bottom border
      { x: 4,  z: 7.5, s: 0.85, r: 0.6 },
      { x: 0,  z: 8.5, s: 1.0, r: 1.1 },
      { x: -4, z: 8,   s: 0.9, r: 2.0 },
    ];

    const treeModels = NATURE_MODELS.trees;
    this._loadQueue += treePositions.length;

    treePositions.forEach((pos, i) => {
      const modelPath = treeModels[i % treeModels.length];
      this.loader.load(
        modelPath,
        (gltf) => {
          const tree = gltf.scene;
          tree.scale.setScalar(pos.s * 0.8);
          tree.position.set(pos.x, 0, pos.z);
          tree.rotation.y = pos.r;
          tree.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
          this.scene.add(tree);
          this.treeMeshes.push(tree);
          this._checkReady();
        },
        null,
        () => {
          // Fallback: cone tree
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
          g.position.set(pos.x, 0, pos.z);
          g.rotation.y = pos.r;
          g.castShadow = true;
          this.scene.add(g);
          this.treeMeshes.push(g);
          this._checkReady();
        }
      );
    });

    // Rocks in quarry zone
    const rockPositions = [
      { x: 6.5, z: -3.5, s: 0.7 }, { x: 8, z: -2.5, s: 0.9 },
      { x: 7,   z: -1,   s: 0.6 }, { x: 9, z: -4,   s: 0.8 },
      { x: 7.5, z: 0.5,  s: 0.55 },
    ];
    const rockModels = NATURE_MODELS.rocks;
    this._loadQueue += rockPositions.length;
    rockPositions.forEach((pos, i) => {
      const modelPath = rockModels[i % rockModels.length];
      this.loader.load(
        modelPath,
        (gltf) => {
          const rock = gltf.scene;
          rock.scale.setScalar(pos.s);
          rock.position.set(pos.x, 0, pos.z);
          rock.rotation.y = Math.random() * Math.PI * 2;
          rock.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
          this.scene.add(rock);
          this._checkReady();
        },
        null,
        () => {
          const mesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.35 * pos.s, 0),
            new THREE.MeshLambertMaterial({ color: 0x7a7060 })
          );
          mesh.position.set(pos.x, 0.18 * pos.s, pos.z);
          mesh.rotation.y = Math.random() * Math.PI * 2;
          mesh.castShadow = true;
          this.scene.add(mesh);
          this._checkReady();
        }
      );
    });

    // If no async loads queued, mark ready immediately
    if (this._loadQueue <= 0) {
      this._ready = true;
      if (this._onReady) this._onReady();
    }
  }

  // ── Characters ────────────────────────────────────────────────
  loadHero(heroId, heroData) {
    if (this.heroMeshes[heroId]) return; // already loaded
    const def = HEROES[heroId];
    if (!def) return;

    this.loader.load(
      def.model,
      (gltf) => {
        const group = gltf.scene;
        group.scale.setScalar(0.55);
        group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.scene.add(group);

        const z = def.worldZone;
        this.heroMeshes[heroId] = {
          group,
          baseX:  z.x,
          baseZ:  z.z,
          phase:  Math.random() * Math.PI * 2,
          onQuest: false,
        };
        this._updateHeroVisibility(heroId, heroData);
      },
      null,
      () => {
        // Fallback capsule
        const g = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.22, 0.5, 4, 8),
          new THREE.MeshLambertMaterial({ color: parseInt(def.color.replace('#', '0x')) })
        );
        body.position.y = 0.6;
        body.castShadow = true;
        g.add(body);
        this.scene.add(g);
        const z = def.worldZone;
        this.heroMeshes[heroId] = {
          group: g, baseX: z.x, baseZ: z.z,
          phase: Math.random() * Math.PI * 2, onQuest: false,
        };
        this._updateHeroVisibility(heroId, heroData);
      }
    );
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

    // Base platform
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.15, 1.8),
      new THREE.MeshLambertMaterial({ color: 0x8a7060 })
    );
    base.position.y = 0.075;
    base.receiveShadow = true;
    group.add(base);

    // Main body
    let bodyGeo;
    switch (shp) {
      case 'flat':   bodyGeo = new THREE.BoxGeometry(1.6, 0.3, 1.6); break;
      case 'wide':   bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 1.4); break;
      case 'tower':  bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 6); break;
      default:       bodyGeo = new THREE.BoxGeometry(1.4, 1.0, 1.4);
    }
    const body = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshLambertMaterial({ color: colr })
    );
    body.position.y = shp === 'flat' ? 0.3 : shp === 'tower' ? 1.05 : 0.65;
    body.castShadow  = true;
    body.receiveShadow = true;
    group.add(body);

    // Roof
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

    // Level indicator sphere
    const lvlMat = new THREE.MeshLambertMaterial({ color: 0xf5c518, emissive: 0xf5c518, emissiveIntensity: 0.3 });
    const lvlSph = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), lvlMat);
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
    if (sph) {
      const scale = 0.08 + level * 0.04;
      sph.scale.setScalar(scale);
    }
  }

  // ── Update Farm Plots ─────────────────────────────────────────
  updateFarmPlot(index, plotState) {
    const mesh = this.farmMeshes[index];
    if (!mesh) return;
    if (!plotState.crop) {
      mesh.material.color.setHex(0x5c3d0a);
      return;
    }
    const cropDef = (await import('./data.js'))?.CROPS?.[plotState.crop];
    const colors = cropDef?.stageColors ?? [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0x5aaa2a, 0xf5c518];
    mesh.material.color.setHex(colors[Math.min(plotState.stage, colors.length - 1)] ?? 0x5c3d0a);
  }

  updateFarmPlotSync(index, plotState, cropDefs) {
    const mesh = this.farmMeshes[index];
    if (!mesh) return;
    if (!plotState.crop) {
      mesh.material.color.setHex(0x5c3d0a); return;
    }
    const cropDef = cropDefs[plotState.crop];
    const colors  = cropDef?.stageColors ?? [0x5c3d0a, 0x7a5c1a, 0x8aaa2a, 0x5aaa2a, 0xf5c518];
    mesh.material.color.setHex(colors[Math.min(plotState.stage, colors.length - 1)]);
  }

  // ── Render Loop ───────────────────────────────────────────────
  _startRenderLoop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const t = this.clock.getElapsedTime();
      this._animateHeroes(t);
      this._animateBuildingGlow(t);
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  _animateHeroes(t) {
    for (const [id, h] of Object.entries(this.heroMeshes)) {
      if (!h.group.visible || h.onQuest) continue;
      const walkR = 0.7;
      const walkS = 0.4;
      h.group.position.x = h.baseX + Math.cos(t * walkS + h.phase) * walkR;
      h.group.position.z = h.baseZ + Math.sin(t * walkS + h.phase) * walkR;
      h.group.position.y = Math.abs(Math.sin(t * walkS * 2 + h.phase)) * 0.04;
      // Face direction of movement
      const dx = -Math.sin(t * walkS + h.phase);
      const dz =  Math.cos(t * walkS + h.phase);
      h.group.rotation.y = Math.atan2(dx, dz);
    }
  }

  _animateBuildingGlow(t) {
    for (const obj of Object.values(this.buildingObjs)) {
      const sph = obj.userData.lvlSph;
      if (sph) {
        sph.material.emissiveIntensity = 0.2 + 0.15 * Math.sin(t * 2);
      }
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
    // Farm plots
    state.farm.plots.forEach((plot, i) => {
      this.updateFarmPlotSync(i, plot, CROPS_DEF);
    });

    // Buildings
    for (const [bId, bState] of Object.entries(state.buildings)) {
      const def = BUILDINGS_DEF[bId];
      if (def) this.placeBuilding(bId, def, bState.level);
    }

    // Heroes
    for (const [hId, hState] of Object.entries(state.heroes)) {
      if (hState.unlocked) {
        if (!this.heroMeshes[hId]) this.loadHero(hId, hState);
        else this._updateHeroVisibility(hId, hState);
      }
    }
  }
}
