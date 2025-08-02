/**
 * Transfers service for managing all types of transfers
 */
import type { AxiosInstance } from 'axios';
import type { Transfer, CreateTransferRequest, EstimateTransferRequest, TransferEstimation, TransferFilters } from '../models/transfer';
import type { PaginationParams, PaginatedResponse } from '../types/common';
/**
 * Service for managing transfers
 */
export declare class TransfersService {
    private readonly httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * List transfers for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for the transfer list
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of transfers
     */
    list(accountId: string, filters?: TransferFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Transfer>>;
    /**
     * Get a specific transfer by ID
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the transfer
     */
    get(accountId: string, transferId: string): Promise<Transfer>;
    /**
     * Create a new transfer
     *
     * @param accountId - The account ID
     * @param request - Transfer creation request
     * @returns Promise resolving to the created transfer
     */
    create(accountId: string, request: CreateTransferRequest): Promise<Transfer>;
    /**
     * Estimate transfer fees and requirements
     *
     * @param accountId - The account ID
     * @param request - Transfer estimation request
     * @returns Promise resolving to transfer estimation
     */
    estimate(accountId: string, request: EstimateTransferRequest): Promise<TransferEstimation>;
    /**
     * Cancel a pending transfer
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the cancelled transfer
     */
    cancel(accountId: string, transferId: string): Promise<Transfer>;
    /**
     * Retry a failed transfer
     *
     * @param accountId - The account ID
     * @param transferId - The transfer ID
     * @returns Promise resolving to the retried transfer
     */
    retry(accountId: string, transferId: string): Promise<Transfer>;
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
    simpleTransfer(accountId: string, amount: string, _walletAddress: string, token: string, network: string, options?: {
        note?: string;
        memo?: string;
        sourceAddressId?: string;
        smartRecovery?: boolean;
    }): Promise<Transfer>;
    /**
     * Validate account ID
     */
    private validateAccountId;
    /**
     * Validate transfer ID
     */
    private validateTransferId;
    /**
     * Validate create transfer request
     */
    private validateCreateTransferRequest;
    /**
     * Validate estimate transfer request
     */
    private validateEstimateTransferRequest;
    /**
     * Generate transfer-specific idempotency key
     */
    private generateTransferIdempotencyKey;
    /**
     * Create query parameters from filters
     */
    private createFiltersQuery;
    /**
     * Transform API transfer response
     */
    private transformTransferResponse;
    /**
     * Transform API transfers list response
     */
    private transformTransfersResponse;
    /**
     * Transform API estimation response
     */
    private transformEstimationResponse;
}
//# sourceMappingURL=transfers.d.ts.map