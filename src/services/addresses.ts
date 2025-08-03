/**
 * Addresses service for managing both internal and external addresses
 */

import type { AxiosInstance } from 'axios';
import type {
  BaseAddress,
  InternalAddress,
  ExternalAddress,
  AddressWithBalance,
  AddressValidation,
  CreateExternalAddressRequest,
  UpdateAddressRequest,
  SharableAddress,
} from '../models/address';
import type {
  ApiAddress,
  AddressListResponse,
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest as ApiUpdateAddressRequest,
  AddressFilters as ApiAddressFilters,
} from '../models/api-address';
import type { Network } from '../types/common';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '../types/common';
import { BraleAPIError } from '../errors/api-error';
// import { retryable } from '../utils/retry'; // TODO: Re-enable when decorator issues are fixed
import { createPaginationQuery } from '../utils/pagination';
import { createAddressIdempotencyKey } from '../utils/idempotency';

/**
 * Service for managing addresses
 */
export class AddressesService {
  constructor(private readonly httpClient: AxiosInstance) {}

  /**
   * List addresses for an account
   * 
   * @param accountId - The account ID (optional - API returns all addresses if not specified)
   * @param filters - Optional filters for the address list
   * @returns Promise resolving to addresses list response
   */
  async list(
    accountId?: string,
    filters?: ApiAddressFilters
  ): Promise<AddressListResponse> {
    if (accountId) {
      this.validateAccountId(accountId);
    }
    
    const query = this.createFiltersQuery(filters || {});
    
    // The Brale API uses /addresses endpoint, not account-specific
    const response = await this.httpClient.get<AddressListResponse>(
      '/addresses',
      { params: query }
    );
    
    return response.data;
  }

  /**
   * Get a specific address by ID
   * 
   * @param accountId - The account ID (maintained for backward compatibility)
   * @param addressId - The address ID
   * @returns Promise resolving to the address
   */
  async get(accountId: string, addressId: string): Promise<ApiAddress> {
    this.validateAccountId(accountId);
    this.validateAddressId(addressId);
    
    const response = await this.httpClient.get<AddressResponse>(
      `/addresses/${addressId}`
    );
    
    return response.data.data;
  }

  /**
   * Get internal (custodial) addresses for an account
   * 
   * @param accountId - The account ID
   * @param network - Optional network filter
   * @param pagination - Pagination parameters
   * @returns Promise resolving to paginated list of internal addresses
   */
  async listInternal(
    accountId: string,
    network?: Network
  ): Promise<AddressListResponse> {
    const filters: ApiAddressFilters = {
      type: 'custodial',
      network,
    };
    
    const addresses = await this.list(accountId, filters);
    
    // Filter to only custodial addresses
    const custodialAddresses = addresses.data.filter(addr => addr.attributes.type === 'custodial');
    
    return {
      ...addresses,
      data: custodialAddresses,
    };
  }

  /**
   * Get external addresses for an account
   * 
   * @param accountId - The account ID
   * @param filters - Optional filters for external addresses
   * @param pagination - Pagination parameters
   * @returns Promise resolving to paginated list of external addresses
   */
  async listExternal(
    accountId: string,
    filters?: Omit<ApiAddressFilters, 'type'>
  ): Promise<AddressListResponse> {
    const addressFilters: ApiAddressFilters = {
      ...filters,
      type: 'externally-owned',
    };
    
    const addresses = await this.list(accountId, addressFilters);
    
    // Filter to only externally-owned addresses
    const externalAddresses = addresses.data.filter(addr => addr.attributes.type === 'externally-owned');
    
    return {
      ...addresses,
      data: externalAddresses,
    };
  }

