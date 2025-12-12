// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';

/**
 * Click-to-Call Conversion Tracking API
 * 
 * Tracks phone call clicks and fires conversions to Google/Facebook.
 * Called when user clicks a tel: link.
 * 
 * POST /api/track/call-click
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            site_id,
            phone_number,
            page_url,
            page_title,
            utm_source,
            utm_medium,
            utm_campaign,
            gclid,
            fbclid,
            visitor_id,
            session_id
        } = data;

        if (!site_id || !phone_number) {
            return new Response(
                JSON.stringify({ error: 'site_id and phone_number are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = request.headers.get('user-agent') || '';

        // Track as an event
        await directus.request(
            createItem('events', {
                site: site_id,
                event_name: 'call_click',
                event_category: 'engagement',
                event_label: phone_number,
                page_path: page_url,
                session_id,
                visitor_id,
                metadata: { phone_number, page_title }
            })
        );

        // Create conversion
        const conversion = await directus.request(
            createItem('conversions', {
                site: site_id,
                conversion_type: 'call',
                value: 75, // Phone calls typically worth more
                currency: 'USD',
                source: utm_source || (gclid ? 'google_ads' : fbclid ? 'facebook' : 'organic'),
                campaign: utm_campaign,
                gclid: gclid,
                fbclid: fbclid,
                sent_to_google: false,
                sent_to_facebook: false
            })
        ) as any;

        // Get analytics config
        const analyticsConfig = await directus.request(
            readItems('site_analytics', {
                filter: { site: { _eq: site_id }, is_active: { _eq: true } },
                limit: 1
            })
        );
        const config = (analyticsConfig as any[])?.[0];

        let googleSent = false;
        let facebookSent = false;

        // Send to Google Ads (phone call conversion)
        if (config?.google_ads_id && config?.google_ads_phone_conversion && gclid) {
            googleSent = true;
            console.log('[Call Conversion] Google Ads:', {
                conversion_action: config.google_ads_phone_conversion,
                gclid: gclid,
                conversion_value: 75
            });
        }

        // Send to Facebook
        if (config?.fb_pixel_id && config?.fb_access_token) {
            try {
                const fbData = {
                    data: [{
                        event_name: 'Contact',
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: 'website',
                        event_source_url: page_url,
                        user_data: {
                            fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined,
                            client_ip_address: ip,
                            client_user_agent: userAgent
                        },
                        custom_data: {
                            currency: 'USD',
                            value: 75,
                            content_name: 'Phone Call Click'
                        }
                    }],
                    test_event_code: config.fb_test_event_code || undefined
                };

                const fbResponse = await fetch(
                    `https://graph.facebook.com/v18.0/${config.fb_pixel_id}/events?access_token=${config.fb_access_token}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fbData)
                    }
                );
                facebookSent = fbResponse.ok;
            } catch (err) {
                console.error('[Call Conversion] Facebook error:', err);
            }
        }

        // Update conversion record
        if (googleSent || facebookSent) {
            await directus.request(
                updateItem('conversions', conversion.id, {
                    sent_to_google: googleSent,
                    sent_to_facebook: facebookSent
                })
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                conversion_id: conversion.id,
                sent: { google: googleSent, facebook: facebookSent }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error tracking call click:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to track call click' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
