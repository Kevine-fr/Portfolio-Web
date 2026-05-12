import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COLORS, getPerformanceTier, easeInOutCubic } from '../../styles/tokens';

// ─── Texture etoile douce ───────────────────────────────────────────────────
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

// ─── Texture etoile brillante avec halo + spikes Hubble ─────────────────────
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

// ─── Champ d'etoiles LOINTAIN (fond galactique global, voyage entre astres) ─
function makeStarfield(starTex, tier) {
  const N = tier === 'low' ? 3000 : tier === 'medium' ? 6000 : 10000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const palette = [
    [1.0, 0.97, 0.88], [0.95, 0.92, 0.82],
    [1.0, 0.88, 0.65], [0.85, 0.92, 1.0],
  ];
  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 50 + Math.pow(Math.random(), 0.4) * 200;
    pos[i*3]   = Math.sin(phi) * Math.cos(theta) * r;
    pos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r * 0.6;
    pos[i*3+2] = Math.cos(phi) * r - 60;
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
    size: 0.3, vertexColors: true, map: starTex,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 1.0,
  }));
}

// ─── Champ d'etoiles LOCAL avec recyclage infini ────────────────────────────
// Renvoie { points, recycle(t) } : recycle decale les etoiles qui sortent du
// champ visible pour en faire apparaitre constamment de nouvelles.
function makeLocalStarfield(starTex, tier, center) {
  const N = tier === 'low' ? 1500 : tier === 'medium' ? 3000 : 5000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const palette = [
    [1.0, 0.97, 0.88], [0.95, 0.92, 0.82],
    [1.0, 0.88, 0.65], [0.85, 0.92, 1.0],
  ];
  // Tracker par etoile : son angle initial + age (pour drift radial subtil)
  // On stocke pour pouvoir recycler quand l'etoile s'eloigne trop
  const baseAngle = new Float32Array(N);
  const baseRadius = new Float32Array(N);
  const baseY = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 8 + Math.pow(Math.random(), 0.4) * 30;
    const yspread = (Math.random() - 0.5) * 25;
    baseAngle[i]  = theta;
    baseRadius[i] = r;
    baseY[i]      = yspread;
    pos[i*3]   = center.x + Math.cos(theta) * r;
    pos[i*3+1] = center.y + yspread;
    pos[i*3+2] = center.z + Math.sin(theta) * r - 5;
    const c = palette[Math.floor(Math.random() * palette.length)];
    const bright = 0.4 + Math.random() * 0.6;
    col[i*3]   = c[0] * bright;
    col[i*3+1] = c[1] * bright;
    col[i*3+2] = c[2] * bright;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, map: starTex,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 1.0,
  }));

  return { points, baseAngle, baseRadius, baseY, center, N };
}

// ─── CONSTELLATIONS reelles ─────────────────────────────────────────────────
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

const ASTRE_POSITIONS = [
  new THREE.Vector3(   0,   0,    0),
  new THREE.Vector3( -45,   6,  -35),
  new THREE.Vector3(  55,  -8,  -70),
  new THREE.Vector3( -35,  22,  -95),
  new THREE.Vector3(  65,   0, -130),
];

function buildCurvePoints() {
  const curves = {};
  for (let i = 0; i < ASTRE_POSITIONS.length; i++) {
    for (let j = 0; j < ASTRE_POSITIONS.length; j++) {
      if (i === j) continue;
      const a = ASTRE_POSITIONS[i];
      const b = ASTRE_POSITIONS[j];
      const mid = a.clone().lerp(b, 0.5);
      const dir = b.clone().sub(a).normalize();
      const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(8);
      perp.y += 5;
      mid.add(perp);
      curves[`${i}-${j}`] = mid;
    }
  }
  return curves;
}

