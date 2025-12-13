
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load credentials
const envPath = path.resolve(__dirname, '../credentials.env');
dotenv.config({ path: envPath });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL || '')
    .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN || ''))
    .with(rest());

async function listJobs() {
    try {
        console.log("Fetching jobs from", process.env.DIRECTUS_PUBLIC_URL);
        const jobs = await client.request(readItems('generation_jobs', {
            sort: ['-date_created'],
            limit: 5
        }));
        console.log("Found jobs:", JSON.stringify(jobs, null, 2));
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
}

listJobs();
