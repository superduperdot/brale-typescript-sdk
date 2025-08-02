/**
 * Common types and enums used throughout the SDK
 */
export declare enum Network {
    ETHEREUM = "ethereum",
    BASE = "base",
    POLYGON = "polygon",
    ARBITRUM = "arbitrum",
    OPTIMISM = "optimism",
    AVALANCHE = "avalanche",
    CELO = "celo",
    SOLANA = "solana",
    BNB = "bnb",
    CANTON = "canton"
}
export declare enum ValueType {
    SBC = "SBC",
    USDC = "USDC",
    USD = "USD"
}
export declare enum TransferType {
    WIRE = "wire",
    ACH = "ach",
    ETHEREUM = "ethereum",
    BASE = "base",
    POLYGON = "polygon",
    ARBITRUM = "arbitrum",
    OPTIMISM = "optimism",
    AVALANCHE = "avalanche",
    CELO = "celo",
    SOLANA = "solana",
    BNB = "bnb",
    CANTON = "canton"
}
export declare enum TransferStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum AddressType {
    INTERNAL = "internal",
    EXTERNAL = "external"
}
/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
    /** Number of items per page (default: 20, max: 100) */
    limit?: number;
    /** Offset for pagination (default: 0) */
    offset?: number;
    /** Cursor for cursor-based pagination */
    cursor?: string;
}
/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    /** Array of items */
    data: T[];
    /** Pagination metadata */
    pagination: {
        /** Current page offset */
        offset: number;
        /** Items per page */
        limit: number;
        /** Total number of items */
        total: number;
        /** Whether there are more items */
        hasMore: boolean;
        /** Next cursor for cursor-based pagination */
        nextCursor?: string;
    };
}
/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
    /** Response data */
    data: T;
    /** Response metadata */
    meta?: Record<string, unknown>;
    /** Request ID for tracking */
    requestId?: string;
}
//# sourceMappingURL=common.d.ts.map