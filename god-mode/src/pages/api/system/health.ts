
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    // This is a minimal endpoint to verify the frontend server itself is running.
    // In a real health check, you might also ping the database or external services here
    // and return a composite status (e.g. { frontend: 'ok', db: 'ok', directus: 'ok' })

    const healthStatus = {
        status: 'ok',
        service: 'spark-frontend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };

    return new Response(JSON.stringify(healthStatus), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
};
