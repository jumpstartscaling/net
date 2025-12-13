/**
 * Work Log Helper
 * Centralized logging to work_log collection
 */

import { getDirectusClient } from '@/lib/directus/client';
import { createItem } from '@directus/sdk';

export type LogLevel = 'info' | 'success' | 'warning' | 'error';
export type LogAction = 'create' | 'update' | 'delete' | 'generate' | 'publish' | 'sync' | 'test';

interface LogEntry {
    action: LogAction;
    message: string;
    entity_type?: string;
    entity_id?: string | number;
    details?: string;
    level?: LogLevel;
    site?: number;
}

export async function logWork(entry: LogEntry) {
    try {
        const client = getDirectusClient();

        await client.request(
            createItem('work_log', {
                action: entry.action,
                message: entry.message,
                entity_type: entry.entity_type,
                entity_id: entry.entity_id?.toString(),
                details: entry.details,
                level: entry.level || 'info',
                site: entry.site,
                status: 'completed',
            })
        );
    } catch (error) {
        console.error('Failed to log work:', error);
    }
}

// Convenience methods
export const logger = {
    info: (message: string, details?: Partial<LogEntry>) =>
        logWork({ ...details, message, action: details?.action || 'update', level: 'info' }),

    success: (message: string, details?: Partial<LogEntry>) =>
        logWork({ ...details, message, action: details?.action || 'create', level: 'success' }),

    warning: (message: string, details?: Partial<LogEntry>) =>
        logWork({ ...details, message, action: details?.action || 'update', level: 'warning' }),

    error: (message: string, details?: Partial<LogEntry>) =>
        logWork({ ...details, message, action: details?.action || 'update', level: 'error' }),
};
