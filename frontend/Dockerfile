# ========= BASE =========
FROM node:20-alpine AS base
WORKDIR /app

# ========= DEPENDENCIES =========
FROM base AS deps
COPY package.json ./
RUN npm install

# ========= BUILD =========
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ========= RUNNER =========
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
