---
name: sauvegarde-restauration
description: Revenir en arrière sur le site public du Portfolio — relancer l'image Docker de la version précédente après un déploiement raté, ou annuler une fusion. À lancer quand on parle de rollback, de retour arrière, de version cassée en production, ou de sauvegarde du site.
---

# Retour arrière — Portfolio (site public)

Ce dépôt n'a **pas de données** : le contenu (projets, parcours, compétences)
est dans la base de Portfolio-Server, qui a ses propres sauvegardes
(`scripts/backup.sh` là-bas, et la sauvegarde automatique vers MinIO du dépôt
Infrastructure). Une page vide ou fausse vient donc soit de l'API, soit du
code de ce site.

## Revenir à l'image précédente (le plus rapide)

Chaque livraison crée une étiquette Git `vX.Y.Z` et l'image
`zstin4/web-portfolio:prod-vX.Y.Z`. Sur le VPS, dans le dossier du projet :

```sh
git tag --list "v*" --sort=-v:refname | head -3   # (ou l'onglet Tags de GitHub)
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=prod-v1.2.3/' .env   # l'étiquette précédente
export IMAGE_TAG=prod-v1.2.3
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Vérifier : la page d'accueil, une page projet, et `/version.js` qui doit
afficher l'étiquette relancée. La prochaine fusion sur `main` relivrera la
dernière version : corriger d'abord.

## Annuler la fusion fautive dans le code

Une PR qui `git revert` la fusion, sur `dev` puis `dev` → `main`, et c'est
Kévine qui fusionne. Ne jamais pousser sur `main` ni réécrire son historique.

## Ce qu'il ne faut jamais faire

- Supprimer une étiquette `v*` ou une image de Docker Hub : c'est le seul
  moyen de revenir en arrière. (`cd-prod.yml` fait `docker image prune -af`
  sur le VPS : l'image précédente doit donc être re-téléchargée, d'où le
  `pull`.)
- Reconstruire « à la main » sur le VPS une image hors CI : elle n'aurait pas
  d'étiquette, donc pas de retour possible.
