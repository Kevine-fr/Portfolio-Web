import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ASTRES, centreAstre, resumeAstre } from '../lib/espace';
import {
  REGLAGES, SAUT, SAUT_REDUIT, astreProche, avancerSaut, avant, creerVaisseau, distance, entreeClavier,
  entreeManche, entreeVide, interpolerAngle, lancerSaut, orientationVers, phaseSaut, piloter, pointArrivee,
} from '../lib/pilotage';
import {
  FALLBACK_ABOUT, FALLBACK_EDUCATION, FALLBACK_EXPERIENCES, FALLBACK_PROJECTS, FALLBACK_SKILLS,
} from '../data/fallbacks';
import NavigationHUD from '../components/Navigation/NavigationHUD';

const proche = (a, b, eps = 1e-6) => a.every((v, i) => Math.abs(v - b[i]) < eps);

describe('pilotage — vol libre', () => {
  it("l'avant d'un vaisseau sans rotation est -z, et orientationVers inverse avant()", () => {
    expect(proche(avant(0, 0), [0, 0, -1])).toBe(true);
    const o = orientationVers([0, 0, 0], [3, 4, -5]);
    const d = avant(o.lacet, o.tangage);
    const n = Math.hypot(3, 4, -5);
    expect(proche(d, [3 / n, 4 / n, -5 / n], 1e-9)).toBe(true);
  });

  it('accélère vers la consigne, avance dans le sens du nez et ne dépasse pas la vitesse max', () => {
    const v = creerVaisseau();
    const z0 = v.position[2];
    for (let i = 0; i < 300; i++) piloter(v, { ...entreeVide(), poussee: 1 }, 1 / 60);
    expect(v.vitesse).toBeGreaterThan(REGLAGES.vitesseMax * 0.95);
    expect(v.vitesse).toBeLessThanOrEqual(REGLAGES.vitesseMax);
    expect(v.position[2]).toBeLessThan(z0);
  });

  it('le boost ne vaut qu\'en marche avant, la marche arrière est lente', () => {
    const v = creerVaisseau();
    for (let i = 0; i < 300; i++) piloter(v, { lacet: 0, tangage: 0, poussee: -1, boost: true }, 1 / 60);
    expect(v.vitesse).toBeLessThan(0);
    expect(Math.abs(v.vitesse)).toBeLessThanOrEqual(REGLAGES.vitesseMax * REGLAGES.marcheArriere + 1e-9);
  });

  it('borne le tangage (sinon la caméra de poursuite se retourne)', () => {
    const v = creerVaisseau();
    for (let i = 0; i < 600; i++) piloter(v, { ...entreeVide(), tangage: 1 }, 1 / 60);
    expect(v.tangage).toBeCloseTo(REGLAGES.tangageMax);
  });

  it("un onglet revenu au premier plan (dt de 3 s) ne téléporte pas le vaisseau", () => {
    const v = creerVaisseau();
    v.vitesse = REGLAGES.vitesseMax;
    const avantPos = [...v.position];
    piloter(v, { ...entreeVide(), poussee: 1 }, 3);
    expect(distance(avantPos, v.position)).toBeLessThan(REGLAGES.vitesseMax * 0.1 + 1e-6);
  });

  it("ne traverse pas un astre et ne quitte pas le domaine de vol", () => {
    const v = creerVaisseau();
    v.position = [0, 0, 0.5]; // dans la sphère d'accueil
    piloter(v, entreeVide(), 1 / 60);
    expect(distance(v.position, centreAstre(ASTRES[0]))).toBeGreaterThanOrEqual(ASTRES[0].rayon - 1e-9);

    v.position = [1000, 0, 0];
    piloter(v, entreeVide(), 1 / 60);
    expect(distance(v.position, REGLAGES.centre)).toBeLessThanOrEqual(REGLAGES.rayonDomaine + 1e-6);
  });

  it('chaque astre de départ est dans le domaine de vol', () => {
    ASTRES.forEach((a) => {
      expect(distance(centreAstre(a), REGLAGES.centre) + REGLAGES.distanceArrivee + 2).toBeLessThan(REGLAGES.rayonDomaine);
    });
  });
});

describe('pilotage — entrées', () => {
  it('clavier AZERTY (Z = KeyW, Q = KeyA) et QWERTY donnent la même commande', () => {
    expect(entreeClavier(new Set(['KeyW', 'KeyA']))).toEqual({ lacet: 1, tangage: 0, poussee: 1, boost: false });
    expect(entreeClavier(new Set(['KeyS', 'ArrowRight', 'ArrowUp', 'ShiftLeft'])))
      .toEqual({ lacet: -1, tangage: 1, poussee: -1, boost: true });
  });

  it('manche virtuel : zone morte au centre, borné à 1, glisser à droite vire à droite', () => {
    expect(entreeManche(3, 2)).toEqual({ lacet: 0, tangage: 0 });
    const m = entreeManche(500, 0);
    expect(m.lacet).toBeCloseTo(-1);
    expect(Math.abs(m.tangage)).toBe(0);
    expect(entreeManche(0, -70).tangage).toBeCloseTo(1); // glisser vers le haut : cabrer
  });

  it("interpolerAngle passe par le plus court chemin", () => {
    expect(interpolerAngle(3, -3, 1)).toBeCloseTo(-3 + Math.PI * 2);
    expect(interpolerAngle(3, -3, 0.5)).toBeCloseTo(Math.PI, 1);
  });
});

