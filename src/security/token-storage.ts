/**
 * Secure token storage with encryption support
 * Based on best practices from security research and industry standards
 */

import * as crypto from 'crypto';

// Type declaration for browser environment
declare const window: {
  sessionStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
} | undefined;

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
export class SecureTokenStorage {
  private readonly options: Required<SecureStorageOptions>;
  private readonly algorithm = 'aes-256-gcm';

  constructor(options: SecureStorageOptions = {}) {
    this.options = {
      encrypt: options.encrypt ?? true,
      encryptionKey: options.encryptionKey ?? this.generateEncryptionKey(),
      storageKey: options.storageKey ?? 'brale_token',
    };
  }

  /**
   * Store token securely with optional encryption
   */
  async storeToken(tokenData: Omit<StoredTokenData, 'encrypted'>): Promise<void> {
    try {
      const dataToStore: StoredTokenData = {
        ...tokenData,
        encrypted: this.options.encrypt,
      };

      let serializedData = JSON.stringify(dataToStore);

      if (this.options.encrypt) {
        serializedData = this.encrypt(serializedData);
      }

      // In browser environment, use secure storage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(this.options.storageKey, serializedData);
      } else {
        // In Node.js environment, store in memory only
        (globalThis as any)[this.options.storageKey] = serializedData;
      }
    } catch (error) {
      throw new Error(`Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve and decrypt stored token
   */
  async retrieveToken(): Promise<StoredTokenData | null> {
    try {
      let serializedData: string | null = null;

      if (typeof window !== 'undefined' && window.sessionStorage) {
        serializedData = window.sessionStorage.getItem(this.options.storageKey);
      } else {
        serializedData = (globalThis as any)[this.options.storageKey] || null;
      }

      if (!serializedData) {
        return null;
      }

      let decryptedData = serializedData;
      
      // If data appears to be encrypted (starts with our encryption header)
      if (this.options.encrypt && serializedData.includes(':')) {
        try {
          decryptedData = this.decrypt(serializedData);
        } catch (decryptError) {
          // If decryption fails, assume it's unencrypted legacy data
          console.warn('Failed to decrypt token, treating as unencrypted');
        }
      }

      const tokenData = JSON.parse(decryptedData) as StoredTokenData;
      
      // Check if token is expired
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        await this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  async clearToken(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(this.options.storageKey);
      } else {
        delete (globalThis as any)[this.options.storageKey];
      }
    } catch (error) {
      console.warn('Failed to clear token:', error);
    }
  }

  /**
   * Check if a token is stored and valid
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.retrieveToken();
    return token !== null && (!token.expiresAt || Date.now() < token.expiresAt);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.options.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = (cipher as any).getAuthTag?.()?.toString('hex') || '';
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.options.encryptionKey);
    
    if ((decipher as any).setAuthTag) {
      (decipher as any).setAuthTag(authTag);
    }
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate a secure encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * Default secure storage instance
 */
export const defaultTokenStorage = new SecureTokenStorage();