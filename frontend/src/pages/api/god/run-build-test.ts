/**
 * API endpoint to run the build test
 */

import type { APIRoute } from 'astro';
import { runBuildTest } from '@/../../backend/scripts/buildTestLongForm';

export const POST: APIRoute = async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Validate God Mode token
    if (token !== process.env.GOD_MODE_TOKEN && token !== process.env.DIRECTUS_ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Run the build test
        const results = await runBuildTest();

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
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
