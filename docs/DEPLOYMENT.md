# Deployment Guide

This guide covers deploying AlgoBrainDoctor to production environments.

---

## 🎯 Deployment Overview

AlgoBrainDoctor is a static single-page application (SPA) built with Vite. It can be deployed to various platforms:

- **Static Hosting**: Vercel, Netlify, GitHub Pages, Cloudflare Pages
- **CDN**: AWS CloudFront, Azure CDN, Google Cloud CDN
- **Container**: Docker, Kubernetes
- **Traditional**: Apache, Nginx

---

## 🏗️ Build Process

### Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager
- Project dependencies installed

### Building for Production

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run production build**:
   ```bash
   npm run build
   ```

3. **Build output**:
   ```
   dist/
   ├── assets/
   │   ├── index-[hash].js      # Application code
   │   ├── index-[hash].css     # Styles
   │   └── [other-assets]       # Images, fonts, etc.
   └── index.html               # Entry HTML file
   ```

4. **Verify build**:
   ```bash
   # Preview production build locally
   npm run preview
   ```
   
   Access at http://localhost:4173

### Build Optimization

The build process automatically:
- **Minifies** JavaScript and CSS
- **Tree-shakes** unused code
- **Code-splits** for optimal loading
- **Optimizes** assets (images, fonts)
- **Generates** source maps (for debugging)
- **Hashes** file names (for cache busting)

**Build Metrics:**
```
dist/index.html                 ~2 KB
dist/assets/index-[hash].js     ~300-500 KB (gzipped ~100-150 KB)
dist/assets/index-[hash].css    ~50-100 KB (gzipped ~10-20 KB)
```

---

## 🚀 Deployment Platforms

### Vercel

**Automatic Deployment:**

1. **Connect GitHub repository** to Vercel
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Deploy automatically** on git push

**Manual Deployment:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Netlify

**Automatic Deployment:**

1. **Connect GitHub repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy automatically** on git push

**Manual Deployment:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy script** to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages** in repository settings

**Base URL Configuration:**

If deploying to a subdirectory (e.g., `https://username.github.io/repo-name/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/',
  // ... other config
})
```

### Cloudflare Pages

1. **Connect GitHub repository** to Cloudflare Pages
2. **Configure build**:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Deploy automatically** on git push

### Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run:**

```bash
# Build image
docker build -t algobraindoctor .

# Run container
docker run -d -p 80:80 algobraindoctor
```

---

## ⚙️ Environment Configuration

### Environment Variables

Currently, AlgoBrainDoctor uses local storage (Spark KV) for data persistence. For production deployments with backend integration:

Create `.env.production`:

```bash
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_KEY=your-api-key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true

# Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

### Build-Time Configuration

**Vite Configuration** (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
```

---

## 🔒 Security Considerations

### HTTPS

**Always use HTTPS in production:**

- Most platforms (Vercel, Netlify) provide automatic HTTPS
- For custom servers, use Let's Encrypt or CloudFlare SSL

### Content Security Policy (CSP)

Add CSP headers to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

### Security Headers

Configure your server to send security headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📊 Performance Optimization

### Caching Strategy

**Static Assets:**
```nginx
# Long-term cache for assets (1 year)
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Short cache for HTML (no cache)
location / {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

### CDN Configuration

**CloudFront Example:**

1. **Origin**: Your hosting server
2. **Cache Behaviors**:
   - `/assets/*` → Cache for 1 year
   - `/*.html` → No cache
   - Default → Cache for 1 day

### Compression

Enable gzip/brotli compression:

```nginx
# Gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
gzip_comp_level 6;
gzip_min_length 1000;

# Brotli (if available)
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

### Preloading

Add preload hints in `index.html`:

```html
<link rel="preload" href="/assets/fonts/SpaceGrotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/index-[hash].js" as="script">
```

---

## 🔍 Monitoring & Analytics

### Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring

**Web Vitals:**

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Analytics

**Google Analytics:**

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/deploy-action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Verify all features work correctly
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify HTTPS is enabled
- [ ] Configure security headers
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics (if required)
- [ ] Set up performance monitoring
- [ ] Test caching behavior
- [ ] Verify CDN configuration (if applicable)
- [ ] Document environment variables
- [ ] Set up automated backups (if using backend)
- [ ] Configure monitoring alerts
- [ ] Review and test rollback procedure

---

## 🔧 Troubleshooting Deployment

### Build Fails

**Issue**: Build command fails

**Solutions**:
1. Clear cache: `rm -rf node_modules && npm install`
2. Check Node.js version: `node --version` (must be 20+)
3. Review build logs for specific errors
4. Check `tsconfig.json` and `vite.config.ts` configuration

### Blank Page After Deployment

**Issue**: Deployed app shows blank page

**Solutions**:
1. Check browser console for errors
2. Verify `base` URL in `vite.config.ts`
3. Check server routing (SPA fallback to index.html)
4. Verify assets are loading (check network tab)

### 404 on Refresh

**Issue**: Refreshing page shows 404

**Solution**: Configure server to serve `index.html` for all routes:

```nginx
# Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

```apache
# Apache (.htaccess)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔄 Rollback Procedure

If deployment issues occur:

1. **Immediate rollback** (platform-specific):
   - Vercel: Revert to previous deployment in dashboard
   - Netlify: Deploy specific git commit
   - Docker: Rollback to previous image

2. **Manual rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Verify rollback** successful

4. **Investigate issue** before redeploying

---

## 📞 Post-Deployment

After successful deployment:

1. **Test production site** thoroughly
2. **Monitor error rates** in Sentry/logs
3. **Check performance metrics** (Web Vitals)
4. **Verify analytics** tracking
5. **Document deployment** (version, date, changes)
6. **Notify team** of successful deployment
7. **Monitor for 24 hours** for any issues

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
