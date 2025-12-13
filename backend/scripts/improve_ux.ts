// @ts-nocheck
import { createDirectus, rest, authentication, readItems, updateItem, createItem } from '@directus/sdk';
import { getDirectusClient } from '../../frontend/src/lib/directus/client';

const DIRECTUS_URL = "https://spark.jumpstartscaling.com";

// Authenticate as Admin to modify schema
const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'));

async function improveUX() {
    console.log("🛠️ Starting UX Improvement Protocol...");

    // Login and get token
    let token = '';
    try {
        const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "somescreenname@gmail.com",
                password: "SLm03N8XWqMTeJK3Zo95ZknWuM7xYWPk"
            })
        });
        const loginData = await loginRes.json();
        token = loginData.data.access_token;
        console.log("🔐 Admin Authenticated.");
    } catch (e) {
        console.error("❌ Auth Failed", e);
        process.exit(1);
    }

    // Helper to make authenticated requests
    const apiRequest = async (endpoint: string, method = 'GET', body?: any) => {
        const res = await fetch(`${DIRECTUS_URL}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        return res.json();
    };

    // 1. Fix 'status' fields on Pages, Generated Articles, etc.
    const statusCollections = ['pages', 'generated_articles', 'posts'];

    for (const collection of statusCollections) {
        console.log(`✨ Refining 'status' field for ${collection}...`);
        try {
            await apiRequest(`/fields/${collection}/status`, 'PATCH', {
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: "Draft", value: "draft" },
                            { text: "Published", value: "published" },
                            { text: "Archived", value: "archived" }
                        ]
                    },
                    display: 'labels',
                    display_options: {
                        showAsDot: true,
                        choices: [
                            { text: "Draft", value: "draft", foreground: "#FFFFFF", background: "#FFA400" },
                            { text: "Published", value: "published", foreground: "#FFFFFF", background: "#00C897" },
                            { text: "Archived", value: "archived", foreground: "#FFFFFF", background: "#5F6C7B" }
                        ]
                    }
                }
            });
            console.log(`✅ ${collection}.status upgraded to Badge/Dropdown.`);
        } catch (e) {
            console.error(`⚠️ Failed to update ${collection}.status:`, e.message);
        }
    }

    // 2. Fix 'site_id' to be a Dropdown (Many-to-One)
    const siteIdCollections = ['pages', 'generated_articles', 'generation_jobs'];

    for (const collection of siteIdCollections) {
        console.log(`🔗 Linking 'site_id' for ${collection}...`);
        try {
            await apiRequest(`/fields/${collection}/site_id`, 'PATCH', {
                meta: {
                    interface: 'select-dropdown-m2o',
                    options: {
                        template: "{{name}}"
                    },
                    display: 'related-values',
                    display_options: {
                        template: "{{name}}"
                    }
                }
            });
            console.log(`✅ ${collection}.site_id upgraded to Relationship Dropdown.`);
        } catch (e) {
            console.error(`⚠️ Failed to update ${collection}.site_id:`, e.message);
        }
    }

    // 3. Work Log Status
    try {
        await apiRequest('/fields/work_log/status', 'PATCH', {
            meta: {
                interface: 'select-dropdown',
                options: {
                    choices: [
                        { text: "Info", value: "info" },
                        { text: "Success", value: "success" },
                        { text: "Warning", value: "warning" },
                        { text: "Error", value: "error" }
                    ]
                },
                display: 'labels',
                display_options: {
                    showAsDot: true,
                    choices: [
                        { text: "Info", value: "info", foreground: "#FFFFFF", background: "#3399FF" },
                        { text: "Success", value: "success", foreground: "#FFFFFF", background: "#00C897" },
                        { text: "Warning", value: "warning", foreground: "#FFFFFF", background: "#FFA400" },
                        { text: "Error", value: "error", foreground: "#FFFFFF", background: "#FF3333" }
                    ]
                }
            }
        });
        console.log(`✅ work_log.status upgraded.`);
    } catch (e) {
        console.warn("⚠️ work_log.status skipped (might not exist yet)");
    }

    console.log("🎉 All UX optimizations applied. Refresh your Spark Admin dashboard!");
}

improveUX();
