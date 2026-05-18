/**
 * App version lue a l'execution depuis window.APP_VERSION.
 *
 * En production, /version.js est genere par docker-entrypoint.sh a chaque
 * demarrage du container, en lisant la variable IMAGE_TAG du .env du VPS.
 * Donc changer la version = editer le .env + redemarrer le container,
 * AUCUN rebuild d'image n'est necessaire.
 *
 * En dev local : window.APP_VERSION n'est pas defini, fallback sur "dev".
 */

const RAW = (typeof window !== 'undefined' && window.APP_VERSION) || 'dev';

/**
 * Version complete telle que dans IMAGE_TAG (ex: "prod-v1.0.19").
 */
export const APP_VERSION = RAW;

/**
 * Version reduite a la partie semver pour affichage : "v1.0.19".
 * Si aucune correspondance trouvee, retourne RAW tel quel (ex: "dev").
 */
const SEMVER_MATCH = RAW.match(/v\d+\.\d+\.\d+/);
export const APP_VERSION_DISPLAY = SEMVER_MATCH ? SEMVER_MATCH[0] : RAW;
