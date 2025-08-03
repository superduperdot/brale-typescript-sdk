/**
 * Common types and enums used throughout the SDK
 */

export enum Network {
  // EVM Mainnet Networks
  ETHEREUM = 'ethereum',
  BASE = 'base',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  AVALANCHE = 'avalanche',
  CELO = 'celo',
  BNB = 'bnb',
  VICTION = 'viction',
  CLASSIC = 'classic',
  
  // EVM Testnet Networks
  SEPOLIA = 'sepolia',
  BASE_SEPOLIA = 'base_sepolia',
  FUJI = 'fuji',
  MORDOR = 'mordor',
  ALFAJORES = 'alfajores',
  AMOY = 'amoy',
  
  // Non-EVM Networks
  SOLANA = 'solana',
  SOLANA_DEVNET = 'solana_devnet',
  STELLAR = 'stellar',
  STELLAR_TESTNET = 'stellar_testnet',
  HEDERA = 'hedera',
  COREUM = 'coreum',
  CANTON = 'canton',
  CANTON_TESTNET = 'canton_testnet',
}

export enum ValueType {
  SBC = 'SBC',
  USDC = 'USDC',
  USD = 'USD',
}

export enum TransferType {
  // Offchain (traditional payment rails)
  WIRE = 'wire',
  ACH = 'ach',
  // Onchain (blockchain networks)
  ETHEREUM = 'ethereum',
  BASE = 'base',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  AVALANCHE = 'avalanche',
  CELO = 'celo',
  SOLANA = 'solana',
  BNB = 'bnb',
  CANTON = 'canton',
}

export enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AddressType {
  CUSTODIAL = 'custodial',
  EXTERNALLY_OWNED = 'externally-owned',
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