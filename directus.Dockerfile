FROM directus/directus:11

USER root

# Install openssl for password generation
RUN apk add --no-cache openssl

# Copy scripts and templates
COPY --chown=node:node ./directus/scripts /directus/scripts
COPY --chown=node:node ./directus/template /directus/template
COPY --chown=node:node ./directus/extensions /directus/extensions
COPY --chown=node:node ./backend/data /directus/data

# Make bootstrap script executable
RUN chmod +x /directus/scripts/bootstrap.sh

USER node

WORKDIR /directus

# Use bootstrap script as entrypoint
CMD ["/bin/sh", "/directus/scripts/bootstrap.sh"]
