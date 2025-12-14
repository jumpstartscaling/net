/**
 * Auto-Permissions Hook
 * Automatically grants all permissions to admin policy on startup
 */

export default ({ init }, { services, database, logger }) => {

    // Run after Directus initialization
    init('app.after', async () => {
        try {
            logger.info('Auto-permissions: Granting all permissions to admin policy');

            // Get admin policy
            const [policy] = await database('directus_policies')
                .where('name', 'Administrator')
                .select('id');

            if (!policy) {
                logger.warn('Auto-permissions: Admin policy not found');
                return;
            }

            // Get all custom collections
            const collections = await database('directus_collections')
                .whereNotLike('collection', 'directus_%')
                .select('collection');

            if (collections.length === 0) {
                logger.info('Auto-permissions: No custom collections found');
                return;
            }

            // Check if permissions already exist
            const existing = await database('directus_permissions')
                .where('policy', policy.id)
                .count('* as count')
                .first();

            const expectedCount = collections.length * 4; // 4 actions per collection

            if (parseInt(existing.count) >= expectedCount) {
                logger.info('Auto-permissions: Permissions already granted');
                return;
            }

            // Delete old permissions
            await database('directus_permissions')
                .where('policy', policy.id)
                .delete();

            // Grant new permissions
            const permissions = [];
            const actions = ['create', 'read', 'update', 'delete'];

            for (const { collection } of collections) {
                for (const action of actions) {
                    permissions.push({
                        policy: policy.id,
                        collection,
                        action,
                        permissions: null,
                        validation: null,
                        presets: null,
                        fields: ['*']
                    });
                }
            }

            await database('directus_permissions').insert(permissions);

            logger.info(`Auto-permissions: Granted ${permissions.length} permissions for ${collections.length} collections`);

        } catch (error) {
            logger.error('Auto-permissions failed:', error);
        }
    });
};
