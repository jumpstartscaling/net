/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_DIRECTUS_URL: string;
    readonly DIRECTUS_ADMIN_TOKEN: string;
    readonly PUBLIC_PLATFORM_DOMAIN: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        siteId: string | null;
        site: import('./types/schema').Site | null;
        isAdminRoute: boolean;
        isPlatformAdmin: boolean;
        scope: 'super-admin' | 'tenant';
    }
}
