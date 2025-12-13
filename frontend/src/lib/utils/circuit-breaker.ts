/**
 * Circuit Breaker
 * Prevents cascading failures for external services
 */

export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
}

export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime: number | null = null;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private name: string,
        private options: CircuitBreakerOptions = {
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            monitoringPeriod: 10000, // 10 seconds
        }
    ) { }

    async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
        // Check if circuit is open
        if (this.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - (this.lastFailureTime || 0);

            if (timeSinceLastFailure > this.options.resetTimeout) {
                this.state = 'HALF_OPEN';
                this.failures = 0;
            } else {
                console.warn(`[CircuitBreaker:${this.name}] Circuit is OPEN, using fallback`);
                if (fallback) {
                    return fallback();
                }
                throw new Error(`Circuit breaker open for ${this.name}`);
            }
        }

        try {
            const result = await operation();

            // Success - reset if in half-open state
            if (this.state === 'HALF_OPEN') {
                this.state = 'CLOSED';
                this.failures = 0;
                console.log(`[CircuitBreaker:${this.name}] Circuit closed after recovery`);
            }

            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            console.error(`[CircuitBreaker:${this.name}] Failure ${this.failures}/${this.options.failureThreshold}`);

            // Open circuit if threshold reached
            if (this.failures >= this.options.failureThreshold) {
                this.state = 'OPEN';
                console.error(`[CircuitBreaker:${this.name}] Circuit OPENED due to failures`);
            }

            // Use fallback if available
            if (fallback) {
                return fallback();
            }

            throw error;
        }
    }

    getStatus() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime,
        };
    }

    reset() {
        this.state = 'CLOSED';
        this.failures = 0;
        this.lastFailureTime = null;
    }
}

// Pre-configured circuit breakers
export const breakers = {
    wordpress: new CircuitBreaker('WordPress', {
        failureThreshold: 3,
        resetTimeout: 30000,
        monitoringPeriod: 5000,
    }),

    directus: new CircuitBreaker('Directus', {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
    }),
};
