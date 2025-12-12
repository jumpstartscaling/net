// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';

/**
 * Pageview Tracking API
 * 
 * Records pageviews for internal analytics.
 * Detects bots and extracts UTM parameters.
 * 
 * POST /api/track/pageview
 */

// Common bot user agents
const BOT_PATTERNS = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'applebot', 'semrushbot', 'ahrefsbot',
    'mj12bot', 'dotbot', 'petalbot', 'bytespider', 'gptbot', 'claudebot',
    'crawler', 'spider', 'bot/', 'bot;', 'headless', 'phantomjs', 'selenium'
];

function detectBot(userAgent: string): { isBot: boolean; botName: string | null } {
    const ua = userAgent.toLowerCase();
    for (const pattern of BOT_PATTERNS) {
        if (ua.includes(pattern)) {
            return { isBot: true, botName: pattern };
        }
    }
    return { isBot: false, botName: null };
}

function detectDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
        if (/ipad|tablet/i.test(ua)) return 'tablet';
        return 'mobile';
    }
    return 'desktop';
}

function detectBrowser(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
}

function detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
}

export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            site_id,
            page_path,
            page_title,
            referrer,
            session_id,
            visitor_id
        } = data;

        if (!site_id || !page_path) {
            return new Response(
                JSON.stringify({ error: 'site_id and page_path are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Extract user agent and IP
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Detect bot
        const { isBot, botName } = detectBot(userAgent);

        // Parse URL for UTM params
        const url = new URL(page_path, 'http://localhost');
        const utmSource = url.searchParams.get('utm_source');
        const utmMedium = url.searchParams.get('utm_medium');
        const utmCampaign = url.searchParams.get('utm_campaign');
        const utmContent = url.searchParams.get('utm_content');
        const utmTerm = url.searchParams.get('utm_term');

        const directus = getDirectusClient();

        // Create pageview record
        await directus.request(
            createItem('pageviews', {
                site: site_id,
                page_path: url.pathname,
                page_title,
                referrer,
                utm_source: utmSource,
                utm_medium: utmMedium,
                utm_campaign: utmCampaign,
                utm_content: utmContent,
                utm_term: utmTerm,
                user_agent: userAgent.substring(0, 500),
                ip_address: ip,
                device_type: detectDevice(userAgent),
                browser: detectBrowser(userAgent),
                os: detectOS(userAgent),
                session_id,
                visitor_id,
                is_bot: isBot,
                bot_name: botName
            })
        );

        return new Response(
            JSON.stringify({ success: true, is_bot: isBot }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error tracking pageview:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to track pageview' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
