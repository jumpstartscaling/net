import { createDirectus, rest, authentication, updateField } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || 'https://spark.jumpstartscaling.com';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function updateStatusChoices() {
    await client.login(EMAIL!, PASSWORD!);

    try {
        console.log('Updating status field choices for Kanban...');
        await client.request(updateField('generated_articles', 'status', {
            meta: {
                options: {
                    choices: [
                        { text: 'Queued', value: 'queued', color: '#6366f1' },       // Indigo
                        { text: 'Processing', value: 'processing', color: '#eab308' }, // Yellow
                        { text: 'QC Review', value: 'qc', color: '#a855f7' },        // Purple
                        { text: 'Approved', value: 'approved', color: '#22c55e' },   // Green
                        { text: 'Published', value: 'published', color: '#10b981' },  // Emerald
                        { text: 'Draft', value: 'draft', color: '#94a3b8' },         // Legacy/Grey
                        { text: 'Archived', value: 'archived', color: '#475569' }     // Legacy/Slate
                    ]
                }
            }
        }));
        console.log('✅ Status choices updated successfully!');
    } catch (e: any) {
        console.error('❌ Error updating status field:', e.message);
    }
}

updateStatusChoices();
