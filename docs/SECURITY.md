# 🔒 Brale SDK Security Guide

## Overview

This guide outlines security best practices for using the Brale TypeScript SDK in production environments. Following these guidelines will help protect your application and users' financial data.

## 🔑 Credential Management

### ✅ **DO**

```typescript
// ✅ Use environment variables
const client = new BraleClient({
  clientId: process.env.BRALE_CLIENT_ID!,
  clientSecret: process.env.BRALE_CLIENT_SECRET!,
});

// ✅ Validate credentials on startup
const validation = CredentialValidator.validateCredentials(clientId, clientSecret);
if (!validation.isValid) {
  throw new Error(`Invalid credentials: ${validation.issues.join(', ')}`);
}
```

### ❌ **DON'T**

```typescript
// ❌ Never hardcode credentials
const client = new BraleClient({
  clientId: 'your-client-id-here',
  clientSecret: 'your-secret-here', // This will leak!
});

// ❌ Don't commit .env files with real credentials
// Add .env to .gitignore!

// ❌ Don't log credentials
console.log('Config:', { clientSecret }); // Never do this!
```

## 🛡️ Production Security Checklist

### **Environment Setup**
- [ ] Credentials stored in secure environment variables or secret manager
- [ ] `.env` files added to `.gitignore` 
- [ ] Separate development and production credentials
- [ ] Regular credential rotation schedule (90 days recommended)

### **Application Security**
- [ ] HTTPS enabled for all API communications
- [ ] Request timeout configured (30s recommended)
- [ ] Rate limiting implemented
- [ ] Error handling doesn't expose sensitive data
- [ ] Audit logging enabled for sensitive operations

### **Monitoring & Alerting**
- [ ] API usage monitoring configured
- [ ] Suspicious activity alerts set up
- [ ] Failed authentication attempt tracking
- [ ] Credential expiration notifications

## 🔐 Secret Management Solutions

### **Recommended Tools**

| **Environment** | **Tool** | **Why** |
|----------------|----------|---------|
| **AWS** | AWS Secrets Manager | Native rotation, IAM integration |
| **GCP** | Secret Manager | Simple API, automatic encryption |
| **Azure** | Key Vault | Enterprise features, compliance |
| **Kubernetes** | Sealed Secrets | GitOps-friendly, encrypted at rest |
| **Development** | dotenv + .gitignore | Simple, prevents accidental commits |

### **Implementation Example**

```typescript
// AWS Secrets Manager integration
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getBraleCredentials() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(new GetSecretValueCommand({
    SecretId: 'brale-api-credentials'
  }));
  
  const secrets = JSON.parse(response.SecretString!);
  return {
    clientId: secrets.clientId,
    clientSecret: secrets.clientSecret,
  };
}

// Use in your application
const credentials = await getBraleCredentials();
const braleClient = new BraleClient(credentials);
```

## 🚨 Incident Response

### **If Credentials Are Compromised**

1. **Immediate Actions (< 5 minutes)**
   ```bash
   # Revoke compromised credentials
   # Contact Brale support immediately
   # Rotate to new credentials
   ```

2. **Assessment (< 30 minutes)**
   - Check audit logs for unauthorized usage
   - Assess potential financial impact
   - Document timeline of exposure

3. **Recovery (< 2 hours)**
   - Deploy new credentials to all environments
   - Update monitoring alerts
   - Verify normal operation

4. **Post-Incident**
   - Conduct root cause analysis
   - Update security procedures
   - Schedule follow-up security review

## 🔍 Security Monitoring

### **Key Metrics to Track**

```typescript
// Example monitoring integration
import { BraleClient } from '@brale/sdk';

const client = new BraleClient({
  clientId: process.env.BRALE_CLIENT_ID!,
  clientSecret: process.env.BRALE_CLIENT_SECRET!,
  debug: false, // Never enable debug in production
});

// Add custom monitoring
client.on('auth:success', (event) => {
  logger.info('Authentication successful', {
    timestamp: new Date().toISOString(),
    clientId: CredentialValidator.maskCredential(event.clientId),
  });
});

client.on('auth:failure', (event) => {
  logger.error('Authentication failed', {
    timestamp: new Date().toISOString(),
    error: event.error,
    // Never log the full clientSecret
  });
});
```

### **Alert Conditions**

- Multiple failed authentication attempts (> 5 in 10 minutes)
- Unusual API usage patterns
- High-value transfer attempts
- API calls from unexpected IP addresses
- Credential expiration warnings (30 days before expiry)

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Brale API Documentation](https://docs.brale.xyz)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

## 🆘 Support

If you discover a security vulnerability, please email security@brale.xyz instead of using the public issue tracker.