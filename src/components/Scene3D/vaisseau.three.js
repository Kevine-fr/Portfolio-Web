// ─── Vaisseau et hyperespace (mode « Naviguer dans mon espace ») ───────────
// Construit dans la scène existante : le vaisseau vole entre les vrais astres
// de PersistentScene au lieu d'une copie. La physique vit dans lib/pilotage.js
// (pure, testée) ; ici, seulement le rendu.
import * as THREE from 'three';
import { COLORS } from '../../styles/tokens';
import { avant } from '../../lib/pilotage';

// Dessin original : une flèche à ailes en delta, métal noir filet d'or,
// cockpit bleuté et deux réacteurs. Rien d'emprunté à un vaisseau connu.
function construireVaisseau(envMap, haloTex) {
  const groupe = new THREE.Group();
  const coque = new THREE.MeshStandardMaterial({
    color: 0x14100c, metalness: 0.95, roughness: 0.22, envMap, envMapIntensity: 2.0,
  });
  const filet = new THREE.MeshStandardMaterial({
    color: COLORS.goldPale, metalness: 1.0, roughness: 0.3, envMap, envMapIntensity: 1.6,
    emissive: 0x2a1d08,
  });
  const verre = new THREE.MeshStandardMaterial({
    color: 0x9fd4ff, metalness: 0.2, roughness: 0.05, emissive: 0x1a3c66, envMap, envMapIntensity: 1.2,
  });

  // Fuselage : cône étiré, la pointe vers -z (l'avant du vaisseau)
  const fuselage = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.2, 6), coque);
  fuselage.rotation.x = -Math.PI / 2;
  groupe.add(fuselage);

  // Ailes en delta : un triangle extrudé de chaque côté
  const forme = new THREE.Shape();
  forme.moveTo(0, 0.55);
  forme.lineTo(1.35, -0.75);
  forme.lineTo(0.15, -0.55);
  forme.lineTo(0, -0.55);
  const aileGeo = new THREE.ExtrudeGeometry(forme, { depth: 0.04, bevelEnabled: false });
  aileGeo.rotateX(-Math.PI / 2);
  aileGeo.translate(0, -0.02, 0.35);
  const aileD = new THREE.Mesh(aileGeo, coque);
  const aileG = new THREE.Mesh(aileGeo, coque);
  aileG.scale.x = -1;
  groupe.add(aileD, aileG);

  // Filets d'or le long du bord d'attaque
  const bordGeo = new THREE.BoxGeometry(0.03, 0.03, 1.55);
  [1, -1].forEach((s) => {
    const bord = new THREE.Mesh(bordGeo, filet);
    bord.position.set(0.66 * s, 0.03, 0.42);
    bord.rotation.y = -0.79 * s;
    groupe.add(bord);
  });

  // Dérive dorsale
  const derive = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.6), filet);
  derive.position.set(0, 0.26, 0.75);
  derive.rotation.x = -0.35;
  groupe.add(derive);

  // Cockpit
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), verre);
  cockpit.scale.set(0.9, 0.7, 2.0);
  cockpit.position.set(0, 0.12, -0.15);
  groupe.add(cockpit);

  // Réacteurs : tuyères et lueurs (sprites additifs, mis à l'échelle de la poussée)
  const tuyereGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.32, 12, 1, true);
  const lueurs = [];
  [0.32, -0.32].forEach((x) => {
    const tuyere = new THREE.Mesh(tuyereGeo, filet);
    tuyere.rotation.x = Math.PI / 2;
    tuyere.position.set(x, 0, 1.05);
    groupe.add(tuyere);
    const lueur = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, color: 0x9cc8ff, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.8,
    }));
    lueur.position.set(x, 0, 1.28);
    lueur.scale.setScalar(0.5);
    groupe.add(lueur);
    lueurs.push(lueur);
  });

  // Lumière d'appoint : sans elle le vaisseau est une silhouette noire entre deux astres
  const appoint = new THREE.PointLight(0xffe7b8, 1.6, 9, 1.5);
  appoint.position.set(0, 2.2, 1.5);
  groupe.add(appoint);

  // A l'echelle 1 il masquait l'astre vise sur mobile : la camera suit de pres
  groupe.scale.setScalar(0.8);

  const geometries = [fuselage.geometry, aileGeo, bordGeo, derive.geometry, cockpit.geometry, tuyereGeo];
  const materiaux = [coque, filet, verre, ...lueurs.map((l) => l.material)];
  return { groupe, lueurs, geometries, materiaux };
}

