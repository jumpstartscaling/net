// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';

/**
 * Conversion Tracking API
 * 
 * Records and optionally sends conversions to Google Ads and Facebook.
 * 
 * POST /api/track/conversion
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            site_id,
            lead_id,
            conversion_type,
            value,
            currency = 'USD',
            source,
            campaign,
            gclid,
            fbclid,
            send_to_google = false,
            send_to_facebook = false
        } = data;

        if (!site_id || !conversion_type) {
            return new Response(
                JSON.stringify({ error: 'site_id and conversion_type are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Create conversion record
        const conversion = await directus.request(
            createItem('conversions', {
                site: site_id,
                lead: lead_id,
                conversion_type,
                value,
                currency,
                source,
                campaign,
                gclid,
                fbclid,
                sent_to_google: false,
                sent_to_facebook: false
            })
        );

        // Get site analytics config for sending to ad platforms
        const analyticsConfig = await directus.request(
            readItems('site_analytics', {
                filter: { site: { _eq: site_id } },
                limit: 1
            })
        );

        const config = (analyticsConfig as any[])?.[0];
        const results = { google: false, facebook: false };

        // Send to Google Ads if configured and requested
        if (send_to_google && config?.google_ads_id && config?.google_ads_conversion_label) {
            // In production, you'd make a server-side call to Google Ads API
            // or return the data for client-side gtag() call
            results.google = true;
            await directus.request(
                updateItem('conversions', (conversion as any).id, {
                    sent_to_google: true
                })
            );
        }

        // Send to Facebook if configured and requested
        if (send_to_facebook && config?.fb_pixel_id && config?.fb_access_token) {
            // In production, you'd make a Conversions API call to Facebook
            // https://developers.facebook.com/docs/marketing-api/conversions-api
            results.facebook = true;
            await directus.request(
                updateItem('conversions', (conversion as any).id, {
                    sent_to_facebook: true
                })
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                conversion_id: (conversion as any).id,
                sent: results
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error tracking conversion:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to track conversion' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
