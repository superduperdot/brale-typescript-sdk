"use strict";
/**
 * Custom error classes for the Brale SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BraleNetworkError = exports.BraleValidationError = exports.BraleRateLimitError = exports.BraleAuthError = exports.BraleAPIError = void 0;
/**
 * Base error class for all Brale API errors
 */
class BraleAPIError extends Error {
    constructor(message, status, code, context, requestId) {
        super(message);
        this.name = 'BraleAPIError';
        this.status = status;
        this.code = code || '';
        this.context = context || {};
        this.requestId = requestId || '';
        // Ensure the error stack trace points to where the error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BraleAPIError);
        }
    }
    /**
     * Create a BraleAPIError from an HTTP response
     */
    static fromResponse(status, data, requestId) {
        let message = 'An API error occurred';
        let code;
        let context;
        if (data && typeof data === 'object') {
            const errorData = data;
            if (typeof errorData.message === 'string') {
                message = errorData.message;
            }
            else if (typeof errorData.error === 'string') {
                message = errorData.error;
            }
            if (typeof errorData.code === 'string') {
                code = errorData.code;
            }
            if (errorData.details && typeof errorData.details === 'object') {
                context = errorData.details;
            }
        }
        return new BraleAPIError(message, status, code, context, requestId);
    }
    /**
     * Check if this is a client error (4xx status)
     */
    isClientError() {
        return this.status >= 400 && this.status < 500;
    }
    /**
     * Check if this is a server error (5xx status)
     */
    isServerError() {
        return this.status >= 500 && this.status < 600;
    }
    /**
     * Check if this error is retryable
     */
    isRetryable() {
        // Retry on server errors and specific client errors
        return this.isServerError() ||
            this.status === 408 || // Request Timeout
            this.status === 429; // Too Many Requests
    }
    /**
     * Convert error to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            context: this.context,
            requestId: this.requestId,
            stack: this.stack,
        };
    }
}
exports.BraleAPIError = BraleAPIError;
/**
 * Authentication-related errors
 */
class BraleAuthError extends BraleAPIError {
    constructor(message, context) {
        super(message, 401, 'AUTH_ERROR', context);
        this.name = 'BraleAuthError';
    }
}
exports.BraleAuthError = BraleAuthError;
/**
 * Rate limiting errors
 */
class BraleRateLimitError extends BraleAPIError {
    constructor(message, retryAfter, context) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', context);
        this.name = 'BraleRateLimitError';
        this.retryAfter = retryAfter || 0;
    }
}
exports.BraleRateLimitError = BraleRateLimitError;
/**
 * Validation errors
 */
class BraleValidationError extends BraleAPIError {
    constructor(message, context) {
        super(message, 400, 'VALIDATION_ERROR', context);
        this.name = 'BraleValidationError';
    }
}
exports.BraleValidationError = BraleValidationError;
/**
 * Network/connection errors
 */
class BraleNetworkError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'BraleNetworkError';
        this.originalError = originalError;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BraleNetworkError);
        }
    }
}
exports.BraleNetworkError = BraleNetworkError;
//# sourceMappingURL=api-error.js.map