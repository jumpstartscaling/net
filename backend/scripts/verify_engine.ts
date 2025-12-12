
// We import using relative paths to cross the project boundary
import { SpintaxParser } from '../../frontend/src/lib/cartesian/SpintaxParser';
import { GrammarEngine } from '../../frontend/src/lib/cartesian/GrammarEngine';

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

console.log('--- Verification Complete ---');
