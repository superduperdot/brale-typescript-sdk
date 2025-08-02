/**
 * Configuration interfaces for the Brale SDK
 */
export interface BraleConfig {
    /** OAuth2 client ID obtained from the Brale dashboard */
    clientId: string;
    /** OAuth2 client secret obtained from the Brale dashboard */
    clientSecret: string;
    /** Base URL for the Brale API (default: https://api.brale.xyz) */
    apiUrl?: string;
    /** Base URL for authentication (default: https://auth.brale.xyz) */
    authUrl?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Maximum number of retry attempts for failed requests (default: 3) */
    maxRetries?: number;
    /** Custom user agent string */
    userAgent?: string;
    /** Enable debug logging (default: false) */
    debug?: boolean;
}
export interface AuthConfig {
    /** OAuth2 client ID */
    clientId: string;
    /** OAuth2 client secret */
    clientSecret: string;
    /** Base URL for authentication */
    authUrl: string;
    /** Request timeout in milliseconds */
    timeout: number;
}
//# sourceMappingURL=config.d.ts.map