  /**
   * Create a new external address
   * 
   * @param accountId - The account ID
   * @param request - External address creation request
   * @returns Promise resolving to the created external address
   */
  async createExternal(accountId: string, request: CreateExternalAddressRequest): Promise<ApiAddress> {
    this.validateAccountId(accountId);
    this.validateCreateExternalAddressRequest(request);
    
    const idempotencyKey = createAddressIdempotencyKey({
      accountId,
      address: request.address,
      network: request.network,
      type: 'external',
    });
    
    const response = await this.httpClient.post<AddressResponse>(
      '/addresses',
      {
        address: request.address,
        name: request.label,
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    
    return response.data.data;
  }

  /**
   * Update an existing address
   * 
   * @param accountId - The account ID (maintained for backward compatibility)
   * @param addressId - The address ID
   * @param request - Address update request
   * @returns Promise resolving to the updated address
   */
  async update(accountId: string, addressId: string, request: ApiUpdateAddressRequest): Promise<ApiAddress> {
    this.validateAccountId(accountId);
    this.validateAddressId(addressId);
    this.validateUpdateAddressRequest(request);
    
    const response = await this.httpClient.patch<AddressResponse>(
      `/addresses/${addressId}`,
      request
    );
    
    return response.data.data;
  }

  /**
   * Delete an external address
   * 
   * @param accountId - The account ID
   * @param addressId - The address ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(accountId: string, addressId: string): Promise<void> {
    this.validateAccountId(accountId);
    this.validateAddressId(addressId);
    
    await this.httpClient.delete(`/accounts/${accountId}/addresses/${addressId}`);
  }

  /**
   * Get address with balance information
   * 
   * @param accountId - The account ID
   * @param addressId - The address ID
   * @returns Promise resolving to address with balances
   */
  async getWithBalances(accountId: string, addressId: string): Promise<AddressWithBalance> {
    this.validateAccountId(accountId);
    this.validateAddressId(addressId);
    
    const response = await this.httpClient.get<ApiResponse<AddressWithBalance>>(
      `/accounts/${accountId}/addresses/${addressId}/balances`
    );
    
    return this.transformAddressWithBalanceResponse(response.data.data);
  }

  /**
   * Validate an address format and network
   * 
   * @param address - The blockchain address to validate
   * @param network - Optional expected network
   * @returns Promise resolving to validation result
   */
  async validate(address: string, network?: Network): Promise<AddressValidation> {
    this.validateAddressString(address);
    
    const params: Record<string, string> = {
      address,
    };
    
    if (network) {
      params.network = network;
    }
    
    const response = await this.httpClient.get<ApiResponse<AddressValidation>>(
      '/addresses/validate',
      { params }
    );
    
    return response.data.data;
  }

  /**
   * Get sharable wallet addresses for receiving funds
   * 
   * @param accountId - The account ID
   * @param network - Optional network filter
   * @returns Promise resolving to list of sharable addresses
   */
  async getSharable(accountId: string, network?: Network): Promise<SharableAddress[]> {
    this.validateAccountId(accountId);
    
    const params: Record<string, string> = {};
    if (network) {
      params.network = network;
    }
    
    const response = await this.httpClient.get<ApiResponse<SharableAddress[]>>(
      `/accounts/${accountId}/addresses/sharable`,
      { params }
    );
    
    return response.data.data;
  }

  /**
   * Find or create an external address for a wallet
   * 
   * @param accountId - The account ID
   * @param address - The blockchain address
   * @param network - The network
   * @param label - Optional label for the address
   * @returns Promise resolving to the external address
   */
  async findOrCreateExternal(
    accountId: string,
    address: string,
    network: Network,
    label?: string
  ): Promise<ApiAddress> {
    // First try to find existing external address
    const existingAddresses = await this.listExternal(accountId, {
      network,
    });
    
    // Filter by address manually since search is not supported
    const matchingAddresses = existingAddresses.data.filter(
      addr => addr.attributes.address.toLowerCase() === address.toLowerCase()
    );
    
    const existing = matchingAddresses.length > 0 ? matchingAddresses[0] : null;
    
    if (existing) {
      return existing;
    }
    
    // Create new external address if not found
    return this.createExternal(accountId, {
      address,
      network,
      label,
    });
  }

  /**
   * Validate account ID
   */
  private validateAccountId(accountId: string): void {
    if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
      throw new BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
    }
  }

  /**
   * Validate address ID
   */
  private validateAddressId(addressId: string): void {
    if (!addressId || typeof addressId !== 'string' || addressId.trim().length === 0) {
      throw new BraleAPIError('Invalid address ID', 400, 'INVALID_ADDRESS_ID');
    }
  }

  /**
   * Validate address string
   */
  private validateAddressString(address: string): void {
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      throw new BraleAPIError('Invalid address', 400, 'INVALID_ADDRESS');
    }
    
    // Basic length validation (most blockchain addresses are 20-100 characters)
    if (address.length < 20 || address.length > 100) {
      throw new BraleAPIError('Address length invalid', 400, 'INVALID_ADDRESS_LENGTH');
    }
  }

  /**
   * Validate create external address request
   */
  private validateCreateExternalAddressRequest(request: CreateExternalAddressRequest): void {
    this.validateAddressString(request.address);
    
    if (!request.network) {
      throw new BraleAPIError('Network is required', 400, 'MISSING_NETWORK');
    }
    
    if (request.label && request.label.length > 100) {
      throw new BraleAPIError('Label too long (max 100 characters)', 400, 'LABEL_TOO_LONG');
    }
  }

  /**
   * Validate update address request
   */
  private validateUpdateAddressRequest(request: UpdateAddressRequest): void {
    if (request.label !== undefined) {
      if (typeof request.label !== 'string') {
        throw new BraleAPIError('Invalid label', 400, 'INVALID_LABEL');
      }
      
      if (request.label.length > 100) {
        throw new BraleAPIError('Label too long (max 100 characters)', 400, 'LABEL_TOO_LONG');
      }
    }
  }

  /**
   * Create query parameters from filters
   */
  private createFiltersQuery(filters: ApiAddressFilters): Record<string, string> {
    const query: Record<string, string> = {};
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.network) {
      query.network = filters.network;
    }
    
    return query;
  }

  /**
   * Transform API address response
   */
  private transformAddressResponse(data: unknown): BaseAddress {
    const address = data as any;
    
    // Transform date strings to Date objects
    if (typeof address.createdAt === 'string') {
      address.createdAt = new Date(address.createdAt);
    }
    
    if (typeof address.updatedAt === 'string') {
      address.updatedAt = new Date(address.updatedAt);
    }
    
    if (typeof address.lastUsedAt === 'string') {
      address.lastUsedAt = new Date(address.lastUsedAt);
    }
    
    return address as BaseAddress;
  }

  /**
   * Transform API addresses list response
   */
  private transformAddressesResponse(data: PaginatedResponse<unknown>): PaginatedResponse<BaseAddress> {
    return {
      ...data,
      data: data.data.map(address => this.transformAddressResponse(address)),
    };
  }

  /**
   * Transform API address with balance response
   */
  private transformAddressWithBalanceResponse(data: unknown): AddressWithBalance {
    const address = this.transformAddressResponse(data) as AddressWithBalance;
    
    // Transform additional fields specific to AddressWithBalance
    if (typeof address.lastTransactionAt === 'string') {
      address.lastTransactionAt = new Date(address.lastTransactionAt);
    }
    
    return address;
  }
}