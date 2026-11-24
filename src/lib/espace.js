// ─── Les astres du portfolio et ce qu'ils racontent ─────────────────────────
// Une seule source pour les positions : la scène 3D (PersistentScene), le
// pilotage du vaisseau et le panneau de détails lisent ce tableau. Avant le
// mode « Naviguer », les positions vivaient dans la scène seule ; les
// recopier ici aurait laissé le vaisseau viser un astre déplacé.
import { byMostRecent, getYear } from './dates';
import { sortProjects } from './projects';

export const ASTRES = [
  { index: 0, section: 'hero',       label: 'ACCUEIL',     nom: "Sphère d'obsidienne",       position: [0, 0, 0],      rayon: 2.6 },
  { index: 1, section: 'about',      label: 'A PROPOS',    nom: 'Géante annelée',            position: [-45, 6, -35],  rayon: 3.0 },
  { index: 2, section: 'skills',     label: 'COMPETENCES', nom: 'Amas des constellations',   position: [55, -8, -70],  rayon: 1.2 },
  { index: 3, section: 'experience', label: 'EXPERIENCES', nom: 'Danse orbitale',            position: [10, 18, -110], rayon: 1.6 },
  { index: 4, section: 'education',  label: 'PARCOURS',    nom: 'Système solaire',           position: [-55, -4, -150], rayon: 1.2 },
  { index: 5, section: 'projects',   label: 'PROJETS',     nom: 'Nœud des projets',          position: [30, 25, -195], rayon: 2.4 },
  // La naine blanche est décalée de +3 en x dans son groupe : c'est elle que
  // l'on vise, pas le centre vide du groupe.
  { index: 6, section: 'contact',    label: 'CONTACT',     nom: 'Naine blanche',             position: [70, 0, -240],  rayon: 2.0, cible: [73, 0, -240] },
];

/** Le point que l'on regarde et autour duquel on se pose. */
export const centreAstre = (astre) => astre.cible ?? astre.position;

const sansGras = (texte) => (texte || '').replace(/\*\*([^*]+)\*\*/g, '$1');

const periode = (debut, fin, enCours) => {
  const a = getYear(debut);
  const b = enCours ? "aujourd'hui" : getYear(fin);
  if (!a) return b ? String(b) : '';
  return b && b !== a ? `${a} – ${b}` : String(a);
};

/**
 * Ce que le panneau affiche en approchant d'un astre : un titre, quelques
 * lignes tirées des mêmes données que les sections, et le lien vers la page
 * complète. Fonction pure : les données arrivent déjà chargées (ou de repli).
 */
export function resumeAstre(index, donnees = {}) {
  const astre = ASTRES[index];
  if (!astre) return null;
  const about = donnees.about || {};
  const base = { astre: astre.nom, label: astre.label, section: astre.section };

  switch (astre.section) {
    case 'hero': {
      const nom = [about.firstName, about.lastName].filter(Boolean).join(' ');
      return {
        ...base,
        titre: nom || 'Bienvenue',
        texte: about.tagline || '',
        lignes: [...(about.stats || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((s) => ({ titre: String(s.value), texte: s.label })),
        etiquettes: about.roles || [],
        lien: { to: '/#hero', label: "Revenir à l'accueil" },
      };
    }
    case 'about':
      return {
        ...base,
        titre: about.title || 'Qui suis-je ?',
        texte: sansGras(about.bio),
        lignes: [...(about.values || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .slice(0, 4)
          .map((v) => ({ titre: `${v.icon ? `${v.icon} ` : ''}${v.title}`, texte: v.description })),
        etiquettes: [],
        lien: { to: '/#about', label: 'Lire la section' },
      };
    case 'skills': {
      const visibles = (donnees.skills || []).filter((s) => s.visible !== false);
      const parCategorie = new Map();
      [...visibles]
        .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
        .forEach((s) => {
          const cat = s.category || 'autres';
          if (!parCategorie.has(cat)) parCategorie.set(cat, []);
          parCategorie.get(cat).push(s.name);
        });
      return {
        ...base,
        titre: 'Compétences',
        texte: `${visibles.length} technologie${visibles.length > 1 ? 's' : ''} maîtrisée${visibles.length > 1 ? 's' : ''}.`,
        lignes: [...parCategorie].map(([cat, noms]) => ({
          titre: cat.toUpperCase(),
          texte: noms.slice(0, 5).join(' · '),
        })),
        etiquettes: [],
        lien: { to: '/#skills', label: 'Voir toutes les compétences' },
      };
    }
    case 'experience':
      return {
        ...base,
        titre: 'Expériences',
        texte: '',
        lignes: [...(donnees.experiences || [])]
          .sort(byMostRecent)
          .slice(0, 3)
          .map((x) => ({
            titre: [x.title, x.company].filter(Boolean).join(' — '),
            texte: periode(x.startDate, x.endDate, x.current),
          })),
        etiquettes: [],
        lien: { to: '/experiences', label: 'Toutes les expériences' },
      };
    case 'education':
      return {
        ...base,
        titre: 'Parcours',
        texte: '',
        lignes: [...(donnees.education || [])]
          .sort(byMostRecent)
          .slice(0, 3)
          .map((e) => ({
            titre: [e.degree, e.field].filter(Boolean).join(' — '),
            texte: [e.school, periode(e.startDate, e.endDate, e.current)].filter(Boolean).join(' · '),
          })),
        etiquettes: [],
        lien: { to: '/parcours', label: 'Tout le parcours' },
      };
    case 'projects':
      return {
        ...base,
        titre: 'Projets',
        texte: '',
        lignes: sortProjects((donnees.projects || []).filter((p) => p.status !== 'archived'))
          .slice(0, 3)
          .map((p) => ({
            titre: p.title,
            texte: (p.techStack || []).slice(0, 4).join(' · ') || p.subtitle || '',
            to: p.slug ? `/projets/${p.slug}` : undefined,
          })),
        etiquettes: [],
        lien: { to: '/projets', label: 'Tous les projets' },
      };
    case 'contact':
      return {
        ...base,
        titre: 'Contact',
        texte: 'Un projet, une question ? Le canal est ouvert : le formulaire de contact transmet votre message.',
        lignes: [],
        etiquettes: [],
        lien: { to: '/#contact', label: 'Envoyer un message' },
      };
    default:
      return null;
  }
}
