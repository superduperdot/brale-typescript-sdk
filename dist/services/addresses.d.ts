/**
 * Addresses service for managing both internal and external addresses
 */
import type { AxiosInstance } from 'axios';
import type { BaseAddress, InternalAddress, ExternalAddress, AddressWithBalance, AddressValidation, CreateExternalAddressRequest, UpdateAddressRequest, AddressFilters, SharableAddress } from '../models/address';
import type { Network } from '../types/common';
import type { PaginationParams, PaginatedResponse } from '../types/common';
/**
 * Service for managing addresses
 */
export declare class AddressesService {
    private readonly httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * List addresses for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for the address list
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of addresses
     */
    list(accountId: string, filters?: AddressFilters, pagination?: PaginationParams): Promise<PaginatedResponse<BaseAddress>>;
    /**
     * Get a specific address by ID
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @returns Promise resolving to the address
     */
    get(accountId: string, addressId: string): Promise<BaseAddress>;
    /**
     * Get internal (custodial) addresses for an account
     *
     * @param accountId - The account ID
     * @param network - Optional network filter
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of internal addresses
     */
    listInternal(accountId: string, network?: Network, pagination?: PaginationParams): Promise<PaginatedResponse<InternalAddress>>;
    /**
     * Get external addresses for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for external addresses
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of external addresses
     */
    listExternal(accountId: string, filters?: Omit<AddressFilters, 'type'>, pagination?: PaginationParams): Promise<PaginatedResponse<ExternalAddress>>;
    /**
     * Create a new external address
     *
     * @param accountId - The account ID
     * @param request - External address creation request
     * @returns Promise resolving to the created external address
     */
    createExternal(accountId: string, request: CreateExternalAddressRequest): Promise<ExternalAddress>;
    /**
     * Update an existing address
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @param request - Address update request
     * @returns Promise resolving to the updated address
     */
    update(accountId: string, addressId: string, request: UpdateAddressRequest): Promise<BaseAddress>;
    /**
     * Delete an external address
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @returns Promise resolving when deletion is complete
     */
    delete(accountId: string, addressId: string): Promise<void>;
    /**
     * Get address with balance information
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @returns Promise resolving to address with balances
     */
    getWithBalances(accountId: string, addressId: string): Promise<AddressWithBalance>;
    /**
     * Validate an address format and network
     *
     * @param address - The blockchain address to validate
     * @param network - Optional expected network
     * @returns Promise resolving to validation result
     */
    validate(address: string, network?: Network): Promise<AddressValidation>;
    /**
     * Get sharable wallet addresses for receiving funds
     *
     * @param accountId - The account ID
     * @param network - Optional network filter
     * @returns Promise resolving to list of sharable addresses
     */
    getSharable(accountId: string, network?: Network): Promise<SharableAddress[]>;
    /**
     * Find or create an external address for a wallet
     *
     * @param accountId - The account ID
     * @param address - The blockchain address
     * @param network - The network
     * @param label - Optional label for the address
     * @returns Promise resolving to the external address
     */
    findOrCreateExternal(accountId: string, address: string, network: Network, label?: string): Promise<ExternalAddress>;
    /**
     * Validate account ID
     */
    private validateAccountId;
    /**
     * Validate address ID
     */
    private validateAddressId;
    /**
     * Validate address string
     */
    private validateAddressString;
    /**
     * Validate create external address request
     */
    private validateCreateExternalAddressRequest;
    /**
     * Validate update address request
     */
    private validateUpdateAddressRequest;
    /**
     * Create query parameters from filters
     */
    private createFiltersQuery;
    /**
     * Transform API address response
     */
    private transformAddressResponse;
    /**
     * Transform API addresses list response
     */
    private transformAddressesResponse;
    /**
     * Transform API address with balance response
     */
    private transformAddressWithBalanceResponse;
}
//# sourceMappingURL=addresses.d.ts.map