describe('pilotage — saut en hyperespace', () => {
  it('la chorégraphie : charge, tunnel, sortie, fini ; intensité qui monte puis retombe à 0', () => {
    const total = SAUT.charge + SAUT.tunnel + SAUT.sortie;
    expect(phaseSaut(SAUT, 0).phase).toBe('charge');
    expect(phaseSaut(SAUT, SAUT.charge + 0.01).phase).toBe('tunnel');
    expect(phaseSaut(SAUT, SAUT.charge + SAUT.tunnel / 2).intensite).toBe(1);
    expect(phaseSaut(SAUT, SAUT.charge + SAUT.tunnel + 0.01).phase).toBe('sortie');
    expect(phaseSaut(SAUT, total + 0.01)).toMatchObject({ phase: 'fini', intensite: 0, voyage: 1 });
    // Le voyage ne commence qu'après la charge et ne recule jamais
    let precedent = 0;
    for (let e = 0; e <= total; e += 0.05) {
      const { voyage } = phaseSaut(SAUT, e);
      expect(voyage).toBeGreaterThanOrEqual(precedent - 1e-12);
      precedent = voyage;
    }
    expect(phaseSaut(SAUT, SAUT.charge * 0.9).voyage).toBe(0);
  });

  it("pose le vaisseau devant l'astre visé, nez tourné vers lui, puis rend la main", () => {
    const v = creerVaisseau();
    expect(lancerSaut(v, 5)).toBe(true);
    expect(lancerSaut(v, 3)).toBe(false); // pas de second saut en plein tunnel
    const arrivee = pointArrivee(5, [0, 1.5, 16]);
    let ph;
    for (let i = 0; i < 400 && v.saut; i++) ph = avancerSaut(v, 1 / 60);
    expect(v.saut).toBeNull();
    expect(ph.phase).toBe('fini');
    expect(proche(v.position, arrivee, 1e-9)).toBe(true);
    const c = centreAstre(ASTRES[5]);
    expect(distance(v.position, c)).toBeLessThan(REGLAGES.approcheEntree);
    const o = orientationVers(v.position, c);
    expect(v.lacet).toBeCloseTo(o.lacet, 5);
    expect(astreProche(v.position)).toBe(5);
  });

  it('pendant le saut, les commandes ne bougent pas le vaisseau', () => {
    const v = creerVaisseau();
    lancerSaut(v, 2);
    const p = [...v.position];
    piloter(v, { lacet: 1, tangage: 1, poussee: 1, boost: true }, 1 / 60);
    expect(v.position).toEqual(p);
  });

  it("refuse un saut vers l'astre où l'on est déjà posé, ou vers un astre inconnu", () => {
    const v = creerVaisseau();
    v.position = pointArrivee(1, v.position);
    expect(lancerSaut(v, 1)).toBe(false);
    expect(lancerSaut(v, 42)).toBe(false);
  });

  it('mouvement réduit : saut plus court, signalé à la scène', () => {
    const v = creerVaisseau();
    lancerSaut(v, 6, { reduit: true });
    const ph = avancerSaut(v, 1 / 60);
    expect(ph.reduit).toBe(true);
    const total = SAUT_REDUIT.charge + SAUT_REDUIT.tunnel + SAUT_REDUIT.sortie;
    expect(total).toBeLessThan(SAUT.charge + SAUT.tunnel + SAUT.sortie);
  });
});

describe('astreProche', () => {
  it("ouvre le panneau à l'entrée et le garde jusqu'à la sortie (pas de clignotement en lisière)", () => {
    const c = centreAstre(ASTRES[1]);
    const a = (d) => [c[0] + d, c[1], c[2]];
    expect(astreProche(a(REGLAGES.approcheEntree + 1))).toBeNull();
    expect(astreProche(a(REGLAGES.approcheEntree - 1))).toBe(1);
    expect(astreProche(a(REGLAGES.approcheEntree + 1), 1)).toBe(1);
    expect(astreProche(a(REGLAGES.approcheSortie + 1), 1)).toBeNull();
  });

  it('les zones de détails des astres ne se chevauchent pas', () => {
    for (const a of ASTRES) {
      for (const b of ASTRES) {
        if (a.index < b.index) {
          expect(distance(centreAstre(a), centreAstre(b))).toBeGreaterThan(REGLAGES.approcheSortie * 2);
        }
      }
    }
  });
});

