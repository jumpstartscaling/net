
/**
 * MetadataGenerator
 * Auto-generates SEO titles and descriptions.
 */
export class MetadataGenerator {
    static generateTitle(niche: string, city: string, state: string): string {
        // Simple formula for now - can be expanded to use patterns
        return `Top ${niche} Services in ${city}, ${state} | Verified Experts`;
    }

    static generateDescription(niche: string, city: string): string {
        return `Looking for the best ${niche} in ${city}? We provide top-rated solutions tailored for your business needs. Get a free consultation today.`;
    }
}
