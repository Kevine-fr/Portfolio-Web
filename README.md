# CV 3D Portfolio — Dark Tech

Portfolio interactif en 3D : scène three.js, animations Framer Motion, projets et parcours chargés depuis l'API du portfolio.

Stack : React 18 + Vite + Three.js + Framer Motion + Node.js + MongoDB

---

## 🚀 Démarrage rapide (Frontend)

```bash
# Cloner / se placer dans le dossier
cd cv-3d

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
# → http://localhost:5173
```

---

## 🧪 Qualité

```bash
npm test        # Vitest + Testing Library (hooks, pages, sections)
npm run lint    # ESLint 9 (flat config)
npm run build   # build de production (chunks three / react séparés, pages en lazy-loading)
```

La CI (`.github/workflows/ci.yml`) lance lint, tests et build sur chaque pull request.

---

## 🐙 Contenu piloté par GitHub

Les projets, compétences, expériences et formations viennent de l'API (`Portfolio-Server`), qui peut les
**synchroniser depuis GitHub** (voir la section « Synchronisation GitHub » du README du serveur) :

- `/projets` et l'accueil utilisent `GET /projects?summary=true` (liste allégée, mise en cache côté client) ;
- `/projets/:slug` utilise `GET /projects/slug/:slug` et affiche le **README rendu** (`contentHtml`, HTML déjà
  sanitisé par l'API), les étoiles, forks, langages et topics du dépôt ;
- en cas d'API injoignable, les données de secours de `src/data/fallbacks.js` restent affichées.

---

## 📁 Structure du projet

```
cv-3d/
├── public/
│   └── fonts/          # Polices locales (optionnel)
│
├── src/
│   ├── components/
│   │   ├── Hero/
│   │   │   ├── HeroScene.jsx          ← Composant principal (hero 3D)
│   │   │   ├── HeroScene.module.css   ← Styles isolés (CSS Modules)
│   │   │   └── heroScene.three.js     ← Logique Three.js séparée
│   │   │
│   │   ├── Projects/      (étape 2)
│   │   ├── Skills/        (étape 3)
│   │   ├── Contact/       (étape 4)
│   │   └── Admin/         (étape 5)
│   │
│   ├── hooks/
│   │   ├── useTyping.js     ← Animation typewriter
│   │   ├── useProjects.js   (étape 2 — fetch API)
│   │   └── useAuth.js       (étape 5 — JWT admin)
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminProjects.jsx
│   │   │   └── AdminSkills.jsx
│   │   └── NotFound.jsx
│   │
│   ├── services/
│   │   └── api.js           (étape 6 — Axios config + endpoints)
│   │
│   ├── data/
│   │   └── mock.js          ← Données statiques pendant le dev frontend
│   │
│   ├── styles/
│   │   └── global.css       ← Reset + variables globales
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

## 🗺️ Plan de développement

### Étape 1 — Hero 3D ✅ (actuel)
- Scène Three.js : particules, torus knot, icosaèdre, grille
- Typing animation
- Parallaxe souris
- Navigation skeleton

### Étape 2 — Section Projets
- Cards 3D avec Framer Motion (flip, hover 3D)
- Filtres par technologie / tag
- Données mockées → puis API

### Étape 3 — Section Compétences
- Barre de progression animée
- Groupes : Frontend / Backend / DevOps / Design
- Animation au scroll (Intersection Observer)

### Étape 4 — Section Contact
- Formulaire → POST /api/contacts
- Validation côté client + feedback

### Étape 5 — Backend Node.js + Express
- API REST (CRUD projets, compétences, expériences)
- Auth JWT (login admin)
- Upload images (Multer)

### Étape 6 — Interface Admin
- Dashboard avec statistiques
- CRUD complet via formulaires
- Upload d'images de projets

### Étape 7 — Connexion Frontend ↔ Backend
- Remplacement des mocks par les vrais appels API (Axios)
- Gestion des erreurs et états de chargement
- Déploiement (Vercel frontend + Railway/Render backend)

---

## 🔧 Variables d'environnement (à créer)

```env
# .env.local (frontend)
VITE_API_URL=http://localhost:3001/api

# .env (backend — étape 5)
PORT=3001
MONGO_URI=mongodb://localhost:27017/cv-portfolio
JWT_SECRET=ton_secret_jwt_ici
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
```

---

## 📦 Dépendances clés

| Package | Usage |
|---|---|
| `three` | Moteur 3D WebGL |
| `framer-motion` | Animations React fluides |
| `react-router-dom` | Routing SPA |
| `axios` | Appels API HTTP |

---

## 🎨 Palette neon dark tech

| Nom | Hex | Usage |
|---|---|---|
| Fond principal | `#020408` | Background global |
| Cyan neon | `#00FFFF` | Accent principal, titres |
| Violet neon | `#8800FF` | Accent secondaire |
| Vert neon | `#00FF88` | Accent tertiaire |
| Texte discret | `rgba(255,255,255,0.35)` | Corps de texte |

---

## Tests, métriques et retour arrière

- Tests : `npm run lint && npm test && npm run build` ; la CI (`ci.yml`) les relance sur chaque PR, avec `nginx -t` sur la configuration de l'image.
- **Métriques** : `stub_status` sur le port interne 8080, lu par `nginx-exporter-portfolio-web:9113` (même compose) pour le Prometheus du dépôt Infrastructure.
- **Retour arrière** : relancer l'image `zstin4/web-portfolio:prod-v<précédente>` (voir `.claude/skills/sauvegarde-restauration`).
- Conventions de travail : `CLAUDE.md`.
