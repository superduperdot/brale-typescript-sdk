/**
 * Accounts service for managing Brale customer accounts
 */
import type { AxiosInstance } from 'axios';
import type { Account, AccountBalance, AccountActivity, CreateAccountRequest, UpdateAccountRequest } from '../models/account';
import type { PaginationParams, PaginatedResponse } from '../types/common';
/**
 * Service for managing Brale accounts
 */
export declare class AccountsService {
    private readonly httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * List all accounts for the authenticated user
     *
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of accounts
     */
    list(pagination?: PaginationParams): Promise<PaginatedResponse<Account>>;
    /**
     * Get a specific account by ID
     *
     * @param accountId - The account ID
     * @returns Promise resolving to the account
     */
    get(accountId: string): Promise<Account>;
    /**
     * Create a new account
     *
     * @param request - Account creation request
     * @returns Promise resolving to the created account
     */
    create(request: CreateAccountRequest): Promise<Account>;
    /**
     * Update an existing account
     *
     * @param accountId - The account ID
     * @param request - Account update request
     * @returns Promise resolving to the updated account
     */
    update(accountId: string, request: UpdateAccountRequest): Promise<Account>;
    /**
     * Delete an account
     *
     * @param accountId - The account ID
     * @returns Promise resolving when deletion is complete
     */
    delete(accountId: string): Promise<void>;
    /**
     * Get account balances across all networks and tokens
     *
     * @param accountId - The account ID
     * @returns Promise resolving to account balance information
     */
    getBalances(accountId: string): Promise<AccountBalance>;
    /**
     * Get account activity summary
     *
     * @param accountId - The account ID
     * @param period - Time period for activity (default: last 30 days)
     * @returns Promise resolving to account activity summary
     */
    getActivity(accountId: string, period?: {
        start: Date;
        end: Date;
    }): Promise<AccountActivity>;
    /**
     * Get the first available account (convenience method)
     *
     * @returns Promise resolving to the first account
     */
    getFirst(): Promise<Account>;
    /**
     * Validate account ID format
     */
    private validateAccountId;
    /**
     * Validate create account request
     */
    private validateCreateAccountRequest;
    /**
     * Validate update account request
     */
    private validateUpdateAccountRequest;
    /**
     * Transform API account response to SDK model
     */
    private transformAccountResponse;
    /**
     * Transform API accounts list response
     */
    private transformAccountsResponse;
    /**
     * Transform API balance response
     */
    private transformBalanceResponse;
    /**
     * Transform API activity response
     */
    private transformActivityResponse;
}
//# sourceMappingURL=accounts.d.ts.map