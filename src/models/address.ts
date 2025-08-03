/**
 * Address models for both internal (custodial) and external addresses
 */

import type { Network, AddressType } from '../types/common';

/**
 * Base address interface
 */
export interface BaseAddress {
  /** Unique address identifier */
  id: string;
  
  /** The blockchain address */
  address: string;
  
  /** Network/blockchain this address belongs to */
  network: Network;
  
  /** Address type (internal/external) */
  type: AddressType;
  
  /** Address label/name */
  label?: string;
  
  /** Address creation timestamp */
  createdAt: Date;
  
  /** Last updated timestamp */
  updatedAt: Date;
  
  /** Address metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Internal (custodial) address managed by Brale
 */
export interface InternalAddress extends BaseAddress {
  type: AddressType.CUSTODIAL;
  
  /** Account ID this address belongs to */
  accountId: string;
  
  /** Whether this is the primary address for the network */
  isPrimary: boolean;
  
  /** Address derivation path (for HD wallets) */
  derivationPath?: string;
  
  /** Whether the address can receive funds */
  canReceive: boolean;
  
  /** Whether the address can send funds */
  canSend: boolean;
}

/**
 * External address for transfers to third parties
 */
export interface ExternalAddress extends BaseAddress {
  type: AddressType.EXTERNALLY_OWNED;
  
  /** Whether the address has been verified */
  verified: boolean;
  
  /** Verification method used */
  verificationMethod?: VerificationMethod;
  
  /** Whether the address is whitelisted */
  whitelisted: boolean;
  
  /** Risk assessment score (0-100) */
  riskScore?: number;
  
  /** Last used timestamp */
  lastUsedAt?: Date;
}

/**
 * Address verification methods
 */
export enum VerificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  MANUAL = 'manual',
  AUTOMATED = 'automated',
}

/**
 * Address with balance information
 */
export interface AddressWithBalance extends BaseAddress {
  /** Current balances by token */
  balances: Record<string, {
    available: string;
    pending: string;
    total: string;
  }>;
  
  /** Transaction count */
  transactionCount: number;
  
  /** Last transaction timestamp */
  lastTransactionAt?: Date;
}

/**
 * Address validation result
 */
export interface AddressValidation {
  /** Whether the address is valid */
  valid: boolean;
  
  /** Network the address belongs to */
  network?: Network;
  
  /** Address format/type (e.g., 'legacy', 'segwit', 'bech32') */
  format?: string;
  
  /** Validation error message if invalid */
  error?: string;
  
  /** Additional validation details */
  details?: Record<string, unknown>;
}

/**
 * Create external address request
 */
export interface CreateExternalAddressRequest {
  /** The blockchain address */
  address: string;
  
  /** Network/blockchain */
  network: Network;
  
  /** Address label/name */
  label?: string;
  
  /** Whether to whitelist the address */
  whitelist?: boolean;
  
  /** Address metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Update address request
 */
export interface UpdateAddressRequest {
  /** Updated label/name */
  label?: string;
  
  /** Updated whitelist status */
  whitelisted?: boolean;
  
  /** Updated metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Address search filters
 */
export interface AddressFilters {
  /** Filter by address type */
  type?: AddressType;
  
  /** Filter by network */
  network?: Network;
  
  /** Filter by verification status */
  verified?: boolean;
  
  /** Filter by whitelist status */
  whitelisted?: boolean;
  
  /** Search by address or label */
  search?: string;
  
  /** Filter by creation date range */
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Sharable wallet address information
 */
export interface SharableAddress {
  /** The blockchain address that can be shared */
  address: string;
  
  /** Network/blockchain */
  network: Network;
  
  /** QR code data URL for easy sharing */
  qrCode?: string;
  
  /** Address label for display */
  label?: string;
  
  /** Whether this address is active and can receive funds */
  active: boolean;
}