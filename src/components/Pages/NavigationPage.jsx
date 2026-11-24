import { useEffect, useRef } from 'react';
import PersistentScene from '../Scene3D/PersistentScene';
import NavigationHUD from '../Navigation/NavigationHUD';
import { useFetch } from '../../hooks/useFetch';
import { entreeVide } from '../../lib/pilotage';
import {
  FALLBACK_ABOUT, FALLBACK_EDUCATION, FALLBACK_EXPERIENCES, FALLBACK_PROJECTS, FALLBACK_SKILLS,
} from '../../data/fallbacks';

const reduitDemande = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * « Naviguer dans mon espace » : la même scène que l'accueil, pilotée en
 * vaisseau. Les données sont celles des sections (même cache useFetch) :
 * revenir à l'accueil ne recharge rien.
 */
export default function NavigationPage() {
  const pilotRef = useRef({ entree: entreeVide(), demandeSaut: null, reduit: reduitDemande(), telemetrie: null });

  const { data: about }       = useFetch('/about', FALLBACK_ABOUT);
  const { data: skills }      = useFetch('/skills', FALLBACK_SKILLS);
  const { data: experiences } = useFetch('/experiences', FALLBACK_EXPERIENCES);
  const { data: education }   = useFetch('/education', FALLBACK_EDUCATION);
  const { data: projects }    = useFetch('/projects?summary=true', FALLBACK_PROJECTS);

  // Pas de page qui défile sous le cockpit (le glisser tactile la faisait bouger)
  useEffect(() => {
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const titre = document.title;
    document.title = 'Naviguer dans mon espace — Portfolio';
    return () => {
      document.body.style.overflow = avant;
      document.title = titre;
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050309', overflow: 'hidden' }}>
      <PersistentScene pilotRef={pilotRef} />
      <NavigationHUD
        pilotRef={pilotRef}
        donnees={{
          about: about || FALLBACK_ABOUT,
          skills: skills || [],
          experiences: experiences || [],
          education: education || [],
          projects: projects || [],
        }}
      />
    </div>
  );
}
