import type { APIRoute } from 'astro';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';
import {
    extractSpintaxSlots,
    calculateTotalCombinations,
    generateWithLocations,
    getCartesianMetadata,
    explodeSpintax
} from '@/lib/seo/cartesian';
import type { LocationEntry, CartesianResult } from '@/types/cartesian';

/**
 * Generate Headlines API
 * 
 * Generates all Cartesian product combinations from:
 * - Campaign spintax template
 * - Location data (if location_mode is set)
 * 
 * Uses the n^k formula where:
 * - n = number of options per spintax slot
 * - k = number of slots
 * - Final total = (n₁ × n₂ × ... × nₖ) × location_count
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const {
            campaign_id,
            max_headlines = 10000,
            batch_size = 500,
            offset = 0
        } = data;

        if (!campaign_id) {
            return new Response(
                JSON.stringify({ error: 'Campaign ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get campaign
        const campaigns = await directus.request(
            readItems('campaign_masters', {
                filter: { id: { _eq: campaign_id } },
                limit: 1,
                fields: [
                    'id',
                    'headline_spintax_root',
                    'niche_variables',
                    'location_mode',
                    'location_target'
                ]
            })
        );

        if (!campaigns?.length) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const campaign = campaigns[0] as any;
        const spintax = campaign.headline_spintax_root;
        const nicheVariables = campaign.niche_variables || {};
        const locationMode = campaign.location_mode || 'none';

        // Fetch locations based on mode
        let locations: LocationEntry[] = [];

        if (locationMode !== 'none') {
            locations = await fetchLocations(
                directus,
                locationMode,
                campaign.location_target
            );
        }

        // Calculate metadata BEFORE generation
        const metadata = getCartesianMetadata(
            spintax,
            locations.length,
            max_headlines
        );

        // Check existing headlines to avoid duplicates
        const existing = await directus.request(
            readItems('headline_inventory', {
                filter: { campaign: { _eq: campaign_id } },
                fields: ['final_title_text']
            })
        );
        const existingTitles = new Set(
            existing?.map((h: any) => h.final_title_text) || []
        );

        // Generate Cartesian product headlines
        const generator = generateWithLocations(
            spintax,
            locations,
            nicheVariables,
            { maxCombinations: max_headlines, offset }
        );

        // Insert new headlines in batches
        let insertedCount = 0;
        let skippedCount = 0;
        let processedCount = 0;

        const batch: CartesianResult[] = [];

        for (const result of generator) {
            processedCount++;

            if (existingTitles.has(result.text)) {
                skippedCount++;
                continue;
            }

            batch.push(result);

            // Insert batch when full
            if (batch.length >= batch_size) {
                insertedCount += await insertHeadlineBatch(
                    directus,
                    campaign_id,
                    batch
                );
                batch.length = 0; // Clear batch
            }

            // Safety limit
            if (insertedCount >= max_headlines) break;
        }

        // Insert remaining batch
        if (batch.length > 0) {
            insertedCount += await insertHeadlineBatch(
                directus,
                campaign_id,
                batch
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                metadata: {
                    template: spintax,
                    slotCount: metadata.slotCount,
                    spintaxCombinations: metadata.totalSpintaxCombinations,
                    locationCount: locations.length,
                    totalPossible: metadata.totalPossibleCombinations,
                    wasTruncated: metadata.wasTruncated
                },
                results: {
                    processed: processedCount,
                    inserted: insertedCount,
                    skipped: skippedCount,
                    alreadyExisted: existingTitles.size
                }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error generating headlines:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate headlines' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * Fetch locations based on mode and optional target filter
 */
async function fetchLocations(
    directus: any,
    mode: string,
    targetId?: string
): Promise<LocationEntry[]> {
    try {
        switch (mode) {
            case 'state': {
                const filter: any = targetId
                    ? { id: { _eq: targetId } }
                    : {};

                const states = await directus.request(
                    readItems('locations_states', {
                        filter,
                        fields: ['id', 'name', 'code'],
                        limit: 100
                    })
                );

                return (states || []).map((s: any) => ({
                    id: s.id,
                    state: s.name,
                    stateCode: s.code
                }));
            }

            case 'county': {
                const filter: any = targetId
                    ? { state: { _eq: targetId } }
                    : {};

                const counties = await directus.request(
                    readItems('locations_counties', {
                        filter,
                        fields: ['id', 'name', 'population', { state: ['name', 'code'] }],
                        sort: ['-population'],
                        limit: 500
                    })
                );

                return (counties || []).map((c: any) => ({
                    id: c.id,
                    county: c.name,
                    state: c.state?.name || '',
                    stateCode: c.state?.code || '',
                    population: c.population
                }));
            }

            case 'city': {
                const filter: any = {};

                // If target is set, filter to that state's cities
                if (targetId) {
                    // Check if target is a state or county
                    const states = await directus.request(
                        readItems('locations_states', {
                            filter: { id: { _eq: targetId } },
                            limit: 1
                        })
                    );

                    if (states?.length) {
                        filter.state = { _eq: targetId };
                    } else {
                        filter.county = { _eq: targetId };
                    }
                }

                const cities = await directus.request(
                    readItems('locations_cities', {
                        filter,
                        fields: [
                            'id',
                            'name',
                            'population',
                            { county: ['name'] },
                            { state: ['name', 'code'] }
                        ],
                        sort: ['-population'],
                        limit: 1000 // Top 1000 cities
                    })
                );

                return (cities || []).map((c: any) => ({
                    id: c.id,
                    city: c.name,
                    county: c.county?.name || '',
                    state: c.state?.name || '',
                    stateCode: c.state?.code || '',
                    population: c.population
                }));
            }

            default:
                return [];
        }
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
}

/**
 * Insert a batch of headlines into the database
 */
async function insertHeadlineBatch(
    directus: any,
    campaignId: string,
    batch: CartesianResult[]
): Promise<number> {
    let count = 0;

    for (const result of batch) {
        try {
            await directus.request(
                createItem('headline_inventory', {
                    campaign: campaignId,
                    final_title_text: result.text,
                    status: 'available',
                    location_data: result.location || null
                })
            );
            count++;
        } catch (error) {
            // Skip duplicates or errors
            console.error('Failed to insert headline:', error);
        }
    }

    return count;
}

/**
 * Preview endpoint - shows what WOULD be generated without inserting
 */
export const GET: APIRoute = async ({ url }) => {
    try {
        const campaignId = url.searchParams.get('campaign_id');
        const previewCount = parseInt(url.searchParams.get('preview') || '10');

        if (!campaignId) {
            return new Response(
                JSON.stringify({ error: 'campaign_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Get campaign
        const campaigns = await directus.request(
            readItems('campaign_masters', {
                filter: { id: { _eq: campaignId } },
                limit: 1,
                fields: ['headline_spintax_root', 'location_mode', 'location_target']
            })
        );

        if (!campaigns?.length) {
            return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const campaign = campaigns[0] as any;
        const spintax = campaign.headline_spintax_root;

        // Get location count
        let locationCount = 1;
        if (campaign.location_mode !== 'none') {
            const locations = await fetchLocations(
                directus,
                campaign.location_mode,
                campaign.location_target
            );
            locationCount = locations.length;
        }

        // Get metadata
        const metadata = getCartesianMetadata(spintax, locationCount);

        // Generate preview samples
        const samples = explodeSpintax(spintax, previewCount);

        return new Response(
            JSON.stringify({
                metadata,
                preview: samples
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error previewing headlines:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to preview headlines' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
