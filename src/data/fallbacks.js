// Fallback data — used when the API is unreachable.
// Garde au moins quelques projets visibles en attendant que le backend remplisse.

export const FALLBACK_PROJECTS = [
  {
    _id: 'fallback-1',
    title: 'Portfolio 3D',
    slug: 'portfolio-3d',
    subtitle: 'Site personnel immersif',
    description: 'Portfolio interactif construit avec React et Three.js — voyage cosmique entre les sections.',
    techStack: ['React', 'Three.js', 'Vite', 'GLSL'],
    status: 'published',
    featured: true,
    year: 2025,
    gallery: [],
  },
  {
    _id: 'fallback-2',
    title: 'Portfolio Admin',
    slug: 'portfolio-admin',
    subtitle: 'Panneau d\'administration',
    description: 'CMS Next.js + NestJS avec gestion des projets, compétences, expériences et messages.',
    techStack: ['Next.js', 'NestJS', 'MongoDB', 'shadcn/ui'],
    status: 'published',
    featured: true,
    year: 2025,
    gallery: [],
  },
];

export const FALLBACK_SKILLS = [
  { _id: 'fb-s1', name: 'React',       category: 'frontend', level: 92, visible: true },
  { _id: 'fb-s2', name: 'TypeScript',  category: 'frontend', level: 85, visible: true },
  { _id: 'fb-s3', name: 'Three.js',    category: 'frontend', level: 80, visible: true },
  { _id: 'fb-s4', name: 'Node.js',     category: 'backend',  level: 88, visible: true },
  { _id: 'fb-s5', name: 'NestJS',      category: 'backend',  level: 80, visible: true },
  { _id: 'fb-s6', name: 'MongoDB',     category: 'backend',  level: 78, visible: true },
  { _id: 'fb-s7', name: 'Docker',      category: 'tools',    level: 75, visible: true },
  { _id: 'fb-s8', name: 'Git',         category: 'tools',    level: 90, visible: true },
];

export const FALLBACK_EXPERIENCES = [];
export const FALLBACK_EDUCATION   = [];

export const FALLBACK_ABOUT = {
  // Hero
  firstName: 'Kevine',
  lastName:  'DIANTOUADI',
  tagline:   "Experiences web immersives a la croisee du design, de la 3D et de l'ingenierie logicielle.",
  roles: [
    'Developpeur Full-Stack',
    'Architecte Cloud',
    'Passionne 3D & WebGL',
    'Creative Developer',
  ],
  stats: [
    { label: 'ANS XP',  value: 3,  order: 0 },
    { label: 'PROJETS', value: 20, order: 1 },
    { label: 'TECHNOS', value: 12, order: 2 },
  ],
  // About
  title: 'Qui suis-je ?',
  bio: "Developpeur passionne par la convergence du **design**, de la **3D** et de l'**ingenierie logicielle**. Je construis des interfaces qui marquent — entre rigueur technique et imagination visuelle.",
  cvUrl: '',
  cvFilename: '',
  timeline: [
    { year: '2021', title: 'Premiere ligne de code',  description: 'Decouverte du HTML/CSS via un site perso.' },
    { year: '2022', title: 'Plongee dans React',      description: 'Premieres applications web interactives.' },
    { year: '2023', title: 'Apprentissage backend',   description: 'Node.js, bases de donnees, architecture API.' },
    { year: '2024', title: 'Specialisation 3D',       description: 'Three.js, WebGL, experiences immersives.' },
    { year: '2025', title: "Aujourd'hui",             description: 'Creative developer full-stack.' },
  ],
  values: [
    { icon: '◆', title: 'Precision',  description: 'Code propre, performance et accessibilite avant tout.' },
    { icon: '✦', title: 'Curiosite',  description: 'Veille technologique constante, exploration permanente.' },
    { icon: '◈', title: 'Creativite', description: "Chercher l'experience qui marque, pas juste l'utile." },
    { icon: '✧', title: 'Rigueur',    description: 'Architecture pensee, tests, documentation.' },
  ],
};
