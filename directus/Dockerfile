FROM directus/directus:11.1.0

USER root

# Install additional dependencies for image generation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

USER node

# Copy extensions and scripts
COPY --chown=node:node ./extensions /directus/extensions
COPY --chown=node:node ./scripts /directus/scripts
COPY --chown=node:node ./template /directus/template

WORKDIR /directus
