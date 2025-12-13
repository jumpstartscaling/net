import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// Spark Platform - Multi-Tenant SSR Configuration
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
    })
  ],
  server: {
    port: Number(process.env.PORT) || 4321,
    host: true
  },
  vite: {
    optimizeDeps: {
      exclude: ['@directus/sdk']
    }
  }
});
