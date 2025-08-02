/**
 * Retry utility with exponential backoff for handling transient failures
 */

import { BraleAPIError } from '../errors/api-error';

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
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: 0.1,
  shouldRetry: (error: Error) => {
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
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error = new Error('Retry failed');
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
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
export function createRetryWrapper(options: RetryOptions = {}) {
  return function retryWrapper<T>(fn: () => Promise<T>, overrideOptions?: RetryOptions): Promise<T> {
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
export function retryable(options: RetryOptions = {}) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    
    if (!originalMethod) {
      throw new Error('Retryable decorator can only be applied to methods');
    }
    
    descriptor.value = async function (this: unknown, ...args: Parameters<T>) {
      return retry(() => originalMethod.apply(this, args), options);
    } as T;
    
    return descriptor;
  };
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: Required<RetryOptions>): number {
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
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeoutMs: number = 60000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly monitoringPeriodMs: number = 30000 // Reserved for future monitoring features
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
  
  getFailureCount(): number {
    return this.failures;
  }
  
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}