# 🔄 Credential Rotation Guide

## Overview

The Brale SDK includes comprehensive credential rotation capabilities to help maintain security by regularly replacing API credentials. This guide covers how to implement, configure, and monitor credential rotation in your applications.

## 🎯 Why Rotate Credentials?

1. **🔒 Security Best Practice** - Limits the impact of compromised credentials
2. **📋 Compliance** - Meet regulatory requirements for credential management
3. **🛡️ Defense in Depth** - Additional security layer beyond token expiration
4. **⏰ Proactive Security** - Address security risks before they become incidents

---

## 🚀 Quick Start

### Basic Setup

```typescript
import { BraleClient, MockRotationProvider } from '@brale/sdk';

const client = new BraleClient({
  clientId: process.env.BRALE_CLIENT_ID!,
  clientSecret: process.env.BRALE_CLIENT_SECRET!,
});

// Create a rotation provider (see examples below)
const rotationProvider = new CustomRotationProvider();

// Enable rotation monitoring
client.auth.enableCredentialRotation(rotationProvider, {
  warningThresholdDays: 30,  // Warn 30 days before expiration
  urgentThresholdDays: 7,    // Urgent alert 7 days before
  maxCredentialAgeDays: 90,  // Force rotation after 90 days
});
```

### Check Rotation Status

```typescript
const status = client.auth.getRotationStatus();

console.log('Rotation enabled:', status.enabled);
console.log('Current status:', status.status); // 'healthy', 'warning', 'urgent', 'expired'
console.log('Days since last rotation:', status.daysSinceLastRotation);
console.log('Days until expiration:', status.daysUntilExpiration);
```

### Manual Rotation

```typescript
try {
  const newCredentials = await client.auth.rotateCredentials();
  
  // Update your configuration with new credentials
  console.log('New Client ID:', newCredentials.clientId);
  console.log('New Client Secret:', newCredentials.clientSecret);
  
  // You may need to update environment variables or secret stores
  await updateSecretStore({
    clientId: newCredentials.clientId,
    clientSecret: newCredentials.clientSecret,
  });
  
} catch (error) {
  console.error('Rotation failed:', error);
}
```

---

## 🏗️ Implementing Rotation Providers

### Custom Rotation Provider

Create a custom provider that integrates with your secret management system:

```typescript
import { RotationProvider } from '@brale/sdk';

class AWSSecretsRotationProvider implements RotationProvider {
  private secretsManager: AWS.SecretsManager;
  private secretName: string;

  constructor(secretName: string) {
    this.secretsManager = new AWS.SecretsManager();
    this.secretName = secretName;
  }

  async hasNewCredentials(): Promise<boolean> {
    // Check if AWS Secrets Manager has a pending rotation
    const response = await this.secretsManager.describeSecret({
      SecretId: this.secretName,
    }).promise();
    
    return response.RotationEnabled && 
           response.NextRotationDate && 
           response.NextRotationDate <= new Date();
  }

  async getNewCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    // Get the new credentials from AWS Secrets Manager
    const response = await this.secretsManager.getSecretValue({
      SecretId: this.secretName,
      VersionStage: 'AWSPENDING', // Get the new version
    }).promise();

    const secrets = JSON.parse(response.SecretString!);
    return {
      clientId: secrets.clientId,
      clientSecret: secrets.clientSecret,
    };
  }

  async revokeCredentials(clientId: string): Promise<void> {
    // Mark the old credentials as revoked in your system
    // This might involve calling an API or updating a database
    console.log(`Revoking credentials for ${clientId}`);
  }

  async validateCredentials(clientId: string, clientSecret: string): Promise<boolean> {
    // Test the new credentials by making a test API call
    try {
      const testAuth = new BraleAuth({
        clientId,
        clientSecret,
        authUrl: 'https://auth.brale.xyz',
        timeout: 10000,
      });
      
      await testAuth.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### HashiCorp Vault Provider

```typescript
class VaultRotationProvider implements RotationProvider {
  private vaultClient: any; // Your Vault client
  private secretPath: string;

  constructor(vaultClient: any, secretPath: string) {
    this.vaultClient = vaultClient;
    this.secretPath = secretPath;
  }

