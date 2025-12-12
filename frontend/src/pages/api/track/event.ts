// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, createItem } from '@/lib/directus/client';

/**
 * Event Tracking API
 * 
 * Records custom events (form submits, button clicks, scroll depth, etc.)
 * 
 * POST /api/track/event
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            site_id,
            event_name,
            event_category,
            event_label,
            event_value,
            page_path,
            session_id,
            visitor_id,
            metadata
        } = data;

        if (!site_id || !event_name) {
            return new Response(
                JSON.stringify({ error: 'site_id and event_name are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        await directus.request(
            createItem('events', {
                site: site_id,
                event_name,
                event_category,
                event_label,
                event_value,
                page_path,
                session_id,
                visitor_id,
                metadata
            })
        );

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error tracking event:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to track event' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
