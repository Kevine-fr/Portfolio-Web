import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ASTRES, resumeAstre } from '../../lib/espace';
import { entreeClavier, entreeManche, fusionnerEntrees } from '../../lib/pilotage';
import './navigation.css';

const RAYON_MANCHE = 70;

// Les touches que le pilotage consomme : on les retient pour que les flèches
// et la barre d'espace ne fassent pas défiler la page sous le HUD.
const TOUCHES_VOL = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space',
]);

const estChampDeSaisie = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Le cockpit : destinations (saut en hyperespace), télémétrie, panneau de
 * détails de l'astre approché et commandes (clavier, souris, tactile).
 * Rien ici ne re-rend à chaque image : la vitesse et l'éclair s'écrivent
 * directement dans le DOM, l'état React ne change qu'avec l'astre ou la phase.
 */
export default function NavigationHUD({ pilotRef, donnees }) {
  const navigate = useNavigate();
  const [proche, setProche] = useState(null);
  const [saut, setSaut] = useState(null);           // { phase, cible } | null
  const [aide, setAide] = useState(true);
  const [detailsOuverts, setDetailsOuverts] = useState(true);
  const [manche, setManche] = useState(null);       // { x, y, dx, dy } pour l'affichage

  const touches = useRef(new Set());
  const entreeManuelle = useRef({ lacet: 0, tangage: 0, poussee: 0, boost: false });
  const doigt = useRef(null);                       // pointerId + origine du manche
  const vitesseRef = useRef(null);
  const jaugeRef = useRef(null);
  const eclairRef = useRef(null);
  const tunnelRef = useRef(null);

  const sauter = (index) => {
    if (!pilotRef.current || pilotRef.current.telemetrie?.saut) return;
    pilotRef.current.demandeSaut = index;
    setAide(false);
  };

  // ── Clavier
  useEffect(() => {
    const bas = (e) => {
      if (estChampDeSaisie(e.target)) return;
      if (e.code === 'Escape') { navigate('/'); return; }
      const chiffre = /^(Digit|Numpad)([1-7])$/.exec(e.code);
      if (chiffre) { sauter(Number(chiffre[2]) - 1); return; }
      if (e.code === 'KeyH') { setAide((a) => !a); return; }
      if (TOUCHES_VOL.has(e.code)) {
        e.preventDefault();
        touches.current.add(e.code);
        setAide(false);
      }
    };
    const haut = (e) => touches.current.delete(e.code);
    // Alt-Tab avec une touche enfoncée : sans ceci le vaisseau accélère seul
    const perte = () => touches.current.clear();
    window.addEventListener('keydown', bas);
    window.addEventListener('keyup', haut);
    window.addEventListener('blur', perte);
    return () => {
      window.removeEventListener('keydown', bas);
      window.removeEventListener('keyup', haut);
      window.removeEventListener('blur', perte);
    };
    // sauter ne lit que des refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ── Boucle d'affichage : entrées vers la scène, télémétrie vers le DOM
  useEffect(() => {
    let id;
    let dernierProche = null;
    let derniereCle = '';
    const tour = () => {
      id = requestAnimationFrame(tour);
      const ctrl = pilotRef.current;
      if (!ctrl) return;
      const clavier = entreeClavier(touches.current);
      // Espace = gaz, comme le bouton tactile
      if (touches.current.has('Space')) clavier.poussee = Math.max(clavier.poussee, 1);
      ctrl.entree = fusionnerEntrees(clavier, entreeManuelle.current);

      const tel = ctrl.telemetrie;
      if (!tel) return;
      if (vitesseRef.current) vitesseRef.current.textContent = String(Math.round(tel.vitesse * 10)).padStart(3, '0');
      if (jaugeRef.current) jaugeRef.current.style.transform = `scaleX(${Math.min(1, tel.vitesse / 48)})`;
      const intensite = tel.saut?.intensite ?? 0;
      if (tunnelRef.current) tunnelRef.current.style.opacity = String(intensite * 0.85);
      if (eclairRef.current) {
        // Éclair blanc au moment où l'on sort du tunnel
        const flash = tel.saut?.phase === 'sortie' ? intensite : 0;
        eclairRef.current.style.opacity = String(flash * (ctrl.reduit ? 0.25 : 0.7));
      }
      if (tel.proche !== dernierProche) { dernierProche = tel.proche; setProche(tel.proche); }
      const cle = tel.saut ? `${tel.saut.phase}:${tel.saut.cible}` : '';
      if (cle !== derniereCle) { derniereCle = cle; setSaut(tel.saut ? { phase: tel.saut.phase, cible: tel.saut.cible } : null); }
    };
    tour();
    return () => cancelAnimationFrame(id);
  }, [pilotRef]);

  // Un nouvel astre rouvre le panneau, même si on l'avait replié sur le précédent
  useEffect(() => { if (proche !== null) setDetailsOuverts(true); }, [proche]);

  // ── Manche : glisser n'importe où sur l'espace (souris ou doigt)
  const debutManche = (e) => {
    if (doigt.current) return;
    doigt.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setManche({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 });
    setAide(false);
  };
  const bougerManche = (e) => {
    const d = doigt.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const { lacet, tangage } = entreeManche(dx, dy, RAYON_MANCHE);
    entreeManuelle.current.lacet = lacet;
    entreeManuelle.current.tangage = tangage;
    const n = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, RAYON_MANCHE / n);
    setManche({ x: d.x, y: d.y, dx: dx * k, dy: dy * k });
  };
  const finManche = (e) => {
    if (!doigt.current || doigt.current.id !== e.pointerId) return;
    doigt.current = null;
    entreeManuelle.current.lacet = 0;
    entreeManuelle.current.tangage = 0;
    setManche(null);
  };

  // ── Gaz / frein / boost (boutons maintenus)
  const maintenir = (champ, valeur) => ({
    onPointerDown: (e) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      entreeManuelle.current[champ] = valeur;
      setAide(false);
    },
    onPointerUp: () => { entreeManuelle.current[champ] = champ === 'boost' ? false : 0; },
    onPointerCancel: () => { entreeManuelle.current[champ] = champ === 'boost' ? false : 0; },
    onContextMenu: (e) => e.preventDefault(),
  });

  const enSaut = !!saut;
  const resume = proche !== null && !enSaut ? resumeAstre(proche, donnees) : null;
  const cibleSaut = saut ? ASTRES[saut.cible] : null;

  let statut = 'EN VOL LIBRE';
  if (saut?.phase === 'charge') statut = `CHARGE DE L'HYPERPROPULSION → ${cibleSaut.label}`;
  else if (saut?.phase === 'tunnel') statut = `HYPERESPACE → ${cibleSaut.label}`;
  else if (saut?.phase === 'sortie') statut = `SORTIE · ${cibleSaut.nom.toUpperCase()}`;
  else if (proche !== null) statut = `EN ORBITE · ${ASTRES[proche].nom.toUpperCase()}`;

  return (
    <div className="nav-hud" data-testid="navigation-hud">
      {/* Surface de pilotage : sous tous les panneaux */}
      <div
        className="nav-surface"
        aria-hidden="true"
        onPointerDown={debutManche}
        onPointerMove={bougerManche}
        onPointerUp={finManche}
        onPointerCancel={finManche}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div ref={tunnelRef} className="nav-tunnel" aria-hidden="true" />
      <div ref={eclairRef} className="nav-eclair" aria-hidden="true" />

      {manche && (
        <div className="nav-manche" style={{ left: manche.x, top: manche.y }} aria-hidden="true">
          <span style={{ transform: `translate(${manche.dx}px, ${manche.dy}px)` }} />
        </div>
      )}

      {/* En-tête */}
      <header className="nav-entete">
        <Link to="/" className="nav-quitter">← QUITTER</Link>
        <h1>NAVIGUER DANS MON ESPACE</h1>
        <button type="button" className="nav-aide-btn" onClick={() => setAide((a) => !a)} aria-expanded={aide} aria-label="Commandes de vol">
          ?
        </button>
      </header>

      {/* Destinations : un clic lance le saut */}
      <nav className="nav-destinations" aria-label="Destinations">
        <p className="nav-titre-bloc">DESTINATIONS</p>
        <ol>
          {ASTRES.map((a) => {
            const ici = proche === a.index;
            return (
              <li key={a.index}>
                <button
                  type="button"
                  onClick={() => sauter(a.index)}
                  disabled={enSaut || ici}
                  aria-current={ici ? 'location' : undefined}
                  className={saut?.cible === a.index ? 'cible' : ''}
                  title={`Saut vers ${a.nom}`}>
                  <kbd>{a.index + 1}</kbd>
                  <span className="nom-court">{a.label}</span>
                  <span className="nom-astre">{a.nom}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Télémétrie */}
      <div className="nav-telemetrie" role="status" aria-live="polite">
        <span className="nav-statut">{statut}</span>
        <span className="nav-vitesse">
          <span ref={vitesseRef}>000</span> <small>KM/S ×1000</small>
        </span>
        <span className="nav-jauge"><span ref={jaugeRef} /></span>
      </div>

      {/* Détails de l'astre approché */}
      {resume && (
        <section className={`nav-details ${detailsOuverts ? '' : 'replie'}`} aria-label={`Détails : ${resume.label}`}>
          <button
            type="button"
            className="nav-details-entete"
            onClick={() => setDetailsOuverts((o) => !o)}
            aria-expanded={detailsOuverts}>
            <span>{resume.astre.toUpperCase()} · {resume.label}</span>
            <span aria-hidden="true">{detailsOuverts ? '–' : '+'}</span>
          </button>
          {detailsOuverts && (
            <div className="nav-details-corps">
              <h2>{resume.titre}</h2>
              {resume.texte && <p className="nav-details-texte">{resume.texte}</p>}
              {resume.etiquettes.length > 0 && (
                <p className="nav-etiquettes">{resume.etiquettes.map((e) => <span key={e}>{e}</span>)}</p>
              )}
              {resume.lignes.length > 0 && (
                <ul>
                  {resume.lignes.map((l, i) => (
                    <li key={i}>
                      {l.to ? <Link to={l.to}><strong>{l.titre}</strong></Link> : <strong>{l.titre}</strong>}
                      {l.texte && <span>{l.texte}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <Link className="nav-details-lien" to={resume.lien.to}>{resume.lien.label} →</Link>
            </div>
          )}
        </section>
      )}

      {/* Commandes tactiles (cachées sur ordinateur, voir navigation.css) */}
      <div className="nav-gaz" aria-label="Poussée">
        <button type="button" {...maintenir('boost', true)} aria-label="Boost">⇈</button>
        <button type="button" {...maintenir('poussee', 1)} aria-label="Accélérer">▲</button>
        <button type="button" {...maintenir('poussee', -1)} aria-label="Freiner">▼</button>
      </div>

      {aide && (
        <div className="nav-aide" role="dialog" aria-label="Commandes de vol">
          <p className="nav-titre-bloc">COMMANDES DE VOL</p>
          <ul className="nav-aide-clavier">
            <li><kbd>Z</kbd>/<kbd>W</kbd> ou <kbd>Espace</kbd> accélérer · <kbd>S</kbd> freiner</li>
            <li><kbd>Q</kbd>/<kbd>A</kbd> <kbd>D</kbd> ou <kbd>←</kbd> <kbd>→</kbd> virer · <kbd>↑</kbd> <kbd>↓</kbd> monter / descendre</li>
            <li><kbd>Maj</kbd> boost · <kbd>1</kbd>–<kbd>7</kbd> saut en hyperespace · <kbd>Échap</kbd> quitter</li>
            <li>Ou glisser avec la souris pour orienter le vaisseau.</li>
          </ul>
          <ul className="nav-aide-tactile">
            <li>Glisser le doigt sur l&apos;espace pour orienter le vaisseau.</li>
            <li>▲ accélérer · ▼ freiner · ⇈ boost.</li>
            <li>Toucher une destination pour sauter en hyperespace.</li>
          </ul>
          <p>Approchez un astre pour lire la section qui lui correspond.</p>
          <button type="button" onClick={() => setAide(false)}>DÉCOLLER</button>
        </div>
      )}
    </div>
  );
}
