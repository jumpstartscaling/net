/**
 * BullMQ Configuration
 * Job queue setup for content generation
 */

import { Queue, Worker, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection
const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
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

export { connection };