  async hasNewCredentials(): Promise<boolean> {
    // Check if Vault has new credentials available
    const metadata = await this.vaultClient.read(`${this.secretPath}/metadata`);
    return metadata.data.current_version > metadata.data.oldest_version;
  }

  async getNewCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    // Generate new credentials using Vault's dynamic secrets
    const response = await this.vaultClient.read(`${this.secretPath}/creds/brale`);
    return {
      clientId: response.data.client_id,
      clientSecret: response.data.client_secret,
    };
  }

  async revokeCredentials(clientId: string): Promise<void> {
    // Revoke the lease in Vault
    await this.vaultClient.write(`${this.secretPath}/revoke`, {
      client_id: clientId,
    });
  }

  async validateCredentials(clientId: string, clientSecret: string): Promise<boolean> {
    // Validate credentials with a test call
    // Implementation similar to AWS example above
    return true;
  }
}
```

---

## 📊 Monitoring and Alerting

### Event Handling

```typescript
import { RotationEvent } from '@brale/sdk';

client.auth.enableCredentialRotation(rotationProvider);

// Listen to rotation events
const rotationManager = client.auth.rotationManager;
rotationManager.on('rotation_event', (event: RotationEvent) => {
  switch (event.type) {
    case 'warning':
      // Send notification to team
      await sendSlackNotification(`🔔 Brale credentials need rotation in ${event.context?.daysUntilExpiration} days`);
      break;
      
    case 'urgent':
      // Create urgent ticket
      await createJiraTicket({
        title: 'URGENT: Brale credentials expiring soon',
        description: event.message,
        priority: 'High',
      });
      break;
      
    case 'rotation_needed':
      // Trigger automated rotation
      await triggerAutomatedRotation();
      break;
      
    case 'rotation_completed':
      // Log successful rotation
      logger.info('Credential rotation completed successfully', event);
      break;
      
    case 'rotation_failed':
      // Alert security team
      await alertSecurityTeam(event);
      break;
  }
});
```

### Automated Rotation Workflow

```typescript
class AutomatedRotationWorkflow {
  private client: BraleClient;
  private configManager: ConfigurationManager;

  constructor(client: BraleClient, configManager: ConfigurationManager) {
    this.client = client;
    this.configManager = configManager;
  }

  async setupAutomatedRotation(): void {
    const rotationProvider = new AWSSecretsRotationProvider('brale-credentials');
    
    this.client.auth.enableCredentialRotation(rotationProvider, {
      maxCredentialAgeDays: 90,
      urgentThresholdDays: 7,
    });

    // Set up automated response to rotation events
    const rotationManager = (this.client.auth as any).rotationManager;
    rotationManager.on('rotation_event', async (event: RotationEvent) => {
      if (event.type === 'rotation_needed') {
        await this.performAutomatedRotation();
      }
    });
  }

  private async performAutomatedRotation(): Promise<void> {
    try {
      // 1. Rotate credentials
      const newCredentials = await this.client.auth.rotateCredentials();
      
      // 2. Update configuration management
      await this.configManager.updateCredentials(newCredentials);
      
      // 3. Update all running instances
      await this.deployNewCredentials(newCredentials);
      
      // 4. Verify everything is working
      await this.verifyRotation();
      
      console.log('✅ Automated rotation completed successfully');
      
    } catch (error) {
      console.error('❌ Automated rotation failed:', error);
      
      // Alert human operators for manual intervention
      await this.alertOperations(error);
    }
  }

  private async deployNewCredentials(credentials: { clientId: string; clientSecret: string }): Promise<void> {
    // Update Kubernetes secrets
    await this.updateKubernetesSecrets(credentials);
    
    // Restart pods to pick up new credentials
    await this.restartPods();
    
    // Wait for pods to be ready
    await this.waitForPodsReady();
  }

