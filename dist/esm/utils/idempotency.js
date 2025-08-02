/**
 * Idempotency utilities for ensuring requests are not duplicated
 */
import { randomBytes, createHash } from 'crypto';
/**
 * Generate a unique idempotency key
 *
 * @param prefix - Optional prefix for the key
 * @returns A unique idempotency key
 */
export function generateIdempotencyKey(prefix) {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(16).toString('hex');
    const key = `${timestamp}-${randomPart}`;
    return prefix ? `${prefix}-${key}` : key;
}
/**
 * Generate a deterministic idempotency key based on request parameters
 *
 * @param params - Request parameters to base the key on
 * @param prefix - Optional prefix for the key
 * @returns A deterministic idempotency key
 */
export function generateDeterministicKey(params, prefix) {
    // Create a consistent string representation of the parameters
    const sortedKeys = Object.keys(params).sort();
    const paramsString = sortedKeys
        .map(key => `${key}=${JSON.stringify(params[key])}`)
        .join('&');
    // Hash the parameters to create a consistent key
    const hash = createHash('sha256')
        .update(paramsString)
        .digest('hex')
        .substring(0, 16);
    const timestamp = Math.floor(Date.now() / 1000).toString(36);
    const key = `${timestamp}-${hash}`;
    return prefix ? `${prefix}-${key}` : key;
}
/**
 * Validate an idempotency key format
 *
 * @param key - The idempotency key to validate
 * @returns Whether the key is valid
 */
export function validateIdempotencyKey(key) {
    // Check basic format: should be a string with reasonable length
    if (typeof key !== 'string' || key.length < 10 || key.length > 128) {
        return false;
    }
    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(key);
}
/**
 * Idempotency key manager for tracking and managing keys
 */
export class IdempotencyManager {
    /**
     * Create a new IdempotencyManager
     *
     * @param keyTtlMs - Time to live for keys in milliseconds (default: 24 hours)
     */
    constructor(keyTtlMs = 24 * 60 * 60 * 1000) {
        this.usedKeys = new Map();
        this.keyTtlMs = keyTtlMs;
        // Clean up expired keys periodically
        setInterval(() => this.cleanup(), Math.min(keyTtlMs / 4, 60 * 60 * 1000));
    }
    /**
     * Check if a key has been used recently
     *
     * @param key - The idempotency key to check
     * @returns The previous result if key was used, undefined otherwise
     */
    checkKey(key) {
        const entry = this.usedKeys.get(key);
        if (!entry) {
            return undefined;
        }
        // Check if key has expired
        if (Date.now() - entry.timestamp > this.keyTtlMs) {
            this.usedKeys.delete(key);
            return undefined;
        }
        return entry.result;
    }
    /**
     * Mark a key as used and store the result
     *
     * @param key - The idempotency key
     * @param result - The result to associate with the key
     */
    markKeyUsed(key, result) {
        this.usedKeys.set(key, {
            timestamp: Date.now(),
            result,
        });
    }
    /**
     * Remove a specific key
     *
     * @param key - The key to remove
     */
    removeKey(key) {
        this.usedKeys.delete(key);
    }
    /**
     * Clear all keys
     */
    clear() {
        this.usedKeys.clear();
    }
    /**
     * Get the number of stored keys
     */
    size() {
        return this.usedKeys.size;
    }
    /**
     * Clean up expired keys
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.usedKeys.entries()) {
            if (now - entry.timestamp > this.keyTtlMs) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.usedKeys.delete(key);
        }
    }
}
/**
 * Idempotent function wrapper
 *
 * @param fn - The function to make idempotent
 * @param keyGenerator - Function to generate idempotency key from arguments
 * @param manager - Optional idempotency manager instance
 * @returns Wrapped idempotent function
 */
export function makeIdempotent(fn, keyGenerator, manager) {
    const idempotencyManager = manager || new IdempotencyManager();
    return async (...args) => {
        const key = keyGenerator(...args);
        // Validate the generated key
        if (!validateIdempotencyKey(key)) {
            throw new Error(`Invalid idempotency key: ${key}`);
        }
        // Check if this key has been used recently
        const cachedResult = idempotencyManager.checkKey(key);
        if (cachedResult !== undefined) {
            return cachedResult;
        }
        // Execute the function and cache the result
        // eslint-disable-next-line no-useless-catch
        try {
            const result = await fn(...args);
            idempotencyManager.markKeyUsed(key, result);
            return result;
        }
        catch (error) {
            // Don't cache errors - allow retries
            throw error;
        }
    };
}
/**
 * Idempotent method decorator
 *
 * @param keyGenerator - Function to generate idempotency key from method arguments
 * @param manager - Optional idempotency manager instance
 * @returns Method decorator
 */
export function idempotent(keyGenerator, manager) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            throw new Error('Idempotent decorator can only be applied to methods');
        }
        const idempotencyManager = manager || new IdempotencyManager();
        descriptor.value = async function (...args) {
            const key = keyGenerator(target, propertyKey, ...args);
            if (!validateIdempotencyKey(key)) {
                throw new Error(`Invalid idempotency key: ${key}`);
            }
            const cachedResult = idempotencyManager.checkKey(key);
            if (cachedResult !== undefined) {
                return cachedResult;
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const result = await originalMethod.apply(this, args);
                idempotencyManager.markKeyUsed(key, result);
                return result;
            }
            catch (error) {
                // Don't cache errors
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Create a transfer-specific idempotency key
 *
 * @param params - Transfer parameters
 * @returns Idempotency key for the transfer
 */
export function createTransferIdempotencyKey(params) {
    return generateDeterministicKey(params, 'transfer');
}
/**
 * Create an address-specific idempotency key
 *
 * @param params - Address parameters
 * @returns Idempotency key for address operations
 */
export function createAddressIdempotencyKey(params) {
    return generateDeterministicKey(params, 'address');
}
//# sourceMappingURL=idempotency.js.map