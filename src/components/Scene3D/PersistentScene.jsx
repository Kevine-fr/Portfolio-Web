import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COLORS, getPerformanceTier, easeInOutCubic } from '../../styles/tokens';

// ─── Texture etoile (douce, blanc creme) ─────────────────────────────────────
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

// ─── Texture etoile brillante avec spikes (pour stars de constellation) ──────
function makeBrightStarTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  // Halo doux
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.1,  'rgba(255,250,240,0.95)');
  g.addColorStop(0.3,  'rgba(255,230,180,0.5)');
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  // Spikes diffraction (4 branches type Hubble)
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,245,220,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(64, 8);  ctx.lineTo(64, 120);    // vertical
  ctx.moveTo(8, 64);  ctx.lineTo(120, 64);    // horizontal
  ctx.stroke();
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

// ─── VRAIES CONSTELLATIONS ───────────────────────────────────────────────────
// Coordonnees stylisees inspirees de constellations celebres.
// magnitude: 0=tres brillante (Sirius), 5=peu visible
const CONSTELLATIONS = [
  // GRANDE OURSE (Big Dipper) - reconnaissable au monde entier
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
  // ORION (le chasseur)
  {
    name: 'ORION',
    stars: [
      { x:  2.8, y:  1.5, z: 0, mag: 0.5, name: 'Betelgeuse' },  // rouge geante
      { x:  1.8, y:  1.6, z: 0, mag: 1.6, name: 'Bellatrix' },
      { x:  2.2, y:  0.4, z: 0, mag: 1.7, name: 'Alnitak' },     // ceinture
      { x:  2.5, y:  0.4, z: 0, mag: 1.7, name: 'Alnilam' },
      { x:  2.8, y:  0.4, z: 0, mag: 2.2, name: 'Mintaka' },
      { x:  3.0, y: -1.0, z: 0, mag: 0.1, name: 'Rigel' },        // bleu blanc
      { x:  1.8, y: -1.0, z: 0, mag: 2.0, name: 'Saiph' },
    ],
    connections: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]],
  },
  // CASSIOPEE (W)
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

