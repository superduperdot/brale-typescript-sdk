"use strict";
/**
 * Secure token storage with encryption support
 * Based on best practices from security research and industry standards
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTokenStorage = exports.SecureTokenStorage = void 0;
const crypto = __importStar(require("crypto"));
/**
 * Secure token storage implementation
 * Provides optional encryption for sensitive token data
 */
class SecureTokenStorage {
    constructor(options = {}) {
        this.algorithm = 'aes-256-gcm';
        this.options = {
            encrypt: options.encrypt ?? true,
            encryptionKey: options.encryptionKey ?? this.generateEncryptionKey(),
            storageKey: options.storageKey ?? 'brale_token',
        };
    }
    /**
     * Store token securely with optional encryption
     */
    async storeToken(tokenData) {
        try {
            const dataToStore = {
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
            }
            else {
                // In Node.js environment, store in memory only
                globalThis[this.options.storageKey] = serializedData;
            }
        }
        catch (error) {
            throw new Error(`Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve and decrypt stored token
     */
    async retrieveToken() {
        try {
            let serializedData = null;
            if (typeof window !== 'undefined' && window.sessionStorage) {
                serializedData = window.sessionStorage.getItem(this.options.storageKey);
            }
            else {
                serializedData = globalThis[this.options.storageKey] || null;
            }
            if (!serializedData) {
                return null;
            }
            let decryptedData = serializedData;
            // If data appears to be encrypted (starts with our encryption header)
            if (this.options.encrypt && serializedData.includes(':')) {
                try {
                    decryptedData = this.decrypt(serializedData);
                }
                catch (decryptError) {
                    // If decryption fails, assume it's unencrypted legacy data
                    console.warn('Failed to decrypt token, treating as unencrypted');
                }
            }
            const tokenData = JSON.parse(decryptedData);
            // Check if token is expired
            if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
                await this.clearToken();
                return null;
            }
            return tokenData;
        }
        catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }
    }
    /**
     * Clear stored token
     */
    async clearToken() {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeItem(this.options.storageKey);
            }
            else {
                delete globalThis[this.options.storageKey];
            }
        }
        catch (error) {
            console.warn('Failed to clear token:', error);
        }
    }
    /**
     * Check if a token is stored and valid
     */
    async hasValidToken() {
        const token = await this.retrieveToken();
        return token !== null && (!token.expiresAt || Date.now() < token.expiresAt);
    }
    /**
     * Encrypt data using AES-256-GCM
     */
    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.options.encryptionKey);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag?.()?.toString('hex') || '';
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    /**
     * Decrypt data using AES-256-GCM
     */
    decrypt(encryptedData) {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        const [ivHex, authTagHex, encrypted] = parts;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipher(this.algorithm, this.options.encryptionKey);
        if (decipher.setAuthTag) {
            decipher.setAuthTag(authTag);
        }
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Generate a secure encryption key
     */
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}
exports.SecureTokenStorage = SecureTokenStorage;
/**
 * Default secure storage instance
 */
exports.defaultTokenStorage = new SecureTokenStorage();
//# sourceMappingURL=token-storage.js.map