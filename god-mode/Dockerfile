# God Mode (Valhalla) Dockerfile
# Optimized for reliable builds with full dependencies

# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
# Install libc6-compat for sharp/performance
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm install for robustness (npm ci can fail if lockfile is out of sync)
RUN npm install --legacy-peer-deps

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

USER astro
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
