/**
 * Retry utility with exponential backoff for handling transient failures
 */
/**
 * Retry configuration options
 */
export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxAttempts?: number;
    /** Initial delay in milliseconds (default: 1000) */
    initialDelayMs?: number;
    /** Maximum delay in milliseconds (default: 30000) */
    maxDelayMs?: number;
    /** Backoff multiplier (default: 2) */
    backoffMultiplier?: number;
    /** Jitter factor to add randomness (0-1, default: 0.1) */
    jitter?: number;
    /** Custom function to determine if error should be retried */
    shouldRetry?: (error: Error, attempt: number) => boolean;
    /** Custom function called before each retry */
    onRetry?: (error: Error, attempt: number, delay: number) => void;
}
/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves to the function result
 */
export declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Create a retry wrapper function
 *
 * @param options - Default retry options
 * @returns Function that wraps other functions with retry logic
 */
export declare function createRetryWrapper(options?: RetryOptions): <T>(fn: () => Promise<T>, overrideOptions?: RetryOptions) => Promise<T>;
/**
 * Retry decorator for class methods
 *
 * @param options - Retry configuration options
 * @returns Method decorator
 */
export declare function retryable(options?: RetryOptions): <T extends (...args: unknown[]) => Promise<unknown>>(_target: unknown, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * Retry with circuit breaker pattern
 */
export declare class CircuitBreaker {
    private readonly failureThreshold;
    private readonly timeoutMs;
    private readonly monitoringPeriodMs;
    private failures;
    private lastFailureTime;
    private state;
    constructor(failureThreshold?: number, timeoutMs?: number, monitoringPeriodMs?: number);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): 'closed' | 'open' | 'half-open';
    getFailureCount(): number;
    reset(): void;
}
//# sourceMappingURL=retry.d.ts.map