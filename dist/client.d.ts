/**
 * Main Brale SDK client
 */
import { AccountsService } from './services/accounts';
import { TransfersService } from './services/transfers';
import { AddressesService } from './services/addresses';
import { AutomationsService } from './services/automations';
import type { BraleConfig } from './types/config';
/**
 * Main Brale SDK client for interacting with the Brale API
 *
 * This client provides a unified interface to all Brale API services including
 * accounts, transfers, addresses, and automations. It handles authentication,
 * retry logic, error handling, and response transformation.
 *
 * @example
 * ```typescript
 * import { BraleClient } from '@brale/sdk';
 *
 * const client = new BraleClient({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 * });
 *
 * // List accounts
 * const accounts = await client.accounts.list();
 *
 * // Create a transfer
 * const transfer = await client.transfers.simpleTransfer(
 *   'account-id',
 *   '100',
 *   '0x1234...abcd',
 *   'SBC',    // Value type
 *   'base'    // Transfer type (onchain network)
 * );
 * ```
 */
export declare class BraleClient {
    private readonly config;
    private readonly auth;
    private readonly httpClient;
    /** Accounts service for managing customer accounts */
    readonly accounts: AccountsService;
    /** Transfers service for managing all types of transfers */
    readonly transfers: TransfersService;
    /** Addresses service for managing internal and external addresses */
    readonly addresses: AddressesService;
    /** Automations service for managing automated workflows */
    readonly automations: AutomationsService;
    /**
     * Create a new Brale SDK client
     *
     * @param config - Client configuration including authentication credentials
     */
    constructor(config: BraleConfig);
    /**
     * Test the API connection and authentication
     *
     * @returns Promise resolving to connection status
     */
    testConnection(): Promise<{
        connected: boolean;
        authenticated: boolean;
        latencyMs: number;
    }>;
    /**
     * Get the current authentication status
     *
     * @returns Whether the client is currently authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get the access token expiration time
     *
     * @returns Token expiration date or null if not authenticated
     */
    getTokenExpiration(): Date | null;
    /**
     * Manually refresh the access token
     *
     * @returns Promise resolving to the new access token
     */
    refreshToken(): Promise<string>;
    /**
     * Revoke the current access token and clear authentication
     *
     * @returns Promise resolving when token is revoked
     */
    revokeToken(): Promise<void>;
    /**
     * Clear the stored authentication token without revoking it
     */
    clearToken(): void;
    /**
     * Get the current configuration
     *
     * @returns Current client configuration (with secrets redacted)
     */
    getConfig(): Omit<Required<BraleConfig>, 'clientSecret'>;
    /**
     * Update configuration at runtime
     *
     * @param updates - Configuration updates
     */
    updateConfig(updates: Partial<Omit<BraleConfig, 'clientId' | 'clientSecret'>>): void;
    /**
     * Validate the configuration
     */
    private validateConfig;
    /**
     * Validate URL format
     */
    private isValidUrl;
    /**
     * Setup response interceptor for error handling
     */
    private setupResponseInterceptor;
    /**
     * Setup debug interceptor for logging
     */
    private setupDebugInterceptor;
    /**
     * Redact sensitive information from headers for logging
     */
    private redactSensitiveHeaders;
}
//# sourceMappingURL=client.d.ts.map