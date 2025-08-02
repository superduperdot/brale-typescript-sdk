/**
 * Transfer models for all types of transactions supported by Brale
 */

import type { Amount } from './amount';
import type { Network, ValueType, TransferType, TransferStatus } from '../types/common';

/**
 * Base transfer interface
 */
export interface BaseTransfer {
  /** Unique transfer identifier */
  id: string;
  
  /** Account ID that owns this transfer */
  accountId: string;
  
  /** Transfer amount */
  amount: Amount;
  
  /** Transfer status */
  status: TransferStatus;
  
  /** Transfer creation timestamp */
  createdAt: Date;
  
  /** Last updated timestamp */
  updatedAt: Date;
  
  /** Transfer completion timestamp */
  completedAt?: Date;
  
  /** Source information */
  source: TransferEndpoint;
  
  /** Destination information */
  destination: TransferEndpoint;
  
  /** Transfer fees */
  fees?: TransferFee[];
  
  /** Exchange rate information (if applicable) */
  exchangeRate?: ExchangeRate;
  
  /** Transfer metadata */
  metadata?: TransferMetadata;
  
  /** Idempotency key for duplicate prevention */
  idempotencyKey?: string;
}

/**
 * Transfer endpoint (source or destination)
 */
export interface TransferEndpoint {
  /** Value type (currency/asset) */
  type: ValueType;
  
  /** Transfer method (onchain/offchain) */
  transferType: TransferType;
  
  /** Address ID (for crypto transfers) */
  addressId?: string;
  
  /** Financial institution ID (for fiat transfers) */
  financialInstitutionId?: string;
  
  /** Network information (for crypto transfers) */
  network?: Network;
  
  /** Account information (for internal transfers) */
  account?: {
    id: string;
    name?: string;
  };
}

/**
 * Transfer fee information
 */
export interface TransferFee {
  /** Fee type */
  type: FeeType;
  
  /** Fee amount */
  amount: Amount;
  
  /** Fee description */
  description: string;
  
  /** Whether fee is paid by sender or recipient */
  paidBy: 'sender' | 'recipient';
}

/**
 * Fee types
 */
export enum FeeType {
  NETWORK = 'network',
  PROCESSING = 'processing',
  EXCHANGE = 'exchange',
  PLATFORM = 'platform',
}

/**
 * Exchange rate information
 */
export interface ExchangeRate {
  /** Source value type */
  from: ValueType;
  
  /** Destination value type */
  to: ValueType;
  
  /** Exchange rate */
  rate: string;
  
  /** Rate timestamp */
  timestamp: Date;
  
  /** Rate provider */
  provider?: string;
}

/**
 * Transfer metadata
 */
export interface TransferMetadata {
  /** Transfer note/memo */
  note?: string;
  
  /** Transfer memo (for blockchain transactions) */
  memo?: string;
  
  /** Reference number */
  reference?: string;
  
  /** Transaction hash (for crypto transfers) */
  transactionHash?: string;
  
  /** Block confirmation count */
  confirmations?: number;
  
  /** Block number */
  blockNumber?: number;
  
  /** Smart recovery information */
  smartRecovery?: SmartRecoveryInfo;
  
  /** Additional custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Smart recovery information
 */
export interface SmartRecoveryInfo {
  /** Whether smart recovery was used */
  enabled: boolean;
  
  /** Recovery steps taken */
  steps?: RecoveryStep[];
  
  /** Confidence level */
  confidence?: 'low' | 'medium' | 'high';
  
  /** Estimated completion time */
  estimatedTime?: string;
  
  /** Total recovery cost */
  totalCost?: Amount;
}

/**
 * Recovery step information
 */
export interface RecoveryStep {
  /** Step type */
  type: 'cross-chain' | 'token-swap' | 'funding';
  
  /** Step description */
  description: string;
  
  /** Step status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  /** Step details */
  details?: Record<string, unknown>;
}

/**
 * Transfer with full details
 */
export interface Transfer extends BaseTransfer {
  /** Transfer history/audit trail */
  history?: TransferHistoryEntry[];
  
  /** Related transfers (for multi-step operations) */
  relatedTransfers?: string[];
  
  /** Error information (if failed) */
  error?: TransferError;
}

/**
 * Transfer history entry
 */
export interface TransferHistoryEntry {
  /** Entry timestamp */
  timestamp: Date;
  
  /** Status at this point */
  status: TransferStatus;
  
  /** Event description */
  description: string;
  
  /** Additional event data */
  data?: Record<string, unknown>;
}

/**
 * Transfer error information
 */
export interface TransferError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Error details */
  details?: Record<string, unknown>;
  
  /** Whether the error is retryable */
  retryable: boolean;
  
  /** Suggested recovery actions */
  recovery?: string[];
}

/**
 * Create transfer request
 */
export interface CreateTransferRequest {
  /** Transfer amount */
  amount: string;
  
  /** Currency/value type */
  currency: ValueType;
  
  /** Source configuration */
  source: CreateTransferEndpoint;
  
  /** Destination configuration */
  destination: CreateTransferEndpoint;
  
  /** Transfer note */
  note?: string;
  
  /** Transfer memo (for blockchain) */
  memo?: string;
  
  /** Idempotency key */
  idempotencyKey?: string;
  
  /** Enable smart recovery */
  smartRecovery?: boolean;
  
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Transfer endpoint for creation
 */
export interface CreateTransferEndpoint {
  /** Value type */
  type: ValueType;
  
  /** Transfer method (onchain/offchain) */
  transferType: TransferType;
  
  /** Address ID (for crypto) */
  addressId?: string;
  
  /** Financial institution ID (for traditional transfers) */
  financialInstitutionId?: string;
}

/**
 * Transfer estimation request
 */
export interface EstimateTransferRequest {
  /** Transfer amount */
  amount: string;
  
  /** Currency/value type */
  currency: ValueType;
  
  /** Source configuration */
  source: CreateTransferEndpoint;
  
  /** Destination configuration */
  destination: CreateTransferEndpoint;
}

/**
 * Transfer estimation response
 */
export interface TransferEstimation {
  /** Estimated fees */
  fees: TransferFee[];
  
  /** Total cost including fees */
  totalCost: Amount;
  
  /** Estimated completion time */
  estimatedTime: string;
  
  /** Exchange rate (if applicable) */
  exchangeRate?: ExchangeRate;
  
  /** Available balance check */
  sufficientBalance: boolean;
  
  /** Required balance for the transfer */
  requiredBalance: Amount;
  
  /** Smart recovery options (if needed) */
  recoveryOptions?: SmartRecoveryOption[];
}

/**
 * Smart recovery option
 */
export interface SmartRecoveryOption {
  /** Option description */
  description: string;
  
  /** Confidence level */
  confidence: 'low' | 'medium' | 'high';
  
  /** Estimated time */
  estimatedTime: string;
  
  /** Recovery cost */
  cost: Amount;
  
  /** Required steps */
  steps: string[];
}

/**
 * Transfer filters for listing
 */
export interface TransferFilters {
  /** Filter by status */
  status?: TransferStatus | TransferStatus[];
  
  /** Filter by currency */
  currency?: ValueType;
  
  /** Filter by transfer type */
  transferType?: TransferType;
  
  /** Filter by date range */
  createdAfter?: Date;
  createdBefore?: Date;
  
  /** Filter by amount range */
  minAmount?: string;
  maxAmount?: string;
  
  /** Search by reference or note */
  search?: string;
}