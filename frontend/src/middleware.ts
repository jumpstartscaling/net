import { defineMiddleware } from 'astro:middleware';
import { getDirectusClient, readItems } from './lib/directus/client';

/**
 * Multi-Tenant Middleware
 * Resolves siteId based on incoming domain and attaches it to SSR context.
 * Gracefully handles missing Directus schema (first-run scenario).
 */
export const onRequest = defineMiddleware(async (context, next) => {
    const host = context.request.headers.get('host') || 'localhost';
    const cleanHost = host.split(':')[0].replace(/^www\./, '');
    const pathname = new URL(context.request.url).pathname;

    // Determine if this is an admin route
    const isAdminRoute = pathname.startsWith('/admin');

    // Check if this is the platform admin (central admin)
    const platformDomain = import.meta.env.PUBLIC_PLATFORM_DOMAIN || 'platform.local';
    const isPlatformAdmin = cleanHost === platformDomain;

    // Initialize locals with safe defaults
    context.locals.siteId = null;
    context.locals.site = null;
    context.locals.isAdminRoute = isAdminRoute;
    context.locals.isPlatformAdmin = isPlatformAdmin;
    context.locals.scope = isPlatformAdmin && isAdminRoute ? 'super-admin' : 'tenant';

    // Skip Directus calls for static assets
    if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
        return next();
    }

    try {
        const directus = getDirectusClient();

        const sites = await directus.request(
            readItems('sites', {
                filter: {
                    _or: [
                        { domain: { _eq: cleanHost } },
                        { domain_aliases: { _contains: cleanHost } }
                    ]
                },
                limit: 1,
                fields: ['id', 'name', 'domain', 'settings']
            })
        );

        if (sites?.length) {
            context.locals.siteId = sites[0].id;
            context.locals.site = sites[0];
        }
    } catch (err: any) {
        // Silently handle - schema may not exist yet
        // Only log in development
        if (import.meta.env.DEV) {
            console.warn('Middleware: Directus query failed (schema may not exist):', err?.message || err);
        }
    }

    return next();
});
