// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';
import { parseSpintaxRandom, injectVariables } from '@/lib/seo/cartesian';
import { generateFeaturedImage, type ImageTemplate } from '@/lib/seo/image-generator';
import type { VariableMap } from '@/types/cartesian';

/**
 * Fragment types for the 6-pillar content structure + intro and FAQ
 */
const FRAGMENT_TYPES = [
    'intro_hook',
    'pillar_1_keyword',
    'pillar_2_uniqueness',
    'pillar_3_relevance',
    'pillar_4_quality',
    'pillar_5_authority',
    'pillar_6_backlinks',
    'faq_section'
];

/**
 * Count words in text (strip HTML first)
 */
function countWords(text: string): number {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
}

/**
 * Generate Article API
 * 
 * Assembles SEO articles by:
 * 1. Pulling an available headline from inventory
 * 2. Fetching location data for variable injection
 * 3. Selecting random fragments for each 6-pillar section
 * 4. Processing spintax within fragments (random selection)
 * 5. Injecting all variables (niche + location)
 * 6. Stitching into full HTML body
 */
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const { campaign_id, batch_size = 1 } = data;
        const siteId = locals.siteId;

        if (!campaign_id) {
            return new Response(
                JSON.stringify({ error: 'Campaign ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get campaign configuration
        const campaigns = await directus.request(
            readItems('campaign_masters', {
                filter: { id: { _eq: campaign_id } },
                limit: 1,
                fields: ['*']
            })
        );

        if (!campaigns?.length) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const campaign = campaigns[0] as any;
        const nicheVariables: VariableMap = campaign.niche_variables || {};
        const generatedArticles = [];
        const effectiveBatchSize = Math.min(batch_size, 50);

        for (let i = 0; i < effectiveBatchSize; i++) {
            // Get next available headline
            const headlines = await directus.request(
                readItems('headline_inventory', {
                    filter: {
                        campaign: { _eq: campaign_id },
                        status: { _eq: 'available' }
                    },
                    limit: 1,
                    fields: ['id', 'final_title_text', 'location_data']
                })
            );

            if (!headlines?.length) {
                break; // No more headlines available
            }

            const headline = headlines[0] as any;

            // Get location variables (from headline or fetch fresh)
            let locationVars: VariableMap = {};

            if (headline.location_data) {
                // Use location from headline (set during headline generation)
                const loc = headline.location_data;
                locationVars = {
                    city: loc.city || '',
                    county: loc.county || '',
                    state: loc.state || '',
                    state_code: loc.stateCode || ''
                };
            } else if (campaign.location_mode === 'city') {
                // Fetch random city
                const cities = await directus.request(
                    readItems('locations_cities', {
                        limit: 1,
                        offset: Math.floor(Math.random() * 100),
                        fields: ['name', 'population', { county: ['name'] }, { state: ['name', 'code'] }]
                    })
                );

                if (cities?.length) {
                    const city = cities[0] as any;
                    locationVars = {
                        city: city.name,
                        county: city.county?.name || '',
                        state: city.state?.name || '',
                        state_code: city.state?.code || '',
                        population: String(city.population || '')
                    };
                }
            } else if (campaign.location_mode === 'county') {
                const counties = await directus.request(
                    readItems('locations_counties', {
                        limit: 1,
                        offset: Math.floor(Math.random() * 100),
                        fields: ['name', { state: ['name', 'code'] }]
                    })
                );

                if (counties?.length) {
                    const county = counties[0] as any;
                    locationVars = {
                        county: county.name,
                        state: county.state?.name || '',
                        state_code: county.state?.code || ''
                    };
                }
            } else if (campaign.location_mode === 'state') {
                const states = await directus.request(
                    readItems('locations_states', {
                        limit: 1,
                        offset: Math.floor(Math.random() * 50),
                        fields: ['name', 'code']
                    })
                );

                if (states?.length) {
                    const state = states[0] as any;
                    locationVars = {
                        state: state.name,
                        state_code: state.code
                    };
                }
            }

            // Merge all variables for injection
            const allVariables: VariableMap = { ...nicheVariables, ...locationVars };

            // Assemble article from fragments
            const fragments: string[] = [];

            for (const fragmentType of FRAGMENT_TYPES) {
                const typeFragments = await directus.request(
                    readItems('content_fragments', {
                        filter: {
                            campaign: { _eq: campaign_id },
                            fragment_type: { _eq: fragmentType }
                        },
                        fields: ['content_body']
                    })
                );

                if (typeFragments?.length) {
                    // Pick random fragment for variation
                    const randomFragment = typeFragments[
                        Math.floor(Math.random() * typeFragments.length)
                    ] as any;

                    let content = randomFragment.content_body;

                    // Process spintax (random selection within fragments)
                    content = parseSpintaxRandom(content);

                    // Inject all variables
                    content = injectVariables(content, allVariables);

                    fragments.push(content);
                }
            }

            // Assemble full article HTML
            const fullHtmlBody = fragments.join('\n\n');
            const wordCount = countWords(fullHtmlBody);

            // Generate meta title and description
            const processedHeadline = injectVariables(headline.final_title_text, allVariables);
            const metaTitle = processedHeadline.substring(0, 70);
            const metaDescription = fragments[0]
                ? fragments[0].replace(/<[^>]*>/g, '').substring(0, 155)
                : metaTitle;

            // Generate featured image from template
            const featuredImage = generateFeaturedImage({
                title: processedHeadline,
                subtitle: locationVars.city
                    ? `${locationVars.city}, ${locationVars.state_code || locationVars.state}`
                    : undefined
            });

            // Generate JSON-LD Schema
            const schemaJson = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": processedHeadline,
                "description": metaDescription,
                "wordCount": wordCount,
                "datePublished": new Date().toISOString(),
                "author": {
                    "@type": "Organization",
                    "name": locationVars.state ? `${locationVars.state} Services` : "Local Service Provider"
                },
                "image": featuredImage.filename ? `/assets/content/${featuredImage.filename}` : undefined
            };

            // Check Word Count Goal
            const targetWordCount = campaign.target_word_count || 1500;
            const wordCountStatus = wordCount >= targetWordCount ? 'optimal' : 'under_target';

            // Create article record with featured image and schema
            const article = await directus.request(
                createItem('generated_articles', {
                    site: siteId || campaign.site,
                    campaign: campaign_id,
                    headline: processedHeadline,
                    meta_title: metaTitle,
                    meta_description: metaDescription,
                    full_html_body: fullHtmlBody,
                    word_count: wordCount,
                    word_count_status: wordCountStatus,
                    is_published: false,
                    location_city: locationVars.city || null,
                    location_county: locationVars.county || null,
                    location_state: locationVars.state || null,
                    featured_image_svg: featuredImage.svg,
                    featured_image_filename: featuredImage.filename,
                    featured_image_alt: featuredImage.alt,
                    schema_json: schemaJson
                })
            );

            // Mark headline as used
            await directus.request(
                updateItem('headline_inventory', headline.id, {
                    status: 'used',
                    used_on_article: (article as any).id
                })
            );

            generatedArticles.push({
                id: (article as any).id,
                headline: processedHeadline,
                word_count: wordCount,
                location: locationVars.city || locationVars.county || locationVars.state || null
            });
        }

        // Get remaining available headlines count
        const remainingHeadlines = await directus.request(
            readItems('headline_inventory', {
                filter: {
                    campaign: { _eq: campaign_id },
                    status: { _eq: 'available' }
                },
                aggregate: { count: '*' }
            })
        );

        const remainingCount = (remainingHeadlines as any)?.[0]?.count || 0;

        return new Response(
            JSON.stringify({
                success: true,
                generated: generatedArticles.length,
                articles: generatedArticles,
                remaining_headlines: parseInt(remainingCount, 10)
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error generating article:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate article' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
