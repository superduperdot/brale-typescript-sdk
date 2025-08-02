"use strict";
/**
 * Transfers service for managing all types of transfers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const api_error_1 = require("../errors/api-error");
// import { retryable } from '../utils/retry'; // TODO: Re-enable when decorator issues are fixed
const pagination_1 = require("../utils/pagination");
const idempotency_1 = require("../utils/idempotency");
/**
 * Service for managing transfers
 */
class TransfersService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * List transfers for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for the transfer list
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of transfers
     */
    async list(accountId, filters, pagination) {
        this.validateAccountId(accountId);
        const query = {
            ...(0, pagination_1.createPaginationQuery)(pagination || {}),
            ...this.createFiltersQuery(filters || {}),
        };
        const response = await this.httpClient.get(`/accounts/${accountId}/transfers`, { params: query });
        return this.transformTransfersResponse(response.data.data);
    }
    /**
     * Get a specific transfer by ID
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the transfer
     */
    async get(accountId, transferId) {
        this.validateAccountId(accountId);
        this.validateTransferId(transferId);
        const response = await this.httpClient.get(`/accounts/${accountId}/transfers/${transferId}`);
        return this.transformTransferResponse(response.data.data);
    }
    /**
     * Create a new transfer
     *
     * @param accountId - The account ID
     * @param request - Transfer creation request
     * @returns Promise resolving to the created transfer
     */
    async create(accountId, request) {
        this.validateAccountId(accountId);
        this.validateCreateTransferRequest(request);
        // Generate idempotency key if not provided
        const transferRequest = {
            ...request,
            idempotencyKey: request.idempotencyKey || this.generateTransferIdempotencyKey(accountId, request),
        };
        const response = await this.httpClient.post(`/accounts/${accountId}/transfers`, transferRequest, {
            headers: {
                'Idempotency-Key': transferRequest.idempotencyKey,
            },
        });
        return this.transformTransferResponse(response.data.data);
    }
    /**
     * Estimate transfer fees and requirements
     *
     * @param accountId - The account ID
     * @param request - Transfer estimation request
     * @returns Promise resolving to transfer estimation
     */
    async estimate(accountId, request) {
        this.validateAccountId(accountId);
        this.validateEstimateTransferRequest(request);
        const response = await this.httpClient.post(`/accounts/${accountId}/transfers/estimate`, request);
        return this.transformEstimationResponse(response.data.data);
    }
    /**
     * Cancel a pending transfer
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the cancelled transfer
     */
    async cancel(accountId, transferId) {
        this.validateAccountId(accountId);
        this.validateTransferId(transferId);
        const response = await this.httpClient.post(`/accounts/${accountId}/transfers/${transferId}/cancel`);
        return this.transformTransferResponse(response.data.data);
    }
    /**
     * Retry a failed transfer
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the retried transfer
     */
    async retry(accountId, transferId) {
        this.validateAccountId(accountId);
        this.validateTransferId(transferId);
        const response = await this.httpClient.post(`/accounts/${accountId}/transfers/${transferId}/retry`, {}, {
            headers: {
                'Idempotency-Key': (0, idempotency_1.generateIdempotencyKey)('retry'),
            },
        });
        return this.transformTransferResponse(response.data.data);
    }
    /**
     * Simple external wallet transfer (convenience method)
     *
     * @param accountId - The account ID
     * @param amount - Transfer amount
     * @param walletAddress - Destination wallet address
     * @param token - Token type (SBC, USDC, etc.)
     * @param transferType - Transfer type (onchain network or offchain rail)
     * @param options - Additional transfer options
     * @returns Promise resolving to the created transfer
     */
    async simpleTransfer(accountId, amount, _walletAddress, token, network, options) {
        // This is a convenience method that wraps the more complex create() method
        const request = {
            amount,
            currency: token,
            source: {
                type: token,
                transferType: network,
                addressId: options?.sourceAddressId,
            },
            destination: {
                type: token,
                transferType: network,
                // In real implementation, would need to create/find external address
                addressId: 'external-address-id', // This would be resolved from walletAddress
            },
            note: options?.note,
            memo: options?.memo,
            smartRecovery: options?.smartRecovery,
        };
        return this.create(accountId, request);
    }
    /**
     * Validate account ID
     */
    validateAccountId(accountId) {
        if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new api_error_1.BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
        }
    }
    /**
     * Validate transfer ID
     */
    validateTransferId(transferId) {
        if (!transferId || typeof transferId !== 'string' || transferId.trim().length === 0) {
            throw new api_error_1.BraleAPIError('Invalid transfer ID', 400, 'INVALID_TRANSFER_ID');
        }
    }
    /**
     * Validate create transfer request
     */
    validateCreateTransferRequest(request) {
        if (!request.amount || typeof request.amount !== 'string') {
            throw new api_error_1.BraleAPIError('Transfer amount is required', 400, 'MISSING_AMOUNT');
        }
        const amount = parseFloat(request.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new api_error_1.BraleAPIError('Invalid transfer amount', 400, 'INVALID_AMOUNT');
        }
        if (!request.currency) {
            throw new api_error_1.BraleAPIError('Currency is required', 400, 'MISSING_CURRENCY');
        }
        if (!request.source || !request.destination) {
            throw new api_error_1.BraleAPIError('Source and destination are required', 400, 'MISSING_ENDPOINTS');
        }
        if (!request.source.type || !request.source.transferType) {
            throw new api_error_1.BraleAPIError('Invalid source configuration', 400, 'INVALID_SOURCE');
        }
        if (!request.destination.type || !request.destination.transferType) {
            throw new api_error_1.BraleAPIError('Invalid destination configuration', 400, 'INVALID_DESTINATION');
        }
    }
    /**
     * Validate estimate transfer request
     */
    validateEstimateTransferRequest(request) {
        // Similar validation to create request
        this.validateCreateTransferRequest(request);
    }
    /**
     * Generate transfer-specific idempotency key
     */
    generateTransferIdempotencyKey(accountId, request) {
        return (0, idempotency_1.createTransferIdempotencyKey)({
            accountId,
            amount: request.amount,
            currency: request.currency,
            sourceType: request.source.type,
            sourceId: request.source.addressId || request.source.financialInstitutionId || 'unknown',
            destType: request.destination.type,
            destId: request.destination.addressId || request.destination.financialInstitutionId || 'unknown',
        });
    }
    /**
     * Create query parameters from filters
     */
    createFiltersQuery(filters) {
        const query = {};
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                query.status = filters.status.join(',');
            }
            else {
                query.status = filters.status;
            }
        }
        if (filters.currency) {
            query.currency = filters.currency;
        }
        if (filters.transferType) {
            query.transfer_type = filters.transferType;
        }
        if (filters.createdAfter) {
            query.created_after = filters.createdAfter.toISOString();
        }
        if (filters.createdBefore) {
            query.created_before = filters.createdBefore.toISOString();
        }
        if (filters.minAmount) {
            query.min_amount = filters.minAmount;
        }
        if (filters.maxAmount) {
            query.max_amount = filters.maxAmount;
        }
        if (filters.search) {
            query.search = filters.search;
        }
        return query;
    }
    /**
     * Transform API transfer response
     */
    transformTransferResponse(data) {
        const transfer = data;
        // Transform date strings to Date objects
        if (typeof transfer.createdAt === 'string') {
            transfer.createdAt = new Date(transfer.createdAt);
        }
        if (typeof transfer.updatedAt === 'string') {
            transfer.updatedAt = new Date(transfer.updatedAt);
        }
        if (typeof transfer.completedAt === 'string') {
            transfer.completedAt = new Date(transfer.completedAt);
        }
        return transfer;
    }
    /**
     * Transform API transfers list response
     */
    transformTransfersResponse(data) {
        return {
            ...data,
            data: data.data.map(transfer => this.transformTransferResponse(transfer)),
        };
    }
    /**
     * Transform API estimation response
     */
    transformEstimationResponse(data) {
        return data;
    }
}
exports.TransfersService = TransfersService;
//# sourceMappingURL=transfers.js.map