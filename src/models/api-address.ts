/**
 * Address models that match the actual Brale API JSON:API format
 * 
 * These models reflect the real API responses discovered through testing
 */

/**
 * Supported blockchain network information
 */
export interface SupportedChain {
  /** Network identifier */
  id: string;
  
  /** Human-readable network name */
  name: string;
  
  /** Network type */
  networkType: 'mainnet' | 'testnet';
}

/**
 * Address attributes as returned by the API
 */
export interface AddressAttributes {
  /** Address name/label (can be null) */
  name: string | null;
  
  /** Address status */
  status: 'active' | 'inactive';
  
  /** Address type */
  type: 'custodial' | 'externally-owned';
  
  /** The blockchain address */
  address: string;
  
  /** Creation timestamp */
  created: string;
  
  /** List of supported blockchain networks */
  supportedChains: SupportedChain[];
}

/**
 * JSON:API links structure
 */
export interface ApiLinks {
  self: {
    href: string;
  };
}

/**
 * Complete address object as returned by the API (JSON:API format)
 */
export interface ApiAddress {
  /** Unique address identifier */
  id: string;
  
  /** JSON:API resource type */
  type: 'address';
  
  /** Address data */
  attributes: AddressAttributes;
  
  /** JSON:API links */
  links: ApiLinks;
}

/**
 * Address list response from the API
 */
export interface AddressListResponse {
  /** Array of addresses */
  data: ApiAddress[];
  
  /** JSON:API links for the collection */
  links: {
    self: {
      href: string;
    };
  };
}

/**
 * Individual address response from the API
 */
export interface AddressResponse {
  /** Single address data */
  data: ApiAddress;
}

/**
 * Address creation request
 */
export interface CreateAddressRequest {
  /** The blockchain address */
  address: string;
  
  /** Optional name/label for the address */
  name?: string;
  
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Address update request
 */
export interface UpdateAddressRequest {
  /** Optional name/label update */
  name?: string;
  
  /** Optional metadata update */
  metadata?: Record<string, unknown>;
}

/**
 * Address filters for listing
 */
export interface AddressFilters {
  /** Filter by address type */
  type?: 'custodial' | 'externally-owned';
  
  /** Filter by status */
  status?: 'active' | 'inactive';
  
  /** Filter by network */
  network?: string;
}

/**
 * Utility function to check if an address is custodial
 */
export function isCustodialAddress(address: ApiAddress): boolean {
  return address.attributes.type === 'custodial';
}

/**
 * Utility function to check if an address is externally owned
 */
export function isExternalAddress(address: ApiAddress): boolean {
  return address.attributes.type === 'externally-owned';
}

/**
 * Utility function to get supported mainnet chains
 */
export function getMainnetChains(address: ApiAddress): SupportedChain[] {
  return address.attributes.supportedChains.filter(chain => chain.networkType === 'mainnet');
}

/**
 * Utility function to get supported testnet chains
 */
export function getTestnetChains(address: ApiAddress): SupportedChain[] {
  return address.attributes.supportedChains.filter(chain => chain.networkType === 'testnet');
}

/**
 * Utility function to check if address supports a specific network
 */
export function supportsNetwork(address: ApiAddress, networkId: string): boolean {
  return address.attributes.supportedChains.some(chain => chain.id === networkId);
}