// Traînées d'étoiles de l'hyperespace : des segments dans le repère de la
// caméra, sur un tube autour de l'axe de visée. Leur longueur suit
// l'intensité du saut ; à 0 elles sont invisibles et ne coûtent qu'un test.
function construireTrainees(tier) {
  const N = tier === 'low' ? 260 : tier === 'medium' ? 520 : 900;
  const PROFONDEUR = 160;
  const pos = new Float32Array(N * 6);
  const col = new Float32Array(N * 6);
  const z = new Float32Array(N);
  const vitesseRel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    // Pas d'étoile sur l'axe : elle traverserait le vaisseau à l'écran
    const r = 2.5 + Math.pow(Math.random(), 0.6) * 22;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    pos[i * 6] = pos[i * 6 + 3] = x;
    pos[i * 6 + 1] = pos[i * 6 + 4] = y;
    z[i] = -Math.random() * PROFONDEUR;
    vitesseRel[i] = 0.7 + Math.random() * 0.6;
    // Tête blanc-bleu, queue presque noire : en additif, c'est le dégradé de la traînée
    const teinte = Math.random() < 0.25 ? [1.0, 0.92, 0.75] : [0.78, 0.88, 1.0];
    col[i * 6] = teinte[0]; col[i * 6 + 1] = teinte[1]; col[i * 6 + 2] = teinte[2];
    col[i * 6 + 3] = teinte[0] * 0.05; col[i * 6 + 4] = teinte[1] * 0.08; col[i * 6 + 5] = teinte[2] * 0.15;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false,
  });
  const lignes = new THREE.LineSegments(geo, mat);
  lignes.frustumCulled = false;
  lignes.renderOrder = 10;
  lignes.visible = false;
  return { lignes, z, vitesseRel, N, PROFONDEUR };
}

/**
 * Ajoute le vaisseau, la caméra de poursuite et l'hyperespace à la scène.
 * `mettreAJour(v, phaseSaut, dt, t)` est appelé par la boucle de PersistentScene.
 */
export function creerVaisseau3D({ scene, camera, envMap, haloTex, tier }) {
  const vaisseau = construireVaisseau(envMap, haloTex);
  scene.add(vaisseau.groupe);

  const trainees = construireTrainees(tier);
  camera.add(trainees.lignes);
  scene.add(camera); // un enfant de la caméra n'est rendu que si la caméra est dans la scène

  const FOV_BASE = camera.fov;
  const av = [0, 0, 0];
  const vAv = new THREE.Vector3();
  const vCam = new THREE.Vector3();
  const vVisee = new THREE.Vector3();
  let premiereImage = true;

  function mettreAJour(v, saut, dt, t) {
    const intensite = saut ? saut.intensite : 0;

    // ── Vaisseau
    vaisseau.groupe.position.set(v.position[0], v.position[1], v.position[2]);
    // Tremblement de charge : léger, et seulement avant le départ
    const tremble = saut?.phase === 'charge' ? saut.p * 0.04 : 0;
    vaisseau.groupe.rotation.set(
      v.tangage + Math.sin(t * 61) * tremble,
      v.lacet + Math.sin(t * 47) * tremble,
      v.inclinaison,
      'YXZ',
    );
    const poussee = Math.min(1, Math.abs(v.vitesse) / 22);
    const feu = 0.35 + poussee * 0.9 + intensite * 1.4;
    vaisseau.lueurs.forEach((l, i) => {
      l.scale.setScalar(feu * (0.95 + Math.sin(t * 30 + i) * 0.05));
      l.material.opacity = Math.min(1, 0.45 + poussee * 0.5 + intensite);
    });

    // ── Caméra de poursuite : derrière et au-dessus, regard un peu devant le nez
    avant(v.lacet, v.tangage, av);
    vAv.set(av[0], av[1], av[2]);
    const recul = 5.2 + poussee * 1.2 + intensite * 2.5;
    vCam.copy(vaisseau.groupe.position).addScaledVector(vAv, -recul);
    vCam.y += 1.5;
    // En saut, la caméra est rivée au vaisseau : avec un retard, le vaisseau
    // sortait du cadre dès les premières images du tunnel.
    const k = premiereImage || saut ? 1 : Math.min(1, dt * 6);
    camera.position.lerp(vCam, k);
    vVisee.copy(vaisseau.groupe.position).addScaledVector(vAv, 8);
    camera.lookAt(vVisee);
    premiereImage = false;

    // Le champ s'élargit dans le tunnel : la sensation de vitesse vient surtout de là
    const fovCible = FOV_BASE + intensite * (saut?.reduit ? 0 : 38);
    if (Math.abs(camera.fov - fovCible) > 0.05) {
      camera.fov += (fovCible - camera.fov) * Math.min(1, dt * 8);
      camera.updateProjectionMatrix();
    }

    // ── Traînées
    const L = trainees.lignes;
    if (intensite < 0.01) {
      L.visible = false;
      return;
    }
    L.visible = true;
    L.material.opacity = Math.min(1, intensite * 1.2);
    const arr = L.geometry.attributes.position.array;
    const vitesse = 40 + intensite * 420;
    const etirement = saut?.reduit ? 0.5 : 0.4 + intensite * 38;
    for (let i = 0; i < trainees.N; i++) {
      trainees.z[i] += vitesse * trainees.vitesseRel[i] * dt;
      if (trainees.z[i] > 2) trainees.z[i] -= trainees.PROFONDEUR;
      const tete = trainees.z[i];
      arr[i * 6 + 2] = tete;
      arr[i * 6 + 5] = tete - etirement * trainees.vitesseRel[i];
    }
    L.geometry.attributes.position.needsUpdate = true;
  }

  function dispose() {
    camera.remove(trainees.lignes);
    scene.remove(vaisseau.groupe);
    trainees.lignes.geometry.dispose();
    trainees.lignes.material.dispose();
    vaisseau.geometries.forEach((g) => g.dispose());
    vaisseau.materiaux.forEach((m) => m.dispose());
  }

  return { mettreAJour, dispose };
}
