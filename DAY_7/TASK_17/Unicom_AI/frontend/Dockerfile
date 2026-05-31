# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (cache layer)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the TanStack Start SSR app
# Output: dist/server/ (Node handler) + dist/client/ (static assets)
RUN npm run build

# ─── Stage 2: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run the server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the SSR server port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD wget -qO- http://127.0.0.1:3000/ || exit 1

# Symlink dist/client to public so srvx serves static assets automatically
RUN ln -s /app/dist/client /app/public

# TanStack Start / Vite SSR server entry using srvx
CMD ["npx", "srvx", "serve", "--entry", "./dist/server/server.js", "--port", "3000", "--host", "0.0.0.0"]
