// @ts-nocheck

import { SpintaxParser } from './SpintaxParser';
import { GrammarEngine } from './GrammarEngine';
import { HTMLRenderer } from './HTMLRenderer';
import { createDirectus, rest, staticToken, readItems, readItem } from '@directus/sdk';

// Config
// In a real app, client should be passed in or singleton
// For this class, we assume data is passed in or we have a method to fetch it.

export interface GenerationContext {
    avatar: any;
    niche: string;
    city: any;
    site: any;
    template: any;
}

export class CartesianEngine {
    private client: any;

    constructor(directusClient: any) {
        this.client = directusClient;
    }

    /**
     * Generate a single article based on specific inputs.
     * @param overrides Optional overrides for slug, title, etc.
     */
    async generateArticle(context: GenerationContext, overrides?: any) {
        const { avatar, niche, city, site, template } = context;
        const variant = await this.getAvatarVariant(avatar.id, 'neutral'); // Default to neutral or specific

        // 1. Process Template Blocks
        const blocksData = [];

        // Parse structure_json (assuming array of block IDs)
        const blockIds = Array.isArray(template.structure_json) ? template.structure_json : [];

        for (const blockId of blockIds) {
            // Fetch Universal Block
            // In production, fetch specific fields to optimize
            let universal: any = {};
            try {
                // Assuming blockId is the ID in offer_blocks_universal (or key)
                // Since we stored them as items, we query by block_id field or id
                const result = await this.client.request(readItems('offer_blocks_universal' as any, {
                    filter: { block_id: { _eq: blockId } },
                    limit: 1
                }));
                universal = result[0] || {};
            } catch (e) { console.error(`Block not found: ${blockId}`); }

            // Fetch Personalized Expansion (Skipped for MVP)

            // MERGE 
            const mergedBlock = {
                id: blockId,
                title: universal.title,
                hook: universal.hook_generator,
                pains: universal.universal_pains || [],
                solutions: universal.universal_solutions || [],
                value_points: universal.universal_value_points || [],
                cta: universal.cta_spintax,
                spintax: universal.spintax_content // Assuming a new field for full block spintax
            };

            // 2. Resolve Tokens Per Block
            const solvedBlock = this.resolveBlock(mergedBlock, context, variant);
            blocksData.push(solvedBlock);
        }

        // 3. Assemble HTML
        const html = HTMLRenderer.renderArticle(blocksData);

        // 4. Generate Meta
        const metaTitle = overrides?.title || this.generateMetaTitle(context, variant);

        return {
            title: metaTitle,
            html_content: html,
            slug: overrides?.slug || this.generateSlug(metaTitle),
            meta_desc: "Generated description..." // Implementation TBD
        };
    }

    private resolveBlock(block: any, ctx: GenerationContext, variant: any): any {
        const resolve = (text: string) => {
            if (!text) return '';
            let t = text;

            // Level 1: Variables
            t = t.replace(/{{NICHE}}/g, ctx.niche || 'Business');
            t = t.replace(/{{CITY}}/g, ctx.city.city);
            t = t.replace(/{{STATE}}/g, ctx.city.state);
            t = t.replace(/{{ZIP_FOCUS}}/g, ctx.city.zip_focus || '');
            t = t.replace(/{{AGENCY_NAME}}/g, "Spark Agency"); // Config
            t = t.replace(/{{AGENCY_URL}}/g, ctx.site.url);

            // Level 2: Spintax
            t = SpintaxParser.parse(t);

            // Level 3: Grammar
            t = GrammarEngine.resolve(t, variant);

            return t;
        };

        const resolvedBlock: any = {
            id: block.id,
            title: resolve(block.title),
            hook: resolve(block.hook),
            pains: (block.pains || []).map(resolve),
            solutions: (block.solutions || []).map(resolve),
            value_points: (block.value_points || []).map(resolve),
            cta: resolve(block.cta)
        };

        // Handle Spintax Content & Components
        if (block.spintax) {
            let content = SpintaxParser.parse(block.spintax);

            // Dynamic Component Replacement
            if (content.includes('{{COMPONENT_AVATAR_GRID}}')) {
                content = content.replace('{{COMPONENT_AVATAR_GRID}}', this.generateAvatarGrid());
            }
            if (content.includes('{{COMPONENT_OPTIN_FORM}}')) {
                content = content.replace('{{COMPONENT_OPTIN_FORM}}', this.generateOptinForm());
            }

            content = GrammarEngine.resolve(content, variant);
            resolvedBlock.content = content;
        }

        return resolvedBlock;
    }

    private generateAvatarGrid(): string {
        const avatars = [
            "Scaling Founder", "Marketing Director", "Ecom Owner", "SaaS CEO", "Local Biz Owner",
            "Real Estate Agent", "Coach/Consultant", "Agency Owner", "Startup CTO", "Enterprise VP"
        ];

        let html = '<div class="grid grid-cols-2 md:grid-cols-5 gap-4 my-8">';
        avatars.forEach(a => {
            html += `
                <div class="p-4 border border-slate-700 rounded-lg text-center bg-slate-800">
                    <div class="w-12 h-12 bg-blue-600/20 rounded-full mx-auto mb-2 flex items-center justify-center text-blue-400 font-bold">
                        ${a[0]}
                    </div>
                    <div class="text-xs font-medium text-white">${a}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    private generateOptinForm(): string {
        return `
            <div class="bg-blue-900/20 border border-blue-800 p-8 rounded-xl my-8 text-center">
                <h3 class="text-2xl font-bold text-white mb-4">Book Your Strategy Session</h3>
                <p class="text-slate-400 mb-6">Stop guessing. Get a custom roadmap consisting of the exact systems we used to scale.</p>
                <form class="max-w-md mx-auto space-y-4">
                    <input type="email" placeholder="Enter your work email" class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                    <button type="button" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                        Get My Roadmap
                    </button>
                    <p class="text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
                </form>
            </div>
        `;
    }

    private generateMetaTitle(ctx: GenerationContext, variant: any): string {
        // Simple random pattern selection for now
        // In reality, this should come from "cartesian_patterns" loaded in context
        // But for robust fail-safe:
        const patterns = [
            `Top Rated ${ctx.niche} Company in ${ctx.city.city}`,
            `${ctx.city.city} ${ctx.niche} Experts - ${ctx.site.name || 'Official Site'}`,
            `The #1 ${ctx.niche} Service in ${ctx.city.city}, ${ctx.city.state}`,
            `Best ${ctx.niche} Agency Serving ${ctx.city.city}`
        ];
        const raw = patterns[Math.floor(Math.random() * patterns.length)];
        return raw;
    }

    private generateSlug(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    private async getAvatarVariant(avatarId: string, gender: string) {
        // Try to fetch from Directus "avatar_variants"
        // If fail, return default neutral
        try {
            // We assume variants are stored in a singleton or we query by avatar
            // Since we don't have the ID handy, we return a safe default for this MVP test
            // to ensure it works without complex relation queries right now.
            // The GrammarEngine handles defaults if keys are missing.
            return {
                pronoun: 'they',
                ppronoun: 'them',
                pospronoun: 'their',
                isare: 'are',
                has_have: 'have',
                does_do: 'do'
            };
        } catch (e) {
            return {};
        }
    }
}
