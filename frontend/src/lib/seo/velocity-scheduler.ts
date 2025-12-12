/**
 * Gaussian Velocity Scheduler
 * 
 * Distributes articles over a date range using natural velocity patterns
 * to simulate organic content growth and avoid spam footprints.
 */

export type VelocityMode = 'RAMP_UP' | 'RANDOM_SPIKES' | 'STEADY';

export interface VelocityConfig {
    mode: VelocityMode;
    weekendThrottle: boolean;
    jitterMinutes: number;
    businessHoursOnly: boolean;
}

export interface ScheduleEntry {
    publishDate: Date;
    modifiedDate: Date;
}

/**
 * Generate a natural schedule for article publication
 * 
 * @param startDate - Earliest backdate
 * @param endDate - Latest date (usually today)
 * @param totalArticles - Number of articles to schedule
 * @param config - Velocity configuration
 * @returns Array of scheduled dates
 */
export function generateNaturalSchedule(
    startDate: Date,
    endDate: Date,
    totalArticles: number,
    config: VelocityConfig
): ScheduleEntry[] {
    const now = new Date();
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0 || totalArticles <= 0) {
        return [];
    }

    // Build probability weights for each day
    const dayWeights: { date: Date; weight: number }[] = [];

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);

        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let weight = 1.0;

        // Apply velocity mode
        switch (config.mode) {
            case 'RAMP_UP':
                // Weight grows from 0.2 (20% volume) to 1.0 (100% volume)
                const progress = dayOffset / totalDays;
                weight = 0.2 + (0.8 * progress);
                break;

            case 'RANDOM_SPIKES':
                // 5% chance of a content sprint (3x volume)
                if (Math.random() < 0.05) {
                    weight = 3.0;
                }
                break;

            case 'STEADY':
            default:
                weight = 1.0;
                break;
        }

        // Add human noise (±15% randomness)
        weight *= 0.85 + (Math.random() * 0.30);

        // Weekend throttle (reduce by 80%)
        if (config.weekendThrottle && isWeekend) {
            weight *= 0.2;
        }

        dayWeights.push({ date: currentDate, weight });
    }

    // Normalize and distribute articles
    const totalWeight = dayWeights.reduce((sum, d) => sum + d.weight, 0);
    const scheduleQueue: ScheduleEntry[] = [];

    for (const dayEntry of dayWeights) {
        // Calculate how many articles for this day
        const rawCount = (dayEntry.weight / totalWeight) * totalArticles;

        // Probabilistic rounding
        let count = Math.floor(rawCount);
        if (Math.random() < (rawCount - count)) {
            count += 1;
        }

        // Generate timestamps with jitter
        for (let i = 0; i < count; i++) {
            let hour: number;

            if (config.businessHoursOnly) {
                // Gaussian centered at 2 PM, clamped to 9-18
                hour = Math.round(gaussianRandom(14, 2));
                hour = Math.max(9, Math.min(18, hour));
            } else {
                // Any hour with slight bias toward afternoon
                hour = Math.round(gaussianRandom(14, 4));
                hour = Math.max(0, Math.min(23, hour));
            }

            const minute = Math.floor(Math.random() * 60);

            // Apply jitter to the base hour
            const jitterOffset = Math.floor((Math.random() - 0.5) * 2 * config.jitterMinutes);

            const publishDate = new Date(dayEntry.date);
            publishDate.setHours(hour, minute, 0, 0);
            publishDate.setMinutes(publishDate.getMinutes() + jitterOffset);

            // SEO TRICK: If older than 6 months, set modified date to today
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const modifiedDate = publishDate < sixMonthsAgo
                ? randomDateWithin7Days(now) // Set to recent date for freshness signal
                : new Date(publishDate);

            scheduleQueue.push({ publishDate, modifiedDate });
        }
    }

    // Sort chronologically
    scheduleQueue.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());

    return scheduleQueue;
}

/**
 * Generate a Gaussian random number
 * Uses Box-Muller transform
 */
function gaussianRandom(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
}

/**
 * Generate a random date within 7 days of target
 */
function randomDateWithin7Days(target: Date): Date {
    const offset = Math.floor(Math.random() * 7);
    const result = new Date(target);
    result.setDate(result.getDate() - offset);
    result.setHours(
        Math.floor(Math.random() * 10) + 9, // 9 AM - 7 PM
        Math.floor(Math.random() * 60),
        0, 0
    );
    return result;
}

/**
 * Calculate max backdate based on domain age
 * 
 * @param domainAgeYears - How old the domain is
 * @returns Earliest date that's safe to backdate to
 */
export function getMaxBackdateStart(domainAgeYears: number): Date {
    const now = new Date();
    // Can only backdate to when domain existed, minus a small buffer
    const maxYears = Math.max(0, domainAgeYears - 0.25); // 3 month buffer
    const result = new Date(now);
    result.setFullYear(result.getFullYear() - maxYears);
    return result;
}

/**
 * Create a context-aware year token replacer
 * Replaces {Current_Year} and {Next_Year} based on publish date
 */
export function replaceYearTokens(content: string, publishDate: Date): string {
    const year = publishDate.getFullYear();
    return content
        .replace(/\{Current_Year\}/g, year.toString())
        .replace(/\{Next_Year\}/g, (year + 1).toString())
        .replace(/\{Last_Year\}/g, (year - 1).toString());
}
