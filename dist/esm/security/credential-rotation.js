/**
 * Credential rotation management for enhanced security
 * Implements industry best practices for API credential lifecycle management
 */
import { EventEmitter } from 'events';
import { CredentialValidator } from './credential-validator';
/**
 * Default configuration for credential rotation
 */
const DEFAULT_ROTATION_CONFIG = {
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
    constructor(config = {}) {
        super();
        this.currentMetadata = null;
        this.checkTimer = null;
        this.rotationProvider = null;
        this.config = { ...DEFAULT_ROTATION_CONFIG, ...config };
    }
    /**
     * Set the rotation provider for fetching new credentials
     */
    setRotationProvider(provider) {
        this.rotationProvider = provider;
    }
    /**
     * Register current credentials for monitoring
     */
    registerCredentials(clientId, metadata = {}) {
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
    startMonitoring() {
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
    stopMonitoring() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
            this.auditLog('info', 'Credential rotation monitoring stopped');
        }
    }
    /**
     * Check if credentials need rotation
     */
    checkRotationNeeds() {
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
        }
        else if (daysUntilExpiration <= this.config.urgentThresholdDays) {
            this.emitRotationEvent({
                type: 'urgent',
                timestamp: now,
                credentialId: this.currentMetadata.credentialId,
                message: `Credentials will expire in ${daysUntilExpiration} days - urgent rotation needed`,
                context: { daysUntilExpiration, urgency: 'urgent' },
            });
        }
        else if (daysUntilExpiration <= this.config.warningThresholdDays) {
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
    async rotateCredentials() {
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
            const isValid = await this.rotationProvider.validateCredentials(newCredentials.clientId, newCredentials.clientSecret);
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
            }
            catch (revokeError) {
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
        }
        catch (error) {
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
    getCredentialStatus() {
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
        let status;
        if (daysSinceLastRotation >= this.config.maxCredentialAgeDays) {
            status = 'expired';
        }
        else if (daysUntilExpiration <= this.config.urgentThresholdDays) {
            status = 'urgent';
        }
        else if (daysUntilExpiration <= this.config.warningThresholdDays) {
            status = 'warning';
        }
        else {
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
    emitRotationEvent(event) {
        this.emit('rotation_event', event);
        this.auditLog('info', `Rotation event: ${event.type}`, {
            message: event.message,
            context: event.context,
        });
    }
    /**
     * Audit logging utility
     */
    auditLog(level, message, context = {}) {
        if (!this.config.enableAuditLogging)
            return;
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
    getDaysBetween(date1, date2) {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
/**
 * Simple in-memory rotation provider for development/testing
 */
export class MockRotationProvider {
    constructor(newCredentials) {
        this.newCredentials = null;
        this.newCredentials = newCredentials || null;
    }
    async hasNewCredentials() {
        return this.newCredentials !== null;
    }
    async getNewCredentials() {
        if (!this.newCredentials) {
            throw new Error('No new credentials available');
        }
        return this.newCredentials;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async revokeCredentials(_clientId) {
        // Mock implementation - in real provider this would revoke the credentials
        return Promise.resolve();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateCredentials(_clientId, _clientSecret) {
        // Mock implementation - always returns true
        return Promise.resolve(true);
    }
    setNewCredentials(credentials) {
        this.newCredentials = credentials;
    }
}
//# sourceMappingURL=credential-rotation.js.map