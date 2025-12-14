/**
 * Spark Platform - Cartesian Permutation Engine
 * 
 * Implements true Cartesian Product logic for spintax explosion:
 * - n^k formula for total combinations
 * - Location × Spintax cross-product
 * - Iterator-based generation for memory efficiency
 * 
 * The Cartesian Product generates ALL possible combinations where:
 * - Every element of Set A combines with every element of Set B, C, etc.
 * - Order matters: (A,B) ≠ (B,A)
 * - Formula: n₁ × n₂ × n₃ × ... × nₖ
 * 
 * @example
 * Spintax: "{Best|Top} {Dentist|Clinic} in {city}"
 * Cities: ["Austin", "Dallas"]
 * Result: 2 × 2 × 2 = 8 unique headlines
 */

import type {
    SpintaxSlot,
    CartesianConfig,
    CartesianResult,
    CartesianMetadata,
    LocationEntry,
    VariableMap,
    DEFAULT_CARTESIAN_CONFIG
} from '@/types/cartesian';

// Re-export the default config
export { DEFAULT_CARTESIAN_CONFIG } from '@/types/cartesian';

/**
 * Extract all spintax slots from a template string
 * Handles nested spintax by processing innermost first
 * 
 * @param text - The template string with {option1|option2} syntax
 * @returns Array of SpintaxSlot objects
 * 
 * @example
 * extractSpintaxSlots("{Best|Top} dentist")
 * // Returns: [{ original: "{Best|Top}", options: ["Best", "Top"], position: 0, startIndex: 0, endIndex: 10 }]
 */
