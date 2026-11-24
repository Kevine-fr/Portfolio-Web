// ─── Pilotage du vaisseau et saut en hyperespace ────────────────────────────
// Fonctions pures (aucun THREE, aucun DOM) : la scène les appelle à chaque
// image, les tests les éprouvent sans WebGL. Les vecteurs sont des tableaux
// [x, y, z] et l'état du vaisseau est muté sur place pour ne rien allouer
// dans la boucle de rendu (60 fois par seconde sur mobile).
import { ASTRES, centreAstre } from './espace';

export const REGLAGES = {
  vitesseMax: 22,          // unités / s
  boost: 2.2,              // multiplicateur de vitesseMax
  marcheArriere: 0.3,      // fraction de vitesseMax en reculant
  acceleration: 2.4,       // vitesse de convergence vers la consigne (1/s)
  virage: 1.6,             // rad / s en lacet
  tangage: 1.1,            // rad / s en tangage
  tangageMax: 1.2,         // ± rad : au-delà la caméra de poursuite se retourne
  inclinaisonMax: 0.6,     // roulis visuel en virage
  // Domaine de vol : assez large pour tourner autour de chaque astre, assez
  // petit pour que le champ d'étoiles lointain (r ≤ 250) entoure toujours le vaisseau.
  centre: [8, 5, -120],
  rayonDomaine: 190,
  // Panneau de détails : on l'ouvre à 16, on le ferme à 22. Sans cet écart, un
  // vaisseau qui longe la limite faisait clignoter le panneau.
  approcheEntree: 16,
  approcheSortie: 22,
  distanceArrivee: 9,      // où le saut nous pose, devant l'astre
};