// Conversion magnitude → taille visuelle
const magToSize = (mag) => {
  // magnitude faible = etoile brillante = grande taille
  return Math.max(0.06, 0.18 - mag * 0.025);
};
const magToOpacity = (mag) => {
  return Math.max(0.55, 1.0 - mag * 0.08);
};

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

    // ── HALO ─────────────────────────────────────────────────────────────────
    // Note : on cree deux halos differents (dore et bleu-blanc) pour les sections
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

    // ── Halo secondaire pour la naine blanche (plus intense, plus proche) ────
    const dwarfGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexWhite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0,
    }));
    dwarfGlow.scale.set(4, 4, 1);
    dwarfGlow.position.set(0, 0, -0.5);
    scene.add(dwarfGlow);

    // ── ARCS DE CHAMP MAGNETIQUE (naine blanche / magnetar) ──────────────────
    // Comme sur l'image de reference : des arcs ovales qui s'enroulent autour
    // de la sphere, de tailles et orientations differentes (lignes de champ)
    const dwarfArcsGroup = new THREE.Group();
    dwarfArcsGroup.visible = false;
    scene.add(dwarfArcsGroup);

    const NB_ARCS = tier === 'low' ? 12 : 20;
    const dwarfArcs = [];

    for (let i = 0; i < NB_ARCS; i++) {
      // Chaque arc est un anneau (TorusGeometry) ovale et incline
      // Rayon variable + tube tres fin pour effet "fil lumineux"
      const radius = 1.4 + Math.random() * 1.8;
      const tube   = 0.006 + Math.random() * 0.008;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 4, 96),
        new THREE.MeshBasicMaterial({
          color: 0xb8dcff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      // Inclinaisons aleatoires pour creer le "noeud" d'arcs entrecroises
      arc.rotation.x = Math.random() * Math.PI;
      arc.rotation.y = Math.random() * Math.PI;
      arc.rotation.z = Math.random() * Math.PI;
      // Forme ovale (asymetrique) pour ressembler aux lignes de champ
      arc.scale.set(1, 0.4 + Math.random() * 0.5, 1);

      dwarfArcsGroup.add(arc);
      dwarfArcs.push({
        mesh: arc,
        baseRotX: arc.rotation.x,
        baseRotY: arc.rotation.y,
        baseRotZ: arc.rotation.z,
        speedX: (Math.random() - 0.5) * 0.0015,
        speedY: (Math.random() - 0.5) * 0.0015,
        speedZ: (Math.random() - 0.5) * 0.001,
        flickerSpeed: 1.5 + Math.random() * 2.5,
        flickerOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.4 + Math.random() * 0.5,
      });
    }

    // ── Anneaux orbitaux globaux ─────────────────────────────────────────────
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
    // Scale 0.65 pour voir le torus knot ENTIER dans le viewport (au lieu de gros plan)
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

    // ── CONSTELLATIONS REALISTES (skills) ───────────────────────────────────
    const constellationGroup = new THREE.Group();
    constellationGroup.visible = false;
    scene.add(constellationGroup);

    const constStars = [];   // chaque etoile : { mesh, basePos, twinkleSpeed, twinkleOffset, baseOpacity }
    const constLines = [];

    CONSTELLATIONS.forEach((cst, cIdx) => {
      // Etoiles
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
        sprite.scale.set(size * 4, size * 4, 1);
        sprite.position.set(star.x, star.y, star.z);
        constellationGroup.add(sprite);

        const starObj = {
          mesh: sprite,
          basePos: { x: star.x, y: star.y, z: star.z },
          twinkleSpeed: 1.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          baseOpacity: magToOpacity(star.mag),
          name: star.name,
          mag: star.mag,
        };
        constStars.push(starObj);
        localStars.push(starObj);
      });

      // Lignes de connexion (entre etoiles de la MEME constellation)
      cst.connections.forEach(([i, j]) => {
        const a = localStars[i].basePos;
        const b = localStars[j].basePos;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3(b.x, b.y, b.z),
        ]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          color: 0xd4c19a,
          transparent: true,
          opacity: 0,
        }));
        constellationGroup.add(line);
        constLines.push(line);
      });
    });

    // Petites etoiles decoratives en fond du panel constellation
    const DECO_STARS = 40;
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
    // Pour la naine blanche : couleur quasi-blanc-pur teintee bleu, halo intense
    const morphTargets = {
      0: { centerX: 0, sphereVisible: 1, projectsVisible: 0, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x050309, sphereScale: 1, sphereMetal: 1, sphereRough: 0.08,
           sphereEnvIntensity: 2.5, haloOpacity: 0.5, haloColor: 0xffd97a, haloScale: 7,
           ringOpacities: [0.4, 0.2, 0],
           sparkOpacity: 0.7, sparkColor: 0xffd97a },

      1: { centerX: 0, sphereVisible: 1, projectsVisible: 0, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x8a6f3f, sphereScale: 1.1, sphereMetal: 0.7, sphereRough: 0.25,
           sphereEnvIntensity: 1.5, haloOpacity: 0.3, haloColor: 0xd4c19a, haloScale: 8,
           ringOpacities: [0.8, 0.6, 0.4],
           sparkOpacity: 0.4, sparkColor: 0xd4c19a },

      // 2 SKILLS : sphere centrale TRES petite + constellations
      2: { centerX: 0, sphereVisible: 1, projectsVisible: 0, constVisible: 1, dwarfGlowOpacity: 0,
           sphereColor: 0x1a1410, sphereScale: 0.25, sphereMetal: 1, sphereRough: 0.15,
           sphereEnvIntensity: 1.8, haloOpacity: 0.15, haloColor: 0xd4c19a, haloScale: 2,
           ringOpacities: [0, 0, 0],
           sparkOpacity: 0.2, sparkColor: 0xffd97a },

      3: { centerX: 0, sphereVisible: 0, projectsVisible: 1, constVisible: 0, dwarfGlowOpacity: 0,
           sphereColor: 0x050309, sphereScale: 0.01, sphereMetal: 1, sphereRough: 0.08,
           sphereEnvIntensity: 2.5, haloOpacity: 0, haloColor: 0xffd97a, haloScale: 5,
           ringOpacities: [0, 0, 0],
           sparkOpacity: 0.5, sparkColor: 0xd4c19a },

      // 4 CONTACT : NAINE BLANCHE decalee a droite pour liberer le formulaire
      // - reduit la taille (0.7 -> 0.55)
      // - decalee a droite (centerX = 3) pour laisser place au formulaire
      // - halo legerement plus petit (11 -> 9)
      4: { centerX: 3, sphereVisible: 1, projectsVisible: 0, constVisible: 0, dwarfGlowOpacity: 1,
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

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      const state = stateRef.current;

      const targetSection = activeSectionRef.current ?? 0;
      if (targetSection !== state.targetMorph) {
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

      // ── DECALAGE HORIZONTAL (centerX) ─────────────────────────────────────
      // En section contact, on decale toute la naine blanche a droite
      // pour liberer la zone du formulaire a gauche
      const centerX = lerp(from.centerX, to.centerX, p);
      sphere.position.x        = centerX;
      halo.position.x          = centerX;
      dwarfGlow.position.x     = centerX;
      dwarfArcsGroup.position.x = centerX;

      // Pour la naine blanche : material emissif (lumiere propre tres intense)
      if (state.targetMorph === 4 || state.currentMorph === 4) {
        sphereMat.emissive = new THREE.Color(0xeaf4ff);
        const dwarfP = state.targetMorph === 4 ? p : (1 - p);
        // Intensite tres elevee = effet aveuglant comme l'image de reference
        sphereMat.emissiveIntensity = 3.5 * dwarfP;
      } else {
        sphereMat.emissive = new THREE.Color(0x000000);
        sphereMat.emissiveIntensity = 0;
      }

      const projectsVis = lerp(from.projectsVisible, to.projectsVisible, p);
      projectsGroup.visible = projectsVis > 0.01;
      projKnot.material.transparent     = true;
      projKnot.material.opacity         = projectsVis;
      projSphere.material.transparent   = true;
      projSphere.material.opacity       = projectsVis;
      projDodec.material.transparent    = true;
      projDodec.material.opacity        = projectsVis;
      projRings.forEach((ring, i) => {
        const baseOp = i === 2 ? 0.2 : 0.5;
        ring.material.opacity = baseOp * projectsVis;
      });

      // Glow naine blanche
      const dwarfGlowVis = lerp(from.dwarfGlowOpacity, to.dwarfGlowOpacity, p);
      // Pulsation rapide de la naine blanche (instabilites)
      const dwarfPulse = 0.7 + Math.sin(t * 4.0) * 0.25 + Math.sin(t * 7.3) * 0.1;
      dwarfGlow.material.opacity = dwarfGlowVis * dwarfPulse;
      dwarfGlow.scale.setScalar((3 + Math.sin(t * 4.0) * 0.4) * (dwarfGlowVis > 0.01 ? 1 : 0));

      // ── Arcs magnetiques (lignes de champ qui rayonnent autour) ───────────
      dwarfArcsGroup.visible = dwarfGlowVis > 0.01;
      if (dwarfArcsGroup.visible) {
        dwarfArcs.forEach((arc) => {
          // Rotation continue lente et chaotique = lignes de champ qui bougent
          arc.mesh.rotation.x = arc.baseRotX + t * arc.speedX * 60;
          arc.mesh.rotation.y = arc.baseRotY + t * arc.speedY * 60;
          arc.mesh.rotation.z = arc.baseRotZ + t * arc.speedZ * 60;
          // Scintillement (intensite variable des plasma loops)
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
      // Switch de texture du halo selon section
      if (state.targetMorph === 4) {
        halo.material.map = haloTexWhite;
      } else {
        halo.material.map = haloTexGold;
      }
      halo.material.needsUpdate = true;

      rings.forEach((ring, i) => {
        ring.material.opacity = lerp(from.ringOpacities[i], to.ringOpacities[i], p);
        ring.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.0006;
      });

      // Projects animation
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

      // ── CONSTELLATIONS REALISTES ──────────────────────────────────────────
      const cOp = lerp(from.constVisible, to.constVisible, p);
      constellationGroup.visible = cOp > 0.01;
      if (constellationGroup.visible) {
        // Twinkle (scintillement realiste, chaque etoile sa frequence)
        constStars.forEach((star) => {
          const twinkle = 0.75 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.25;
          star.mesh.material.opacity = star.baseOpacity * cOp * twinkle;
          // Pour Betelgeuse (orange-rouge), teinter
          if (star.name === 'Betelgeuse') {
            star.mesh.material.color.setHex(0xffaa55);
          } else if (star.name === 'Rigel') {
            star.mesh.material.color.setHex(0xc8d8ff);  // bleu-blanc
          } else {
            star.mesh.material.color.setHex(0xfff8e8);
          }
        });
        constLines.forEach((line) => {
          line.material.opacity = 0.25 * cOp;
        });
        decoStars.forEach((star) => {
          const tw = 0.5 + Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5;
          star.mesh.material.opacity = star.baseOpacity * cOp * tw;
        });
        // Rotation tres lente de l'ensemble (deplacement celeste)
        constellationGroup.rotation.y = Math.sin(t * 0.04) * 0.04;
      }

      // Sphere rotation
      sphere.rotation.y = t * 0.18;
      sphere.rotation.x = Math.sin(t * 0.3) * 0.15;

      starfield.rotation.y = t * 0.015;

      // Sparks
      sparkMat.color.setHex(lerpColor(from.sparkColor, to.sparkColor, p));
      sparkMat.opacity = lerp(from.sparkOpacity, to.sparkOpacity, p);
      const sparkPositions = sparkGeo.getAttribute('position').array;
      const targetRadius = state.targetMorph === 3 ? 1.8 : baseScale * 1.8;
      // Pour la naine blanche, les sparks sont plus rapides (ejection magnetique)
      const sparkSpeed = state.targetMorph === 4 ? 0.012 : 0.005;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const d = sparkData[i];
        d.life += 0.01;
        if (d.life > d.maxLife) {
          const theta = Math.random() * Math.PI * 2;
          const phi   = Math.acos(Math.random() * 2 - 1);
          // Sparks emis depuis la position courante (centerX) de la sphere
          sparkPositions[i*3]   = centerX + targetRadius * Math.sin(phi) * Math.cos(theta);
          sparkPositions[i*3+1] = targetRadius * Math.sin(phi) * Math.sin(theta);
          sparkPositions[i*3+2] = targetRadius * Math.cos(phi);
          // Vitesse radiale autour du centre decale
          const dx = sparkPositions[i*3]   - centerX;
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
      sphereGeo.dispose();
      sphereMat.dispose();
      projKnot.geometry.dispose();   projKnot.material.dispose();
      projSphere.geometry.dispose(); projSphere.material.dispose();
      projDodec.geometry.dispose();  projDodec.material.dispose();
      rings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      projRings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      constStars.forEach(s => { s.mesh.material.dispose(); });
      constLines.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
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