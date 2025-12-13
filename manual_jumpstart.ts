// @ts-nocheck
import { WordPressClient } from './frontend/src/lib/wordpress/WordPressClient';

const SITE_URL = "https://chrisamaya.work";
const USERNAME = "gatekeeper";
const PASSWORD = "Idk@2025";

// Create Directus Client manually since we are in a script
import { createDirectus, rest, authentication, readItems, createItem } from '@directus/sdk';
const DIRECTUS_URL = "https://spark.jumpstartscaling.com";
// const DIRECTUS_TOKEN = "SufWLAbsqmbbqF_gg5I70ng8wE1zXt-a"; // Lacking permissions

const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'));



async function triggerPendingJobs() {
    console.log("🚀 Starting Manual Engine Trigger...");

    // 0. Authenticate via Raw API
    try {
        const loginUrl = `${DIRECTUS_URL}/auth/login`;
        // Credentials from previous steps
        const email = "somescreenname@gmail.com";
        const password = "SLm03N8XWqMTeJK3Zo95ZknWuM7xYWPk";

        const authRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!authRes.ok) {
            throw new Error(`Auth Failed: ${authRes.status} ${await authRes.text()}`);
        }

        const authData = await authRes.json();
        await client.setToken(authData.data.access_token);
        console.log("🔐 Authenticated successfully.");

    } catch (e) {
        console.error("❌ CRTICAL AUTH FAILURE:", e);
        process.exit(1);
    }

    // 1. Fetch Pending Jobs
    console.log("🔍 Looking for Pending Refactor Jobs...");
    try {
        const pendingJobs = await client.request(
            readItems('generation_jobs', {
                filter: { status: { _eq: 'Pending' } },
                limit: 100
            })
        );

        if (!pendingJobs || pendingJobs.length === 0) {
            console.log("✅ No pending jobs found. All caught up!");
            return;
        }

        console.log(`🔥 Found ${pendingJobs.length} Pending Jobs. Firing Engine...`);
        const FRONTEND_url = "https://launch.jumpstartscaling.com";

        for (const job of pendingJobs) {
            console.log(`⚡️ Triggering Job #${job.id}...`);
            try {
                // We use the FRONTEND URL for the API
                const response = await fetch(`${FRONTEND_url}/api/generate-content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: job.id,
                        mode: 'refactor',
                        batchSize: 5
                    })
                });

                const resText = await response.text();
                // Check if success
                if (response.ok) {
                    console.log(`✅ Triggered: ${resText.substring(0, 50)}...`);
                } else {
                    console.error(`❌ Failed Trigger: ${response.status} - ${resText}`);
                }
            } catch (err) {
                console.error(`❌ Network Error triggering job ${job.id}:`, err);
            }

            // Wait a bit between triggers to not DOS ourselves?
            await new Promise(r => setTimeout(r, 500));
        }

    } catch (e) {
        console.error("❌ Error fetching/processing jobs:", e);
    }
}

triggerPendingJobs();
