# AlgoBrainDoctor — Deployment Guide

> Version: 1.0.0 | Updated: 2026-05-04

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [Docker (Self-Hosted)](#docker-self-hosted)
5. [GitHub Spark (Default Platform)](#github-spark-default-platform)
6. [Static Hosting (Vercel / Netlify / Pages)](#static-hosting)
7. [Staging Deployment](#staging-deployment)
8. [Production Deployment](#production-deployment)
9. [Rollback](#rollback)
10. [Health Checks](#health-checks)
11. [Observability](#observability)

---

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Docker | 24.x (optional, for self-hosting) |
| Git | 2.x |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required for AI Features

| Variable | Description |
|---|---|
| `VITE_OPENAI_API_KEY` | OpenAI API key — get from https://platform.openai.com/api-keys |

### Optional but Recommended for Production

| Variable | Description | Default |
|---|---|---|
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | — |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | — |
| `VITE_APP_VERSION` | Semantic version (set by CI) | `0.0.0` |
| `VITE_LOG_LEVEL` | Log verbosity (`debug/info/warn/error`) | `info` |

> ⚠️ **Never commit `.env` to version control.** The `.gitignore` already excludes it.

---

## Local Development

```bash
# Install dependencies
npm ci

# Start development server (hot reload on http://localhost:5173)
npm run dev

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type-check
npx tsc --noEmit

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Docker (Self-Hosted)

### Build and Run with Docker Compose

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env and set VITE_OPENAI_API_KEY and other required values

# Build and start
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f web

# Stop
docker compose down
```

The app is available at **http://localhost:8080**.

### Build-only (without Compose)

```bash
docker build \
  --build-arg VITE_APP_VERSION=$(git rev-parse --short HEAD) \
  --build-arg VITE_LOG_LEVEL=info \
  -t algobraindoctor:latest .

docker run -p 8080:8080 algobraindoctor:latest
```

### Redis (optional)

Redis is included in `docker-compose.yml` as an optional service for future rate-limiting
and session caching when a dedicated API server is added. To exclude Redis:

```bash
docker compose up web -d
```

---

## GitHub Spark (Default Platform)

AlgoBrainDoctor is built on [GitHub Spark](https://githubnext.com/projects/github-spark),
which handles hosting, authentication, and key-value storage automatically.

### Deploy to Spark

1. Push your branch to `main`
2. GitHub Spark automatically picks up changes and redeploys
3. No additional configuration required — the Spark runtime injects identity and KV access

### Spark-specific notes

- Authentication is handled by GitHub OAuth via Spark — no JWT setup needed.
- `useKV` provides persistent per-user storage — no database required.
- Environment variables starting with `VITE_` can be set in the Spark project settings.

---

## Static Hosting

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — follow prompts)
vercel

# Set environment variables
vercel env add VITE_OPENAI_API_KEY production
vercel env add VITE_SENTRY_DSN production

# Deploy to production
vercel --prod
```

Add a `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify

Add a `public/_redirects` file:

```
/*  /index.html  200
```

Then deploy:

```bash
netlify deploy --prod --dir dist
```

### GitHub Pages

The `deploy.yml` workflow uploads the `dist/` folder as a Pages artifact on push to `main`.
Enable GitHub Pages in your repository settings under **Settings → Pages → Source → GitHub Actions**.

---

## Staging Deployment

Staging uses the same build process as production but with different environment variables.

```bash
# Using the deploy workflow manually
gh workflow run deploy.yml -f environment=staging
```

Or trigger automatically on push to a `staging` branch by modifying `deploy.yml`.

**Recommended staging configuration:**

| Variable | Staging Value |
|---|---|
| `VITE_LOG_LEVEL` | `debug` |
| `VITE_OPENAI_MODEL` | `gpt-4o-mini` (cheaper) |
| `VITE_SENTRY_DSN` | Separate staging DSN |

---

## Production Deployment

**Pre-deployment checklist:**

- [ ] All CI checks pass on the branch
- [ ] `npm audit` reports no critical/high vulnerabilities
- [ ] `VITE_APP_VERSION` is set to the release tag
- [ ] `VITE_SENTRY_DSN` is configured for error tracking
- [ ] `VITE_OPENAI_API_KEY` is set and valid
- [ ] Docker image builds successfully if using self-hosted
- [ ] Health check endpoint responds correctly

**Deployment:**

```bash
# Tag the release
git tag v1.0.0
git push origin v1.0.0

# Trigger deploy workflow
gh workflow run deploy.yml -f environment=production
```

---

## Rollback

### GitHub Spark

Spark does not currently expose a one-click rollback. To roll back:

```bash
# Revert the last commit
git revert HEAD --no-edit
git push origin main
```

Or reset to a known-good commit:

```bash
git reset --hard <good-sha>
git push --force-with-lease origin main
```

### Docker

```bash
# Pull a previous tagged image
docker pull algobraindoctor:<previous-tag>

# Update docker-compose.yml image tag and redeploy
docker compose up -d
```

### Static Hosting (Vercel / Netlify)

Use the platform dashboard to roll back to a previous deployment instantly.

---

## Health Checks

### Docker

The nginx container exposes a `/health` endpoint:

```bash
curl http://localhost:8080/health
# → ok
```

Docker Compose and the `Dockerfile` both configure this as the health check target.

### Application

No application-level health route exists in the current SPA. For future backend services,
implement a `/api/health` endpoint returning:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-05-04T16:00:00Z"
}
```

---

## Observability

### Logging

The app uses a structured JSON logger (`src/lib/logger.ts`). In production, all log output
is to `stdout`/`stderr` and can be piped to any log aggregation system (Datadog, Loki, etc.).

Set `VITE_LOG_LEVEL=debug` only in development/staging.

### Error Tracking (Sentry)

To enable Sentry:

1. Create a project at https://sentry.io
2. Set `VITE_SENTRY_DSN` in your environment
3. Install the Sentry SDK: `npm install @sentry/react`
4. Initialize in `src/main.tsx`:

```ts
import * as Sentry from '@sentry/react'
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: import.meta.env.VITE_APP_VERSION,
  environment: import.meta.env.MODE,
})
```

### OpenTelemetry

For request tracing when a backend API is added:

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

See `docs/ARCHITECTURE.md` for the planned observability stack.
