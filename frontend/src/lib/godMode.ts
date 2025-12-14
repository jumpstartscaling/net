/**
 * God Mode Client Library
 * 
 * Frontend client for god-mode API access
 * Used by all admin pages for seamless operations
 * Bypasses normal Directus auth via god token
 */

const GOD_MODE_BASE_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://spark.jumpstartscaling.com';
const GOD_TOKEN = import.meta.env.GOD_MODE_TOKEN || 'jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA';

class GodModeClient {
    constructor(token = GOD_TOKEN) {
        this.token = token;
        this.baseUrl = `${GOD_MODE_BASE_URL}/god`;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-God-Token': this.token,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'God mode request failed');
        }

        return response.json();
    }

    // === Status & Health ===
    async getStatus() {
        return this.request('/status');
    }

    // === Database Operations ===
    async setupDatabase(sql) {
        return this.request('/setup/database', {
            method: 'POST',
            body: JSON.stringify({ sql })
        });
    }

    async executeSQL(sql, params = []) {
        return this.request('/sql/execute', {
            method: 'POST',
            body: JSON.stringify({ sql, params })
        });
    }

    // === Permissions ===
    async grantAllPermissions() {
        return this.request('/permissions/grant-all', {
            method: 'POST'
        });
    }

    // === Collections ===
    async getAllCollections() {
        return this.request('/collections/all');
    }

    // === Users ===
    async makeUserAdmin(emailOrId) {
        const body = typeof emailOrId === 'string' && emailOrId.includes('@')
            ? { email: emailOrId }
            : { userId: emailOrId };

        return this.request('/user/make-admin', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // === Schema Management ===
    async createCollection(collection, fields, meta = {}) {
        return this.request('/schema/collections/create', {
            method: 'POST',
            body: JSON.stringify({ collection, fields, meta })
        });
    }

    async addField(collection, field, type, meta = {}) {
        return this.request('/schema/fields/create', {
            method: 'POST',
            body: JSON.stringify({ collection, field, type, meta })
        });
    }

    async deleteField(collection, field) {
        return this.request(`/schema/fields/${collection}/${field}`, {
            method: 'DELETE'
        });
    }

    async exportSchema() {
        return this.request('/schema/snapshot');
    }

    async applySchema(yaml) {
        return this.request('/schema/apply', {
            method: 'POST',
            body: JSON.stringify({ yaml })
        });
    }

    async createRelation(relation) {
        return this.request('/schema/relations/create', {
            method: 'POST',
            body: JSON.stringify(relation)
        });
    }

    // === Site Provisioning ===
    async provisionSite({ name, domain, create_homepage = true, include_collections = [] }) {
        return this.request('/sites/provision', {
            method: 'POST',
            body: JSON.stringify({
                name,
                domain,
                create_homepage,
                include_collections
            })
        });
    }

    async addPageToSite(siteId, { title, slug, template = 'default' }) {
        return this.request(`/sites/${siteId}/add-page`, {
            method: 'POST',
            body: JSON.stringify({ title, slug, template })
        });
    }

    // === Work Log ===
    async logWork(data) {
        return this.executeSQL(
            'INSERT INTO work_log (action, details, user_id, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [data.action, JSON.stringify(data.details), data.userId || 'god-mode']
        );
    }

    async getWorkLog(limit = 100) {
        return this.executeSQL(
            `SELECT * FROM work_log ORDER BY timestamp DESC LIMIT ${limit}`
        );
    }

    // === Error Logs ===
    async logError(error, context = {}) {
        return this.executeSQL(
            'INSERT INTO error_logs (error_message, stack_trace, context, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [
                error.message || error,
                error.stack || '',
                JSON.stringify(context)
            ]
        );
    }

    async getErrorLogs(limit = 50) {
        return this.executeSQL(
            `SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT ${limit}`
        );
    }

    // === Job Queue ===
    async addJob(jobType, payload, priority = 0) {
        return this.executeSQL(
            'INSERT INTO job_queue (job_type, payload, priority, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [jobType, JSON.stringify(payload), priority, 'pending']
        );
    }

    async getJobQueue(status = null) {
        const sql = status
            ? `SELECT * FROM job_queue WHERE status = $1 ORDER BY priority DESC, created_at ASC`
            : `SELECT * FROM job_queue ORDER BY priority DESC, created_at ASC`;

        return this.executeSQL(sql, status ? [status] : []);
    }

    async updateJobStatus(jobId, status, result = null) {
        return this.executeSQL(
            'UPDATE job_queue SET status = $1, result = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [status, result ? JSON.stringify(result) : null, jobId]
        );
    }

    async clearCompletedJobs() {
        return this.executeSQL(
            "DELETE FROM job_queue WHERE status IN ('completed', 'failed') AND updated_at < NOW() - INTERVAL '7 days'"
        );
    }

    // === Batch Operations ===
    async batch(operations) {
        const results = [];
        for (const op of operations) {
            try {
                const result = await this.request(op.endpoint, {
                    method: op.method || 'GET',
                    body: op.body ? JSON.stringify(op.body) : undefined
                });
                results.push({ success: true, result });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return results;
    }
}

// Create singleton instance
export const godMode = new GodModeClient();

// Export class for custom instances
export default GodModeClient;
