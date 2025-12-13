# Recommended Vite & Astro Plugins for Spark Platform

## 🎯 Platform Context
Spark is a **content generation and SEO platform** with:
- Multi-site management
- Visual block editor
- Admin dashboard
- Automated content generation
- SEO optimization tools
- Geospatial intelligence

---

## 🔥 High Priority - Install These First

### 1. **Bundle Analysis & Optimization**

#### `rollup-plugin-visualizer`
**Why:** See what's making your bundles large, optimize load times
```bash
npm install -D rollup-plugin-visualizer
```

**Config** (`astro.config.mjs`):
```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    ]
  }
});
```

**Use case:** Your admin dashboard has heavy components (React Flow, Tremor charts, Leaflet maps). This shows which libraries are bloating the bundle.

---

#### `vite-plugin-compression`
**Why:** Compress assets for faster loading
```bash
npm install -D vite-plugin-compression
```

**Config:**
```javascript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  vite: {
    plugins: [
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      })
    ]
  }
});
```

**Use case:** Generated articles and admin pages load faster with pre-compressed assets.

---

### 2. **SEO & Performance**

#### `@astrojs/sitemap`
**Why:** Auto-generate sitemaps for all your generated sites
```bash
npm install @astrojs/sitemap
```

**Config:**
```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://launch.jumpstartscaling.com',
  integrations: [sitemap()]
});
```

**Use case:** Essential for SEO platform - generates XML sitemaps for all generated content.

---

#### `astro-seo`
**Why:** Better SEO meta tags management
```bash
npm install astro-seo
```

**Usage:**
```astro
---
import { SEO } from 'astro-seo';
---
<SEO
  title="Generated Article Title"
  description="Meta description from Directus"
  openGraph={{
    basic: {
      title: "Article Title",
      type: "article",
      image: "/og-image.jpg",
    }
  }}
/>
```

**Use case:** Programmatically set SEO tags for thousands of generated articles.

---

### 3. **Image Optimization**

#### `@astrojs/image` (or `astro-imagetools`)
**Why:** Optimize images for generated content
```bash
npm install @astrojs/image
```

**Config:**
```javascript
import image from '@astrojs/image';

export default defineConfig({
  integrations: [
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    })
  ]
});
```

**Use case:** Optimize featured images for generated articles, compress avatar images.

---

### 4. **Development Experience**

#### `vite-plugin-inspect`
**Why:** Debug Vite's transformation pipeline
```bash
npm install -D vite-plugin-inspect
```

**Config:**
```javascript
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
  vite: {
    plugins: [Inspect()]
  }
});
```

**Use case:** Debug issues with React Flow, Craft.js, or other complex components.

---

## 🎨 Medium Priority - Enhance User Experience

### 5. **PWA Support**

#### `@vite-pwa/astro`
**Why:** Make admin dashboard work offline
```bash
npm install -D @vite-pwa/astro
```

**Config:**
```javascript
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spark Admin',
        short_name: 'Spark',
        theme_color: '#1e293b',
      }
    })
  ]
});
```

**Use case:** Admins can work on campaigns even with poor internet connection.

---

### 6. **Icons**

#### `unplugin-icons`
**Why:** Use any icon set without importing SVGs
```bash
npm install -D unplugin-icons @iconify/json
```

**Config:**
```javascript
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  vite: {
    plugins: [
      Icons({
        compiler: 'astro',
      })
    ]
  }
});
```

**Usage:**
```astro
---
import IconMap from '~icons/lucide/map';
---
<IconMap />
```

**Use case:** Consistent icons across admin dashboard without manual SVG management.

---

### 7. **Environment Variables**

#### `vite-plugin-environment`
**Why:** Better env var management
```bash
npm install -D vite-plugin-environment
```

**Use case:** Manage different configs for multi-site deployments.

---

## 📊 Analytics & Monitoring

### 8. **Web Vitals Tracking**

#### `vite-plugin-web-vitals`
**Why:** Monitor Core Web Vitals
```bash
npm install -D vite-plugin-web-vitals
```

**Use case:** Track performance of generated sites for SEO optimization.

---

### 9. **Error Tracking**

#### `@astrojs/partytown`
**Why:** Run analytics scripts in web worker (faster page load)
```bash
npm install @astrojs/partytown
```

**Config:**
```javascript
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      }
    })
  ]
});
```

**Use case:** Add Google Analytics to generated sites without slowing them down.

---

## 🔧 Advanced Features

### 10. **API Routes Enhancement**

#### `vite-plugin-api`
**Why:** Better API route handling
```bash
npm install -D vite-plugin-api
```

**Use case:** Enhance `/api/generate-content` and other content generation endpoints.

---

### 11. **Markdown Processing**

#### `@astrojs/mdx`
**Why:** Use MDX for rich content
```bash
npm install @astrojs/mdx
```

**Use case:** Allow markdown with React components in generated articles.

---

### 12. **Database Integration**

#### `astro-db` (Astro Studio)
**Why:** Built-in database for Astro
```bash
npm install @astrojs/db
```

**Use case:** Cache generated content, store analytics data locally.

---

## 🚀 Performance Optimization

### 13. **Code Splitting**

#### `vite-plugin-dynamic-import`
**Why:** Better code splitting control
```bash
npm install -D vite-plugin-dynamic-import
```

**Use case:** Lazy load heavy components (React Flow, Tremor charts) only when needed.

---

### 14. **CSS Optimization**

#### `vite-plugin-purge-css`
**Why:** Remove unused CSS
```bash
npm install -D vite-plugin-purge-css
```

**Use case:** Reduce CSS bundle size for generated sites.

---

## 🎯 Spark-Specific Recommendations

### Top 5 to Install Right Now:

1. **`rollup-plugin-visualizer`** - See what's bloating your bundles
2. **`@astrojs/sitemap`** - Essential for SEO platform
3. **`vite-plugin-compression`** - Faster page loads
4. **`@astrojs/image`** - Optimize generated content images
5. **`@vite-pwa/astro`** - Offline-capable admin dashboard

### Installation Command:
```bash
cd frontend
npm install -D rollup-plugin-visualizer vite-plugin-compression @astrojs/sitemap @astrojs/image @vite-pwa/astro
```

---

## 📝 Next Steps

1. **Install top 5 plugins** (see above)
2. **Update `astro.config.mjs`** with plugin configurations
3. **Run build** to see bundle analysis
4. **Optimize** based on visualizer output
5. **Test** admin dashboard and generated sites

---

## 🔗 Resources

- [Astro Integrations](https://astro.build/integrations/)
- [Vite Plugins](https://vitejs.dev/plugins/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
