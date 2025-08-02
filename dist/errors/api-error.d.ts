/**
 * Custom error classes for the Brale SDK
 */
/**
 * Base error class for all Brale API errors
 */
export declare class BraleAPIError extends Error {
    readonly name: string;
    readonly status: number;
    readonly code?: string;
    readonly context?: Record<string, unknown>;
    readonly requestId?: string;
    constructor(message: string, status: number, code?: string, context?: Record<string, unknown>, requestId?: string);
    /**
     * Create a BraleAPIError from an HTTP response
     */
    static fromResponse(status: number, data: unknown, requestId?: string): BraleAPIError;
    /**
     * Check if this is a client error (4xx status)
     */
    isClientError(): boolean;
    /**
     * Check if this is a server error (5xx status)
     */
    isServerError(): boolean;
    /**
     * Check if this error is retryable
     */
    isRetryable(): boolean;
    /**
     * Convert error to JSON for logging
     */
    toJSON(): Record<string, unknown>;
}
/**
 * Authentication-related errors
 */
export declare class BraleAuthError extends BraleAPIError {
    readonly name: string;
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Rate limiting errors
 */
export declare class BraleRateLimitError extends BraleAPIError {
    readonly name: string;
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number, context?: Record<string, unknown>);
}
/**
 * Validation errors
 */
export declare class BraleValidationError extends BraleAPIError {
    readonly name: string;
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Network/connection errors
 */
export declare class BraleNetworkError extends Error {
    readonly name = "BraleNetworkError";
    readonly originalError: Error;
    constructor(message: string, originalError: Error);
}
//# sourceMappingURL=api-error.d.ts.map