export const SAUT = {
  charge: 0.7,   // le vaisseau s'aligne, les étoiles commencent à s'étirer
  tunnel: 1.4,   // le voyage lui-même
  sortie: 0.6,   // les traînées se rétractent, éclair de sortie
};
// prefers-reduced-motion : pas d'étirement plein écran, un fondu court
export const SAUT_REDUIT = { charge: 0.15, tunnel: 0.6, sortie: 0.25 };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const longueur = (v) => Math.hypot(v[0], v[1], v[2]);
export const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Direction de vol pour un lacet / tangage (convention three.js : l'avant est -z). */
export function avant(lacet, tangage, out = [0, 0, 0]) {
  const c = Math.cos(tangage);
  out[0] = -Math.sin(lacet) * c;
  out[1] = Math.sin(tangage);
  out[2] = -Math.cos(lacet) * c;
  return out;
}

/** Lacet et tangage qui font regarder `de` vers `vers`. */
export function orientationVers(de, vers) {
  const dx = vers[0] - de[0], dy = vers[1] - de[1], dz = vers[2] - de[2];
  const horiz = Math.hypot(dx, dz);
  return {
    lacet: Math.atan2(-dx, -dz),
    tangage: clamp(Math.atan2(dy, horiz), -REGLAGES.tangageMax, REGLAGES.tangageMax),
  };
}

/** Interpole deux angles par le plus court chemin (sinon un demi-tour de 350°). */
export function interpolerAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** Point de départ : devant la sphère d'accueil, le nez tourné vers elle. */
export function creerVaisseau() {
  return {
    position: [0, 1.5, 16],
    lacet: 0,
    tangage: -0.08,
    inclinaison: 0,
    vitesse: 0,
    saut: null,
  };
}

/**
 * Entrée normalisée : lacet, tangage, poussee dans [-1, 1], boost booléen.
 * Le clavier et le manche tactile écrivent tous deux dans cette forme.
 */
export function entreeVide() {
  return { lacet: 0, tangage: 0, poussee: 0, boost: false };
}

/** Clavier → entrée. ZQSD et WASD (claviers AZERTY et QWERTY), plus les flèches. */
export function entreeClavier(touches) {
  const a = (...codes) => codes.some((c) => touches.has(c));
  return {
    lacet: (a('KeyA', 'KeyQ', 'ArrowLeft') ? 1 : 0) - (a('KeyD', 'ArrowRight') ? 1 : 0),
    tangage: (a('ArrowUp') ? 1 : 0) - (a('ArrowDown') ? 1 : 0),
    // KeyW est la touche physique du Z en AZERTY : elle couvre les deux claviers.
    poussee: (a('KeyW') ? 1 : 0) - (a('KeyS') ? 1 : 0),
    boost: a('ShiftLeft', 'ShiftRight'),
  };
}

/** Somme de deux entrées (clavier + manche), bornée. */
export function fusionnerEntrees(a, b) {
  return {
    lacet: clamp(a.lacet + b.lacet, -1, 1),
    tangage: clamp(a.tangage + b.tangage, -1, 1),
    poussee: clamp(a.poussee + b.poussee, -1, 1),
    boost: a.boost || b.boost,
  };
}

/** Manche virtuel : décalage du doigt (px) → lacet / tangage dans [-1, 1]. */
export function entreeManche(dx, dy, rayon = 70) {
  const n = Math.hypot(dx, dy);
  if (n < rayon * 0.12) return { lacet: 0, tangage: 0 }; // zone morte : le pouce tremble
  const k = Math.min(1, n / rayon) / n;
  return { lacet: -dx * k, tangage: -dy * k };
}

const _av = [0, 0, 0];

/** Repousse le vaisseau hors des astres et le garde dans le domaine de vol. */
function contraindre(pos, reglages) {
  for (const astre of ASTRES) {
    const c = centreAstre(astre);
    const d = distance(pos, c);
    if (d < astre.rayon && d > 1e-6) {
      const k = astre.rayon / d;
      for (let i = 0; i < 3; i++) pos[i] = c[i] + (pos[i] - c[i]) * k;
    }
  }
  const off = [pos[0] - reglages.centre[0], pos[1] - reglages.centre[1], pos[2] - reglages.centre[2]];
  const d = longueur(off);
  if (d > reglages.rayonDomaine) {
    const k = reglages.rayonDomaine / d;
    for (let i = 0; i < 3; i++) pos[i] = reglages.centre[i] + off[i] * k;
    return true;
  }
  return false;
}

/** Une image de vol libre. Ne fait rien pendant un saut. */
export function piloter(v, entree, dt, reglages = REGLAGES) {
  if (v.saut) return v;
  dt = clamp(dt, 0, 0.1); // onglet revenu au premier plan : pas de bond de 3 s
  v.lacet += entree.lacet * reglages.virage * dt;
  v.tangage = clamp(v.tangage + entree.tangage * reglages.tangage * dt, -reglages.tangageMax, reglages.tangageMax);

  const max = reglages.vitesseMax * (entree.boost && entree.poussee > 0 ? reglages.boost : 1);
  const consigne = entree.poussee >= 0 ? entree.poussee * max : entree.poussee * max * reglages.marcheArriere;
  v.vitesse += (consigne - v.vitesse) * Math.min(1, reglages.acceleration * dt);
  if (Math.abs(v.vitesse) < 0.01 && entree.poussee === 0) v.vitesse = 0;

  const cibleInclinaison = entree.lacet * reglages.inclinaisonMax;
  v.inclinaison += (cibleInclinaison - v.inclinaison) * Math.min(1, 5 * dt);

  avant(v.lacet, v.tangage, _av);
  for (let i = 0; i < 3; i++) v.position[i] += _av[i] * v.vitesse * dt;
  if (contraindre(v.position, reglages)) v.vitesse *= 0.9; // le bord freine
  return v;
}

/** Où un saut vers l'astre `index` pose le vaisseau, vu depuis `depuis`. */
export function pointArrivee(index, depuis, reglages = REGLAGES) {
  const c = centreAstre(ASTRES[index]);
  const dir = [depuis[0] - c[0], depuis[1] - c[1], depuis[2] - c[2]];
  let n = longueur(dir);
  if (n < 1e-6) { dir[0] = 0; dir[1] = 0; dir[2] = 1; n = 1; }
  // Un peu au-dessus du plan de l'astre : les anneaux se lisent mieux en plongée
  return [
    c[0] + (dir[0] / n) * reglages.distanceArrivee,
    c[1] + (dir[1] / n) * reglages.distanceArrivee + 1.5,
    c[2] + (dir[2] / n) * reglages.distanceArrivee,
  ];
}

/**
 * Prépare un saut. Renvoie false s'il n'y a pas lieu de sauter (déjà en saut,
 * astre inconnu, ou déjà posé devant).
 */
export function lancerSaut(v, index, { reduit = false } = {}) {
  if (v.saut || !ASTRES[index]) return false;
  const arrivee = pointArrivee(index, v.position);
  if (distance(v.position, arrivee) < 2) return false;
  const centre = centreAstre(ASTRES[index]);
  const visee = orientationVers(v.position, centre);
  const final = orientationVers(arrivee, centre);
  v.saut = {
    cible: index,
    depart: [...v.position],
    arrivee,
    lacetDepart: v.lacet,
    tangageDepart: v.tangage,
    visee,
    final,
    duree: reduit ? SAUT_REDUIT : SAUT,
    ecoule: 0,
  };
  return true;
}

/**
 * Phase d'un saut à l'instant `ecoule` : position du voyage (0 → 1) et
 * intensité des traînées (0 → 1 → 0). Pure, pour que la chorégraphie se
 * teste sans rendu.
 */
export function phaseSaut(duree, ecoule) {
  const { charge, tunnel, sortie } = duree;
  if (ecoule < charge) {
    const p = charge ? ecoule / charge : 1;
    return { phase: 'charge', p, voyage: 0, intensite: p * p * 0.35 };
  }
  if (ecoule < charge + tunnel) {
    const p = (ecoule - charge) / tunnel;
    return { phase: 'tunnel', p, voyage: easeInOut(p), intensite: 0.35 + 0.65 * Math.min(1, p * 4) };
  }
  if (ecoule < charge + tunnel + sortie) {
    const p = (ecoule - charge - tunnel) / sortie;
    return { phase: 'sortie', p, voyage: 1, intensite: (1 - p) * (1 - p) };
  }
  return { phase: 'fini', p: 1, voyage: 1, intensite: 0 };
}

/** Avance un saut en cours. Renvoie sa phase (ou null hors saut). */
export function avancerSaut(v, dt) {
  const s = v.saut;
  if (!s) return null;
  s.ecoule += clamp(dt, 0, 0.1);
  const ph = phaseSaut(s.duree, s.ecoule);

  if (ph.phase === 'charge') {
    // Le nez pivote vers la destination pendant que les moteurs chargent
    const k = easeInOut(ph.p);
    v.lacet = interpolerAngle(s.lacetDepart, s.visee.lacet, k);
    v.tangage = s.tangageDepart + (s.visee.tangage - s.tangageDepart) * k;
    v.vitesse *= 0.9;
  } else {
    for (let i = 0; i < 3; i++) v.position[i] = s.depart[i] + (s.arrivee[i] - s.depart[i]) * ph.voyage;
    v.lacet = interpolerAngle(s.visee.lacet, s.final.lacet, ph.voyage);
    v.tangage = s.visee.tangage + (s.final.tangage - s.visee.tangage) * ph.voyage;
    v.vitesse = 0;
  }
  v.inclinaison *= 0.9;

  if (ph.phase === 'fini') {
    v.position[0] = s.arrivee[0]; v.position[1] = s.arrivee[1]; v.position[2] = s.arrivee[2];
    v.saut = null;
  }
  return { ...ph, cible: s.cible, reduit: s.duree === SAUT_REDUIT };
}

/**
 * L'astre dont on est assez près pour lire les détails, avec hystérésis :
 * l'astre affiché reste affiché jusqu'à `approcheSortie`.
 */
export function astreProche(position, courant = null, reglages = REGLAGES) {
  let meilleur = null;
  let dMin = Infinity;
  for (const astre of ASTRES) {
    const d = distance(position, centreAstre(astre));
    if (d < dMin) { dMin = d; meilleur = astre.index; }
  }
  if (courant !== null && courant !== undefined) {
    const dCourant = distance(position, centreAstre(ASTRES[courant]));
    if (dCourant <= reglages.approcheSortie && (meilleur === courant || dMin > reglages.approcheEntree)) {
      return courant;
    }
  }
  return dMin <= reglages.approcheEntree ? meilleur : null;
}
