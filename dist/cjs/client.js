"use strict";
/**
 * Main Brale SDK client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BraleClient = void 0;
const auth_1 = require("./auth");
const accounts_1 = require("./services/accounts");
const transfers_1 = require("./services/transfers");
const addresses_1 = require("./services/addresses");
const automations_1 = require("./services/automations");
const api_error_1 = require("./errors/api-error");
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    apiUrl: 'https://api.brale.xyz',
    authUrl: 'https://auth.brale.xyz',
    timeout: 30000,
    maxRetries: 3,
    debug: false,
};
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
class BraleClient {
    /**
     * Create a new Brale SDK client
     *
     * @param config - Client configuration including authentication credentials
     */
    constructor(config) {
        // Validate required configuration
        this.validateConfig(config);
        // Merge with defaults
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Initialize authentication
        this.auth = new auth_1.BraleAuth({
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            authUrl: this.config.authUrl,
            timeout: this.config.timeout,
        });
        // Create authenticated HTTP client
        this.httpClient = this.auth.createAuthenticatedClient(this.config.apiUrl, this.config.timeout);
        // Add response interceptor for error handling
        this.setupResponseInterceptor();
        // Add request interceptor for debugging
        if (this.config.debug) {
            this.setupDebugInterceptor();
        }
        // Initialize services
        this.accounts = new accounts_1.AccountsService(this.httpClient);
        this.transfers = new transfers_1.TransfersService(this.httpClient);
        this.addresses = new addresses_1.AddressesService(this.httpClient);
        this.automations = new automations_1.AutomationsService(this.httpClient);
    }
    /**
     * Test the API connection and authentication
     *
     * @returns Promise resolving to connection status
     */
    async testConnection() {
        const startTime = Date.now();
        try {
            // Try to get the first account as a connectivity test
            await this.httpClient.get('/accounts', {
                params: { limit: 1 },
            });
            const latencyMs = Date.now() - startTime;
            return {
                connected: true,
                authenticated: true,
                latencyMs,
            };
        }
        catch (error) {
            const latencyMs = Date.now() - startTime;
            if (error instanceof api_error_1.BraleAPIError && error.status === 401) {
                return {
                    connected: true,
                    authenticated: false,
                    latencyMs,
                };
            }
            return {
                connected: false,
                authenticated: false,
                latencyMs,
            };
        }
    }
    /**
     * Get the current authentication status
     *
     * @returns Whether the client is currently authenticated
     */
    isAuthenticated() {
        return this.auth.isAuthenticated();
    }
    /**
     * Get the access token expiration time
     *
     * @returns Token expiration date or null if not authenticated
     */
    getTokenExpiration() {
        return this.auth.getTokenExpiration();
    }
    /**
     * Manually refresh the access token
     *
     * @returns Promise resolving to the new access token
     */
    async refreshToken() {
        return this.auth.getAccessToken();
    }
    /**
     * Revoke the current access token and clear authentication
     *
     * @returns Promise resolving when token is revoked
     */
    async revokeToken() {
        await this.auth.revokeToken();
    }
    /**
     * Clear the stored authentication token without revoking it
     */
    clearToken() {
        this.auth.clearToken();
    }
    /**
     * Get the current configuration
     *
     * @returns Current client configuration (with secrets redacted)
     */
    getConfig() {
        // Return config without sensitive information
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { clientSecret: _, ...safeConfig } = this.config;
        return safeConfig;
    }
    /**
     * Update configuration at runtime
     *
     * @param updates - Configuration updates
     */
    updateConfig(updates) {
        // Update non-sensitive configuration
        Object.assign(this.config, updates);
        // Update HTTP client timeout if changed
        if (updates.timeout) {
            this.httpClient.defaults.timeout = updates.timeout;
        }
        // Update user agent if changed
        if (updates.userAgent) {
            this.httpClient.defaults.headers['User-Agent'] = updates.userAgent;
        }
    }
    /**
     * Validate the configuration
     */
    validateConfig(config) {
        if (!config.clientId || typeof config.clientId !== 'string') {
            throw new api_error_1.BraleValidationError('Client ID is required and must be a string');
        }
        if (!config.clientSecret || typeof config.clientSecret !== 'string') {
            throw new api_error_1.BraleValidationError('Client secret is required and must be a string');
        }
        if (config.timeout !== undefined) {
            if (typeof config.timeout !== 'number' || config.timeout <= 0) {
                throw new api_error_1.BraleValidationError('Timeout must be a positive number');
            }
        }
        if (config.maxRetries !== undefined) {
            if (typeof config.maxRetries !== 'number' || config.maxRetries < 0) {
                throw new api_error_1.BraleValidationError('Max retries must be a non-negative number');
            }
        }
        if (config.apiUrl !== undefined) {
            if (typeof config.apiUrl !== 'string' || !this.isValidUrl(config.apiUrl)) {
                throw new api_error_1.BraleValidationError('API URL must be a valid URL string');
            }
        }
        if (config.authUrl !== undefined) {
            if (typeof config.authUrl !== 'string' || !this.isValidUrl(config.authUrl)) {
                throw new api_error_1.BraleValidationError('Auth URL must be a valid URL string');
            }
        }
    }
    /**
     * Validate URL format
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Setup response interceptor for error handling
     */
    setupResponseInterceptor() {
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                // Transform HTTP errors to BraleAPIError
                throw api_error_1.BraleAPIError.fromResponse(error.response.status, error.response.data, error.response.headers['x-request-id']);
            }
            else if (error.request) {
                // Network error
                throw new api_error_1.BraleNetworkError(`Network error: ${error.message}`, error);
            }
            else {
                // Other error
                throw error;
            }
        });
    }
    /**
     * Setup debug interceptor for logging
     */
    setupDebugInterceptor() {
        // Request interceptor for debugging
        this.httpClient.interceptors.request.use((config) => {
            if (this.config.debug) {
                console.log('[Brale SDK] Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    params: config.params,
                    headers: this.redactSensitiveHeaders(config.headers || {}),
                });
            }
            return config;
        });
        // Response interceptor for debugging
        this.httpClient.interceptors.response.use((response) => {
            if (this.config.debug) {
                console.log('[Brale SDK] Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    url: response.config.url,
                });
            }
            return response;
        }, (error) => {
            if (this.config.debug) {
                console.error('[Brale SDK] Error:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    message: error.message,
                    url: error.config?.url,
                });
            }
            return Promise.reject(error);
        });
    }
    /**
     * Redact sensitive information from headers for logging
     */
    redactSensitiveHeaders(headers) {
        const redacted = { ...headers };
        // Redact authorization headers
        if (redacted.Authorization) {
            redacted.Authorization = '[REDACTED]';
        }
        if (redacted.authorization) {
            redacted.authorization = '[REDACTED]';
        }
        return redacted;
    }
}
exports.BraleClient = BraleClient;
//# sourceMappingURL=client.js.map