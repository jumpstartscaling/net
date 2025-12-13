import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import Inspect from 'vite-plugin-inspect';
import { astroImageTools } from 'astro-imagetools';

// Spark Platform - Multi-Tenant SSR Configuration with Full Plugin Suite
export default defineConfig({
  site: 'https://launch.jumpstartscaling.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true
    }),
    // SEO: Auto-generate sitemaps
    sitemap(),
    // Performance: Run analytics in web worker
    partytown({
      config: {
        forward: ['dataLayer.push']
      }
    }),
    // Image Optimization
    astroImageTools,
    // PWA: Offline-capable admin dashboard
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Spark Admin',
        short_name: 'Spark',
        description: 'Content Generation & SEO Platform',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/spark\.jumpstartscaling\.com\/items\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'directus-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: Number(process.env.PORT) || 4321,
    host: true
  },
  vite: {
    optimizeDeps: {
      exclude: ['@directus/sdk']
    },
    plugins: [
      // Bundle Analysis: Generate visual report
      visualizer({
        open: false,
        filename: 'bundle-stats.html',
        gzipSize: true,
        brotliSize: true
      }),
      // Brotli Compression: Pre-compress assets
      // @ts-ignore - Vite plugin type mismatch between Astro's bundled Vite
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024
      }),
      // Vite Inspect: Debug transformations at /__inspect/
      // @ts-ignore - Vite plugin type mismatch
      Inspect()
    ]
  }
});
