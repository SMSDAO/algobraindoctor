# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1 – Dependencies
# ==============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production-relevant dependencies needed to build
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ==============================================================================
# Stage 2 – Builder
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build-time env vars (injected by CI or docker build --build-arg)
ARG VITE_APP_VERSION=unknown
ARG VITE_LOG_LEVEL=info
ARG VITE_OPENAI_MODEL=gpt-4o-mini
ARG VITE_OPENAI_BASE_URL=https://api.openai.com/v1
ARG VITE_OPENAI_MAX_TOKENS=2048

ENV VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_LOG_LEVEL=$VITE_LOG_LEVEL \
    VITE_OPENAI_MODEL=$VITE_OPENAI_MODEL \
    VITE_OPENAI_BASE_URL=$VITE_OPENAI_BASE_URL \
    VITE_OPENAI_MAX_TOKENS=$VITE_OPENAI_MAX_TOKENS

RUN npm run build

# ==============================================================================
# Stage 3 – Production runtime (nginx)
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: enable SPA routing (all paths → index.html)
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Run as non-root
RUN addgroup -S app && adduser -S app -G app \
    && chown -R app:app /usr/share/nginx/html \
    && chown -R app:app /var/cache/nginx \
    && chown -R app:app /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown app:app /var/run/nginx.pid

USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