export default function PersistentScene({ activeSectionRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mx: 0, my: 0,
    currentMorph: 0,
    targetMorph: 0,
    morphProgress: 1,
    cameraTravelFrom: ASTRE_POSITIONS[0].clone(),
    cameraTravelTo:   ASTRE_POSITIONS[0].clone(),
    cameraTravelCtrl: ASTRE_POSITIONS[0].clone(),
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
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    camera.position.copy(ASTRE_POSITIONS[0]).add(new THREE.Vector3(0, 0, 7));

    const curvePoints = buildCurvePoints();

    const envMap = makeEnvironmentMap(tier);
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0x1a1208, 0.25));
    const keyLight  = new THREE.PointLight(COLORS.goldGlow, 4.5, 25);
    const fillLight = new THREE.PointLight(COLORS.goldDeep, 2.5, 20);
    const rimLight  = new THREE.PointLight(COLORS.goldGlow, 3.0, 15);
    scene.add(keyLight); scene.add(fillLight); scene.add(rimLight);

    const starTex = makeStarTexture();
    const brightStarTex = makeBrightStarTexture();

    const starfield = makeStarfield(starTex, tier);
    scene.add(starfield);

    // ── ETOILES LOCALES avec recyclage infini par astre ─────────────────────
    const localStarfields = ASTRE_POSITIONS.map((pos) => {
      const sf = makeLocalStarfield(starTex, tier, pos);
      scene.add(sf.points);
      return sf;
    });

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

    // ═════════════════════════════════════════════════════════════════════════
    // ── ASTRE 0 : HERO ───────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════
    const heroGroup = new THREE.Group();
    heroGroup.position.copy(ASTRE_POSITIONS[0]);
    scene.add(heroGroup);

    const heroSphereSegs = tier === 'low' ? 32 : tier === 'medium' ? 64 : 96;
    const heroSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, heroSphereSegs, heroSphereSegs),
      new THREE.MeshStandardMaterial({
        color: 0x050309, metalness: 1.0, roughness: 0.08,
        envMap, envMapIntensity: 2.5,
      })
    );
    heroGroup.add(heroSphere);

    const heroHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexGold, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.5,
    }));
    heroHalo.scale.set(7, 7, 1);
    heroHalo.position.set(0, 0, -2);
    heroGroup.add(heroHalo);

    const heroRings = [];
    [2.6, 3.2].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 6, 140),
        new THREE.MeshBasicMaterial({
          color: COLORS.goldPale, transparent: true,
          opacity: i === 0 ? 0.4 : 0.2,
        })
      );
      ring.rotation.x = Math.PI / 2.3 + i * 0.2;
      ring.rotation.z = i * 0.6;
      heroGroup.add(ring);
      heroRings.push(ring);
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── ASTRE 1 : ABOUT ──────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════
    const aboutGroup = new THREE.Group();
    aboutGroup.position.copy(ASTRE_POSITIONS[1]);
    scene.add(aboutGroup);

    const aboutPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(1.98, heroSphereSegs, heroSphereSegs),
      new THREE.MeshStandardMaterial({
        color: 0x8a6f3f, metalness: 0.7, roughness: 0.25,
        envMap, envMapIntensity: 1.5,
      })
    );
    aboutGroup.add(aboutPlanet);

    const aboutHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexGold, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.3,
    }));
    aboutHalo.scale.set(8, 8, 1);
    aboutHalo.position.set(0, 0, -2);
    aboutGroup.add(aboutHalo);

    const aboutRings = [];
    [2.6, 3.2, 4.0].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 6, 140),
        new THREE.MeshBasicMaterial({
          color: COLORS.goldPale, transparent: true,
          opacity: [0.8, 0.6, 0.4][i],
        })
      );
      ring.rotation.x = Math.PI / 2.3 + i * 0.2;
      ring.rotation.z = i * 0.6;
      aboutGroup.add(ring);
      aboutRings.push(ring);
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── ASTRE 2 : SKILLS ─────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════
    const skillsGroup = new THREE.Group();
    skillsGroup.position.copy(ASTRE_POSITIONS[2]);
    scene.add(skillsGroup);

    const skillsCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, heroSphereSegs, heroSphereSegs),
      new THREE.MeshStandardMaterial({
        color: 0x1a1410, metalness: 1.0, roughness: 0.15,
        envMap, envMapIntensity: 1.8,
      })
    );
    skillsGroup.add(skillsCore);

    const skillsHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexGold, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.15,
    }));
    skillsHalo.scale.set(2, 2, 1);
    skillsHalo.position.set(0, 0, -1);
    skillsGroup.add(skillsHalo);

    const constStars = [];
    const constLines = [];
    CONSTELLATIONS.forEach((cst) => {
      const localStars = [];
      cst.stars.forEach((star) => {
        const size = magToSize(star.mag);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: brightStarTex, color: 0xfff8e8,
          transparent: true, opacity: magToOpacity(star.mag),
          depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        sprite.scale.set(size * 8, size * 8, 1);
        sprite.position.set(star.x, star.y, star.z);
        skillsGroup.add(sprite);
        const starObj = {
          mesh: sprite, basePos: { x: star.x, y: star.y, z: star.z },
          twinkleSpeed: 1.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          driftSpeed: 0.3 + Math.random() * 0.4,
          driftAmplitude: 0.06 + Math.random() * 0.04,
          driftPhase: Math.random() * Math.PI * 2,
          baseOpacity: magToOpacity(star.mag),
          baseSize: size * 8,
          name: star.name,
        };
        constStars.push(starObj);
        localStars.push(starObj);
      });
      cst.connections.forEach(([i, j], lineIdx) => {
        const a = localStars[i].basePos, b = localStars[j].basePos;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3(b.x, b.y, b.z),
        ]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          color: 0xd4c19a, transparent: true, opacity: 0,
        }));
        skillsGroup.add(line);
        constLines.push({ mesh: line, revealDelay: lineIdx * 0.12 });
      });
    });

    const decoStars = [];
    for (let i = 0; i < 50; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: starTex, color: 0xfff8e8,
        transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const s = 0.06 + Math.random() * 0.08;
      sprite.scale.set(s, s, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5,
        -1.5 + Math.random() * 1.5
      );
      skillsGroup.add(sprite);
      decoStars.push({
        mesh: sprite,
        twinkleSpeed: 0.8 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.3 + Math.random() * 0.4,
      });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ── ASTRE 3 : PROJECTS ───────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════
    const projectsGroup = new THREE.Group();
    projectsGroup.position.copy(ASTRE_POSITIONS[3]);
    projectsGroup.scale.setScalar(0.65);
    scene.add(projectsGroup);

    const projKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.4, 0.42, tier === 'low' ? 150 : 300, tier === 'low' ? 20 : 40, 2, 3),
      new THREE.MeshStandardMaterial({
        color: 0x050309, metalness: 1.0, roughness: 0.0,
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
        color: 0x050309, metalness: 1.0, roughness: 0.1,
        envMap, envMapIntensity: 1.6,
      })
    );
    projectsGroup.add(projDodec);

    const projRingColors = [COLORS.goldPale, COLORS.goldDeep, 0xeef4ff];
    const projRings = [3.0, 3.7, 4.5].map((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({
          color: projRingColors[i], transparent: true,
          opacity: i === 2 ? 0.2 : 0.5,
        })
      );
      ring.rotation.x = Math.PI / (2.2 + i * 0.55);
      ring.rotation.z = i * 0.5;
      projectsGroup.add(ring);
      return ring;
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── ASTRE 4 : CONTACT ────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════
    const contactGroup = new THREE.Group();
    contactGroup.position.copy(ASTRE_POSITIONS[4]);
    const dwarfOffset = new THREE.Vector3(3, 0, 0);
    scene.add(contactGroup);

    const dwarfStar = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, heroSphereSegs, heroSphereSegs),
      new THREE.MeshStandardMaterial({
        color: 0xffffff, metalness: 0, roughness: 0,
        emissive: 0xeaf4ff, emissiveIntensity: 3.5,
      })
    );
    dwarfStar.scale.setScalar(0.55);
    dwarfStar.position.copy(dwarfOffset);
    contactGroup.add(dwarfStar);

    const dwarfHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexWhite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 1.0,
    }));
    dwarfHalo.scale.set(9, 9, 1);
    dwarfHalo.position.set(dwarfOffset.x, dwarfOffset.y, dwarfOffset.z - 0.5);
    contactGroup.add(dwarfHalo);

    const dwarfGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexWhite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.9,
    }));
    dwarfGlow.scale.set(4, 4, 1);
    dwarfGlow.position.copy(dwarfOffset);
    contactGroup.add(dwarfGlow);

    const NB_ARCS = tier === 'low' ? 12 : 20;
    const dwarfArcs = [];
    for (let i = 0; i < NB_ARCS; i++) {
      const radius = 1.4 + Math.random() * 1.8;
      const tube   = 0.006 + Math.random() * 0.008;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 4, 96),
        new THREE.MeshBasicMaterial({
          color: 0xb8dcff, transparent: true, opacity: 0.5,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      arc.rotation.x = Math.random() * Math.PI;
      arc.rotation.y = Math.random() * Math.PI;
      arc.rotation.z = Math.random() * Math.PI;
      arc.scale.set(1, 0.4 + Math.random() * 0.5, 1);
      arc.position.copy(dwarfOffset);
      contactGroup.add(arc);
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

    scene.fog = new THREE.FogExp2(COLORS.bg, 0.0035);

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

    const TRAVEL_DURATION = 1.2;
    const TRAVEL_INCREMENT = 1 / (60 * TRAVEL_DURATION);

    const clock = new THREE.Clock();
    let animId;
    let constRevealStart = 0;
    let prevTime = 0;

    const vTmp = new THREE.Vector3();
    const vLook = new THREE.Vector3();

    function quadBezier(p0, p1, p2, t, out) {
      const u = 1 - t;
      out.x = u*u*p0.x + 2*u*t*p1.x + t*t*p2.x;
      out.y = u*u*p0.y + 2*u*t*p1.y + t*t*p2.y;
      out.z = u*u*p0.z + 2*u*t*p1.z + t*t*p2.z;
      return out;
    }

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      const dt = Math.max(0.001, t - prevTime);
      prevTime = t;
      const state = stateRef.current;

      const targetSection = activeSectionRef.current ?? 0;
      if (targetSection !== state.targetMorph) {
        state.cameraTravelFrom.copy(ASTRE_POSITIONS[state.currentMorph]);
        state.cameraTravelTo.copy(ASTRE_POSITIONS[targetSection]);
        const ctrl = curvePoints[`${state.currentMorph}-${targetSection}`];
        if (ctrl) state.cameraTravelCtrl.copy(ctrl);
        if (targetSection === 2) constRevealStart = t;
        state.targetMorph = targetSection;
        state.morphProgress = 0;
      }
      if (state.morphProgress < 1) {
        state.morphProgress = Math.min(state.morphProgress + TRAVEL_INCREMENT, 1);
      }

      const p = easeInOutCubic(state.morphProgress);

      // ── VOYAGE camera (Bezier quadratique) ───────────────────────────────────
      quadBezier(state.cameraTravelFrom, state.cameraTravelCtrl, state.cameraTravelTo, p, vTmp);
      vTmp.z += 7;
      vTmp.x += state.mx * 0.6;
      vTmp.y += state.my * 0.4;
      camera.position.lerp(vTmp, state.morphProgress < 1 ? 1 : 0.08);

      const lookTarget = state.morphProgress < 1
        ? state.cameraTravelTo
        : ASTRE_POSITIONS[state.targetMorph];
      vLook.copy(lookTarget);
      camera.lookAt(vLook);

      // ── LUMIERES ─────────────────────────────────────────────────────────────
      const lookAstre = state.morphProgress < 1
        ? state.cameraTravelTo
        : ASTRE_POSITIONS[state.targetMorph];
      keyLight.position.set(
        lookAstre.x + 2 + Math.cos(t * 0.4) * 3,
        lookAstre.y + 5 + Math.sin(t * 0.4) * 1,
        lookAstre.z + 4
      );
      fillLight.position.set(
        lookAstre.x + 4 + Math.cos(t * 0.5) * 1.5,
        lookAstre.y - 1,
        lookAstre.z + 3
      );
      rimLight.position.set(lookAstre.x, lookAstre.y, lookAstre.z - 3);

      // ═══════════════════════════════════════════════════════════════════════
      // ── ANIMATIONS DES ASTRES ───────────────────────────────────────────────
      // ═══════════════════════════════════════════════════════════════════════

      // HERO
      heroSphere.rotation.y = t * 0.18;
      heroSphere.rotation.x = Math.sin(t * 0.3) * 0.15;
      heroSphere.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
      heroHalo.material.opacity = 0.5 * (0.85 + Math.sin(t * 0.8) * 0.15);
      heroHalo.scale.setScalar(7 + Math.sin(t * 0.6) * 0.3);
      heroRings.forEach((ring, i) => {
        ring.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.0006;
      });

      // ABOUT
      aboutPlanet.rotation.y = t * 0.15;
      aboutPlanet.rotation.x = Math.sin(t * 0.3) * 0.1;
      aboutPlanet.scale.setScalar(1.1 * (1 + Math.sin(t * 1.0) * 0.01));
      aboutHalo.material.opacity = 0.3 * (0.85 + Math.sin(t * 0.7) * 0.15);
      aboutHalo.scale.setScalar(8 + Math.sin(t * 0.5) * 0.3);
      aboutRings.forEach((ring, i) => {
        ring.rotation.z += 0.0012 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.0008;
      });

      // SKILLS
      skillsCore.rotation.y = t * 0.18;
      skillsCore.scale.setScalar(1 + Math.sin(t * 1.2) * 0.02);
      constStars.forEach((star) => {
        const twinkle = 0.7 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.3;
        star.mesh.material.opacity = star.baseOpacity * twinkle;
        const sizePulse = 1 + Math.sin(t * star.twinkleSpeed * 0.7 + star.twinkleOffset) * 0.12;
        star.mesh.scale.set(star.baseSize * sizePulse, star.baseSize * sizePulse, 1);
        const drift = star.driftAmplitude;
        star.mesh.position.x = star.basePos.x + Math.cos(t * star.driftSpeed + star.driftPhase) * drift;
        star.mesh.position.y = star.basePos.y + Math.sin(t * star.driftSpeed + star.driftPhase) * drift * 0.7;
        star.mesh.position.z = star.basePos.z + Math.sin(t * star.driftSpeed * 0.5) * drift * 0.4;
        if (star.name === 'Betelgeuse')   star.mesh.material.color.setHex(0xffaa55);
        else if (star.name === 'Rigel')   star.mesh.material.color.setHex(0xc8d8ff);
        else                              star.mesh.material.color.setHex(0xfff8e8);
      });
      const timeSinceReveal = t - constRevealStart;
      constLines.forEach((lineObj, idx) => {
        const lineProgress = Math.max(0, Math.min(1, (timeSinceReveal - lineObj.revealDelay) / 0.6));
        const linePulse = 0.7 + Math.sin(t * 1.2 + idx * 0.5) * 0.3;
        lineObj.mesh.material.opacity = 0.35 * lineProgress * linePulse;
      });
      decoStars.forEach((star) => {
        const tw = 0.5 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5;
        star.mesh.material.opacity = star.baseOpacity * tw;
      });
      skillsGroup.rotation.y = Math.sin(t * 0.05) * 0.06;
      skillsGroup.rotation.x = Math.cos(t * 0.04) * 0.03;

      // PROJECTS
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

      // CONTACT
      const dwarfPulse = 0.7 + Math.sin(t * 4.0) * 0.25 + Math.sin(t * 7.3) * 0.1;
      dwarfHalo.material.opacity = dwarfPulse;
      dwarfHalo.scale.setScalar(9 + Math.sin(t * 4.0) * 0.6);
      dwarfGlow.material.opacity = 0.9 * dwarfPulse;
      dwarfGlow.scale.setScalar(3 + Math.sin(t * 4.0) * 0.4);
      dwarfStar.scale.setScalar(0.55 * (1 + Math.sin(t * 5.0) * 0.08));
      dwarfArcs.forEach((arc) => {
        arc.mesh.rotation.x = arc.baseRotX + t * arc.speedX * 60;
        arc.mesh.rotation.y = arc.baseRotY + t * arc.speedY * 60;
        arc.mesh.rotation.z = arc.baseRotZ + t * arc.speedZ * 60;
        const flicker = 0.6 + Math.sin(t * arc.flickerSpeed + arc.flickerOffset) * 0.4;
        arc.mesh.material.opacity = arc.baseOpacity * flicker;
      });

      // ── ROTATION + RECYCLAGE INFINI DES CHAMPS D'ETOILES ────────────────────
      // Le fond galactique tourne juste tres lentement (decor)
      starfield.rotation.y = t * 0.005;

      // Pour les locales : meme rotation Y MAIS chaque etoile derive en angle
      // ce qui simule un flux continu. Quand son rayon devient trop grand
      // (sortie du champ visible), on la recycle a un nouveau rayon proche.
      // Vitesse angulaire equivalente a la rotation = 0.005 rad/s
      const ANGULAR_SPEED = 0.005;
      // Drift radial leger : les etoiles s'eloignent progressivement
      // puis se font recycler. Vitesse "voyage" subtile.
      const RADIAL_DRIFT = 0.06 * dt;   // unites/s
      const R_MIN = 8;
      const R_MAX = 38;   // 8 + 30 = limite naturelle de generation

      localStarfields.forEach((sf) => {
        const arr = sf.points.geometry.attributes.position.array;
        const c = sf.center;
        for (let i = 0; i < sf.N; i++) {
          // Avance l'angle (= rotation Y) ET le rayon (= drift)
          sf.baseAngle[i]  += ANGULAR_SPEED * dt;
          sf.baseRadius[i] += RADIAL_DRIFT;
          // Recyclage si etoile trop loin
          if (sf.baseRadius[i] > R_MAX) {
            sf.baseAngle[i]  = Math.random() * Math.PI * 2;
            sf.baseRadius[i] = R_MIN + Math.random() * 2;   // respawn proche
            sf.baseY[i]      = (Math.random() - 0.5) * 25;
          }
          const r = sf.baseRadius[i];
          const a = sf.baseAngle[i];
          arr[i*3]   = c.x + Math.cos(a) * r;
          arr[i*3+1] = c.y + sf.baseY[i];
          arr[i*3+2] = c.z + Math.sin(a) * r - 5;
        }
        sf.points.geometry.attributes.position.needsUpdate = true;
      });

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
      localStarfields.forEach(sf => {
        sf.points.geometry.dispose();
        sf.points.material.dispose();
      });
      heroSphere.geometry.dispose(); heroSphere.material.dispose();
      heroRings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      aboutPlanet.geometry.dispose(); aboutPlanet.material.dispose();
      aboutRings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      skillsCore.geometry.dispose(); skillsCore.material.dispose();
      constStars.forEach(s => { s.mesh.material.dispose(); });
      constLines.forEach(l => { l.mesh.geometry.dispose(); l.mesh.material.dispose(); });
      decoStars.forEach(s => { s.mesh.material.dispose(); });
      projKnot.geometry.dispose();   projKnot.material.dispose();
      projSphere.geometry.dispose(); projSphere.material.dispose();
      projDodec.geometry.dispose();  projDodec.material.dispose();
      projRings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      dwarfStar.geometry.dispose(); dwarfStar.material.dispose();
      dwarfArcs.forEach(a => { a.mesh.geometry.dispose(); a.mesh.material.dispose(); });
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