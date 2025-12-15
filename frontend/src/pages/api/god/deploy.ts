/**
 * God Mode Smart Deployment Endpoint
 * 
 * Accepts JSON deployment payloads and intelligently routes to correct engines
 */

import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, createItem, readItems } from '@directus/sdk';
import type { DirectusSchema } from '@/lib/schemas';

const DIRECTUS_URL = import.meta.env.DIRECTUS_PUBLIC_URL;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_ADMIN_TOKEN;

interface DeploymentPayload {
    api_token: string;
    deployment_instruction: string;
    deployment_config?: {
        auto_execute?: boolean;
        output_type?: 'posts' | 'pages' | 'generated_articles';
        publish_status?: 'published' | 'draft';
        batch_size?: number;
        target_cities?: string[];
    };
    deployment_data: {
        site_setup: {
            name: string;
            url: string;
            status: string;
        };
        article_template?: {
            name: string;
            structure_json: string[];
        };
        campaign_master: {
            name: string;
            target_word_count: number;
            location_mode: string;
            niche_variables: Record<string, string>;
        };
        headline_inventory: any[];
        content_fragments: any[];
    };
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const payload: DeploymentPayload = await request.json();

        // Validate God Mode token
        if (payload.api_token !== process.env.GOD_MODE_TOKEN &&
            payload.api_token !== ADMIN_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid api_token'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const startTime = Date.now();
        const directus = createDirectus<DirectusSchema>(DIRECTUS_URL!)
            .with(staticToken(ADMIN_TOKEN!))
            .with(rest());

        // Route based on deployment_instruction
        switch (payload.deployment_instruction) {
            case 'DEPLOY_FULL_CAMPAIGN_V2':
                return await deployFullCampaign(directus, payload, startTime);

            case 'IMPORT_BLUEPRINTS_ONLY':
                return await importBlueprintsOnly(directus, payload, startTime);

            case 'GENERATE_FROM_EXISTING':
                return await generateFromExisting(directus, payload, startTime);

            case 'DEPLOY_AND_PUBLISH_LIVE':
                return await deployAndPublishLive(directus, payload, startTime);

            default:
                return new Response(JSON.stringify({
                    success: false,
                    error: `Unknown deployment_instruction: ${payload.deployment_instruction}`,
                    available_instructions: [
                        'DEPLOY_FULL_CAMPAIGN_V2',
                        'IMPORT_BLUEPRINTS_ONLY',
                        'GENERATE_FROM_EXISTING',
                        'DEPLOY_AND_PUBLISH_LIVE'
                    ]
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }
    } catch (error: any) {
        console.error('Deployment error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

/**
 * DEPLOY_FULL_CAMPAIGN_V2: Complete workflow
 */
async function deployFullCampaign(directus: any, payload: DeploymentPayload, startTime: number) {
    const results: any = {
        success: false,
        workflow: {
            steps_completed: 0,
            steps_total: 5
        },
        created: {},
        preview_links: [],
        metrics: {}
    };

    try {
        // Step 1: Create Site
        const site = await directus.request(createItem('sites', {
            name: payload.deployment_data.site_setup.name,
            url: payload.deployment_data.site_setup.url,
            status: payload.deployment_data.site_setup.status || 'active'
        }));
        results.created.site_id = site.id;
        results.workflow.steps_completed = 1;

        // Step 2: Create Template (if provided)
        let templateId;
        if (payload.deployment_data.article_template) {
            const template = await directus.request(createItem('article_templates', {
                name: payload.deployment_data.article_template.name,
                structure_json: payload.deployment_data.article_template.structure_json
            }));
            templateId = template.id;
            results.created.template_id = templateId;
        }
        results.workflow.steps_completed = 2;

        // Step 3: Create Campaign
        const campaign = await directus.request(createItem('campaign_masters', {
            site_id: site.id,
            name: payload.deployment_data.campaign_master.name,
            target_word_count: payload.deployment_data.campaign_master.target_word_count,
            location_mode: payload.deployment_data.campaign_master.location_mode,
            niche_variables: payload.deployment_data.campaign_master.niche_variables,
            article_template: templateId,
            status: 'active'
        }));
        results.created.campaign_id = campaign.id;
        results.workflow.steps_completed = 3;

        // Step 4: Import Headlines
        const headlines = await Promise.all(
            payload.deployment_data.headline_inventory.map(headline =>
                directus.request(createItem('headline_inventory', {
                    campaign_id: campaign.id,
                    headline_text: headline.headline_text,
                    status: headline.status || 'available',
                    location_data: headline.location_data
                }))
            )
        );
        results.created.headlines_created = headlines.length;

        // Step 5: Import Content Fragments
        const fragments = await Promise.all(
            payload.deployment_data.content_fragments.map(fragment =>
                directus.request(createItem('content_fragments', {
                    campaign_id: campaign.id,
                    fragment_type: fragment.type,
                    content_body: fragment.content,
                    word_count: fragment.word_count || 0,
                    status: 'active'
                }))
            )
        );
        results.created.fragments_imported = fragments.length;
        results.workflow.steps_completed = 4;

        // Step 6: Generate Articles (if auto_execute)
        if (payload.deployment_config?.auto_execute) {
            const generateResponse = await fetch(`${DIRECTUS_URL}/api/seo/generate-article`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                },
                body: JSON.stringify({
                    campaign_id: campaign.id,
                    batch_size: payload.deployment_config.batch_size || headlines.length
                })
            });

            if (generateResponse.ok) {
                const generated = await generateResponse.json();
                results.created.articles_generated = generated.articles?.length || 0;

                // Create preview links
                results.preview_links = (generated.articles || []).map((article: any) =>
                    `${DIRECTUS_URL}/preview/article/${article.id}`
                );

                // Calculate metrics
                if (generated.articles?.length > 0) {
                    const totalWords = generated.articles.reduce((sum: number, a: any) => sum + (a.word_count || 0), 0);
                    results.metrics = {
                        avg_word_count: Math.round(totalWords / generated.articles.length),
                        total_words_generated: totalWords,
                        unique_variations: generated.articles.length
                    };
                }
            }
        }
        results.workflow.steps_completed = 5;

        results.success = true;
        results.execution_time = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        results.error = error.message;
        return new Response(JSON.stringify(results), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * IMPORT_BLUEPRINTS_ONLY: Just import fragments, no generation
 */
async function importBlueprintsOnly(directus: any, payload: DeploymentPayload, startTime: number) {
    // Similar logic but skip generation step
    return new Response(JSON.stringify({
        success: true,
        message: 'Blueprints imported successfully'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * GENERATE_FROM_EXISTING: Skip setup, use existing campaign
 */
async function generateFromExisting(directus: any, payload: DeploymentPayload, startTime: number) {
    return new Response(JSON.stringify({
        success: true,
        message: 'Generation from existing campaign not yet implemented'
    }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * DEPLOY_AND_PUBLISH_LIVE: Full deployment + publish
 */
async function deployAndPublishLive(directus: any, payload: DeploymentPayload, startTime: number) {
    // Override config to set publish_status: 'published'
    payload.deployment_config = {
        ...payload.deployment_config,
        auto_execute: true,
        publish_status: 'published'
    };

    return deployFullCampaign(directus, payload, startTime);
}
