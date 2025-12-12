
/**
 * GrammarEngine
 * Resolves grammar tokens like [[PRONOUN]], [[ISARE]] based on avatar variants.
 */
export class GrammarEngine {
    /**
     * Resolve grammar tokens in text.
     * @param text Text containing [[TOKEN]] syntax
     * @param variant The avatar variant object (e.g. { pronoun: "he", isare: "is" })
     * @param variables Optional extra variables for function tokens like [[A_AN:{{NICHE}}]]
     */
    static resolve(text: string, variant: Record<string, string>): string {
        if (!text) return '';
        let resolved = text;

        // 1. Simple replacement from variant map
        // Matches [[KEY]]
        resolved = resolved.replace(/\[\[([A-Z_]+)\]\]/g, (match, key) => {
            const lowerKey = key.toLowerCase();
            if (variant[lowerKey]) {
                return variant[lowerKey];
            }
            return match; // Return original if not found
        });

        // 2. Handling A/An logic: [[A_AN:Word]]
        resolved = resolved.replace(/\[\[A_AN:(.*?)\]\]/g, (match, content) => {
            return GrammarEngine.a_an(content);
        });

        // 3. Capitalization: [[CAP:word]]
        resolved = resolved.replace(/\[\[CAP:(.*?)\]\]/g, (match, content) => {
            return content.charAt(0).toUpperCase() + content.slice(1);
        });

        return resolved;
    }

    static a_an(word: string): string {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const firstChar = word.trim().charAt(0).toLowerCase();
        // Simple heuristic
        if (vowels.includes(firstChar)) {
            return `an ${word}`;
        }
        return `a ${word}`;
    }
}
