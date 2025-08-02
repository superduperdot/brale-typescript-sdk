/**
 * Pagination utilities for handling paginated API responses
 */
import type { PaginationParams, PaginatedResponse } from '../types/common';
/**
 * Default pagination parameters
 */
export declare const DEFAULT_PAGINATION: Required<PaginationParams>;
/**
 * Maximum allowed page size
 */
export declare const MAX_PAGE_SIZE = 100;
/**
 * Validate pagination parameters
 *
 * @param params - Pagination parameters to validate
 * @returns Validated and normalized parameters
 */
export declare function validatePaginationParams(params?: PaginationParams): Required<PaginationParams>;
/**
 * Create pagination query parameters for API requests
 *
 * @param params - Pagination parameters
 * @returns Query parameters object
 */
export declare function createPaginationQuery(params: PaginationParams): Record<string, string>;
/**
 * Calculate pagination metadata
 *
 * @param totalItems - Total number of items
 * @param params - Current pagination parameters
 * @returns Pagination metadata
 */
export declare function calculatePaginationMeta(totalItems: number, params: Required<PaginationParams>): {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
};
/**
 * Paginated iterator for automatically fetching all pages
 */
export declare class PaginatedIterator<T> {
    private readonly fetchPage;
    private currentParams;
    private hasMorePages;
    constructor(fetchPage: (params: PaginationParams) => Promise<PaginatedResponse<T>>, initialParams?: PaginationParams);
    /**
     * Get the next page of results
     *
     * @returns Next page of results or null if no more pages
     */
    next(): Promise<PaginatedResponse<T> | null>;
    /**
     * Iterate through all pages and collect all items
     *
     * @param maxPages - Maximum number of pages to fetch (default: no limit)
     * @returns Array of all items from all pages
     */
    all(maxPages?: number): Promise<T[]>;
    /**
     * Create an async iterator for easy iteration
     */
    [Symbol.asyncIterator](): AsyncIterableIterator<T[]>;
    /**
     * Reset the iterator to start from the beginning
     */
    reset(params?: PaginationParams): void;
    /**
     * Check if there are more pages to fetch
     */
    hasMore(): boolean;
}
/**
 * Auto-paginating function wrapper
 *
 * @param fetchPage - Function to fetch a single page
 * @returns Function that automatically handles pagination
 */
export declare function createAutoPaginator<T>(fetchPage: (params: PaginationParams) => Promise<PaginatedResponse<T>>): {
    /**
     * Get a single page
     */
    page: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
    /**
     * Get all items across all pages
     */
    all: (params?: PaginationParams, maxPages?: number) => Promise<T[]>;
    /**
     * Create an iterator for manual pagination
     */
    iterate: (params?: PaginationParams) => PaginatedIterator<T>;
};
/**
 * Helper function to create a paginated response
 *
 * @param data - Array of items
 * @param params - Pagination parameters used
 * @param totalItems - Total number of items available
 * @param nextCursor - Next cursor for cursor-based pagination
 * @returns Formatted paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], params: Required<PaginationParams>, totalItems: number, nextCursor?: string): PaginatedResponse<T>;
/**
 * Convert cursor to offset for mixed pagination support
 *
 * @param cursor - Base64 encoded cursor
 * @returns Decoded offset value
 */
export declare function cursorToOffset(cursor: string): number;
/**
 * Convert offset to cursor for mixed pagination support
 *
 * @param offset - Offset value
 * @returns Base64 encoded cursor
 */
export declare function offsetToCursor(offset: number): string;
//# sourceMappingURL=pagination.d.ts.map