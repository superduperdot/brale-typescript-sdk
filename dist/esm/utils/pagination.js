/**
 * Pagination utilities for handling paginated API responses
 */
/**
 * Default pagination parameters
 */
export const DEFAULT_PAGINATION = {
    limit: 20,
    offset: 0,
    cursor: '',
};
/**
 * Maximum allowed page size
 */
export const MAX_PAGE_SIZE = 100;
/**
 * Validate pagination parameters
 *
 * @param params - Pagination parameters to validate
 * @returns Validated and normalized parameters
 */
export function validatePaginationParams(params = {}) {
    const validated = {
        limit: params.limit ?? DEFAULT_PAGINATION.limit,
        offset: params.offset ?? DEFAULT_PAGINATION.offset,
        cursor: params.cursor ?? DEFAULT_PAGINATION.cursor,
    };
    // Validate limit
    if (validated.limit < 1) {
        validated.limit = DEFAULT_PAGINATION.limit;
    }
    else if (validated.limit > MAX_PAGE_SIZE) {
        validated.limit = MAX_PAGE_SIZE;
    }
    // Validate offset
    if (validated.offset < 0) {
        validated.offset = 0;
    }
    return validated;
}
/**
 * Create pagination query parameters for API requests
 *
 * @param params - Pagination parameters
 * @returns Query parameters object
 */
export function createPaginationQuery(params) {
    const validated = validatePaginationParams(params);
    const query = {};
    if (validated.limit !== DEFAULT_PAGINATION.limit) {
        query.limit = validated.limit.toString();
    }
    if (validated.cursor) {
        query.cursor = validated.cursor;
    }
    else if (validated.offset > 0) {
        query.offset = validated.offset.toString();
    }
    return query;
}
/**
 * Calculate pagination metadata
 *
 * @param totalItems - Total number of items
 * @param params - Current pagination parameters
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(totalItems, params) {
    const currentPage = Math.floor(params.offset / params.limit) + 1;
    const totalPages = Math.ceil(totalItems / params.limit);
    const hasMore = params.offset + params.limit < totalItems;
    return {
        offset: params.offset,
        limit: params.limit,
        total: totalItems,
        hasMore,
        currentPage,
        totalPages,
    };
}
/**
 * Paginated iterator for automatically fetching all pages
 */
export class PaginatedIterator {
    constructor(fetchPage, initialParams = {}) {
        this.fetchPage = fetchPage;
        this.hasMorePages = true;
        this.currentParams = validatePaginationParams(initialParams);
    }
    /**
     * Get the next page of results
     *
     * @returns Next page of results or null if no more pages
     */
    async next() {
        if (!this.hasMorePages) {
            return null;
        }
        const response = await this.fetchPage(this.currentParams);
        // Update pagination state
        this.hasMorePages = response.pagination.hasMore;
        if (response.pagination.nextCursor) {
            // Cursor-based pagination
            this.currentParams.cursor = response.pagination.nextCursor;
        }
        else {
            // Offset-based pagination
            this.currentParams.offset += this.currentParams.limit;
        }
        return response;
    }
    /**
     * Iterate through all pages and collect all items
     *
     * @param maxPages - Maximum number of pages to fetch (default: no limit)
     * @returns Array of all items from all pages
     */
    async all(maxPages) {
        const allItems = [];
        let pageCount = 0;
        while (this.hasMorePages && (!maxPages || pageCount < maxPages)) {
            const page = await this.next();
            if (!page)
                break;
            allItems.push(...page.data);
            pageCount++;
        }
        return allItems;
    }
    /**
     * Create an async iterator for easy iteration
     */
    async *[Symbol.asyncIterator]() {
        while (this.hasMorePages) {
            const page = await this.next();
            if (!page)
                break;
            yield page.data;
        }
    }
    /**
     * Reset the iterator to start from the beginning
     */
    reset(params) {
        this.currentParams = validatePaginationParams(params);
        this.hasMorePages = true;
    }
    /**
     * Check if there are more pages to fetch
     */
    hasMore() {
        return this.hasMorePages;
    }
}
/**
 * Auto-paginating function wrapper
 *
 * @param fetchPage - Function to fetch a single page
 * @returns Function that automatically handles pagination
 */
export function createAutoPaginator(fetchPage) {
    return {
        /**
         * Get a single page
         */
        page: fetchPage,
        /**
         * Get all items across all pages
         */
        all: async (params, maxPages) => {
            const iterator = new PaginatedIterator(fetchPage, params);
            return iterator.all(maxPages);
        },
        /**
         * Create an iterator for manual pagination
         */
        iterate: (params) => {
            return new PaginatedIterator(fetchPage, params);
        },
    };
}
/**
 * Helper function to create a paginated response
 *
 * @param data - Array of items
 * @param params - Pagination parameters used
 * @param totalItems - Total number of items available
 * @param nextCursor - Next cursor for cursor-based pagination
 * @returns Formatted paginated response
 */
export function createPaginatedResponse(data, params, totalItems, nextCursor) {
    const hasMore = nextCursor ?
        Boolean(nextCursor) :
        params.offset + data.length < totalItems;
    return {
        data,
        pagination: {
            offset: params.offset,
            limit: params.limit,
            total: totalItems,
            hasMore,
            nextCursor,
        },
    };
}
/**
 * Convert cursor to offset for mixed pagination support
 *
 * @param cursor - Base64 encoded cursor
 * @returns Decoded offset value
 */
export function cursorToOffset(cursor) {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const offset = parseInt(decoded, 10);
        return isNaN(offset) ? 0 : Math.max(0, offset);
    }
    catch {
        return 0;
    }
}
/**
 * Convert offset to cursor for mixed pagination support
 *
 * @param offset - Offset value
 * @returns Base64 encoded cursor
 */
export function offsetToCursor(offset) {
    return Buffer.from(offset.toString(), 'utf-8').toString('base64');
}
//# sourceMappingURL=pagination.js.map