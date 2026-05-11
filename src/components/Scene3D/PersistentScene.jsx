import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COLORS, getPerformanceTier, easeInOutCubic } from '../../styles/tokens';

// ─── Texture etoile (douce) ─────────────────────────────────────────────────
function makeStarTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0,    'rgba(255,250,240,1)');
  g.addColorStop(0.15, 'rgba(245,238,220,0.95)');
  g.addColorStop(0.5,  'rgba(212,193,154,0.35)');
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ─── Texture etoile brillante AMELIOREE (halo + spikes Hubble) ──────────────
function makeBrightStarTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const cx = 128, cy = 128;
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
  halo.addColorStop(0,    'rgba(255,255,255,0.95)');
  halo.addColorStop(0.05, 'rgba(255,250,240,0.6)');
  halo.addColorStop(0.15, 'rgba(255,240,210,0.3)');
  halo.addColorStop(0.35, 'rgba(255,220,170,0.12)');
  halo.addColorStop(0.7,  'rgba(180,150,100,0.04)');
  halo.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalCompositeOperation = 'lighter';
  const drawSpike = (angle, length, width) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(-length, 0, length, 0);
    grad.addColorStop(0,   'rgba(255,255,255,0)');
    grad.addColorStop(0.4, 'rgba(255,250,230,0.4)');
    grad.addColorStop(0.5, 'rgba(255,255,255,1)');
    grad.addColorStop(0.6, 'rgba(255,250,230,0.4)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-length, -width/2, length * 2, width);
    ctx.restore();
  };
  drawSpike(0,             115, 1.4);
  drawSpike(Math.PI / 2,   115, 1.4);
  drawSpike(Math.PI / 4,   60,  0.8);
  drawSpike(-Math.PI / 4,  60,  0.8);
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function makeEnvironmentMap(tier) {
  const size = tier === 'low' ? 256 : 512;
  const faces = [];
  faces.push(...[
    ['#000000', '#1a0f05', '#ffd97a', 'highlight'],
    ['#000000', '#0a0805', '#3a2a15', 'normal'],
    ['#000000', '#2a1a08', '#ffd97a', 'highlight'],
    ['#000000', '#000000', '#0a0805', 'dark'],
    ['#000000', '#1a1005', '#ffb850', 'highlight'],
    ['#000000', '#0a0805', '#1a1005', 'normal'],
  ].map(([c1, c2, c3, type]) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, size, size);
    if (type === 'highlight') {
      const g = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.45);
      g.addColorStop(0, c3); g.addColorStop(0.3, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    } else if (type === 'normal') {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    }
    return cv;
  }));
  const tex = new THREE.CubeTexture(faces);
  tex.needsUpdate = true;
  return tex;
}

function makeStarfield(starTex, tier) {
  const N = tier === 'low' ? 1500 : tier === 'medium' ? 3000 : 5000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const palette = [
    [1.0, 0.97, 0.88], [0.95, 0.92, 0.82],
    [1.0, 0.88, 0.65], [0.85, 0.92, 1.0],
  ];
  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 8 + Math.pow(Math.random(), 0.4) * 30;
    const yspread = (Math.random() - 0.5) * 25;
    pos[i*3]   = Math.cos(theta) * r;
    pos[i*3+1] = yspread;
    pos[i*3+2] = Math.sin(theta) * r - 5;
    const c = palette[Math.floor(Math.random() * palette.length)];
    const bright = 0.4 + Math.random() * 0.6;
    col[i*3]   = c[0] * bright;
    col[i*3+1] = c[1] * bright;
    col[i*3+2] = c[2] * bright;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, map: starTex,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 1.0,
  }));
}

