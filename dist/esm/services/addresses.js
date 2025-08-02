/**
 * Addresses service for managing both internal and external addresses
 */
import { BraleAPIError } from '../errors/api-error';
// import { retryable } from '../utils/retry'; // TODO: Re-enable when decorator issues are fixed
import { createPaginationQuery } from '../utils/pagination';
import { createAddressIdempotencyKey } from '../utils/idempotency';
/**
 * Service for managing addresses
 */
export class AddressesService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * List addresses for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for the address list
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of addresses
     */
    async list(accountId, filters, pagination) {
        this.validateAccountId(accountId);
        const query = {
            ...createPaginationQuery(pagination || {}),
            ...this.createFiltersQuery(filters || {}),
        };
        const response = await this.httpClient.get(`/accounts/${accountId}/addresses`, { params: query });
        return this.transformAddressesResponse(response.data.data);
    }
    /**
     * Get a specific address by ID
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @returns Promise resolving to the address
     */
    async get(accountId, addressId) {
        this.validateAccountId(accountId);
        this.validateAddressId(addressId);
        const response = await this.httpClient.get(`/accounts/${accountId}/addresses/${addressId}`);
        return this.transformAddressResponse(response.data.data);
    }
    /**
     * Get internal (custodial) addresses for an account
     *
     * @param accountId - The account ID
     * @param network - Optional network filter
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of internal addresses
     */
    async listInternal(accountId, network, pagination) {
        const filters = {
            type: 'internal',
            network,
        };
        const addresses = await this.list(accountId, filters, pagination);
        return {
            ...addresses,
            data: addresses.data,
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
    async listExternal(accountId, filters, pagination) {
        const addressFilters = {
            ...filters,
            type: 'external',
        };
        const addresses = await this.list(accountId, addressFilters, pagination);
        return {
            ...addresses,
            data: addresses.data,
        };
    }
    /**
     * Create a new external address
     *
     * @param accountId - The account ID
     * @param request - External address creation request
     * @returns Promise resolving to the created external address
     */
    async createExternal(accountId, request) {
        this.validateAccountId(accountId);
        this.validateCreateExternalAddressRequest(request);
        const idempotencyKey = createAddressIdempotencyKey({
            accountId,
            address: request.address,
            network: request.network,
            type: 'external',
        });
        const response = await this.httpClient.post(`/accounts/${accountId}/addresses`, request, {
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
        });
        return this.transformAddressResponse(response.data.data);
    }
    /**
     * Update an existing address
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @param request - Address update request
     * @returns Promise resolving to the updated address
     */
    async update(accountId, addressId, request) {
        this.validateAccountId(accountId);
        this.validateAddressId(addressId);
        this.validateUpdateAddressRequest(request);
        const response = await this.httpClient.patch(`/accounts/${accountId}/addresses/${addressId}`, request);
        return this.transformAddressResponse(response.data.data);
    }
    /**
     * Delete an external address
     *
     * @param accountId - The account ID
     * @param addressId - The address ID
     * @returns Promise resolving when deletion is complete
     */
    async delete(accountId, addressId) {
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
    async getWithBalances(accountId, addressId) {
        this.validateAccountId(accountId);
        this.validateAddressId(addressId);
        const response = await this.httpClient.get(`/accounts/${accountId}/addresses/${addressId}/balances`);
        return this.transformAddressWithBalanceResponse(response.data.data);
    }
    /**
     * Validate an address format and network
     *
     * @param address - The blockchain address to validate
     * @param network - Optional expected network
     * @returns Promise resolving to validation result
     */
    async validate(address, network) {
        this.validateAddressString(address);
        const params = {
            address,
        };
        if (network) {
            params.network = network;
        }
        const response = await this.httpClient.get('/addresses/validate', { params });
        return response.data.data;
    }
    /**
     * Get sharable wallet addresses for receiving funds
     *
     * @param accountId - The account ID
     * @param network - Optional network filter
     * @returns Promise resolving to list of sharable addresses
     */
    async getSharable(accountId, network) {
        this.validateAccountId(accountId);
        const params = {};
        if (network) {
            params.network = network;
        }
        const response = await this.httpClient.get(`/accounts/${accountId}/addresses/sharable`, { params });
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
    async findOrCreateExternal(accountId, address, network, label) {
        // First try to find existing external address
        const existingAddresses = await this.listExternal(accountId, {
            search: address,
            network,
        });
        const existing = existingAddresses.data.find(addr => addr.address.toLowerCase() === address.toLowerCase() && addr.network === network);
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
    validateAccountId(accountId) {
        if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
        }
    }
    /**
     * Validate address ID
     */
    validateAddressId(addressId) {
        if (!addressId || typeof addressId !== 'string' || addressId.trim().length === 0) {
            throw new BraleAPIError('Invalid address ID', 400, 'INVALID_ADDRESS_ID');
        }
    }
    /**
     * Validate address string
     */
    validateAddressString(address) {
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
    validateCreateExternalAddressRequest(request) {
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
    validateUpdateAddressRequest(request) {
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
    createFiltersQuery(filters) {
        const query = {};
        if (filters.type) {
            query.type = filters.type;
        }
        if (filters.network) {
            query.network = filters.network;
        }
        if (filters.verified !== undefined) {
            query.verified = filters.verified.toString();
        }
        if (filters.whitelisted !== undefined) {
            query.whitelisted = filters.whitelisted.toString();
        }
        if (filters.search) {
            query.search = filters.search;
        }
        if (filters.createdAfter) {
            query.created_after = filters.createdAfter.toISOString();
        }
        if (filters.createdBefore) {
            query.created_before = filters.createdBefore.toISOString();
        }
        return query;
    }
    /**
     * Transform API address response
     */
    transformAddressResponse(data) {
        const address = data;
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
        return address;
    }
    /**
     * Transform API addresses list response
     */
    transformAddressesResponse(data) {
        return {
            ...data,
            data: data.data.map(address => this.transformAddressResponse(address)),
        };
    }
    /**
     * Transform API address with balance response
     */
    transformAddressWithBalanceResponse(data) {
        const address = this.transformAddressResponse(data);
        // Transform additional fields specific to AddressWithBalance
        if (typeof address.lastTransactionAt === 'string') {
            address.lastTransactionAt = new Date(address.lastTransactionAt);
        }
        return address;
    }
}
//# sourceMappingURL=addresses.js.map