describe('resumeAstre', () => {
  const donnees = {
    about: FALLBACK_ABOUT, skills: FALLBACK_SKILLS, experiences: FALLBACK_EXPERIENCES,
    education: FALLBACK_EDUCATION, projects: FALLBACK_PROJECTS,
  };

  it('chaque astre a son résumé et un lien vers sa section', () => {
    ASTRES.forEach((a) => {
      const r = resumeAstre(a.index, donnees);
      expect(r.titre).toBeTruthy();
      expect(r.lien.to).toMatch(/^\//);
    });
    expect(resumeAstre(99, donnees)).toBeNull();
  });

  it('retire le gras markdown de la bio et trie les compétences par niveau', () => {
    expect(resumeAstre(1, donnees).texte).not.toMatch(/\*\*/);
    const skills = resumeAstre(2, donnees);
    expect(skills.lignes.find((l) => l.titre === 'FRONTEND').texte).toBe('React · TypeScript · Three.js');
  });

  it("met l'expérience en cours en premier, ignore les projets archivés", () => {
    const xp = resumeAstre(3, donnees);
    expect(xp.lignes[0].titre).toContain('Freelance');
    expect(xp.lignes[0].texte).toBe("2024 – aujourd'hui");
    const p = resumeAstre(5, { projects: [{ title: 'Vieux', status: 'archived' }, { title: 'Neuf', slug: 'neuf', techStack: ['Go'] }] });
    expect(p.lignes).toEqual([{ titre: 'Neuf', texte: 'Go', to: '/projets/neuf' }]);
  });

  it('tient debout sans données (API injoignable et pas encore de repli)', () => {
    ASTRES.forEach((a) => expect(resumeAstre(a.index, {})).toBeTruthy());
  });
});

describe('NavigationHUD', () => {
  let raf;
  beforeEach(() => {
    // Une image à la demande : la boucle du HUD ne tourne pas seule dans jsdom
    raf = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { raf.push(cb); return raf.length; });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  const image = () => act(() => { const f = raf; raf = []; f.forEach((cb) => cb(0)); });

  const monter = () => {
    const pilotRef = { current: { entree: entreeVide(), demandeSaut: null, reduit: false, telemetrie: null } };
    render(
      <MemoryRouter>
        <NavigationHUD pilotRef={pilotRef} donnees={{ about: FALLBACK_ABOUT, skills: FALLBACK_SKILLS }} />
      </MemoryRouter>,
    );
    return pilotRef;
  };

  it('une destination demande le saut à la scène ; les chiffres du clavier aussi', () => {
    const pilotRef = monter();
    fireEvent.click(screen.getByRole('button', { name: /PROJETS/ }));
    expect(pilotRef.current.demandeSaut).toBe(5);
    pilotRef.current.demandeSaut = null;
    fireEvent.keyDown(window, { code: 'Digit3' });
    expect(pilotRef.current.demandeSaut).toBe(2);
  });

  it('le clavier pilote et une touche relâchée (ou la fenêtre quittée) coupe les gaz', () => {
    const pilotRef = monter();
    fireEvent.keyDown(window, { code: 'KeyW' });
    image();
    expect(pilotRef.current.entree.poussee).toBe(1);
    fireEvent.blur(window);
    image();
    expect(pilotRef.current.entree.poussee).toBe(0);
  });

  it("affiche les détails de l'astre approché et les cache pendant un saut", () => {
    const pilotRef = monter();
    pilotRef.current.telemetrie = { vitesse: 0, proche: 1, saut: null };
    image();
    const region = screen.getByRole('region', { name: /A PROPOS/ });
    expect(region).toHaveTextContent('Qui suis-je ?');
    expect(screen.getByRole('link', { name: /Lire la section/ })).toHaveAttribute('href', '/#about');
    const destinations = within(screen.getByRole('navigation', { name: 'Destinations' }));
    expect(destinations.getByRole('button', { name: /A PROPOS/ })).toBeDisabled();
    expect(destinations.getByRole('button', { name: /PROJETS/ })).toBeEnabled();

    pilotRef.current.telemetrie = { vitesse: 0, proche: null, saut: { phase: 'tunnel', intensite: 1, cible: 6 } };
    image();
    expect(screen.queryByRole('region', { name: /A PROPOS/ })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('HYPERESPACE → CONTACT');
    // Toutes les destinations sont gelées pendant le tunnel
    destinations.getAllByRole('button').forEach((b) => expect(b).toBeDisabled());
  });

  it('les boutons tactiles maintenus poussent, relâchés coupent', () => {
    const pilotRef = monter();
    const gaz = screen.getByRole('button', { name: 'Accélérer' });
    fireEvent.pointerDown(gaz, { pointerId: 1 });
    image();
    expect(pilotRef.current.entree.poussee).toBe(1);
    fireEvent.pointerUp(gaz, { pointerId: 1 });
    image();
    expect(pilotRef.current.entree.poussee).toBe(0);
  });
});
