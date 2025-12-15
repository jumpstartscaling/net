import { defineMiddleware } from 'astro:middleware';
import { getDirectusClient, readItems } from './lib/directus/client';

/**
 * Chameleon Middleware
 * Separates "God Mode/Admin" traffic from "Client/Public" traffic.
 */
export const onRequest = defineMiddleware(async (context, next) => {
    const host = context.request.headers.get('host') || 'localhost';
    const cleanHost = host.split(':')[0].replace(/^www\./, '');
    const pathname = new URL(context.request.url).pathname;

    // Configuration
    const platformDomain = import.meta.env.PUBLIC_PLATFORM_DOMAIN || 'spark.jumpstartscaling.com';
    const previewSecret = import.meta.env.PREVIEW_SECRET || process.env.PREVIEW_SECRET;

    // Defaults
    context.locals.siteId = null;
    context.locals.site = null;
    context.locals.isAdminRoute = pathname.startsWith('/admin');
    context.locals.isPlatformAdmin = false; // Will be true if on platform domain
    context.locals.scope = 'tenant';
    context.locals.showDiagnostics = false;
    context.locals.previewMode = false;

    // Skip static assets
    if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|map)$/)) {
        return next();
    }

    // --- LOGIC BRANCH 1: PLATFORM HUB (Admin/Diagnostics) ---
    if (cleanHost === platformDomain || cleanHost === 'localhost') {
        context.locals.isPlatformAdmin = true;
        context.locals.scope = 'super-admin';

        // Diagnostic Overlay Logic
        // Always show for Admin routes, or if preview token is present
        if (context.locals.isAdminRoute) {
            context.locals.showDiagnostics = true;
        }

        // Preview Logic
        const token = new URL(context.request.url).searchParams.get('token');
        const siteId = new URL(context.request.url).searchParams.get('site_id');

        if (token && token === previewSecret) {
            context.locals.previewMode = true;
            context.locals.showDiagnostics = true;
            if (siteId) context.locals.siteId = siteId;
        }

        return next();
    }

    // --- LOGIC BRANCH 2: CLIENT NODE (Public Site) ---
    // Pure Cache-First HTML Delivery
    try {
        const directus = getDirectusClient();
        const sites = await directus.request(
            readItems('sites', {
                filter: { domain: { _eq: cleanHost } },
                limit: 1,
                fields: ['id', 'domain', 'config', 'status']
            })
        );

        if (sites?.length) {
            const site = sites[0];
            if (site.status === 'maintenance') {
                return new Response('Maintenance Mode', { status: 503 });
            }
            context.locals.siteId = site.id;
            context.locals.site = site;
            // Diagnostics strictly OFF for public traffic
            context.locals.showDiagnostics = false;
        } else {
            // Domain not found in DB
            // return new Response('Site Not Found', { status: 404 });
            // For now, let it fall through to 404 page handled by Astro
        }
    } catch (err) {
        if (import.meta.env.DEV) console.warn('Middleware Site Lookup Failed:', err);
    }

    return next();
});
