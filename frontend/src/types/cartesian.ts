/**
 * Cartesian Permutation Type Definitions
 * 
 * Types for spintax parsing, n^k combinations, and location cross-products.
 */

/**
 * Represents a single spintax slot found in text
 * Example: "{Best|Top|Leading}" becomes: 
 * { original: "{Best|Top|Leading}", options: ["Best", "Top", "Leading"], position: 0 }
 */
export interface SpintaxSlot {
    /** The original matched string including braces */
    original: string;
    /** Array of options extracted from the slot */
    options: string[];
    /** Position index in the template */
    position: number;
    /** Start character index in original text */
    startIndex: number;
    /** End character index in original text */
    endIndex: number;
}

/**
 * Configuration for Cartesian product generation
 */
export interface CartesianConfig {
    /** Maximum number of combinations to generate (safety limit) */
    maxCombinations: number;
    /** Whether to include location data in cross-product */
    includeLocations: boolean;
    /** How to handle locations: state, county, city, or none */
    locationMode: 'state' | 'county' | 'city' | 'none';
    /** Optional: limit to specific state/county */
    locationTargetId?: string;
    /** Batch size for processing */
    batchSize: number;
    /** Starting offset for pagination */
    offset: number;
}

/**
 * Default configuration
 */
export const DEFAULT_CARTESIAN_CONFIG: CartesianConfig = {
    maxCombinations: 10000,
    includeLocations: false,
    locationMode: 'none',
    batchSize: 500,
    offset: 0
};

/**
 * A single result from Cartesian product generation
 */
export interface CartesianResult {
    /** The final assembled text */
    text: string;
    /** Map of slot identifier to chosen value */
    slotValues: Record<string, string>;
    /** Location data if applicable */
    location?: {
        city?: string;
        county?: string;
        state?: string;
        stateCode?: string;
        id?: string;
    };
    /** Index in the full Cartesian product sequence */
    index: number;
}

/**
 * Metadata about a Cartesian product operation
 */
export interface CartesianMetadata {
    /** Template before expansion */
    template: string;
    /** Number of slots found */
    slotCount: number;
    /** Product of all slot option counts (n^k formula result) */
    totalSpintaxCombinations: number;
    /** Number of locations in cross-product */
    locationCount: number;
    /** Total possible combinations (spintax × locations) */
    totalPossibleCombinations: number;
    /** Actual count generated (respecting maxCombinations) */
    generatedCount: number;
    /** Whether generation was truncated due to limit */
    wasTruncated: boolean;
}

/**
 * Location data structure for cross-product
 */
export interface LocationEntry {
    id: string;
    city?: string;
    county?: string;
    state: string;
    stateCode: string;
    population?: number;
}

/**
 * Variable map for injection
 */
export type VariableMap = Record<string, string>;
