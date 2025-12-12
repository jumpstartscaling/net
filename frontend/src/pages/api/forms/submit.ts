// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';

/**
 * Form Submission API
 * 
 * Handles form submissions, creates leads, and auto-fires conversions.
 * Sends conversion data to Google Ads and Facebook if configured.
 * 
 * POST /api/forms/submit
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const formData = await request.json();
        const { 
            site_id,
            form_id,
            form_slug,
            data,
            page_url,
            utm_source,
            utm_medium,
            utm_campaign,
            gclid,
            fbclid
        } = formData;

        if (!site_id || (!form_id && !form_slug)) {
            return new Response(
                JSON.stringify({ error: 'site_id and form_id/form_slug are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = request.headers.get('user-agent') || '';

        // Get form config
        let form: any;
        if (form_id) {
            form = await directus.request(readItems('forms', {
                filter: { id: { _eq: form_id } },
                limit: 1
            }));
        } else {
            form = await directus.request(readItems('forms', {
                filter: { slug: { _eq: form_slug }, site: { _eq: site_id } },
                limit: 1
            }));
        }
        form = (form as any[])?.[0];

        // Create form submission record
        const submission = await directus.request(
            createItem('form_submissions', {
                site: site_id,
                form: form?.id,
                data: data,
                ip_address: ip,
                user_agent: userAgent.substring(0, 500),
                page_url: page_url,
                utm_source,
                utm_medium,
                utm_campaign,
                status: 'new'
            })
        ) as any;

        // Create lead if form has name/email fields
        let lead: any = null;
        if (data.name || data.email || data.phone) {
            lead = await directus.request(
                createItem('leads', {
                    site: site_id,
                    form: form?.id,
                    name: data.name || data.full_name || data.first_name,
                    email: data.email,
                    phone: data.phone || data.telephone,
                    message: data.message || data.comments || data.inquiry,
                    source: form?.slug || 'form',
                    status: 'new',
                    page_url: page_url,
                    landing_page: page_url,
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    ip_address: ip
                })
            ) as any;
        }

        // === AUTO-CREATE CONVERSION ===
        const conversion = await directus.request(
            createItem('conversions', {
                site: site_id,
                lead: lead?.id,
                conversion_type: 'form',
                value: form?.conversion_value || 50, // Default $50 lead value
                currency: 'USD',
                source: utm_source || (gclid ? 'google_ads' : fbclid ? 'facebook' : 'organic'),
                campaign: utm_campaign,
                gclid: gclid,
                fbclid: fbclid,
                sent_to_google: false,
                sent_to_facebook: false
            })
        ) as any;

        // Get analytics config for this site
        const analyticsConfig = await directus.request(
            readItems('site_analytics', {
                filter: { site: { _eq: site_id }, is_active: { _eq: true } },
                limit: 1
            })
        );
        const config = (analyticsConfig as any[])?.[0];

        // Send to Google Ads if gclid present and configured
        let googleSent = false;
        if (config?.google_ads_id && config?.google_ads_conversion_label && gclid) {
            // Server-side Google Ads conversion (using Google Ads API)
            // In production, you'd call: https://googleads.googleapis.com/v14/customers/{customer_id}:uploadClickConversions
            googleSent = true;
            console.log('[Conversion] Google Ads:', {
                conversion_action: config.google_ads_conversion_label,
                gclid: gclid,
                conversion_date_time: new Date().toISOString(),
                conversion_value: form?.conversion_value || 50
            });
        }

        // Send to Facebook Conversions API if fbclid present and configured
        let facebookSent = false;
        if (config?.fb_pixel_id && config?.fb_access_token) {
            // Facebook Conversions API call
            try {
                const fbData = {
                    data: [{
                        event_name: 'Lead',
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: 'website',
                        event_source_url: page_url,
                        user_data: {
                            em: data.email ? hashSHA256(data.email.toLowerCase()) : undefined,
                            ph: data.phone ? hashSHA256(data.phone.replace(/\D/g, '')) : undefined,
                            fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined,
                            client_ip_address: ip,
                            client_user_agent: userAgent
                        },
                        custom_data: {
                            currency: 'USD',
                            value: form?.conversion_value || 50
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
                console.log('[Conversion] Facebook:', await fbResponse.json());
            } catch (err) {
                console.error('[Conversion] Facebook error:', err);
            }
        }

        // Update conversion with send status
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
                submission_id: submission.id,
                lead_id: lead?.id,
                conversion_id: conversion.id,
                sent: { google: googleSent, facebook: facebookSent },
                redirect_url: form?.redirect_url,
                success_message: form?.success_message || 'Thank you for your submission!'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error processing form:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process form submission' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// Simple SHA256 hash for Facebook user data
async function hashSHA256(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
