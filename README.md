# CV 3D Portfolio — Dark Tech

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
