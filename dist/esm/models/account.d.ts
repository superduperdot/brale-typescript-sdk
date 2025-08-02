/**
 * Account model representing a Brale customer account
 */
import type { Balance } from './amount';
import type { Network, ValueType } from '../types/common';
/**
 * Brale customer account
 */
export interface Account {
    /** Unique account identifier */
    id: string;
    /** Human-readable account name */
    name: string;
    /** Account status */
    status: AccountStatus;
    /** Account type */
    type: AccountType;
    /** Account creation timestamp */
    createdAt: Date;
    /** Last updated timestamp */
    updatedAt: Date;
    /** Account metadata */
    metadata?: Record<string, unknown>;
    /** Account settings */
    settings?: AccountSettings;
}
/**
 * Account status enumeration
 */
export declare enum AccountStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    CLOSED = "closed"
}
/**
 * Account type enumeration
 */
export declare enum AccountType {
    PERSONAL = "personal",
    BUSINESS = "business",
    INSTITUTIONAL = "institutional"
}
/**
 * Account settings and preferences
 */
export interface AccountSettings {
    /** Default currency for the account */
    defaultCurrency?: ValueType;
    /** Notification preferences */
    notifications?: NotificationSettings;
    /** Security settings */
    security?: SecuritySettings;
    /** API settings */
    api?: ApiSettings;
}
/**
 * Notification preferences
 */
export interface NotificationSettings {
    /** Email notifications enabled */
    email?: boolean;
    /** SMS notifications enabled */
    sms?: boolean;
    /** Webhook notifications enabled */
    webhook?: boolean;
    /** Transaction notifications */
    transactions?: boolean;
    /** Security alert notifications */
    security?: boolean;
}
/**
 * Security settings
 */
export interface SecuritySettings {
    /** Two-factor authentication enabled */
    twoFactorEnabled?: boolean;
    /** IP whitelist for API access */
    ipWhitelist?: string[];
    /** Require confirmation for large transfers */
    requireConfirmation?: boolean;
    /** Maximum daily transfer limit */
    dailyTransferLimit?: string;
}
/**
 * API-specific settings
 */
export interface ApiSettings {
    /** Rate limiting settings */
    rateLimiting?: {
        requestsPerMinute: number;
        burstLimit: number;
    };
    /** Webhook settings */
    webhooks?: {
        url: string;
        secret: string;
        events: string[];
    }[];
}
/**
 * Account balance summary
 */
export interface AccountBalance {
    /** Account ID */
    accountId: string;
    /** Balances by network and value type */
    balances: Record<Network, Record<ValueType, Balance>>;
    /** Total portfolio value in USD */
    totalValueUsd?: string;
    /** Last updated timestamp */
    updatedAt: Date;
}
/**
 * Account activity summary
 */
export interface AccountActivity {
    /** Account ID */
    accountId: string;
    /** Total number of transactions */
    totalTransactions: number;
    /** Transaction volume in the last 30 days */
    monthlyVolume: Record<ValueType, string>;
    /** Last transaction timestamp */
    lastTransactionAt?: Date;
    /** Activity period */
    period: {
        start: Date;
        end: Date;
    };
}
/**
 * Create account request
 */
export interface CreateAccountRequest {
    /** Account name */
    name: string;
    /** Account type */
    type: AccountType;
    /** Account metadata */
    metadata?: Record<string, unknown>;
    /** Initial settings */
    settings?: Partial<AccountSettings>;
}
/**
 * Update account request
 */
export interface UpdateAccountRequest {
    /** Updated account name */
    name?: string;
    /** Updated metadata */
    metadata?: Record<string, unknown>;
    /** Updated settings */
    settings?: Partial<AccountSettings>;
}
//# sourceMappingURL=account.d.ts.map