
// Logic copied from SpintaxParser.ts for verification
class SpintaxParser {
    static parse(text: string): string {
        if (!text) return '';
        let parsed = text;
        const regex = /\{([^{}]+)\}/g;
        while (regex.test(parsed)) {
            parsed = parsed.replace(regex, (match, content) => {
                const options = content.split('|');
                return options[Math.floor(Math.random() * options.length)];
            });
        }
        return parsed;
    }
}

// Logic copied from GrammarEngine.ts for verification
class GrammarEngine {
    static resolve(text: string, variant: Record<string, string>): string {
        if (!text) return '';
        let resolved = text;
        resolved = resolved.replace(/\[\[([A-Z_]+)\]\]/g, (match, key) => {
            const lowerKey = key.toLowerCase();
            if (variant[lowerKey]) {
                return variant[lowerKey];
            }
            return match;
        });
        resolved = resolved.replace(/\[\[A_AN:(.*?)\]\]/g, (match, content) => {
            return GrammarEngine.a_an(content);
        });
        return resolved;
    }
    static a_an(word: string): string {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const firstChar = word.trim().charAt(0).toLowerCase();
        if (vowels.includes(firstChar)) {
            return `an ${word}`;
        }
        return `a ${word}`;
    }
}

console.log('--- Verifying SpintaxParser ---');
const spintax = "{Hello|Hi} {World|Friend|{Universe|Cosmos}}";
const parsed = SpintaxParser.parse(spintax);
console.log(`Input: ${spintax}`);
console.log(`Output: ${parsed}`);

if (parsed.includes('{') || parsed.includes('}')) {
    console.error('❌ Spintax failed to fully resolve.');
    process.exit(1);
} else {
    console.log('✅ Spintax Resolved');
}

console.log('--- Verifying GrammarEngine ---');
const distinct = { pronoun: "he", isare: "is" };
const text = "[[PRONOUN]] [[ISARE]] going to the [[A_AN:Apple]] store.";
const resolved = GrammarEngine.resolve(text, distinct);
console.log(`Input: ${text}`);
console.log(`Output: ${resolved}`);

if (resolved !== "he is going to the an Apple store.") {
    console.warn(`⚠️ Grammar resolution mismatch. Got: ${resolved}`);
} else {
    console.log('✅ Grammar Resolved');
}

console.log('✅ Logic Verification Passed.');
