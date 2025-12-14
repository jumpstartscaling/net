/**
 * Spark Platform - God Mode API Extension
 * 
 * Provides unrestricted access to Directus and database operations
 * Bypasses all authentication and permission checks
 * 
 * SECURITY: Access via X-God-Token header only
 * DO NOT commit token to git!
 */

import schemaRouter from './schema.js';
import sitesRouter from './sites.js';

export default (router, context) => {
    const { services, database, env, logger } = context;
    const { ItemsService, UsersService, PermissionsService, CollectionsService } = services;

    // God mode authentication middleware
    const godAuth = (req, res, next) => {
        const token = req.headers['x-god-token'];

        if (!token || token !== env.GOD_MODE_TOKEN) {
            logger.warn('Unauthorized god mode access attempt');
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Bypass all Directus auth - set as super admin
        req.accountability = {
            user: 'god-mode',
            role: null,
            admin: true,
            app: true,
            ip: req.ip
        };

        next();
    };

    // Apply god auth to all routes
    router.use(godAuth);

    /**
     * POST /god/setup/database
     * Initialize database with complete schema
     */
    router.post('/setup/database', async (req, res) => {
        try {
            logger.info('God mode: Running database setup');

            // Execute complete_schema.sql
            const schemaSQL = req.body.sql || '';

            if (schemaSQL) {
                await database.raw(schemaSQL);
            }

            // Get all custom tables
            const tables = await database('pg_tables')
                .where('schemaname', 'public')
                .whereNotLike('tablename', 'directus_%')
                .whereNotLike('tablename', 'spatial_%')
                .select('tablename');

            logger.info(`Created ${tables.length} custom tables`);

            res.json({
                success: true,
                tables_created: tables.length,
                tables: tables.map(t => t.tablename)
            });
        } catch (error) {
            logger.error('God mode database setup failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/permissions/grant-all
     * Grant all permissions to admin policy
     */
    router.post('/permissions/grant-all', async (req, res) => {
        try {
            logger.info('God mode: Granting all permissions');

            // Get or create admin policy
            let [policy] = await database('directus_policies')
                .where('name', 'Administrator')
                .select('id');

            if (!policy) {
                [policy] = await database('directus_policies')
                    .insert({
                        name: 'Administrator',
                        icon: 'verified_user',
                        description: 'Full access to everything',
                        admin_access: true,
                        app_access: true
                    })
                    .returning('id');
            }

            // Get all collections
            const collections = await database('directus_collections')
                .whereNotLike('collection', 'directus_%')
                .select('collection');

            // Delete existing permissions for this policy
            await database('directus_permissions')
                .where('policy', policy.id)
                .delete();

            // Grant all permissions
            const permissions = [];
            const actions = ['create', 'read', 'update', 'delete'];

            for (const { collection } of collections) {
                for (const action of actions) {
                    permissions.push({
                        policy: policy.id,
                        collection,
                        action,
                        permissions: null, // null = all items
                        validation: null,
                        presets: null,
                        fields: ['*']
                    });
                }
            }

            await database('directus_permissions').insert(permissions);

            logger.info(`Granted ${permissions.length} permissions`);

            res.json({
                success: true,
                permissions_granted: permissions.length,
                collections: collections.length
            });
        } catch (error) {
            logger.error('God mode permission grant failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/sql/execute
     * Execute arbitrary SQL (DANGEROUS!)
     */
    router.post('/sql/execute', async (req, res) => {
        try {
            const { sql, params } = req.body;

            logger.warn('God mode: Executing raw SQL', { sql });

            const result = params
                ? await database.raw(sql, params)
                : await database.raw(sql);

            res.json({
                success: true,
                rows: result.rows || result,
                rowCount: result.rowCount || (result.rows ? result.rows.length : 0)
            });
        } catch (error) {
            logger.error('God mode SQL execution failed:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /god/collections/all
     * Get all collections including system
     */
    router.get('/collections/all', async (req, res) => {
        try {
            const collections = await database('directus_collections')
                .select('*')
                .orderBy('collection');

            res.json({
                success: true,
                count: collections.length,
                data: collections
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /god/user/make-admin
     * Grant admin access to any user
     */
    router.post('/user/make-admin', async (req, res) => {
        try {
            const { userId, email } = req.body;

            let user;
            if (userId) {
                user = await database('directus_users')
                    .where('id', userId)
                    .first();
            } else if (email) {
                user = await database('directus_users')
                    .where('email', email)
                    .first();
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get admin role/policy
            const [adminRole] = await database('directus_roles')
                .where('name', 'Administrator')
                .select('id');

            if (adminRole) {
                await database('directus_users')
                    .where('id', user.id)
                    .update({ role: adminRole.id });
            }

            logger.info('God mode: Made user admin', { userId: user.id, email: user.email });

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: adminRole?.id
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /god/status
     * Check god mode status and permissions
     */
    router.get('/status', async (req, res) => {
        try {
            const tablesCount = await database('pg_tables')
                .where('schemaname', 'public')
                .whereNotLike('tablename', 'directus_%')
                .whereNotLike('tablename', 'spatial_%')
                .count('* as count')
                .first();

            const collectionsCount = await database('directus_collections')
                .whereNotLike('collection', 'directus_%')
                .count('* as count')
                .first();

            const permissionsCount = await database('directus_permissions')
                .count('* as count')
                .first();

            res.json({
                success: true,
                god_mode: true,
                database: {
                    tables: parseInt(tablesCount.count),
                    collections: parseInt(collectionsCount.count),
                    permissions: parseInt(permissionsCount.count)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Mount sub-routers for schema and sites management
    const express = require('express');
    const schemaSubRouter = express.Router();
    const sitesSubRouter = express.Router();

    schemaRouter(schemaSubRouter, context);
    sitesRouter(sitesSubRouter, context);

    router.use('/schema', schemaSubRouter);
    router.use('/sites', sitesSubRouter);

    logger.info('God Mode API Extension loaded - Use X-God-Token header for access');
};
