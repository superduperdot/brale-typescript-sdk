"use strict";
/**
 * Accounts service for managing Brale customer accounts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const api_error_1 = require("../errors/api-error");
const retry_1 = require("../utils/retry");
const pagination_1 = require("../utils/pagination");
/**
 * Service for managing Brale accounts
 */
class AccountsService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * List all accounts for the authenticated user
     *
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of accounts
     */
    async list(pagination) {
        const query = (0, pagination_1.createPaginationQuery)(pagination || {});
        const response = await this.httpClient.get('/accounts', { params: query });
        return this.transformAccountsResponse(response.data.data);
    }
    /**
     * Get a specific account by ID
     *
     * @param accountId - The account ID
     * @returns Promise resolving to the account
     */
    async get(accountId) {
        this.validateAccountId(accountId);
        const response = await this.httpClient.get(`/accounts/${accountId}`);
        return this.transformAccountResponse(response.data.data);
    }
    /**
     * Create a new account
     *
     * @param request - Account creation request
     * @returns Promise resolving to the created account
     */
    async create(request) {
        this.validateCreateAccountRequest(request);
        const response = await this.httpClient.post('/accounts', request);
        return this.transformAccountResponse(response.data.data);
    }
    /**
     * Update an existing account
     *
     * @param accountId - The account ID
     * @param request - Account update request
     * @returns Promise resolving to the updated account
     */
    async update(accountId, request) {
        this.validateAccountId(accountId);
        this.validateUpdateAccountRequest(request);
        const response = await this.httpClient.patch(`/accounts/${accountId}`, request);
        return this.transformAccountResponse(response.data.data);
    }
    /**
     * Delete an account
     *
     * @param accountId - The account ID
     * @returns Promise resolving when deletion is complete
     */
    async delete(accountId) {
        this.validateAccountId(accountId);
        await this.httpClient.delete(`/accounts/${accountId}`);
    }
    /**
     * Get account balances across all networks and tokens
     *
     * @param accountId - The account ID
     * @returns Promise resolving to account balance information
     */
    async getBalances(accountId) {
        this.validateAccountId(accountId);
        const response = await this.httpClient.get(`/accounts/${accountId}/balances`);
        return this.transformBalanceResponse(response.data.data);
    }
    /**
     * Get account activity summary
     *
     * @param accountId - The account ID
     * @param period - Time period for activity (default: last 30 days)
     * @returns Promise resolving to account activity summary
     */
    async getActivity(accountId, period) {
        this.validateAccountId(accountId);
        const params = {};
        if (period) {
            params.start_date = period.start.toISOString();
            params.end_date = period.end.toISOString();
        }
        const response = await this.httpClient.get(`/accounts/${accountId}/activity`, { params });
        return this.transformActivityResponse(response.data.data);
    }
    /**
     * Get the first available account (convenience method)
     *
     * @returns Promise resolving to the first account
     */
    async getFirst() {
        const accounts = await (0, retry_1.retry)(async () => {
            const response = await this.list({ limit: 1 });
            if (response.data.length === 0) {
                throw new api_error_1.BraleAPIError('No accounts found', 404, 'NO_ACCOUNTS_FOUND');
            }
            return response.data;
        });
        return accounts[0];
    }
    /**
     * Validate account ID format
     */
    validateAccountId(accountId) {
        if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new api_error_1.BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
        }
    }
    /**
     * Validate create account request
     */
    validateCreateAccountRequest(request) {
        if (!request.name || typeof request.name !== 'string' || request.name.trim().length === 0) {
            throw new api_error_1.BraleAPIError('Account name is required', 400, 'MISSING_ACCOUNT_NAME');
        }
        if (request.name.length > 100) {
            throw new api_error_1.BraleAPIError('Account name too long (max 100 characters)', 400, 'ACCOUNT_NAME_TOO_LONG');
        }
        if (!request.type) {
            throw new api_error_1.BraleAPIError('Account type is required', 400, 'MISSING_ACCOUNT_TYPE');
        }
    }
    /**
     * Validate update account request
     */
    validateUpdateAccountRequest(request) {
        if (request.name !== undefined) {
            if (typeof request.name !== 'string' || request.name.trim().length === 0) {
                throw new api_error_1.BraleAPIError('Invalid account name', 400, 'INVALID_ACCOUNT_NAME');
            }
            if (request.name.length > 100) {
                throw new api_error_1.BraleAPIError('Account name too long (max 100 characters)', 400, 'ACCOUNT_NAME_TOO_LONG');
            }
        }
    }
    /**
     * Transform API account response to SDK model
     */
    transformAccountResponse(data) {
        // In a real implementation, this would transform the API response
        // to match our SDK models, handling date parsing, etc.
        return data;
    }
    /**
     * Transform API accounts list response
     */
    transformAccountsResponse(data) {
        return {
            ...data,
            data: data.data.map(account => this.transformAccountResponse(account)),
        };
    }
    /**
     * Transform API balance response
     */
    transformBalanceResponse(data) {
        const balance = data;
        // Transform date strings to Date objects
        if (typeof balance.updatedAt === 'string') {
            balance.updatedAt = new Date(balance.updatedAt);
        }
        return balance;
    }
    /**
     * Transform API activity response
     */
    transformActivityResponse(data) {
        const activity = data;
        // Transform date strings to Date objects
        if (typeof activity.lastTransactionAt === 'string') {
            activity.lastTransactionAt = new Date(activity.lastTransactionAt);
        }
        if (activity.period) {
            if (typeof activity.period.start === 'string') {
                activity.period.start = new Date(activity.period.start);
            }
            if (typeof activity.period.end === 'string') {
                activity.period.end = new Date(activity.period.end);
            }
        }
        return activity;
    }
}
exports.AccountsService = AccountsService;
//# sourceMappingURL=accounts.js.map