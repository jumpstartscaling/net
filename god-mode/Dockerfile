# God Mode (Valhalla) Dockerfile
# Optimized for "Insane Mode" (High Concurrency & Throughput)

# 1. Base Image
FROM node:22-alpine AS base
WORKDIR /app
# Install system utilities for performance tuning
RUN apk add --no-cache libc6-compat curl bash

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install deps (Legacy Peer Deps for Astro ecosystem compatibility)
# Force NODE_ENV=development to ensure devDependencies (like vite) are installed
ENV NODE_ENV=development
RUN npm install --legacy-peer-deps

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- BUILD OPTIMIZATION ---
# Increase memory for the build process (Compiling all Admin UI components takes > 2GB)
# Set to 4GB to be safe on most build runners (8GB can cause OOM on smaller VMs)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Debug: Check if astro is installed
RUN npm list astro || true

# Build the application with verbose logging to debug failures
RUN npm run build -- --verbose

# 4. Runner (God Mode Runtime)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# --- RUNTIME OPTIMIZATIONS ---
# 1. Memory: Allow up to 16GB RAM usage (Prevents GC thrashing on 100k items)
# Ensure the host machine has enough RAM, otherwise this will OOM.
ENV NODE_OPTIONS="--max-old-space-size=16384"
# 2. Threadpool: Increase libuv pool for heavy database I/O (Default 4 -> 128)
ENV UV_THREADPOOL_SIZE=128
# 3. Timeouts: Increase default timeouts for long-running batch jobs
ENV HTTP_TIMEOUT=300000
ENV KEEP_ALIVE_TIMEOUT=300000

# Create dedicated runner user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy artifacts
# Copy application code
COPY . .

# Ensure migrations are included
COPY migrations/ ./migrations/
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Security & Permissions
USER astro

# Expose Port
EXPOSE 4321

# Launch with optimized settings
CMD ["node", "./dist/server/entry.mjs"]
