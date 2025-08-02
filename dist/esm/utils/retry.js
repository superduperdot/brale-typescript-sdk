/**
 * Retry utility with exponential backoff for handling transient failures
 */
import { BraleAPIError } from '../errors/api-error';
/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: 0.1,
    shouldRetry: (error) => {
        if (error instanceof BraleAPIError) {
            return error.isRetryable();
        }
        // Retry on network errors by default
        return error.name === 'BraleNetworkError';
    },
    onRetry: () => {
        // Default: do nothing
    },
};
/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves to the function result
 */
export async function retry(fn, options = {}) {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError = new Error('Retry failed');
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Don't retry on the last attempt
            if (attempt === config.maxAttempts) {
                break;
            }
            // Check if we should retry this error
            if (!config.shouldRetry(lastError, attempt)) {
                break;
            }
            // Calculate delay with exponential backoff and jitter
            const delay = calculateDelay(attempt, config);
            // Call onRetry callback
            config.onRetry(lastError, attempt, delay);
            // Wait before retrying
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Create a retry wrapper function
 *
 * @param options - Default retry options
 * @returns Function that wraps other functions with retry logic
 */
export function createRetryWrapper(options = {}) {
    return function retryWrapper(fn, overrideOptions) {
        const mergedOptions = { ...options, ...overrideOptions };
        return retry(fn, mergedOptions);
    };
}
/**
 * Retry decorator for class methods
 *
 * @param options - Retry configuration options
 * @returns Method decorator
 */
export function retryable(options = {}) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            throw new Error('Retryable decorator can only be applied to methods');
        }
        descriptor.value = async function (...args) {
            return retry(() => originalMethod.apply(this, args), options);
        };
        return descriptor;
    };
}
/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt, config) {
    // Calculate exponential backoff delay
    const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    // Apply maximum delay limit
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
    // Add jitter to avoid thundering herd
    const jitterAmount = cappedDelay * config.jitter * Math.random();
    const finalDelay = cappedDelay + jitterAmount;
    return Math.round(finalDelay);
}
/**
 * Sleep for the specified number of milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
    constructor(failureThreshold = 5, timeoutMs = 60000, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    monitoringPeriodMs = 30000 // Reserved for future monitoring features
    ) {
        this.failureThreshold = failureThreshold;
        this.timeoutMs = timeoutMs;
        this.monitoringPeriodMs = monitoringPeriodMs;
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'closed';
    }
    async execute(fn) {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeoutMs) {
                this.state = 'half-open';
            }
            else {
                throw new Error('Circuit breaker is open');
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failures = 0;
        this.state = 'closed';
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'open';
        }
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failures;
    }
    reset() {
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'closed';
    }
}
//# sourceMappingURL=retry.js.map