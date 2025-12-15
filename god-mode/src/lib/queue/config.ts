/**
 * BullMQ Configuration
 * Job queue setup for content generation
 */

import { Queue, Worker, type QueueOptions } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection
// Supports REDIS_URL (with or without password) or separate host/port
const connection = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
    })
    : new IORedis({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
    });

// Handle connection errors gracefully
connection.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
});

connection.on('ready', () => {
    console.log('[Redis] Connected successfully');
});

// Queue options
const queueOptions: QueueOptions = {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            count: 100,
            age: 3600,
        },
        removeOnFail: {
            count: 1000,
        },
    },
};

// Define queues
export const queues = {
    generation: new Queue('generation', queueOptions),
    publishing: new Queue('publishing', queueOptions),
    svgImages: new Queue('svg-images', queueOptions),
    wpSync: new Queue('wp-sync', queueOptions),
    cleanup: new Queue('cleanup', queueOptions),
};

// Batch queue for campaign generation
export const batchQueue = new Queue('generate_campaign_content', queueOptions);

export { connection };
export const redisConnection = connection;
