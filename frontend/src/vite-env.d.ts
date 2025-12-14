/// <reference types="vite/client" />
/// <reference types="astro/client" />

/**
 * Spark Platform Environment Variables
 * These are injected at build/runtime via Astro's import.meta.env
 */
interface ImportMetaEnv {
    /** Public Directus API URL (e.g., https://spark.jumpstartscaling.com) */
    readonly PUBLIC_DIRECTUS_URL: string;

    /** Admin token for authenticated API requests (optional, for SSR) */
    readonly DIRECTUS_ADMIN_TOKEN?: string;

    /** Public platform domain for generating URLs */
    readonly PUBLIC_PLATFORM_DOMAIN?: string;

    /** Preview domain for draft content */
    readonly PREVIEW_DOMAIN?: string;

    /** True when running on server (SSR mode) */
    readonly SSR: boolean;

    /** True during development */
    readonly DEV: boolean;

    /** True for production build */
    readonly PROD: boolean;

    /** Base URL of the site */
    readonly BASE_URL: string;

    /** Current mode (development, production, etc.) */
    readonly MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