const CONSTELLATIONS = [
  {
    name: 'GRANDE OURSE',
    stars: [
      { x: -3.5, y:  1.8, z: -1, mag: 1.8, name: 'Dubhe' },
      { x: -2.8, y:  1.5, z: -1, mag: 2.4, name: 'Merak' },
      { x: -2.0, y:  1.4, z: -1, mag: 2.4, name: 'Phecda' },
      { x: -1.2, y:  1.0, z: -1, mag: 3.3, name: 'Megrez' },
      { x: -0.4, y:  0.7, z: -1, mag: 1.8, name: 'Alioth' },
      { x:  0.4, y:  0.4, z: -1, mag: 2.3, name: 'Mizar' },
      { x:  1.2, y:  0.0, z: -1, mag: 1.9, name: 'Alkaid' },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,3]],
  },
  {
    name: 'ORION',
    stars: [
      { x:  2.8, y:  1.5, z: 0, mag: 0.5, name: 'Betelgeuse' },
      { x:  1.8, y:  1.6, z: 0, mag: 1.6, name: 'Bellatrix' },
      { x:  2.2, y:  0.4, z: 0, mag: 1.7, name: 'Alnitak' },
      { x:  2.5, y:  0.4, z: 0, mag: 1.7, name: 'Alnilam' },
      { x:  2.8, y:  0.4, z: 0, mag: 2.2, name: 'Mintaka' },
      { x:  3.0, y: -1.0, z: 0, mag: 0.1, name: 'Rigel' },
      { x:  1.8, y: -1.0, z: 0, mag: 2.0, name: 'Saiph' },
    ],
    connections: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]],
  },
  {
    name: 'CASSIOPEE',
    stars: [
      { x: -2.5, y: -1.0, z: 1, mag: 2.2, name: 'Caph' },
      { x: -2.0, y: -1.8, z: 1, mag: 2.1, name: 'Schedar' },
      { x: -1.2, y: -1.2, z: 1, mag: 2.5, name: 'Gamma Cas' },
      { x: -0.6, y: -1.8, z: 1, mag: 2.7, name: 'Ruchbah' },
      { x:  0.2, y: -1.2, z: 1, mag: 3.4, name: 'Segin' },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4]],
  },
];

const magToSize = (mag) => Math.max(0.06, 0.18 - mag * 0.025);
const magToOpacity = (mag) => Math.max(0.55, 1.0 - mag * 0.08);

