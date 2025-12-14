
/**
 * SpintaxParser
 * Handles recursive parsing of {option1|option2} syntax.
 */
export class SpintaxParser {
    /**
     * Parse a string containing spintax.
     * Supports nested spintax like {Hi|Hello {World|Friend}}
     * @param text The text with spintax
     * @returns The parsed text with one option selected per block
     */
    static parse(text: string): string {
        if (!text) return '';

        // Regex to find the innermost spintax block: {([^{}]*)}
        // We execute this recursively until no braces remain.
        let parsed = text;
        const regex = /\{([^{}]+)\}/g;

        while (regex.test(parsed)) {
            parsed = parsed.replace(regex, (match, content) => {
                const options = content.split('|');
                const randomOption = options[Math.floor(Math.random() * options.length)];
                return randomOption;
            });
        }

        return parsed;
    }

    /**
     * Count total variations in a spintax string.
     * (Simplified estimate for preview calculator)
     */
    static countVariations(text: string): number {
        // Basic implementation for complexity estimation
        // Real count requiring parsing tree is complex, 
        // this is a placeholder if needed for UI later.
        return 1;
    }
}
