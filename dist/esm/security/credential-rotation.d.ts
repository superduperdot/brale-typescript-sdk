/**
 * Credential rotation management for enhanced security
 * Implements industry best practices for API credential lifecycle management
 */
import { EventEmitter } from 'events';
export interface RotationConfig {
    /** How often to check for rotation needs (in milliseconds) */
    checkInterval?: number;
    /** How many days before expiration to trigger rotation warning */
    warningThresholdDays?: number;
    /** How many days before expiration to trigger urgent rotation */
    urgentThresholdDays?: number;
    /** Maximum age of credentials before forced rotation (in days) */
    maxCredentialAgeDays?: number;
    /** Enable automatic audit logging */
    enableAuditLogging?: boolean;
}
export interface CredentialMetadata {
    /** When the credential was created */
    createdAt: Date;
    /** When the credential last rotated */
    lastRotated: Date;
    /** Credential identifier (masked for security) */
    credentialId: string;
    /** Environment (dev, staging, prod) */
    environment: string;
    /** Custom tags for organization */
    tags?: Record<string, string>;
}
export interface RotationEvent {
    /** Type of rotation event */
    type: 'warning' | 'urgent' | 'rotation_needed' | 'rotation_started' | 'rotation_completed' | 'rotation_failed';
    /** When the event occurred */
    timestamp: Date;
    /** Credential that triggered the event */
    credentialId: string;
    /** Human-readable message */
    message: string;
    /** Additional context */
    context?: Record<string, unknown>;
}
export interface RotationProvider {
    /** Check if new credentials are available */
    hasNewCredentials(): Promise<boolean>;
    /** Retrieve new credentials */
    getNewCredentials(): Promise<{
        clientId: string;
        clientSecret: string;
    }>;
    /** Revoke old credentials */
    revokeCredentials(clientId: string): Promise<void>;
    /** Validate credentials are working */
    validateCredentials(clientId: string, clientSecret: string): Promise<boolean>;
}
/**
 * Credential rotation manager
 * Handles automatic detection, scheduling, and execution of credential rotation
 */
export declare class CredentialRotationManager extends EventEmitter {
    private readonly config;
    private currentMetadata;
    private checkTimer;
    private rotationProvider;
    constructor(config?: RotationConfig);
    /**
     * Set the rotation provider for fetching new credentials
     */
    setRotationProvider(provider: RotationProvider): void;
    /**
     * Register current credentials for monitoring
     */
    registerCredentials(clientId: string, metadata?: Partial<CredentialMetadata>): void;
    /**
     * Start automatic rotation monitoring
     */
    startMonitoring(): void;
    /**
     * Stop automatic rotation monitoring
     */
    stopMonitoring(): void;
    /**
     * Check if credentials need rotation
     */
    checkRotationNeeds(): void;
    /**
     * Perform credential rotation
     */
    rotateCredentials(): Promise<{
        clientId: string;
        clientSecret: string;
    }>;
    /**
     * Get current credential status
     */
    getCredentialStatus(): {
        registered: boolean;
        daysSinceLastRotation: number;
        daysUntilExpiration: number;
        status: 'healthy' | 'warning' | 'urgent' | 'expired';
        metadata?: CredentialMetadata;
    };
    /**
     * Emit a rotation event
     */
    private emitRotationEvent;
    /**
     * Audit logging utility
     */
    private auditLog;
    /**
     * Calculate days between two dates
     */
    private getDaysBetween;
}
/**
 * Simple in-memory rotation provider for development/testing
 */
export declare class MockRotationProvider implements RotationProvider {
    private newCredentials;
    constructor(newCredentials?: {
        clientId: string;
        clientSecret: string;
    });
    hasNewCredentials(): Promise<boolean>;
    getNewCredentials(): Promise<{
        clientId: string;
        clientSecret: string;
    }>;
    revokeCredentials(_clientId: string): Promise<void>;
    validateCredentials(_clientId: string, _clientSecret: string): Promise<boolean>;
    setNewCredentials(credentials: {
        clientId: string;
        clientSecret: string;
    }): void;
}
//# sourceMappingURL=credential-rotation.d.ts.map