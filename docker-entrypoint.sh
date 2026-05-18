#!/bin/sh
# Genere /version.js a chaque demarrage du container, en lisant la variable
# d'environnement IMAGE_TAG injectee depuis le .env via docker-compose.
# Cela permet de changer la version affichee SANS rebuild de l'image.
set -e

VERSION="${IMAGE_TAG:-dev}"
TARGET="/usr/share/nginx/html/version.js"

cat > "$TARGET" <<EOF
window.APP_VERSION = "${VERSION}";
EOF

echo "[entrypoint] APP_VERSION = $VERSION"

# Demarre nginx au premier plan
exec nginx -g "daemon off;"
