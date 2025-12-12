
/**
 * HTMLRenderer (Assembler)
 * Wraps raw content blocks in formatted HTML.
 */
export class HTMLRenderer {
    /**
     * Render a full article from blocks.
     * @param blocks Array of processed content blocks objects
     * @returns Full HTML string
     */
    static renderArticle(blocks: any[]): string {
        return blocks.map(block => this.renderBlock(block)).join('\n\n');
    }

    /**
     * Render a single block based on its structure.
     */
    static renderBlock(block: any): string {
        let html = '';

        // Title
        if (block.title) {
            html += `<h2>${block.title}</h2>\n`;
        }

        // Hook
        if (block.hook) {
            html += `<p class="lead"><strong>${block.hook}</strong></p>\n`;
        }

        // Pains (Unordered List)
        if (block.pains && block.pains.length > 0) {
            html += `<ul>\n${block.pains.map((p: string) => `  <li>${p}</li>`).join('\n')}\n</ul>\n`;
        }

        // Solutions (Paragraphs or Ordered List)
        if (block.solutions && block.solutions.length > 0) {
            // Configurable, defaulting to paragraphs for flow
            html += block.solutions.map((s: string) => `<p>${s}</p>`).join('\n') + '\n';
        }

        // Value Points (Checkmark List style usually)
        if (block.value_points && block.value_points.length > 0) {
            html += `<ul class="value-points">\n${block.value_points.map((v: string) => `  <li>✅ ${v}</li>`).join('\n')}\n</ul>\n`;
        }

        // Raw Content (from Spintax/Components)
        if (block.content) {
            html += `<div class="block-content">\n${block.content}\n</div>\n`;
        }

        // CTA
        if (block.cta) {
            html += `<div class="cta-box"><p>${block.cta}</p></div>\n`;
        }

        return `<section class="content-block" id="${block.id || ''}">\n${html}</section>`;
    }
}
