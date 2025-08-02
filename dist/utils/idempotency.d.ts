/**
 * Idempotency utilities for ensuring requests are not duplicated
 */
/**
 * Generate a unique idempotency key
 *
 * @param prefix - Optional prefix for the key
 * @returns A unique idempotency key
 */
export declare function generateIdempotencyKey(prefix?: string): string;
/**
 * Generate a deterministic idempotency key based on request parameters
 *
 * @param params - Request parameters to base the key on
 * @param prefix - Optional prefix for the key
 * @returns A deterministic idempotency key
 */
export declare function generateDeterministicKey(params: Record<string, unknown>, prefix?: string): string;
/**
 * Validate an idempotency key format
 *
 * @param key - The idempotency key to validate
 * @returns Whether the key is valid
 */
export declare function validateIdempotencyKey(key: string): boolean;
/**
 * Idempotency key manager for tracking and managing keys
 */
export declare class IdempotencyManager {
    private readonly usedKeys;
    private readonly keyTtlMs;
    /**
     * Create a new IdempotencyManager
     *
     * @param keyTtlMs - Time to live for keys in milliseconds (default: 24 hours)
     */
    constructor(keyTtlMs?: number);
    /**
     * Check if a key has been used recently
     *
     * @param key - The idempotency key to check
     * @returns The previous result if key was used, undefined otherwise
     */
    checkKey(key: string): unknown | undefined;
    /**
     * Mark a key as used and store the result
     *
     * @param key - The idempotency key
     * @param result - The result to associate with the key
     */
    markKeyUsed(key: string, result?: unknown): void;
    /**
     * Remove a specific key
     *
     * @param key - The key to remove
     */
    removeKey(key: string): void;
    /**
     * Clear all keys
     */
    clear(): void;
    /**
     * Get the number of stored keys
     */
    size(): number;
    /**
     * Clean up expired keys
     */
    private cleanup;
}
/**
 * Idempotent function wrapper
 *
 * @param fn - The function to make idempotent
 * @param keyGenerator - Function to generate idempotency key from arguments
 * @param manager - Optional idempotency manager instance
 * @returns Wrapped idempotent function
 */
export declare function makeIdempotent<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>, keyGenerator: (...args: TArgs) => string, manager?: IdempotencyManager): (...args: TArgs) => Promise<TResult>;
/**
 * Idempotent method decorator
 *
 * @param keyGenerator - Function to generate idempotency key from method arguments
 * @param manager - Optional idempotency manager instance
 * @returns Method decorator
 */
export declare function idempotent<TArgs extends unknown[], TResult>(keyGenerator: (target: unknown, propertyKey: string | symbol, ...args: TArgs) => string, manager?: IdempotencyManager): <T extends (...args: TArgs) => Promise<TResult>>(target: unknown, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * Create a transfer-specific idempotency key
 *
 * @param params - Transfer parameters
 * @returns Idempotency key for the transfer
 */
export declare function createTransferIdempotencyKey(params: {
    accountId: string;
    amount: string;
    currency: string;
    sourceType: string;
    sourceId: string;
    destType: string;
    destId: string;
}): string;
/**
 * Create an address-specific idempotency key
 *
 * @param params - Address parameters
 * @returns Idempotency key for address operations
 */
export declare function createAddressIdempotencyKey(params: {
    accountId: string;
    address: string;
    network: string;
    type: string;
}): string;
//# sourceMappingURL=idempotency.d.ts.map