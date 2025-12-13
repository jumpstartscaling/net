FROM directus/directus:11

USER root

# Copy scripts and templates
COPY --chown=node:node ./directus/scripts /directus/scripts
COPY --chown=node:node ./directus/template /directus/template
COPY --chown=node:node ./directus/extensions /directus/extensions
COPY --chown=node:node ./backend/data /directus/data

USER node

WORKDIR /directus
