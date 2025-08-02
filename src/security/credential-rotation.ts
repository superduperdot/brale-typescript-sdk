/**
 * Credential rotation management for enhanced security
 * Implements industry best practices for API credential lifecycle management
 */

import { EventEmitter } from 'events';
import { CredentialValidator } from './credential-validator';

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
  getNewCredentials(): Promise<{ clientId: string; clientSecret: string }>;
  /** Revoke old credentials */
  revokeCredentials(clientId: string): Promise<void>;
  /** Validate credentials are working */
  validateCredentials(clientId: string, clientSecret: string): Promise<boolean>;
}

/**
 * Default configuration for credential rotation
 */
const DEFAULT_ROTATION_CONFIG: Required<RotationConfig> = {
  checkInterval: 24 * 60 * 60 * 1000, // 24 hours
  warningThresholdDays: 30,
  urgentThresholdDays: 7,
  maxCredentialAgeDays: 90,
  enableAuditLogging: true,
};

/**
 * Credential rotation manager
 * Handles automatic detection, scheduling, and execution of credential rotation
 */
export class CredentialRotationManager extends EventEmitter {
  private readonly config: Required<RotationConfig>;
  private currentMetadata: CredentialMetadata | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private rotationProvider: RotationProvider | null = null;

  constructor(config: RotationConfig = {}) {
    super();
    this.config = { ...DEFAULT_ROTATION_CONFIG, ...config };
  }

  /**
   * Set the rotation provider for fetching new credentials
   */
  setRotationProvider(provider: RotationProvider): void {
    this.rotationProvider = provider;
  }

  /**
   * Register current credentials for monitoring
   */
  registerCredentials(clientId: string, metadata: Partial<CredentialMetadata> = {}): void {
    const now = new Date();
    this.currentMetadata = {
      createdAt: metadata.createdAt || now,
      lastRotated: metadata.lastRotated || now,
      credentialId: CredentialValidator.maskCredential(clientId),
      environment: metadata.environment || process.env.NODE_ENV || 'unknown',
      tags: metadata.tags || {},
    };

    this.auditLog('info', 'Credentials registered for rotation monitoring', {
      credentialId: this.currentMetadata.credentialId,
      environment: this.currentMetadata.environment,
    });
  }

  /**
   * Start automatic rotation monitoring
   */
  startMonitoring(): void {
    if (this.checkTimer) {
      this.stopMonitoring();
    }

    this.checkTimer = setInterval(() => {
      this.checkRotationNeeds();
    }, this.config.checkInterval);

    this.auditLog('info', 'Credential rotation monitoring started', {
      checkInterval: this.config.checkInterval,
    });

    // Perform initial check
    this.checkRotationNeeds();
  }

