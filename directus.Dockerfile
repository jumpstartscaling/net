FROM directus/directus:11

USER root

# Copy scripts and templates
COPY --chown=node:node ./directus/scripts /directus/scripts
COPY --chown=node:node ./directus/template /directus/template
COPY --chown=node:node ./directus/extensions /directus/extensions

USER node

WORKDIR /directus
