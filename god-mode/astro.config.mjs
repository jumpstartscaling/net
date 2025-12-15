import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: process.env.SITE_URL || 'http://localhost:4321',
    output: 'server',
    prefetch: true,
    adapter: node({
        mode: 'standalone'
    }),
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: true,
        }),
    ],
    vite: {
        ssr: {
            noExternal: ['path-to-regexp']
        }
    }
});
