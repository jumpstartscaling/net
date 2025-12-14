/**
 * God Mode - Schema Management Extension
 * 
 * Provides complete control over Directus schema:
 * - Create/update/delete collections
 * - Manage fields and relationships  
 * - Export/import schema snapshots
 * - Full Directus SDK access
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default (router, { services, database, env, logger }) => {
    const {
        CollectionsService,
        FieldsService,
        RelationsService,
        ItemsService
    } = services;

    // God auth middleware (same as main god-mode)
    const godAuth = (req, res, next) => {
        const token = req.headers['x-god-token'];
        if (!token || token !== env.GOD_MODE_TOKEN) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.accountability = {
            user: 'god-mode',
            role: null,
            admin: true,
            app: true
        };
        next();
    };

    router.use(godAuth);

    /**
     * POST /god/schema/collections/create
     * Create a new collection with fields
     */
    router.post('/collections/create', async (req, res) => {
        try {
            const { collection, fields, meta } = req.body;

            const collectionService = new CollectionsService({
                schema: req.schema,
                accountability: req.accountability
            });

            // Create collection
            await collectionService.createOne({
                collection,
                meta: meta || {},
                schema: {}
            });

            // Add fields
            if (fields && fields.length > 0) {
                const fieldService = new FieldsService({
                    schema: req.schema,
                    accountability: req.accountability
                });

                for (const field of fields) {
                    await fieldService.createField(collection, field);
                }
            }

            logger.info(`God mode: Created collection ${collection} with ${fields?.length || 0} fields`);

            res.json({
                success: true,
                collection,
                fields_created: fields?.length || 0
            });
        } catch (error) {
            logger.error('God mode collection creation failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/schema/fields/create
     * Add field to existing collection
     */
    router.post('/fields/create', async (req, res) => {
        try {
            const { collection, field, type, meta, schema } = req.body;

            const fieldService = new FieldsService({
                schema: req.schema,
                accountability: req.accountability
            });

            await fieldService.createField(collection, {
                field,
                type,
                meta: meta || {},
                schema: schema || {}
            });

            logger.info(`God mode: Added field ${field} to ${collection}`);

            res.json({
                success: true,
                collection,
                field
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * DELETE /god/schema/fields/:collection/:field
     * Remove field from collection
     */
    router.delete('/fields/:collection/:field', async (req, res) => {
        try {
            const { collection, field } = req.params;

            const fieldService = new FieldsService({
                schema: req.schema,
                accountability: req.accountability
            });

            await fieldService.deleteField(collection, field);

            logger.info(`God mode: Deleted field ${collection}.${field}`);

            res.json({
                success: true,
                deleted: `${collection}.${field}`
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /god/schema/snapshot
     * Export current schema as YAML
     */
    router.get('/snapshot', async (req, res) => {
        try {
            logger.info('God mode: Generating schema snapshot');

            // Run directus schema snapshot command
            const { stdout, stderr } = await execAsync('npx directus schema snapshot --format yaml /tmp/schema.yaml');

            if (stderr) {
                logger.warn('Schema snapshot stderr:', stderr);
            }

            // Read the generated file
            const fs = require('fs');
            const schemaYaml = fs.readFileSync('/tmp/schema.yaml', 'utf8');

            res.json({
                success: true,
                schema: schemaYaml,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('God mode schema snapshot failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/schema/apply
     * Apply schema from YAML
     */
    router.post('/apply', async (req, res) => {
        try {
            const { yaml } = req.body;

            logger.info('God mode: Applying schema from YAML');

            // Write YAML to temp file
            const fs = require('fs');
            fs.writeFileSync('/tmp/schema-apply.yaml', yaml);

            // Apply schema
            const { stdout, stderr } = await execAsync('npx directus schema apply /tmp/schema-apply.yaml --yes');

            if (stderr) {
                logger.warn('Schema apply stderr:', stderr);
            }

            logger.info('Schema applied successfully');

            res.json({
                success: true,
                output: stdout,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('God mode schema apply failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/schema/relations/create
     * Create relationship between collections
     */
    router.post('/relations/create', async (req, res) => {
        try {
            const relation = req.body;

            const relationsService = new RelationsService({
                schema: req.schema,
                accountability: req.accountability
            });

            await relationsService.createOne(relation);

            logger.info(`God mode: Created relation ${relation.collection}.${relation.field}`);

            res.json({
                success: true,
                relation
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    logger.info('God Mode Schema Management Extension loaded');
};
