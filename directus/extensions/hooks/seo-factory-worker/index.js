/**
 * SPARK AI FACTORY - DIRECTUS HOOK
 * 
 * Triggers automatically when production_queue items are updated.
 * Processes content generation in chunks to avoid timeouts.
 */

module.exports = function registerHook({ filter, action }, { services, database, getSchema, logger }) {
    const { ItemsService } = services;
    const CHUNK_SIZE = 50; // Process 50 articles per trigger

    // TRIGGER: When Queue status changes to "running"
    action('production_queue.items.update', async (input, { keys, schema }) => {
        if (input.status !== 'running') return;

        const queueId = keys[0];
        const currentSchema = await getSchema();

        const queueService = new ItemsService('production_queue', { schema: currentSchema, knex: database });
        const articleService = new ItemsService('generated_articles', { schema: currentSchema, knex: database });
        const moduleService = new ItemsService('content_modules', { schema: currentSchema, knex: database });
        const workLogService = new ItemsService('work_log', { schema: currentSchema, knex: database });
        const locationsService = new ItemsService('locations_cities', { schema: currentSchema, knex: database });

        try {
            // 1. FETCH JOB DATA
            const job = await queueService.readOne(queueId, {
                fields: ['*', 'campaign.*']
            });

            logger.info(`[FACTORY] Starting Job: ${job.id}`);

            // 2. GET SCHEDULE DATA
            const scheduleData = job.schedule_data || [];
            const startIndex = job.completed_count || 0;
            const endIndex = Math.min(startIndex + CHUNK_SIZE, scheduleData.length);

            if (startIndex >= scheduleData.length) {
                // All done!
                await queueService.updateOne(queueId, {
                    status: 'done',
                    completed_at: new Date().toISOString()
                });
                logger.info(`[FACTORY] Job ${queueId} COMPLETE`);
                return;
            }

            // 3. FETCH LOCATIONS
            const locationFilter = job.campaign?.target_locations_filter || {};
            const locations = await locationsService.readByQuery({
                filter: locationFilter,
                limit: CHUNK_SIZE,
                offset: startIndex
            });

            // 4. GET CONTENT RECIPE
            const recipe = job.campaign?.content_recipe || ['intro', 'benefits', 'howto', 'conclusion'];

            // 5. PRODUCTION LOOP
            let generated = 0;

            for (let i = 0; i < Math.min(locations.length, endIndex - startIndex); i++) {
                const schedule = scheduleData[startIndex + i];
                const city = locations[i];

                if (!city || !schedule) continue;

                const publishDate = new Date(schedule.publish_date);
                const modifiedDate = new Date(schedule.modified_date);

                // ASSEMBLE FROM MODULES
                let finalHTML = '';
                const usedModules = [];

                for (const moduleType of recipe) {
                    const modules = await moduleService.readByQuery({
                        filter: {
                            site: { _eq: job.site },
                            module_type: { _eq: moduleType },
                            is_active: { _eq: true }
                        },
                        sort: ['usage_count'],
                        limit: 1
                    });

                    if (modules.length > 0) {
                        const mod = modules[0];

                        // SPIN CONTENT with context
                        const spunText = processSpintax(mod.content_spintax || '', {
                            city: city.city || city.name || '',
                            state: city.state || '',
                            county: city.county || '',
                            year: publishDate.getFullYear()
                        });

                        finalHTML += spunText + '\n\n';
                        usedModules.push(mod.id);

                        // Increment usage count
                        await database('content_modules')
                            .where('id', mod.id)
                            .increment('usage_count', 1);
                    }
                }

                // Generate headline
                const headline = processSpintax(
                    job.campaign?.spintax_title || `{City} {State} Guide`,
                    { city: city.city || '', state: city.state || '', year: publishDate.getFullYear() }
                );

                // CREATE ARTICLE
                await articleService.createOne({
                    site: job.site,
                    campaign: job.campaign?.id,
                    headline: headline,
                    meta_title: headline.substring(0, 60),
                    meta_description: stripHtml(finalHTML).substring(0, 155) + '...',
                    full_html_body: finalHTML,
                    word_count: stripHtml(finalHTML).split(/\s+/).length,
                    is_published: true,
                    is_test_batch: false,
                    date_published: publishDate.toISOString(),
                    date_modified: modifiedDate.toISOString(),
                    sitemap_status: 'ghost',
                    location_city: city.city || city.name,
                    location_county: city.county,
                    location_state: city.state,
                    modules_used: usedModules
                });

                generated++;
            }

            // 6. UPDATE PROGRESS
            const newCompleted = startIndex + generated;
            const isComplete = newCompleted >= scheduleData.length;

            await queueService.updateOne(queueId, {
                completed_count: newCompleted,
                status: isComplete ? 'done' : 'running',
                completed_at: isComplete ? new Date().toISOString() : null
            });

            // Log progress
            await workLogService.createOne({
                site: job.site,
                action: 'chunk_processed',
                entity_type: 'production_queue',
                entity_id: queueId,
                details: {
                    generated,
                    progress: `${newCompleted}/${scheduleData.length}`,
                    chunk: Math.floor(startIndex / CHUNK_SIZE) + 1
                }
            });

            logger.info(`[FACTORY] Chunk done: ${newCompleted}/${scheduleData.length}`);

            // 7. TRIGGER NEXT CHUNK (if not complete)
            if (!isComplete) {
                // Re-trigger by updating status
                setTimeout(async () => {
                    await queueService.updateOne(queueId, { status: 'running' });
                }, 1000);
            }

        } catch (error) {
            logger.error(`[FACTORY ERROR] ${error.message}`);
            await queueService.updateOne(queueId, {
                status: 'failed',
                error_log: error.message
            });
        }
    });
};

// --- HELPER FUNCTIONS ---

function processSpintax(text, context) {
    // 1. Replace context variables
    let output = text
        .replace(/\{City\}/gi, context.city || '')
        .replace(/\{State\}/gi, context.state || '')
        .replace(/\{County\}/gi, context.county || '')
        .replace(/\{Current_Year\}/gi, String(context.year || new Date().getFullYear()))
        .replace(/\{Next_Year\}/gi, String((context.year || new Date().getFullYear()) + 1))
        .replace(/\{Last_Year\}/gi, String((context.year || new Date().getFullYear()) - 1));

    // 2. Resolve spintax {A|B|C}
    let iterations = 100;
    while (output.includes('{') && iterations > 0) {
        output = output.replace(/\{([^{}]+)\}/g, (match, options) => {
            const choices = options.split('|');
            return choices[Math.floor(Math.random() * choices.length)];
        });
        iterations--;
    }

    return output;
}

function stripHtml(html) {
    return (html || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