export function extractSpintaxSlots(text: string): SpintaxSlot[] {
    const slots: SpintaxSlot[] = [];
    // Match innermost braces only (no nested braces inside)
    const pattern = /\{([^{}]+)\}/g;
    let match: RegExpExecArray | null;
    let position = 0;

    while ((match = pattern.exec(text)) !== null) {
        // Only treat as spintax if it contains pipe separator
        if (match[1].includes('|')) {
            slots.push({
                original: match[0],
                options: match[1].split('|').map(s => s.trim()),
                position: position++,
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }
    }

    return slots;
}

/**
 * Calculate total combinations using the n^k (Cartesian product) formula
 * 
 * For k slots with n₁, n₂, ..., nₖ options respectively:
 * Total = n₁ × n₂ × n₃ × ... × nₖ
 * 
 * @param slots - Array of spintax slots
 * @param locationCount - Number of locations to cross with (default 1)
 * @returns Total number of possible combinations, capped at safe integer max
 */
export function calculateTotalCombinations(
    slots: SpintaxSlot[],
    locationCount: number = 1
): number {
    if (slots.length === 0 && locationCount <= 1) {
        return 1;
    }

    let total = Math.max(locationCount, 1);

    for (const slot of slots) {
        total *= slot.options.length;
        // Safety check to prevent overflow
        if (total > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    return total;
}

/**
 * Generate all Cartesian product combinations from spintax slots
 * Uses an iterative approach with index-based selection for memory efficiency
 * 
 * The algorithm works like a "combination lock" or odometer:
 * - Each slot is a dial with n options
 * - We count through all n₁ × n₂ × ... × nₖ combinations
 * - The index maps to specific choices via modular arithmetic
 * 
 * @param template - Original template string
 * @param slots - Extracted spintax slots
 * @param config - Generation configuration
 * @yields CartesianResult for each combination
 */
export function* generateCartesianProduct(
    template: string,
    slots: SpintaxSlot[],
    config: Partial<CartesianConfig> = {}
): Generator<CartesianResult> {
    const { maxCombinations = 10000, offset = 0 } = config;

    if (slots.length === 0) {
        yield {
            text: template,
            slotValues: {},
            index: 0
        };
        return;
    }

    const totalCombinations = calculateTotalCombinations(slots);
    const limit = Math.min(totalCombinations, maxCombinations);
    const startIndex = Math.min(offset, totalCombinations);

    // Pre-calculate divisors for index-to-options mapping
    const divisors: number[] = [];
    let divisor = 1;
    for (let i = slots.length - 1; i >= 0; i--) {
        divisors[i] = divisor;
        divisor *= slots[i].options.length;
    }

    // Generate combinations using index-based selection
    for (let index = startIndex; index < Math.min(startIndex + limit, totalCombinations); index++) {
        let result = template;
        const slotValues: Record<string, string> = {};

        // Map index to specific option choices (like reading an odometer)
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const optionIndex = Math.floor(index / divisors[i]) % slot.options.length;
            const chosenOption = slot.options[optionIndex];

            slotValues[`slot_${i}`] = chosenOption;
            result = result.replace(slot.original, chosenOption);
        }

        yield {
            text: result,
            slotValues,
            index
        };
    }
}

/**
 * Generate full Cartesian product including location cross-product
 * 
 * This creates the FULL cross-product:
 * (Spintax combinations) × (Location variations)
 * 
 * @param template - The spintax template
 * @param locations - Array of location entries to cross with
 * @param nicheVariables - Additional variables to inject
 * @param config - Generation configuration
 * @yields CartesianResult with location data
 */
export function* generateWithLocations(
    template: string,
    locations: LocationEntry[],
    nicheVariables: VariableMap = {},
    config: Partial<CartesianConfig> = {}
): Generator<CartesianResult> {
    const { maxCombinations = 10000 } = config;

    const slots = extractSpintaxSlots(template);
    const spintaxCombinations = calculateTotalCombinations(slots);
    const locationCount = Math.max(locations.length, 1);
    const totalCombinations = spintaxCombinations * locationCount;

    let generated = 0;

    // If no locations, just generate spintax variations
    if (locations.length === 0) {
        for (const result of generateCartesianProduct(template, slots, config)) {
            if (generated >= maxCombinations) return;

            // Inject niche variables
            const text = injectVariables(result.text, nicheVariables);

            yield {
                ...result,
                text,
                index: generated++
            };
        }
        return;
    }

    // Full cross-product: spintax × locations
    for (const location of locations) {
        // Build location variables
        const locationVars: VariableMap = {
            city: location.city || '',
            county: location.county || '',
            state: location.state,
            state_code: location.stateCode,
            population: String(location.population || '')
        };

        // Merge with niche variables
        const allVariables = { ...nicheVariables, ...locationVars };

        // Generate all spintax combinations for this location
        for (const result of generateCartesianProduct(template, slots, { maxCombinations: Infinity })) {
            if (generated >= maxCombinations) return;

            // Inject all variables
            const text = injectVariables(result.text, allVariables);

            yield {
                text,
                slotValues: result.slotValues,
                location: {
                    city: location.city,
                    county: location.county,
                    state: location.state,
                    stateCode: location.stateCode,
                    id: location.id
                },
                index: generated++
            };
        }
    }
}

/**
 * Inject variables into text, replacing {varName} placeholders
 * Unlike spintax, variable placeholders don't contain pipe separators
 * 
 * @param text - Text with {variable} placeholders
 * @param variables - Map of variable names to values
 * @returns Text with variables replaced
 */
export function injectVariables(text: string, variables: VariableMap): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
        // Match {key} but NOT {key|other} (that's spintax)
        const pattern = new RegExp(`\\{${key}\\}`, 'gi');
        result = result.replace(pattern, value);
    }

    return result;
}

/**
 * Parse spintax and randomly select ONE variation (for content fragments)
 * This is different from Cartesian explosion - it picks a single random path
 * 
 * @param text - Text with spintax {option1|option2}
 * @returns Single randomly selected variation
 */
export function parseSpintaxRandom(text: string): string {
    const pattern = /\{([^{}]+)\}/g;

    function processMatch(_match: string, group: string): string {
        if (!group.includes('|')) {
            return `{${group}}`; // Not spintax, preserve as variable placeholder
        }
        const options = group.split('|');
        return options[Math.floor(Math.random() * options.length)];
    }

    let result = text;
    let previousResult = '';

    // Process nested spintax (innermost first)
    while (result !== previousResult) {
        previousResult = result;
        result = result.replace(pattern, processMatch);
    }

    return result;
}

/**
 * Explode spintax into ALL variations without locations
 * Convenience function for simple use cases
 * 
 * @param text - Spintax template
 * @param maxCount - Maximum results
 * @returns Array of all variations
 */
export function explodeSpintax(text: string, maxCount = 5000): string[] {
    const slots = extractSpintaxSlots(text);
    const results: string[] = [];

    for (const result of generateCartesianProduct(text, slots, { maxCombinations: maxCount })) {
        results.push(result.text);
    }

    return results;
}

/**
 * Get metadata about a Cartesian product without running generation
 * Useful for UI to show "This will generate X combinations"
 * 
 * @param template - Spintax template
 * @param locationCount - Number of locations
 * @param maxCombinations - Generation limit
 * @returns Metadata object
 */
export function getCartesianMetadata(
    template: string,
    locationCount: number = 1,
    maxCombinations: number = 10000
): CartesianMetadata {
    const slots = extractSpintaxSlots(template);
    const totalSpintaxCombinations = calculateTotalCombinations(slots);
    const totalPossibleCombinations = totalSpintaxCombinations * Math.max(locationCount, 1);
    const generatedCount = Math.min(totalPossibleCombinations, maxCombinations);

    return {
        template,
        slotCount: slots.length,
        totalSpintaxCombinations,
        locationCount,
        totalPossibleCombinations,
        generatedCount,
        wasTruncated: totalPossibleCombinations > maxCombinations
    };
}

/**
 * Collect results from a generator into an array
 * Helper for when you need all results at once
 */
export function collectResults(
    generator: Generator<CartesianResult>,
    limit?: number
): CartesianResult[] {
    const results: CartesianResult[] = [];
    let count = 0;

    for (const result of generator) {
        results.push(result);
        count++;
        if (limit && count >= limit) break;
    }

    return results;
}
