/**
 * Custom error classes for the Brale SDK
 */

/**
 * Base error class for all Brale API errors
 */
export class BraleAPIError extends Error {
  public readonly name: string = 'BraleAPIError';
  public readonly status: number;
  public readonly code?: string;
  public readonly context?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    context?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
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
  static fromResponse(
    status: number,
    data: unknown,
    requestId?: string
  ): BraleAPIError {
    let message = 'An API error occurred';
    let code: string | undefined;
    let context: Record<string, unknown> | undefined;

    // Provide more specific error messages for common HTTP status codes
    if (status === 500) {
      message = 'Internal server error - the API is experiencing issues';
    } else if (status === 503) {
      message = 'Service unavailable - the API is temporarily down';
    } else if (status === 429) {
      message = 'Rate limit exceeded - too many requests';
    } else if (status === 401) {
      message = 'Authentication failed - check your credentials';
    } else if (status === 403) {
      message = 'Access forbidden - insufficient permissions';
    } else if (status === 404) {
      message = 'Resource not found';
    }

    if (data && typeof data === 'object') {
      const errorData = data as Record<string, unknown>;
      
      if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      }
      
      if (typeof errorData.code === 'string') {
        code = errorData.code;
      }
      
      if (errorData.details && typeof errorData.details === 'object') {
        context = errorData.details as Record<string, unknown>;
      }
    }

    return new BraleAPIError(message, status, code, context, requestId);
  }

  /**
   * Check if this is a client error (4xx status)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx status)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    // Retry on server errors and specific client errors
    return this.isServerError() || 
           this.status === 408 || // Request Timeout
           this.status === 429;   // Too Many Requests
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
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

/**
 * Authentication-related errors
 */
export class BraleAuthError extends BraleAPIError {
  public readonly name: string = 'BraleAuthError';
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 401, 'AUTH_ERROR', context);
  }
}

/**
 * Rate limiting errors
 */
export class BraleRateLimitError extends BraleAPIError {
  public readonly name: string = 'BraleRateLimitError';
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, context?: Record<string, unknown>) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', context);
    this.retryAfter = retryAfter || 0;
  }
}

/**
 * Validation errors
 */
export class BraleValidationError extends BraleAPIError {
  public readonly name: string = 'BraleValidationError';
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', context);
  }
}

/**
 * Network/connection errors
 */
export class BraleNetworkError extends Error {
  public override readonly name = 'BraleNetworkError';
  public readonly originalError: Error;

  constructor(message: string, originalError: Error) {
    super(message);
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BraleNetworkError);
    }
  }
}