  private async verifyRotation(): Promise<void> {
    // Make test API calls to ensure everything works
    const testClient = new BraleClient({
      clientId: process.env.BRALE_CLIENT_ID!,
      clientSecret: process.env.BRALE_CLIENT_SECRET!,
    });

    const connection = await testClient.testConnection();
    if (!connection.authenticated) {
      throw new Error('Rotation verification failed - authentication not working');
    }
  }
}
```

---

## 🔧 Production Deployment

### Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: your-app:latest
    environment:
      - BRALE_ROTATION_ENABLED=true
      - BRALE_ROTATION_WARNING_DAYS=30
      - BRALE_ROTATION_URGENT_DAYS=7
      - BRALE_ROTATION_MAX_AGE_DAYS=90
      - AWS_SECRETS_MANAGER_SECRET_NAME=brale-credentials
    volumes:
      - aws-credentials:/root/.aws:ro
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brale-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-app:latest
        env:
        - name: BRALE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: brale-credentials
              key: client-id
        - name: BRALE_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: brale-credentials
              key: client-secret
        - name: BRALE_ROTATION_ENABLED
          value: "true"
```

### Monitoring Dashboard

```typescript
// Prometheus metrics for rotation monitoring
import { register, Gauge, Counter } from 'prom-client';

const rotationStatusGauge = new Gauge({
  name: 'brale_credential_days_until_expiration',
  help: 'Days until Brale credentials expire',
});

const rotationEventsCounter = new Counter({
  name: 'brale_credential_rotation_events_total',
  help: 'Total number of credential rotation events',
  labelNames: ['type', 'status'],
});

// Update metrics based on rotation events
rotationManager.on('rotation_event', (event: RotationEvent) => {
  rotationEventsCounter.inc({ type: event.type, status: 'triggered' });
  
  if (event.context?.daysUntilExpiration) {
    rotationStatusGauge.set(event.context.daysUntilExpiration as number);
  }
});
```

---

## 🚨 Security Considerations

### Best Practices

1. **🔐 Secure Storage** - Always store credentials in secure secret management systems
2. **🔄 Zero-Downtime Rotation** - Implement graceful rotation with overlap periods
3. **📝 Audit Logging** - Log all rotation events for compliance and debugging
4. **🚫 Never Log Secrets** - Ensure rotation logs don't contain actual credentials
5. **⚡ Fast Rollback** - Have procedures for quickly reverting failed rotations

### Security Checklist

- [ ] Rotation provider validates new credentials before use
- [ ] Old credentials are properly revoked after rotation
- [ ] Rotation events are logged and monitored
- [ ] Failed rotations trigger immediate alerts
- [ ] Rotation process is tested in staging environment
- [ ] Emergency procedures exist for manual credential updates

---

## 📚 API Reference

### RotationProvider Interface

```typescript
interface RotationProvider {
  hasNewCredentials(): Promise<boolean>;
  getNewCredentials(): Promise<{ clientId: string; clientSecret: string }>;
  revokeCredentials(clientId: string): Promise<void>;
  validateCredentials(clientId: string, clientSecret: string): Promise<boolean>;
}
```

### RotationConfig Options

```typescript
interface RotationConfig {
  checkInterval?: number;           // Check frequency (ms, default: 24h)
  warningThresholdDays?: number;    // Warning threshold (days, default: 30)
  urgentThresholdDays?: number;     // Urgent threshold (days, default: 7)
  maxCredentialAgeDays?: number;    // Max age (days, default: 90)
  enableAuditLogging?: boolean;     // Enable logging (default: true)
}
```

### RotationEvent Types

- `warning` - Credentials approaching expiration
- `urgent` - Credentials expiring soon
- `rotation_needed` - Credentials have expired
- `rotation_started` - Rotation process beginning
- `rotation_completed` - Rotation successful
- `rotation_failed` - Rotation failed

---

## 🆘 Troubleshooting

### Common Issues

**Q: Rotation fails with "No new credentials available"**
A: Check that your rotation provider is correctly configured and has access to generate new credentials.

**Q: New credentials fail validation**
A: Ensure the rotation provider is returning valid credentials and that your validation logic is correct.

**Q: Automated rotation doesn't trigger**
A: Verify that monitoring is enabled and check the rotation thresholds are configured correctly.

**Q: Application breaks after rotation**
A: Implement proper error handling and consider implementing a rollback mechanism.

### Debug Mode

```typescript
// Enable detailed logging
const rotationManager = new CredentialRotationManager({
  enableAuditLogging: true,
});

// Listen to all events for debugging
rotationManager.on('rotation_event', (event) => {
  console.log('DEBUG: Rotation Event', JSON.stringify(event, null, 2));
});
```

---

Need help with credential rotation? Contact our support team or check the [main documentation](./README.md) for more information.