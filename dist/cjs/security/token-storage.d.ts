/**
 * Secure token storage with encryption support
 * Based on best practices from security research and industry standards
 */
export interface SecureStorageOptions {
    encrypt?: boolean;
    encryptionKey?: string;
    storageKey?: string;
}
export interface StoredTokenData {
    accessToken: string;
    tokenType: string;
    expiresAt: number;
    scope?: string;
    encrypted?: boolean;
}
/**
 * Secure token storage implementation
 * Provides optional encryption for sensitive token data
 */
export declare class SecureTokenStorage {
    private readonly options;
    private readonly algorithm;
    constructor(options?: SecureStorageOptions);
    /**
     * Store token securely with optional encryption
     */
    storeToken(tokenData: Omit<StoredTokenData, 'encrypted'>): Promise<void>;
    /**
     * Retrieve and decrypt stored token
     */
    retrieveToken(): Promise<StoredTokenData | null>;
    /**
     * Clear stored token
     */
    clearToken(): Promise<void>;
    /**
     * Check if a token is stored and valid
     */
    hasValidToken(): Promise<boolean>;
    /**
     * Encrypt data using AES-256-GCM
     */
    private encrypt;
    /**
     * Decrypt data using AES-256-GCM
     */
    private decrypt;
    /**
     * Generate a secure encryption key
     */
    private generateEncryptionKey;
}
/**
 * Default secure storage instance
 */
export declare const defaultTokenStorage: SecureTokenStorage;
//# sourceMappingURL=token-storage.d.ts.map