# Conventions de travail — Portfolio (site public)

Site public du portfolio : React + Vite + three.js, servi en statique par nginx (conteneur `portfolio-web`, image `zstin4/web-portfolio:<IMAGE_TAG>`). Les données viennent de l'API du dépôt Portfolio-Server.

Mêmes règles que le dépôt FindUrJob, adaptées à ce projet. L'infrastructure
du VPS (Prometheus, Grafana, MinIO, nginx, entretien de la machine) vit dans
le dépôt **Infrastructure** : rien de tout cela ne s'ajoute ici.

## Git

- **Développer sur `dev`.** Jamais de commit direct sur `main`.
- **Toujours ouvrir une pull request `dev` → `main` en fin de tâche**, sans
  attendre qu'on la demande. C'est Kévine qui fusionne, jamais l'assistant.
- Ne jamais créer d'autre branche pour la PR : toujours `dev`.
- Le déploiement (`ci-prod.yml` construit et étiquette l'image, `cd-prod.yml` la livre) ne part **que** d'un push sur `main` : tant que la PR n'est pas fusionnée, rien n'est livré. Un correctif pas encore visible en production est normal.
- `dev` peut avoir été fusionnée pendant qu'on travaillait : vérifier l'état de
  `main` avant d'ouvrir une PR. Une PR fusionnée est close, elle ne se
  réutilise pas : repartir de `main`.
- Messages de commit et titres de PR en anglais, corps en français.

## Avant de proposer un correctif

- **Regarder ce que `main` contient déjà.** Le dépôt avance en parallèle.
- Aucune base de données ni service de production n'est joignable depuis un
  environnement de développement distant : extraire des **fonctions pures** et
  les éprouver, ou monter les tests sur une base jetable. Le dire quand une
  vérification n'est pas possible, plutôt que d'affirmer.
- **Les tests** : `npm ci --legacy-peer-deps && npm run lint && npm test && npm run build`. Ils doivent tous passer avant d'ouvrir ou de
  mettre à jour une PR. La CI (`.github/workflows/ci.yml`) les relance sur
  chaque PR et chaque push sur `dev` : ne jamais annoncer une PR prête sans
  sa coche verte, et lire le journal quand elle est rouge.
- Ne jamais sauter, désactiver ou affaiblir un test pour passer au vert.
- Tout bug corrigé ajoute son test — un test qui échouait avant la correction.

## Supervision et sauvegardes

- **Métriques** : le site est statique : nginx expose `stub_status` sur le port **interne** 8080 (`/nginx_status`, réseaux privés seulement), lu par `nginx-exporter-portfolio-web:9113` (même compose) ; la sonde blackbox du dépôt Infrastructure mesure la disponibilité et la latence de `portfolio-web:80`. Prometheus (dépôt Infrastructure) les lit
  par le réseau Docker `web` : ne changer ni le nom du conteneur, ni le port,
  ni le chemin sans mettre à jour `monitoring/prometheus/prometheus.yml` dans
  Infrastructure. La CI vérifie la configuration nginx (`nginx -t`).
- **Sauvegardes** : aucune donnée dans ce dépôt (le contenu vit dans la base
  de Portfolio-Server). Revenir en arrière, c'est relancer l'image de la
  version précédente : voir la skill `sauvegarde-restauration`.

## Skills

- `.claude/skills/revue-quotidienne/SKILL.md` : la revue des erreurs des
  dernières 24 h, corrigées avec un test, PR sur `dev`, rapport.
- `.claude/skills/sauvegarde-restauration/SKILL.md` : revenir à l'image
  précédente après un déploiement raté.

## Style

- Code et commentaires en **français**. Les commentaires
  expliquent le *pourquoi* — souvent le bug passé qui justifie la ligne — pas
  le *quoi*.
- Aucun secret dans le dépôt : `.env.example` porte les clés, jamais les
  valeurs.
