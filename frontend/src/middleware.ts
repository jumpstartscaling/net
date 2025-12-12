import { defineMiddleware } from 'astro:middleware';
import { getDirectusClient, readItems } from './lib/directus/client';

/**
 * Multi-Tenant Middleware
 * Resolves siteId based on incoming domain and attaches it to SSR context.
 * Supports both tenant admin (/admin) and public pages.
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

        if (!sites?.length) {
            console.warn(`⚠ No site matched host: ${cleanHost}`);
            context.locals.siteId = null;
            context.locals.site = null;
        } else {
            context.locals.siteId = sites[0].id;
            context.locals.site = sites[0];
        }
    } catch (err) {
        console.error('❌ Middleware Error:', err);
        context.locals.siteId = null;
        context.locals.site = null;
    }

    // Set admin scope
    context.locals.isAdminRoute = isAdminRoute;
    context.locals.isPlatformAdmin = isPlatformAdmin;
    context.locals.scope = isPlatformAdmin && isAdminRoute ? 'super-admin' : 'tenant';

    return next();
});
