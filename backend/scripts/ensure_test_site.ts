
import { createDirectus, rest, staticToken, authentication, login, readItems, createItem } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load Env
dotenv.config({ path: path.resolve(process.cwd(), 'backend', 'credentials.env') });

async function ensureSite() {
    const url = process.env.DIRECTUS_PUBLIC_URL || '';
    const email = process.env.DIRECTUS_ADMIN_EMAIL || '';
    const password = process.env.DIRECTUS_ADMIN_PASSWORD || '';

    if (!url || !email || !password) {
        console.error("Missing credentials in env");
        process.exit(1);
    }

    console.log(`Connecting to ${url}...`);
    const client = createDirectus(url).with(authentication()).with(rest());

    try {
        await client.login(email, password);
        console.log("Authenticated.");

        const existing = await client.request(readItems('sites' as any, {
            filter: {
                url: { _eq: 'https://la.chrisamaya.work' }
            }
        }));

        if (existing.length > 0) {
            console.log("✅ Site 'la.chrisamaya.work' already exists. ID:", existing[0].id);
        } else {
            console.log("Creating new site 'la.chrisamaya.work'...");
            const newSite = await client.request(createItem('sites', {
                name: 'Chris Amaya LA',
                url: 'https://la.chrisamaya.work',
                site_type: 'wordpress',
                status: 'active',
                allowed_niches: ['High-End Agency Owner', 'Real Estate Power Player']
            } as any));
            console.log("✅ Created site. ID:", newSite.id);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

ensureSite();