export default function PersistentScene({ activeSectionRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mx: 0, my: 0,
    currentMorph: 0,
    targetMorph: 0,
    morphProgress: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tier = getPerformanceTier();
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: tier !== 'low',
      powerPreference: 'high-performance', stencil: false,
    });
    renderer.setSize(W, H);
    const maxPR = tier === 'low' ? 1 : tier === 'medium' ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPR));
    renderer.setClearColor(COLORS.bg, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);

    const envMap = makeEnvironmentMap(tier);
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0x1a1208, 0.25));
    const keyLight  = new THREE.PointLight(COLORS.goldGlow, 4.5, 25);
    const fillLight = new THREE.PointLight(COLORS.goldDeep, 2.5, 20);
    const rimLight  = new THREE.PointLight(COLORS.goldGlow, 3.0, 15);
    keyLight.position.set(2, 5, 4);
    fillLight.position.set(4, -1, 3);
    rimLight.position.set(0, 0, -3);
    scene.add(keyLight); scene.add(fillLight); scene.add(rimLight);

    const starTex = makeStarTexture();
    const brightStarTex = makeBrightStarTexture();
    const starfield = makeStarfield(starTex, tier);
    scene.add(starfield);

    // ── SPHERE PRINCIPALE ────────────────────────────────────────────────────
    const sphereSegs = tier === 'low' ? 32 : tier === 'medium' ? 64 : 96;
    const sphereGeo = new THREE.SphereGeometry(1.8, sphereSegs, sphereSegs);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: COLORS.blackMetal, metalness: 1.0, roughness: 0.08,
      envMap, envMapIntensity: 2.5,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // ── HALOS ───────────────────────────────────────────────────────────────
    const makeHaloTexture = (color1, color2) => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 256;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, color1);
      g.addColorStop(0.3, color2);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(cv);
    };
    const haloTexGold  = makeHaloTexture('rgba(255,217,122,0.7)', 'rgba(212,193,154,0.4)');
    const haloTexWhite = makeHaloTexture('rgba(255,255,255,1)',   'rgba(170,210,255,0.6)');

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexGold, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.5,
    }));
    halo.scale.set(7, 7, 1);
    halo.position.set(0, 0, -2);
    scene.add(halo);

    const dwarfGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexWhite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0,
    }));
    dwarfGlow.scale.set(4, 4, 1);
    dwarfGlow.position.set(0, 0, -0.5);
    scene.add(dwarfGlow);

    // ── Arcs magnetiques naine blanche ───────────────────────────────────────
    const dwarfArcsGroup = new THREE.Group();
    dwarfArcsGroup.visible = false;
    scene.add(dwarfArcsGroup);
    const NB_ARCS = tier === 'low' ? 12 : 20;
    const dwarfArcs = [];
    for (let i = 0; i < NB_ARCS; i++) {
      const radius = 1.4 + Math.random() * 1.8;
      const tube   = 0.006 + Math.random() * 0.008;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 4, 96),
        new THREE.MeshBasicMaterial({
          color: 0xb8dcff, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      arc.rotation.x = Math.random() * Math.PI;
      arc.rotation.y = Math.random() * Math.PI;
      arc.rotation.z = Math.random() * Math.PI;
      arc.scale.set(1, 0.4 + Math.random() * 0.5, 1);
      dwarfArcsGroup.add(arc);
      dwarfArcs.push({
        mesh: arc,
        baseRotX: arc.rotation.x, baseRotY: arc.rotation.y, baseRotZ: arc.rotation.z,
        speedX: (Math.random() - 0.5) * 0.0015,
        speedY: (Math.random() - 0.5) * 0.0015,
        speedZ: (Math.random() - 0.5) * 0.001,
        flickerSpeed: 1.5 + Math.random() * 2.5,
        flickerOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.4 + Math.random() * 0.5,
      });
    }

    // ── ABOUT : SYSTEME STELLAIRE BINAIRE ───────────────────────────────────
    const aboutGroup = new THREE.Group();
    aboutGroup.visible = false;
    scene.add(aboutGroup);

    const aboutStarA = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0xd4c19a, metalness: 0.85, roughness: 0.15,
        envMap, envMapIntensity: 2.0,
        emissive: 0xffd97a, emissiveIntensity: 0.25,
      })
    );
    aboutGroup.add(aboutStarA);

    const aboutStarB = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x8a6f3f, metalness: 0.9, roughness: 0.2,
        envMap, envMapIntensity: 1.8,
        emissive: 0x6a4f1f, emissiveIntensity: 0.4,
      })
    );
    aboutGroup.add(aboutStarB);

    const aboutHaloTex = makeHaloTexture('rgba(255,217,122,0.4)', 'rgba(212,193,154,0.15)');
    const aboutHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: aboutHaloTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0,
    }));
    aboutHalo.scale.set(8, 8, 1);
    aboutHalo.position.set(0, 0, -1);
    aboutGroup.add(aboutHalo);

    const aboutOrbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.006, 6, 180),
      new THREE.MeshBasicMaterial({
        color: 0xd4c19a, transparent: true, opacity: 0,
      })
    );
    aboutOrbit.rotation.x = Math.PI / 2.3;
    aboutOrbit.scale.set(1, 0.45, 1);
    aboutGroup.add(aboutOrbit);

    const DUST_COUNT = tier === 'low' ? 80 : tier === 'medium' ? 150 : 240;
    const dustPos = new Float32Array(DUST_COUNT * 3);
    const dustData = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 2.5;
      const yspread = (Math.random() - 0.5) * 0.4;
      dustPos[i*3]   = Math.cos(angle) * r;
      dustPos[i*3+1] = yspread;
      dustPos[i*3+2] = Math.sin(angle) * r;
      dustData.push({ baseAngle: angle, radius: r, yBase: yspread, speed: 0.08 + Math.random() * 0.12 });
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffd97a, size: 0.07, map: starTex,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    aboutGroup.add(dust);

    // ── Anneaux orbitaux (hero) ──────────────────────────────────────────────
    const rings = [];
    [2.6, 3.2, 4.0].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 6, 140),
        new THREE.MeshBasicMaterial({
          color: COLORS.goldPale, transparent: true, opacity: 0,
        })
      );
      ring.rotation.x = Math.PI / 2.3 + i * 0.2;
      ring.rotation.z = i * 0.6;
      scene.add(ring);
      rings.push(ring);
    });

    // ── PROJECTS GROUP ───────────────────────────────────────────────────────
    const projectsGroup = new THREE.Group();
    projectsGroup.visible = false;
    projectsGroup.scale.setScalar(0.65);
    scene.add(projectsGroup);

    const projKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.4, 0.42, tier === 'low' ? 150 : 300, tier === 'low' ? 20 : 40, 2, 3),
      new THREE.MeshStandardMaterial({
        color: COLORS.blackMetal, metalness: 1.0, roughness: 0.0,
        envMap, envMapIntensity: 2.2,
      })
    );
    projectsGroup.add(projKnot);

    const projSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x6a5530, metalness: 1.0, roughness: 0.05,
        envMap, envMapIntensity: 1.8,
      })
    );
    projectsGroup.add(projSphere);

    const projDodec = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.MeshStandardMaterial({
        color: COLORS.blackMetal, metalness: 1.0, roughness: 0.1,
        envMap, envMapIntensity: 1.6,
      })
    );
    projectsGroup.add(projDodec);

    const projRingColors = [COLORS.goldPale, COLORS.goldDeep, 0xeef4ff];
    const projRings = [3.0, 3.7, 4.5].map((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({
          color: projRingColors[i],
          transparent: true,
          opacity: i === 2 ? 0.2 : 0.5,
        })
      );
      ring.rotation.x = Math.PI / (2.2 + i * 0.55);
      ring.rotation.z = i * 0.5;
      projectsGroup.add(ring);
      return ring;
    });

    // ── CONSTELLATIONS (skills) — animation riche ────────────────────────────
    const constellationGroup = new THREE.Group();
    constellationGroup.visible = false;
    scene.add(constellationGroup);

    const constStars = [];
    const constLines = [];

    CONSTELLATIONS.forEach((cst) => {
      const localStars = [];
      cst.stars.forEach((star) => {
        const size = magToSize(star.mag);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: brightStarTex,
          color: 0xfff8e8,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }));
        sprite.scale.set(size * 8, size * 8, 1);
        sprite.position.set(star.x, star.y, star.z);
        constellationGroup.add(sprite);
        const starObj = {
          mesh: sprite,
          basePos: { x: star.x, y: star.y, z: star.z },
          twinkleSpeed: 1.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          driftSpeed: 0.3 + Math.random() * 0.4,
          driftAmplitude: 0.06 + Math.random() * 0.04,
          driftPhase: Math.random() * Math.PI * 2,
          baseOpacity: magToOpacity(star.mag),
          baseSize: size * 8,
          name: star.name,
          mag: star.mag,
        };
        constStars.push(starObj);
        localStars.push(starObj);
      });

      cst.connections.forEach(([i, j], lineIdx) => {
        const a = localStars[i].basePos;
        const b = localStars[j].basePos;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3(b.x, b.y, b.z),
        ]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          color: 0xd4c19a, transparent: true, opacity: 0,
        }));
        constellationGroup.add(line);
        constLines.push({ mesh: line, revealDelay: lineIdx * 0.12 });
      });
    });

    const DECO_STARS = 50;
    const decoStars = [];
    for (let i = 0; i < DECO_STARS; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: starTex, color: 0xfff8e8,
        transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const s = 0.06 + Math.random() * 0.08;
      sprite.scale.set(s, s, 1);
      const x = (Math.random() - 0.5) * 9;
      const y = (Math.random() - 0.5) * 5;
      const z = -1.5 + Math.random() * 1.5;
      sprite.position.set(x, y, z);
      constellationGroup.add(sprite);
      decoStars.push({
        mesh: sprite,
        basePos: { x, y, z },
        twinkleSpeed: 0.8 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.3 + Math.random() * 0.4,
      });
    }

    // ── Sparks ───────────────────────────────────────────────────────────────
    const SPARK_COUNT = tier === 'low' ? 40 : 80;
    const sparkPos = new Float32Array(SPARK_COUNT * 3);
    const sparkData = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      sparkData.push({ life: Math.random(), maxLife: 2 + Math.random() * 2, vx: 0, vy: 0, vz: 0 });
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: COLORS.goldGlow, size: 0.08, map: starTex,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.7,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    scene.fog = new THREE.FogExp2(COLORS.bg, 0.018);

    // ── MORPH TARGETS ────────────────────────────────────────────────────────
    const morphTargets = {
      0: { centerX: 0, sphereVisible: 1, projectsVisible: 0, aboutVisible: 0, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x050309, sphereScale: 1, sphereMetal: 1, sphereRough: 0.08,
           sphereEnvIntensity: 2.5, haloOpacity: 0.5, haloColor: 0xffd97a, haloScale: 7,
           ringOpacities: [0.4, 0.2, 0],
           sparkOpacity: 0.7, sparkColor: 0xffd97a },

      // ABOUT : Saturne (sphere doree + anneaux marques) — comme avant
      1: { centerX: 0, sphereVisible: 1, projectsVisible: 0, aboutVisible: 0, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x8a6f3f, sphereScale: 1.1, sphereMetal: 0.7, sphereRough: 0.25,
           sphereEnvIntensity: 1.5, haloOpacity: 0.3, haloColor: 0xd4c19a, haloScale: 8,
           ringOpacities: [0.8, 0.6, 0.4],
           sparkOpacity: 0.4, sparkColor: 0xd4c19a },

      // SKILLS : mini astre noir au centre + constellations
      2: { centerX: 0, sphereVisible: 1, projectsVisible: 0, aboutVisible: 0, constVisible: 1, dwarfGlowOpacity: 0,
           sphereColor: 0x1a1410, sphereScale: 0.25, sphereMetal: 1, sphereRough: 0.15,
           sphereEnvIntensity: 1.8, haloOpacity: 0.15, haloColor: 0xd4c19a, haloScale: 2,
           ringOpacities: [0, 0, 0],
           sparkOpacity: 0.2, sparkColor: 0xffd97a },

      3: { centerX: 0, sphereVisible: 0, projectsVisible: 1, aboutVisible: 0, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x050309, sphereScale: 0.01, sphereMetal: 1, sphereRough: 0.08,
           sphereEnvIntensity: 2.5, haloOpacity: 0, haloColor: 0xffd97a, haloScale: 5,
           ringOpacities: [0, 0, 0],
           sparkOpacity: 0.5, sparkColor: 0xd4c19a },

      4: { centerX: 3, sphereVisible: 1, projectsVisible: 0, aboutVisible: 0, constVisible: 0, dwarfGlowOpacity: 1,
           sphereColor: 0xffffff, sphereScale: 0.55, sphereMetal: 0, sphereRough: 0.0,
           sphereEnvIntensity: 0, haloOpacity: 1.0, haloColor: 0x88bfff, haloScale: 9,
           ringOpacities: [0, 0, 0],
           sparkOpacity: 1.0, sparkColor: 0xc8e0ff },
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpColor = (cA, cB, t) => {
      const a = new THREE.Color(cA);
      const b = new THREE.Color(cB);
      return a.lerp(b, t).getHex();
    };

    const onMouse = (e) => {
      stateRef.current.mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      stateRef.current.my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let isVisible = true;
    const onVisibility = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const clock = new THREE.Clock();
    let animId;
    let constRevealStart = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      const state = stateRef.current;

      const targetSection = activeSectionRef.current ?? 0;
      if (targetSection !== state.targetMorph) {
        if (targetSection === 2) constRevealStart = t;
        state.targetMorph = targetSection;
        state.morphProgress = 0;
      }
      if (state.morphProgress < 1) {
        state.morphProgress = Math.min(state.morphProgress + 0.012, 1);
      }

      const from = morphTargets[state.currentMorph];
      const to   = morphTargets[state.targetMorph];
      const p    = easeInOutCubic(state.morphProgress);

      // Sphere principale
      sphereMat.color.setHex(lerpColor(from.sphereColor, to.sphereColor, p));
      sphereMat.metalness        = lerp(from.sphereMetal,        to.sphereMetal,        p);
      sphereMat.roughness        = lerp(from.sphereRough,        to.sphereRough,        p);
      sphereMat.envMapIntensity  = lerp(from.sphereEnvIntensity, to.sphereEnvIntensity, p);

      const sphereVis = lerp(from.sphereVisible, to.sphereVisible, p);
      sphereMat.transparent = sphereVis < 1;
      sphereMat.opacity = sphereVis;
      sphere.visible = sphereVis > 0.01;

      const centerX = lerp(from.centerX, to.centerX, p);
      sphere.position.x         = centerX;
      halo.position.x           = centerX;
      dwarfGlow.position.x      = centerX;
      dwarfArcsGroup.position.x = centerX;

      if (state.targetMorph === 4 || state.currentMorph === 4) {
        sphereMat.emissive = new THREE.Color(0xeaf4ff);
        const dwarfP = state.targetMorph === 4 ? p : (1 - p);
        sphereMat.emissiveIntensity = 3.5 * dwarfP;
      } else {
        sphereMat.emissive = new THREE.Color(0x000000);
        sphereMat.emissiveIntensity = 0;
      }

      // Projects fade
      const projectsVis = lerp(from.projectsVisible, to.projectsVisible, p);
      projectsGroup.visible = projectsVis > 0.01;
      projKnot.material.transparent = true;     projKnot.material.opacity   = projectsVis;
      projSphere.material.transparent = true;   projSphere.material.opacity = projectsVis;
      projDodec.material.transparent = true;    projDodec.material.opacity  = projectsVis;
      projRings.forEach((ring, i) => {
        const baseOp = i === 2 ? 0.2 : 0.5;
        ring.material.opacity = baseOp * projectsVis;
      });

      // About fade
      const aboutVis = lerp(from.aboutVisible, to.aboutVisible, p);
      aboutGroup.visible = aboutVis > 0.01;
      aboutStarA.material.transparent = true;
      aboutStarA.material.opacity = aboutVis;
      aboutStarB.material.transparent = true;
      aboutStarB.material.opacity = aboutVis;
      aboutHalo.material.opacity = aboutVis * (0.7 + Math.sin(t * 0.7) * 0.2);
      aboutOrbit.material.opacity = aboutVis * 0.35;
      dustMat.opacity = aboutVis * 0.55;

      // Naine blanche
      const dwarfGlowVis = lerp(from.dwarfGlowOpacity, to.dwarfGlowOpacity, p);
      const dwarfPulse = 0.7 + Math.sin(t * 4.0) * 0.25 + Math.sin(t * 7.3) * 0.1;
      dwarfGlow.material.opacity = dwarfGlowVis * dwarfPulse;
      dwarfGlow.scale.setScalar((3 + Math.sin(t * 4.0) * 0.4) * (dwarfGlowVis > 0.01 ? 1 : 0));

      dwarfArcsGroup.visible = dwarfGlowVis > 0.01;
      if (dwarfArcsGroup.visible) {
        dwarfArcs.forEach((arc) => {
          arc.mesh.rotation.x = arc.baseRotX + t * arc.speedX * 60;
          arc.mesh.rotation.y = arc.baseRotY + t * arc.speedY * 60;
          arc.mesh.rotation.z = arc.baseRotZ + t * arc.speedZ * 60;
          const flicker = 0.6 + Math.sin(t * arc.flickerSpeed + arc.flickerOffset) * 0.4;
          arc.mesh.material.opacity = arc.baseOpacity * dwarfGlowVis * flicker;
        });
      }

      // Echelle sphere + respiration
      const baseScale = lerp(from.sphereScale, to.sphereScale, p);
      let breathSpeed = 1.2, breathAmount = 0.015;
      if (state.targetMorph === 3) { breathSpeed = 0.3; breathAmount = 0.02; }
      if (state.targetMorph === 4) { breathSpeed = 5.0; breathAmount = 0.08; }
      const breathe = 1 + Math.sin(t * breathSpeed) * breathAmount;
      sphere.scale.setScalar(baseScale * breathe);

      // Halo principal
      halo.material.opacity = lerp(from.haloOpacity, to.haloOpacity, p) * (0.85 + Math.sin(t * 0.8) * 0.15);
      halo.material.color.setHex(lerpColor(from.haloColor, to.haloColor, p));
      halo.scale.setScalar(lerp(from.haloScale, to.haloScale, p) + Math.sin(t * 0.6) * 0.3);
      halo.material.map = (state.targetMorph === 4) ? haloTexWhite : haloTexGold;
      halo.material.needsUpdate = true;

      rings.forEach((ring, i) => {
        ring.material.opacity = lerp(from.ringOpacities[i], to.ringOpacities[i], p);
        ring.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.0006;
      });

      // PROJECTS anim
      if (projectsGroup.visible) {
        projKnot.rotation.x  = t * 0.28;
        projKnot.rotation.y  = t * 0.38;
        projSphere.position.x = Math.cos(t * 0.6) * 3.2;
        projSphere.position.y = Math.sin(t * 0.6) * 0.8;
        projSphere.position.z = Math.sin(t * 0.6) * 3.2;
        projSphere.rotation.y = t * 0.5;
        projDodec.position.x = Math.cos(t * 0.4 + Math.PI) * 4;
        projDodec.position.y = 1.5 + Math.sin(t * 0.7) * 0.5;
        projDodec.position.z = Math.sin(t * 0.4 + Math.PI) * 4;
        projDodec.rotation.x = t * 0.6;
        projDodec.rotation.y = t * 0.8;
        projRings.forEach((ring, i) => {
          ring.rotation.z += 0.0018 * (i % 2 === 0 ? 1 : -1);
          ring.rotation.y += 0.001;
        });
      }

      // ABOUT : systeme binaire en orbite
      if (aboutGroup.visible) {
        const orbitSpeed = 0.45;
        const angleA = t * orbitSpeed;
        const angleB = t * orbitSpeed + Math.PI;
        aboutStarA.position.x = Math.cos(angleA) * 0.7;
        aboutStarA.position.y = Math.sin(angleA) * 0.7 * 0.5;
        aboutStarA.position.z = Math.sin(angleA) * 0.7 * 0.3;
        aboutStarB.position.x = Math.cos(angleB) * 1.6;
        aboutStarB.position.y = Math.sin(angleB) * 1.6 * 0.5;
        aboutStarB.position.z = Math.sin(angleB) * 1.6 * 0.3;
        aboutStarA.rotation.y = t * 0.3;
        aboutStarB.rotation.y = t * 0.6;
        aboutStarA.material.emissiveIntensity = 0.25 + Math.sin(t * 1.8) * 0.1;
        aboutStarB.material.emissiveIntensity = 0.4  + Math.sin(t * 2.2 + 1) * 0.15;
        aboutOrbit.rotation.z = t * 0.08;
        const dustPositions = dustGeo.getAttribute('position').array;
        for (let i = 0; i < DUST_COUNT; i++) {
          const d = dustData[i];
          const a = d.baseAngle + t * d.speed;
          dustPositions[i*3]   = Math.cos(a) * d.radius;
          dustPositions[i*3+1] = d.yBase + Math.sin(t * 0.3 + i * 0.1) * 0.05;
          dustPositions[i*3+2] = Math.sin(a) * d.radius;
        }
        dustGeo.getAttribute('position').needsUpdate = true;
      }

      // ── CONSTELLATIONS — ANIMATIONS COMPLETES ─────────────────────────────
      const cOp = lerp(from.constVisible, to.constVisible, p);
      constellationGroup.visible = cOp > 0.01;
      if (constellationGroup.visible) {
        // 1) Etoiles principales : scintillement + pulse + drift orbital
        constStars.forEach((star) => {
          const twinkle = 0.7 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.3;
          star.mesh.material.opacity = star.baseOpacity * cOp * twinkle;

          // Pulse de taille (les etoiles respirent)
          const sizePulse = 1 + Math.sin(t * star.twinkleSpeed * 0.7 + star.twinkleOffset) * 0.12;
          star.mesh.scale.set(star.baseSize * sizePulse, star.baseSize * sizePulse, 1);

          // Micro-orbite individuelle (chaque etoile derive doucement)
          const drift = star.driftAmplitude;
          star.mesh.position.x = star.basePos.x + Math.cos(t * star.driftSpeed + star.driftPhase) * drift;
          star.mesh.position.y = star.basePos.y + Math.sin(t * star.driftSpeed + star.driftPhase) * drift * 0.7;
          star.mesh.position.z = star.basePos.z + Math.sin(t * star.driftSpeed * 0.5) * drift * 0.4;

          // Couleurs spectrales speciales
          if (star.name === 'Betelgeuse') {
            star.mesh.material.color.setHex(0xffaa55);
          } else if (star.name === 'Rigel') {
            star.mesh.material.color.setHex(0xc8d8ff);
          } else {
            star.mesh.material.color.setHex(0xfff8e8);
          }
        });

        // 2) Lignes : trace progressif (chacune apparait en sequence) + pulse
        const timeSinceReveal = t - constRevealStart;
        constLines.forEach((lineObj, idx) => {
          const lineProgress = Math.max(0, Math.min(1, (timeSinceReveal - lineObj.revealDelay) / 0.6));
          const linePulse = 0.7 + Math.sin(t * 1.2 + idx * 0.5) * 0.3;
          lineObj.mesh.material.opacity = 0.35 * cOp * lineProgress * linePulse;
        });

        // 3) Etoiles deco : twinkle independant et intense
        decoStars.forEach((star) => {
          const tw = 0.5 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5;
          star.mesh.material.opacity = star.baseOpacity * cOp * tw;
        });

        // 4) Drift global de tout le ciel (nutation celeste lente)
        constellationGroup.rotation.y = Math.sin(t * 0.05) * 0.06;
        constellationGroup.rotation.x = Math.cos(t * 0.04) * 0.03;
      }

      sphere.rotation.y = t * 0.18;
      sphere.rotation.x = Math.sin(t * 0.3) * 0.15;
      starfield.rotation.y = t * 0.015;

      // Sparks
      sparkMat.color.setHex(lerpColor(from.sparkColor, to.sparkColor, p));
      sparkMat.opacity = lerp(from.sparkOpacity, to.sparkOpacity, p);
      const sparkPositions = sparkGeo.getAttribute('position').array;
      const targetRadius = state.targetMorph === 3 ? 1.8 : baseScale * 1.8;
      const sparkSpeed = state.targetMorph === 4 ? 0.012 : 0.005;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const d = sparkData[i];
        d.life += 0.01;
        if (d.life > d.maxLife) {
          const theta = Math.random() * Math.PI * 2;
          const phi   = Math.acos(Math.random() * 2 - 1);
          sparkPositions[i*3]   = centerX + targetRadius * Math.sin(phi) * Math.cos(theta);
          sparkPositions[i*3+1] = targetRadius * Math.sin(phi) * Math.sin(theta);
          sparkPositions[i*3+2] = targetRadius * Math.cos(phi);
          const dx = sparkPositions[i*3] - centerX;
          const dy = sparkPositions[i*3+1];
          const dz = sparkPositions[i*3+2];
          d.vx = (dx / targetRadius) * sparkSpeed;
          d.vy = (dy / targetRadius) * sparkSpeed + 0.002;
          d.vz = (dz / targetRadius) * sparkSpeed;
          d.life = 0;
          d.maxLife = 2 + Math.random() * 2;
        } else {
          sparkPositions[i*3]   += d.vx;
          sparkPositions[i*3+1] += d.vy;
          sparkPositions[i*3+2] += d.vz;
        }
      }
      sparkGeo.getAttribute('position').needsUpdate = true;

      keyLight.position.x = 2 + Math.cos(t * 0.4) * 3;
      keyLight.position.y = 5 + Math.sin(t * 0.4) * 1;
      fillLight.position.x = 4 + Math.cos(t * 0.5) * 1.5;

      camera.position.x += (state.mx * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (state.my * 0.4 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      if (state.morphProgress >= 1) {
        state.currentMorph = state.targetMorph;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
      starTex.dispose();
      brightStarTex.dispose();
      envMap.dispose();
      haloTexGold.dispose();
      haloTexWhite.dispose();
      aboutHaloTex.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      projKnot.geometry.dispose();   projKnot.material.dispose();
      projSphere.geometry.dispose(); projSphere.material.dispose();
      projDodec.geometry.dispose();  projDodec.material.dispose();
      aboutStarA.geometry.dispose(); aboutStarA.material.dispose();
      aboutStarB.geometry.dispose(); aboutStarB.material.dispose();
      aboutOrbit.geometry.dispose(); aboutOrbit.material.dispose();
      dustGeo.dispose();             dustMat.dispose();
      rings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      projRings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      constStars.forEach(s => { s.mesh.material.dispose(); });
      constLines.forEach(l => { l.mesh.geometry.dispose(); l.mesh.material.dispose(); });
      dwarfArcs.forEach(a => { a.mesh.geometry.dispose(); a.mesh.material.dispose(); });
      decoStars.forEach(s => { s.mesh.material.dispose(); });
    };
  }, [activeSectionRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}