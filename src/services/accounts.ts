/**
 * Accounts service for managing Brale customer accounts
 */

import type { AxiosInstance } from 'axios';
import type {
  Account,
  AccountBalance,
  AccountActivity,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../models/account';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '../types/common';
import { BraleAPIError } from '../errors/api-error';
import { retry } from '../utils/retry';
import { createPaginationQuery } from '../utils/pagination';

/**
 * Service for managing Brale accounts
 */
export class AccountsService {
  constructor(private readonly httpClient: AxiosInstance) {}

  /**
   * List all accounts for the authenticated user
   * 
   * @returns Promise resolving to array of account IDs
   * @note The Brale API returns a simple array of account IDs, not a paginated response
   */
  async list(): Promise<string[]> {
    const response = await this.httpClient.get<{ accounts: string[] }>('/accounts');
    return response.data.accounts;
  }

  /**
   * Get a specific account by ID
   * 
   * @param accountId - The account ID
   * @returns Promise resolving to the account
   */
  async get(accountId: string): Promise<Account> {
    this.validateAccountId(accountId);
    
    const response = await this.httpClient.get<ApiResponse<Account>>(
      `/accounts/${accountId}`
    );
    
    return this.transformAccountResponse(response.data.data);
  }

  /**
   * Create a new account
   * 
   * @param request - Account creation request
   * @returns Promise resolving to the created account
   */
  async create(request: CreateAccountRequest): Promise<Account> {
    this.validateCreateAccountRequest(request);
    
    const response = await this.httpClient.post<ApiResponse<Account>>(
      '/accounts',
      request
    );
    
    return this.transformAccountResponse(response.data.data);
  }

  /**
   * Update an existing account
   * 
   * @param accountId - The account ID
   * @param request - Account update request
   * @returns Promise resolving to the updated account
   */
  async update(accountId: string, request: UpdateAccountRequest): Promise<Account> {
    this.validateAccountId(accountId);
    this.validateUpdateAccountRequest(request);
    
    const response = await this.httpClient.patch<ApiResponse<Account>>(
      `/accounts/${accountId}`,
      request
    );
    
    return this.transformAccountResponse(response.data.data);
  }

  /**
   * Delete an account
   * 
   * @param accountId - The account ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(accountId: string): Promise<void> {
    this.validateAccountId(accountId);
    
    await this.httpClient.delete(`/accounts/${accountId}`);
  }

  /**
   * Get account balances across all networks and tokens
   * 
   * @param accountId - The account ID
   * @returns Promise resolving to account balance information
   */
  async getBalances(accountId: string): Promise<AccountBalance> {
    this.validateAccountId(accountId);
    
    const response = await this.httpClient.get<ApiResponse<AccountBalance>>(
      `/accounts/${accountId}/balances`
    );
    
    return this.transformBalanceResponse(response.data.data);
  }

  /**
   * Get account activity summary
   * 
   * @param accountId - The account ID
   * @param period - Time period for activity (default: last 30 days)
   * @returns Promise resolving to account activity summary
   */
  async getActivity(
    accountId: string,
    period?: { start: Date; end: Date }
  ): Promise<AccountActivity> {
    this.validateAccountId(accountId);
    
    const params: Record<string, string> = {};
    if (period) {
      params.start_date = period.start.toISOString();
      params.end_date = period.end.toISOString();
    }
    
    const response = await this.httpClient.get<ApiResponse<AccountActivity>>(
      `/accounts/${accountId}/activity`,
      { params }
    );
    
    return this.transformActivityResponse(response.data.data);
  }

  /**
   * Get the first available account (convenience method)
   * 
   * @returns Promise resolving to the first account
   */
  async getFirst(): Promise<string> {
    const accounts = await retry(async () => {
      const accountIds = await this.list();
      if (accountIds.length === 0) {
        throw new BraleAPIError('No accounts found', 404, 'NO_ACCOUNTS_FOUND');
      }
      return accountIds;
    });
    
    return accounts[0]!;
  }

  /**
   * Validate account ID format
   */
  private validateAccountId(accountId: string): void {
    if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
      throw new BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
    }
  }

  /**
   * Validate create account request
   */
  private validateCreateAccountRequest(request: CreateAccountRequest): void {
    if (!request.name || typeof request.name !== 'string' || request.name.trim().length === 0) {
      throw new BraleAPIError('Account name is required', 400, 'MISSING_ACCOUNT_NAME');
    }
    
    if (request.name.length > 100) {
      throw new BraleAPIError('Account name too long (max 100 characters)', 400, 'ACCOUNT_NAME_TOO_LONG');
    }
    
    if (!request.type) {
      throw new BraleAPIError('Account type is required', 400, 'MISSING_ACCOUNT_TYPE');
    }
  }

  /**
   * Validate update account request
   */
  private validateUpdateAccountRequest(request: UpdateAccountRequest): void {
    if (request.name !== undefined) {
      if (typeof request.name !== 'string' || request.name.trim().length === 0) {
        throw new BraleAPIError('Invalid account name', 400, 'INVALID_ACCOUNT_NAME');
      }
      
      if (request.name.length > 100) {
        throw new BraleAPIError('Account name too long (max 100 characters)', 400, 'ACCOUNT_NAME_TOO_LONG');
      }
    }
  }

  /**
   * Transform API account response to SDK model
   */
  private transformAccountResponse(data: unknown): Account {
    // In a real implementation, this would transform the API response
    // to match our SDK models, handling date parsing, etc.
    return data as Account;
  }

  /**
   * Transform API accounts list response
   */
  private transformAccountsResponse(data: PaginatedResponse<unknown>): PaginatedResponse<Account> {
    return {
      ...data,
      data: data.data.map(account => this.transformAccountResponse(account)),
    };
  }

  /**
   * Transform API balance response
   */
  private transformBalanceResponse(data: unknown): AccountBalance {
    const balance = data as AccountBalance;
    
    // Transform date strings to Date objects
    if (typeof balance.updatedAt === 'string') {
      balance.updatedAt = new Date(balance.updatedAt);
    }
    
    return balance;
  }

  /**
   * Transform API activity response
   */
  private transformActivityResponse(data: unknown): AccountActivity {
    const activity = data as AccountActivity;
    
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