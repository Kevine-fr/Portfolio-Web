import * as THREE from 'three';

/**
 * Construit et retourne tous les objets Three.js de la scène hero.
 * @param {HTMLCanvasElement} canvas
 * @param {number} width
 * @param {number} height
 * @returns {{ renderer, scene, camera, dispose, objects }}
 */
export function buildHeroScene(canvas, width, height) {
  // ─── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ─── Scene & Camera ─────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
  camera.position.set(0, 0, 7);

  // ─── Particules ─────────────────────────────────────────────────────────────
  const PARTICLE_COUNT = 3000;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const palette = [
    [0.0, 1.0, 1.0],   // cyan
    [0.55, 0.0, 1.0],  // violet
    [0.0, 1.0, 0.6],   // vert-cyan
    [0.9, 0.0, 0.9],   // rose
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.045, vertexColors: true, transparent: true, opacity: 0.75,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ─── Torus Knot (fil extérieur) ─────────────────────────────────────────────
  const tkGeo = new THREE.TorusKnotGeometry(1.6, 0.55, 220, 20, 2, 3);
  const tkMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.2,
  });
  const torusKnot = new THREE.Mesh(tkGeo, tkMat);
  torusKnot.position.x = 2;
  scene.add(torusKnot);

  // ─── Torus Knot (fil intérieur) ─────────────────────────────────────────────
  const tkGeo2 = new THREE.TorusKnotGeometry(1.6, 0.55, 110, 10, 2, 3);
  const tkMat2 = new THREE.MeshBasicMaterial({
    color: 0x8800ff, wireframe: true, transparent: true, opacity: 0.1,
  });
  const torusKnot2 = new THREE.Mesh(tkGeo2, tkMat2);
  torusKnot2.position.x = 2;
  scene.add(torusKnot2);

  // ─── Icosaèdre flottant (accent) ────────────────────────────────────────────
  const icoGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.45,
  });
  const icosahedron = new THREE.Mesh(icoGeo, icoMat);
  icosahedron.position.set(-3, 2, 2);
  scene.add(icosahedron);

  // ─── Anneaux orbitaux ───────────────────────────────────────────────────────
  const ringConfigs = [
    { radius: 3.4, color: 0x00ffff, opacity: 0.22 },
    { radius: 4.2, color: 0x8800ff, opacity: 0.12 },
    { radius: 5.1, color: 0x00ff88, opacity: 0.08 },
  ];
  const rings = ringConfigs.map(({ radius, color, opacity }, i) => {
    const geo = new THREE.TorusGeometry(radius, 0.008, 6, 120);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / (2.2 + i * 0.6);
    ring.rotation.z = i * 0.5;
    ring.position.x = 2;
    scene.add(ring);
    return ring;
  });

  // ─── Grille (style Tron) ────────────────────────────────────────────────────
  const grid = new THREE.GridHelper(60, 60, 0x003333, 0x001515);
  grid.position.y = -4.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  // ─── Dispose (nettoyage mémoire) ────────────────────────────────────────────
  const dispose = () => {
    [pGeo, tkGeo, tkGeo2, icoGeo].forEach((g) => g.dispose());
    [pMat, tkMat, tkMat2, icoMat].forEach((m) => m.dispose());
    rings.forEach((r) => { r.geometry.dispose(); r.material.dispose(); });
    renderer.dispose();
  };

  return {
    renderer,
    scene,
    camera,
    dispose,
    objects: { particles, torusKnot, torusKnot2, icosahedron, rings },
  };
}
