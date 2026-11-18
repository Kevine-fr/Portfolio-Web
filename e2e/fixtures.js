// Données volontairement « difficiles » : titres, noms de dépôt, lignes de
// code et tableaux trop longs pour un écran de 320 px.
const longCode =
  'docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans && docker compose logs -f';

export const project = {
  _id: 'p1', slug: 'portfolio-3d', title: 'Portfolio 3D Immersif Avec Un Titre Assez Long',
  subtitle: 'Site personnel immersif', description: 'Voyage cosmique en Three.js entre les sections du CV.',
  status: 'published', featured: true, year: 2025,
  techStack: ['JavaScript', 'CSS', 'Three.js', 'React', 'Vite', 'GLSL'],
  gallery: ['/uploads/1.png', '/uploads/2.png'],
  repoUrl: 'https://github.com/kev/portfolio-3d', liveUrl: 'https://kevinefray.dev', contentFormat: 'markdown',
  contentHtml:
    `<p align="center"><img src="/uploads/banner.png" width="1600"></p><h2>Installation</h2><pre><code>${longCode}</code></pre>` +
    '<p>Lien : https://github.com/Kevine-fr/Portfolio-Server/blob/main/backend/src/modules/github/github-sync.service.ts</p>' +
    '<table><thead><tr><th>Variable</th><th>Description</th><th>Défaut</th><th>Obligatoire</th><th>Exemple</th></tr></thead>' +
    '<tbody><tr><td><code>GITHUB_TOKEN</code></td><td>Jeton en lecture seule pour 5000 requêtes par heure</td><td>—</td><td>non</td><td><code>github_pat_xxxxxxxxxxxxxxxxxxxxx</code></td></tr></tbody></table>',
  github: {
    fullName: 'Kevine-fr/un-nom-de-depot-vraiment-tres-long-pour-tester', htmlUrl: 'https://github.com/x',
    stars: 1234, forks: 56, pushedAt: '2025-05-01T10:00:00Z',
    topics: ['portfolio', 'threejs', 'react', 'webgl', 'creative-coding', 'nestjs'],
    languages: [
      { name: 'JavaScript', percent: 60 }, { name: 'TypeScript', percent: 20 }, { name: 'CSS', percent: 12 },
      { name: 'HTML', percent: 5 }, { name: 'Dockerfile', percent: 3 },
    ],
  },
};

const about = {
  firstName: 'Kevine', lastName: 'DIANTOUADI', roles: ['Développeur Full-Stack'], tagline: 'Expériences web immersives.',
  stats: [{ label: 'ANS XP', value: 3 }, { label: 'PROJETS', value: 20 }, { label: 'TECHNOS', value: 12 }],
  title: 'Qui suis-je ?', bio: 'Passionné par le **design** et la **3D**.',
  timeline: [{ year: '2021', title: 'Première ligne de code', description: 'Découverte du HTML/CSS.' }],
  values: [
    { icon: '◆', title: 'Précision', description: 'Code propre.' },
    { icon: '✦', title: 'Curiosité', description: 'Veille constante.' },
  ],
};

const experiences = [{
  _id: 'e1', title: 'Développeur Full-Stack Senior Freelance', company: 'Une entreprise au nom assez long SAS',
  location: 'Paris, France', startDate: '2024-01-01', current: true, description: 'Conception et développement.',
  achievements: ['Refonte complète', 'CI/CD'], techStack: ['React', 'NestJS', 'Docker', 'MongoDB', 'TypeScript'],
}];

const education = [{
  _id: 'd1', school: 'École Supérieure d’Informatique et des Réseaux', degree: 'Master',
  field: 'Architecture logicielle et cloud', location: 'France', startDate: '2023-09-01', endDate: '2025-06-30',
}];

const skills = [
  { _id: 's1', name: 'TypeScript', category: 'frontend', level: 95, visible: true },
  { _id: 's2', name: 'Un nom de compétence particulièrement long', category: 'backend', level: 60, visible: true },
];

/** Réponse simulée de l'API pour un chemin donné. */
export function apiResponse(url) {
  const path = new URL(url).pathname.replace(/^.*\/api\/v1/, '');
  if (path.startsWith('/projects/slug/')) return project;
  if (path === '/projects') return [project, { ...project, _id: 'p2', slug: 'autre', title: 'Autre projet', featured: false }];
  if (path === '/about') return about;
  if (path === '/experiences') return experiences;
  if (path === '/education') return education;
  if (path === '/skills') return skills;
  return [];
}
