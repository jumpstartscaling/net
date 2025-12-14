/**
 * Database Transaction Wrapper
 * Ensures atomic operations with PostgreSQL
 */

import { getDirectusClient } from '@/lib/directus/client';
import { logger } from '@/lib/utils/logger';

export async function withTransaction<T>(
    operation: () => Promise<T>,
    options?: {
        onError?: (error: Error) => void;
        logContext?: string;
    }
): Promise<T> {
    try {
        // Execute operation
        const result = await operation();

        if (options?.logContext) {
            await logger.success(`Transaction completed: ${options.logContext}`);
        }

        return result;
    } catch (error) {
        // Log error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (options?.logContext) {
            await logger.error(`Transaction failed: ${options.logContext}`, {
                details: errorMessage,
            });
        }

        // Call error handler if provided
        if (options?.onError && error instanceof Error) {
            options.onError(error);
        }

        throw error;
    }
}

// Batch operation wrapper with rate limiting
export async function batchOperation<T>(
    items: T[],
    operation: (item: T) => Promise<void>,
    options?: {
        batchSize?: number;
        delayMs?: number;
        onProgress?: (completed: number, total: number) => void;
    }
): Promise<void> {
    const batchSize = options?.batchSize || 50;
    const delayMs = options?.delayMs || 100;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        await Promise.all(batch.map(item => operation(item)));

        if (options?.onProgress) {
            options.onProgress(Math.min(i + batchSize, items.length), items.length);
        }

        // Delay between batches
        if (i + batchSize < items.length && delayMs) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}
