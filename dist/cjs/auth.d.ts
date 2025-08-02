/**
 * OAuth 2.0 Client Credentials authentication for Brale API
 */
import { AxiosInstance } from 'axios';
import { RotationProvider } from './security/credential-rotation';
import type { AuthConfig } from './types/config';
/**
 * OAuth token response from Brale auth server
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
}
/**
 * OAuth 2.0 Client Credentials authentication manager
 *
 * Handles token acquisition, storage, and automatic refresh using the OAuth 2.0
 * Client Credentials grant type for machine-to-machine authentication.
 */
export declare class BraleAuth {
    private readonly config;
    private readonly httpClient;
    private storedToken;
    private tokenRefreshPromise;
    private rotationManager;
    /**
     * Create a new BraleAuth instance
     *
     * @param config - Authentication configuration
     */
    constructor(config: AuthConfig);
    /**
     * Get a valid access token, refreshing if necessary
     *
     * @returns Promise resolving to the access token
     */
    getAccessToken(): Promise<string>;
    /**
     * Create an authenticated HTTP client with automatic token injection
     *
     * @param baseURL - Base URL for the API
     * @param timeout - Request timeout in milliseconds
     * @returns Configured axios instance
     */
    createAuthenticatedClient(baseURL: string, timeout: number): AxiosInstance;
    /**
     * Revoke the current access token
     */
    revokeToken(): Promise<void>;
    /**
     * Clear stored token without revoking
     */
    clearToken(): void;
    /**
     * Check if the current token is valid and not expired
     */
    isAuthenticated(): boolean;
    /**
     * Get token expiration time
     */
    getTokenExpiration(): Date | null;
    /**
     * Fetch a new access token using client credentials
     */
    private fetchNewToken;
    /**
     * Check if a token is still valid (not expired)
     */
    private isTokenValid;
    /**
     * Enable credential rotation monitoring
     *
     * @param rotationProvider - Provider for fetching new credentials
     * @param config - Rotation configuration options
     */
    enableCredentialRotation(rotationProvider: RotationProvider, config?: {
        warningThresholdDays?: number;
        urgentThresholdDays?: number;
        maxCredentialAgeDays?: number;
    }): void;
    /**
     * Disable credential rotation monitoring
     */
    disableCredentialRotation(): void;
    /**
     * Get current credential rotation status
     */
    getRotationStatus(): {
        enabled: boolean;
        status?: 'healthy' | 'warning' | 'urgent' | 'expired';
        daysSinceLastRotation?: number;
        daysUntilExpiration?: number;
        lastRotated?: Date;
    };
    /**
     * Manually trigger credential rotation
     *
     * @returns New credentials that should be used to update the SDK configuration
     */
    rotateCredentials(): Promise<{
        clientId: string;
        clientSecret: string;
    }>;
    /**
     * Handle rotation events (logging, alerts, etc.)
     */
    private handleRotationEvent;
}
//# sourceMappingURL=auth.d.ts.map