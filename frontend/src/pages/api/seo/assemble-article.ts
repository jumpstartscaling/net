// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';
import { replaceYearTokens } from '@/lib/seo/velocity-scheduler';

/**
 * Assemble Article API
 * 
 * Builds a full article from content modules based on campaign recipe.
 * Uses lowest usage_count modules to ensure variety.
 * 
 * POST /api/seo/assemble-article
 */
export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json();
        const {
            campaign_id,
            location,  // { city, state, county }
            publish_date,
            modified_date
        } = data;

        if (!campaign_id || !location) {
            return new Response(
                JSON.stringify({ error: 'campaign_id and location required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get campaign with recipe
        const campaigns = await directus.request(readItems('campaign_masters', {
            filter: { id: { _eq: campaign_id } },
            limit: 1
        })) as any[];

        const campaign = campaigns[0];
        if (!campaign) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const recipe = campaign.content_recipe || ['intro', 'benefits', 'howto', 'conclusion'];
        const pubDate = publish_date ? new Date(publish_date) : new Date();
        const modDate = modified_date ? new Date(modified_date) : new Date();

        // Build context for token replacement
        const context = {
            city: location.city || '',
            state: location.state || '',
            county: location.county || '',
            state_code: getStateCode(location.state) || '',
            year: pubDate.getFullYear()
        };

        // Fetch and assemble modules
        const assembledParts: string[] = [];
        const modulesUsed: string[] = [];

        for (const moduleType of recipe) {
            // Get modules of this type, prefer lowest usage_count
            const modules = await directus.request(readItems('content_modules', {
                filter: {
                    site: { _eq: campaign.site },
                    module_type: { _eq: moduleType },
                    is_active: { _eq: true }
                },
                sort: ['usage_count', 'id'], // Lowest usage first
                limit: 1
            })) as any[];

            if (modules.length > 0) {
                const module = modules[0];

                // Process spintax
                let content = module.content_spintax || '';

                // Replace location tokens
                content = content
                    .replace(/\{City\}/gi, context.city)
                    .replace(/\{State\}/gi, context.state)
                    .replace(/\{County\}/gi, context.county)
                    .replace(/\{State_Code\}/gi, context.state_code)
                    .replace(/\{Location_City\}/gi, context.city)
                    .replace(/\{Location_State\}/gi, context.state);

                // Replace year tokens
                content = replaceYearTokens(content, pubDate);

                // Process spintax syntax
                content = processSpintax(content);

                assembledParts.push(content);
                modulesUsed.push(module.id);

                // Increment usage count
                await directus.request(
                    updateItem('content_modules', module.id, {
                        usage_count: (module.usage_count || 0) + 1
                    })
                );
            }
        }

        const fullContent = assembledParts.join('\n\n');

        // Generate headline from intro
        const headline = generateHeadline(campaign.spintax_title, context, pubDate) ||
            `${context.city} ${campaign.name || 'Guide'}`;

        // Generate meta
        const metaTitle = headline.substring(0, 60);
        const metaDescription = stripHtml(fullContent).substring(0, 155) + '...';

        // Count words
        const wordCount = stripHtml(fullContent).split(/\s+/).length;

        // Create article
        const article = await directus.request(
            createItem('generated_articles', {
                site: campaign.site,
                campaign: campaign_id,
                headline: headline,
                meta_title: metaTitle,
                meta_description: metaDescription,
                full_html_body: fullContent,
                word_count: wordCount,
                is_published: false,
                is_test_batch: false,
                date_published: pubDate.toISOString(),
                date_modified: modDate.toISOString(),
                sitemap_status: 'ghost',
                location_city: context.city,
                location_county: context.county,
                location_state: context.state,
                modules_used: modulesUsed
            })
        ) as any;

        return new Response(
            JSON.stringify({
                success: true,
                article_id: article.id,
                headline,
                word_count: wordCount,
                modules_used: modulesUsed.length,
                dates: {
                    published: pubDate.toISOString(),
                    modified: modDate.toISOString()
                }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error assembling article:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to assemble article' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * Process spintax syntax: {option1|option2|option3}
 */
function processSpintax(text: string): string {
    // Match nested spintax from innermost to outermost
    let result = text;
    let maxIterations = 100;

    while (result.includes('{') && maxIterations > 0) {
        result = result.replace(/\{([^{}]+)\}/g, (match, options) => {
            const choices = options.split('|');
            return choices[Math.floor(Math.random() * choices.length)];
        });
        maxIterations--;
    }

    return result;
}

/**
 * Generate headline with spintax and tokens
 */
function generateHeadline(template: string | null, context: any, date: Date): string {
    if (!template) return '';

    let headline = template
        .replace(/\{City\}/gi, context.city)
        .replace(/\{State\}/gi, context.state)
        .replace(/\{County\}/gi, context.county);

    headline = replaceYearTokens(headline, date);
    headline = processSpintax(headline);

    return headline;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getStateCode(state: string): string {
    const codes: Record<string, string> = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
        'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
        'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
        'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
        'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
        'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return codes[state] || '';
}
