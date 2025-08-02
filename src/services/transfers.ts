/**
 * Transfers service for managing all types of transfers
 */

import type { AxiosInstance } from 'axios';
import type {
  Transfer,
  CreateTransferRequest,
  EstimateTransferRequest,
  TransferEstimation,
  TransferFilters,
} from '../models/transfer';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '../types/common';
import { BraleAPIError } from '../errors/api-error';
// import { retryable } from '../utils/retry'; // TODO: Re-enable when decorator issues are fixed
import { createPaginationQuery } from '../utils/pagination';
import { generateIdempotencyKey, createTransferIdempotencyKey } from '../utils/idempotency';

/**
 * Service for managing transfers
 */
export class TransfersService {
  constructor(private readonly httpClient: AxiosInstance) {}

  /**
   * List transfers for an account
   * 
   * @param accountId - The account ID
   * @param filters - Optional filters for the transfer list
   * @param pagination - Pagination parameters
   * @returns Promise resolving to paginated list of transfers
   */
  async list(
    accountId: string,
    filters?: TransferFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Transfer>> {
    this.validateAccountId(accountId);
    
    const query = {
      ...createPaginationQuery(pagination || {}),
      ...this.createFiltersQuery(filters || {}),
    };
    
    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Transfer>>>(
      `/accounts/${accountId}/transfers`,
      { params: query }
    );
    
    return this.transformTransfersResponse(response.data.data);
  }

  /**
   * Get a specific transfer by ID
   * 
   * @param accountId - The account ID
   * @param transferId - The transfer ID
   * @returns Promise resolving to the transfer
   */
  async get(accountId: string, transferId: string): Promise<Transfer> {
    this.validateAccountId(accountId);
    this.validateTransferId(transferId);
    
    const response = await this.httpClient.get<ApiResponse<Transfer>>(
      `/accounts/${accountId}/transfers/${transferId}`
    );
    
    return this.transformTransferResponse(response.data.data);
  }

  /**
   * Create a new transfer
   * 
   * @param accountId - The account ID
   * @param request - Transfer creation request
   * @returns Promise resolving to the created transfer
   */
  async create(accountId: string, request: CreateTransferRequest): Promise<Transfer> {
    this.validateAccountId(accountId);
    this.validateCreateTransferRequest(request);
    
    // Generate idempotency key if not provided
    const transferRequest = {
      ...request,
      idempotencyKey: request.idempotencyKey || this.generateTransferIdempotencyKey(accountId, request),
    };
    
    const response = await this.httpClient.post<ApiResponse<Transfer>>(
      `/accounts/${accountId}/transfers`,
      transferRequest,
      {
        headers: {
          'Idempotency-Key': transferRequest.idempotencyKey,
        },
      }
    );
    
    return this.transformTransferResponse(response.data.data);
  }

  /**
   * Estimate transfer fees and requirements
   * 
   * @param accountId - The account ID
   * @param request - Transfer estimation request
   * @returns Promise resolving to transfer estimation
   */
  async estimate(accountId: string, request: EstimateTransferRequest): Promise<TransferEstimation> {
    this.validateAccountId(accountId);
    this.validateEstimateTransferRequest(request);
    
    const response = await this.httpClient.post<ApiResponse<TransferEstimation>>(
      `/accounts/${accountId}/transfers/estimate`,
      request
    );
    
    return this.transformEstimationResponse(response.data.data);
  }

  /**
   * Cancel a pending transfer
   * 
   * @param accountId - The account ID
   * @param transferId - The transfer ID
   * @returns Promise resolving to the cancelled transfer
   */
  async cancel(accountId: string, transferId: string): Promise<Transfer> {
    this.validateAccountId(accountId);
    this.validateTransferId(transferId);
    
    const response = await this.httpClient.post<ApiResponse<Transfer>>(
      `/accounts/${accountId}/transfers/${transferId}/cancel`
    );
    
    return this.transformTransferResponse(response.data.data);
  }

  /**
   * Retry a failed transfer
   * 
   * @param accountId - The account ID
   * @param transferId - The transfer ID
   * @returns Promise resolving to the retried transfer
   */
  async retry(accountId: string, transferId: string): Promise<Transfer> {
    this.validateAccountId(accountId);
    this.validateTransferId(transferId);
    
    const response = await this.httpClient.post<ApiResponse<Transfer>>(
      `/accounts/${accountId}/transfers/${transferId}/retry`,
      {},
      {
        headers: {
          'Idempotency-Key': generateIdempotencyKey('retry'),
        },
      }
    );
    
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
  async simpleTransfer(
    accountId: string,
    amount: string,
    _walletAddress: string,
    token: string,
    network: string,
    options?: {
      note?: string;
      memo?: string;
      sourceAddressId?: string;
      smartRecovery?: boolean;
    }
  ): Promise<Transfer> {
    // This is a convenience method that wraps the more complex create() method
    const request: CreateTransferRequest = {
      amount,
      currency: token as any,
      source: {
        type: token as any,
        transferType: network as any,
        addressId: options?.sourceAddressId,
      },
      destination: {
        type: token as any,
        transferType: network as any,
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
  private validateAccountId(accountId: string): void {
    if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
      throw new BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
    }
  }

  /**
   * Validate transfer ID
   */
  private validateTransferId(transferId: string): void {
    if (!transferId || typeof transferId !== 'string' || transferId.trim().length === 0) {
      throw new BraleAPIError('Invalid transfer ID', 400, 'INVALID_TRANSFER_ID');
    }
  }

  /**
   * Validate create transfer request
   */
  private validateCreateTransferRequest(request: CreateTransferRequest): void {
    if (!request.amount || typeof request.amount !== 'string') {
      throw new BraleAPIError('Transfer amount is required', 400, 'MISSING_AMOUNT');
    }
    
    const amount = parseFloat(request.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BraleAPIError('Invalid transfer amount', 400, 'INVALID_AMOUNT');
    }
    
    if (!request.currency) {
      throw new BraleAPIError('Currency is required', 400, 'MISSING_CURRENCY');
    }
    
    if (!request.source || !request.destination) {
      throw new BraleAPIError('Source and destination are required', 400, 'MISSING_ENDPOINTS');
    }
    
    if (!request.source.type || !request.source.transferType) {
      throw new BraleAPIError('Invalid source configuration', 400, 'INVALID_SOURCE');
    }
    
    if (!request.destination.type || !request.destination.transferType) {
      throw new BraleAPIError('Invalid destination configuration', 400, 'INVALID_DESTINATION');
    }
  }

  /**
   * Validate estimate transfer request
   */
  private validateEstimateTransferRequest(request: EstimateTransferRequest): void {
    // Similar validation to create request
    this.validateCreateTransferRequest(request as CreateTransferRequest);
  }

  /**
   * Generate transfer-specific idempotency key
   */
  private generateTransferIdempotencyKey(accountId: string, request: CreateTransferRequest): string {
    return createTransferIdempotencyKey({
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
  private createFiltersQuery(filters: TransferFilters): Record<string, string> {
    const query: Record<string, string> = {};
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = filters.status.join(',');
      } else {
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
  private transformTransferResponse(data: unknown): Transfer {
    const transfer = data as any;
    
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
    
    return transfer as Transfer;
  }

  /**
   * Transform API transfers list response
   */
  private transformTransfersResponse(data: PaginatedResponse<unknown>): PaginatedResponse<Transfer> {
    return {
      ...data,
      data: data.data.map(transfer => this.transformTransferResponse(transfer)),
    };
  }

  /**
   * Transform API estimation response
   */
  private transformEstimationResponse(data: unknown): TransferEstimation {
    return data as TransferEstimation;
  }
}