  /**
   * Stop automatic rotation monitoring
   */
  stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      this.auditLog('info', 'Credential rotation monitoring stopped');
    }
  }

  /**
   * Check if credentials need rotation
   */
  checkRotationNeeds(): void {
    if (!this.currentMetadata) {
      this.auditLog('warning', 'No credentials registered for rotation monitoring');
      return;
    }

    const now = new Date();
    const daysSinceLastRotation = this.getDaysBetween(this.currentMetadata.lastRotated, now);
    const daysUntilExpiration = this.config.maxCredentialAgeDays - daysSinceLastRotation;

    // Check for different rotation thresholds
    if (daysSinceLastRotation >= this.config.maxCredentialAgeDays) {
      this.emitRotationEvent({
        type: 'rotation_needed',
        timestamp: now,
        credentialId: this.currentMetadata.credentialId,
        message: `Credentials have exceeded maximum age of ${this.config.maxCredentialAgeDays} days`,
        context: { daysSinceLastRotation, urgency: 'immediate' },
      });
    } else if (daysUntilExpiration <= this.config.urgentThresholdDays) {
      this.emitRotationEvent({
        type: 'urgent',
        timestamp: now,
        credentialId: this.currentMetadata.credentialId,
        message: `Credentials will expire in ${daysUntilExpiration} days - urgent rotation needed`,
        context: { daysUntilExpiration, urgency: 'urgent' },
      });
    } else if (daysUntilExpiration <= this.config.warningThresholdDays) {
      this.emitRotationEvent({
        type: 'warning',
        timestamp: now,
        credentialId: this.currentMetadata.credentialId,
        message: `Credentials will expire in ${daysUntilExpiration} days - plan rotation soon`,
        context: { daysUntilExpiration, urgency: 'warning' },
      });
    }
  }

  /**
   * Perform credential rotation
   */
  async rotateCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    if (!this.rotationProvider) {
      throw new Error('No rotation provider configured');
    }

    if (!this.currentMetadata) {
      throw new Error('No credentials registered for rotation');
    }

    const startTime = new Date();
    const oldCredentialId = this.currentMetadata.credentialId;

    this.emitRotationEvent({
      type: 'rotation_started',
      timestamp: startTime,
      credentialId: oldCredentialId,
      message: 'Credential rotation process started',
    });

    try {
      // Step 1: Check if new credentials are available
      if (!(await this.rotationProvider.hasNewCredentials())) {
        throw new Error('No new credentials available from provider');
      }

      // Step 2: Get new credentials
      const newCredentials = await this.rotationProvider.getNewCredentials();

      // Step 3: Validate new credentials work
      const isValid = await this.rotationProvider.validateCredentials(
        newCredentials.clientId,
        newCredentials.clientSecret
      );

      if (!isValid) {
        throw new Error('New credentials failed validation');
      }

      // Step 4: Update metadata for new credentials
      const now = new Date();
      this.currentMetadata = {
        ...this.currentMetadata,
        lastRotated: now,
        credentialId: CredentialValidator.maskCredential(newCredentials.clientId),
      };

      // Step 5: Revoke old credentials (optional, depending on provider)
      try {
        // We can't revoke the old credentials here since we don't have the old clientId
        // This would typically be handled by the rotation provider
        this.auditLog('info', 'Old credentials should be revoked by the rotation provider');
      } catch (revokeError) {
        this.auditLog('warning', 'Failed to revoke old credentials', { error: revokeError });
      }

      this.emitRotationEvent({
        type: 'rotation_completed',
        timestamp: new Date(),
        credentialId: this.currentMetadata.credentialId,
        message: 'Credential rotation completed successfully',
        context: {
          oldCredentialId,
          duration: Date.now() - startTime.getTime(),
        },
      });

      return newCredentials;
    } catch (error) {
      this.emitRotationEvent({
        type: 'rotation_failed',
        timestamp: new Date(),
        credentialId: oldCredentialId,
        message: `Credential rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime.getTime(),
        },
      });

      throw error;
    }
  }

  /**
   * Get current credential status
   */
  getCredentialStatus(): {
    registered: boolean;
    daysSinceLastRotation: number;
    daysUntilExpiration: number;
    status: 'healthy' | 'warning' | 'urgent' | 'expired';
    metadata?: CredentialMetadata;
  } {
    if (!this.currentMetadata) {
      return {
        registered: false,
        daysSinceLastRotation: 0,
        daysUntilExpiration: 0,
        status: 'expired',
      };
    }

    const now = new Date();
    const daysSinceLastRotation = this.getDaysBetween(this.currentMetadata.lastRotated, now);
    const daysUntilExpiration = this.config.maxCredentialAgeDays - daysSinceLastRotation;

    let status: 'healthy' | 'warning' | 'urgent' | 'expired';
    if (daysSinceLastRotation >= this.config.maxCredentialAgeDays) {
      status = 'expired';
    } else if (daysUntilExpiration <= this.config.urgentThresholdDays) {
      status = 'urgent';
    } else if (daysUntilExpiration <= this.config.warningThresholdDays) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      registered: true,
      daysSinceLastRotation,
      daysUntilExpiration,
      status,
      metadata: this.currentMetadata,
    };
  }

  /**
   * Emit a rotation event
   */
  private emitRotationEvent(event: RotationEvent): void {
    this.emit('rotation_event', event);
    this.auditLog('info', `Rotation event: ${event.type}`, {
      message: event.message,
      context: event.context,
    });
  }

  /**
   * Audit logging utility
   */
  private auditLog(level: 'info' | 'warning' | 'error', message: string, context: Record<string, unknown> = {}): void {
    if (!this.config.enableAuditLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: 'CredentialRotationManager',
      ...context,
    };

    // In production, this would typically go to a proper logging system
    console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
  }

  /**
   * Calculate days between two dates
   */
  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Simple in-memory rotation provider for development/testing
 */
export class MockRotationProvider implements RotationProvider {
  private newCredentials: { clientId: string; clientSecret: string } | null = null;

  constructor(newCredentials?: { clientId: string; clientSecret: string }) {
    this.newCredentials = newCredentials || null;
  }

  async hasNewCredentials(): Promise<boolean> {
    return this.newCredentials !== null;
  }

  async getNewCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    if (!this.newCredentials) {
      throw new Error('No new credentials available');
    }
    return this.newCredentials;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revokeCredentials(_clientId: string): Promise<void> {
    // Mock implementation - in real provider this would revoke the credentials
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateCredentials(_clientId: string, _clientSecret: string): Promise<boolean> {
    // Mock implementation - always returns true
    return Promise.resolve(true);
  }

  setNewCredentials(credentials: { clientId: string; clientSecret: string }): void {
    this.newCredentials = credentials;
  }
}