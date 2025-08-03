/**
 * Enhanced credential validation and security utilities
 * Based on industry best practices from Stripe, Google Cloud, and security research
 */

export interface CredentialValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}

export class CredentialValidator {
  /**
   * Validate client credentials for security issues
   */
  static validateCredentials(clientId: string, clientSecret: string): CredentialValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for common security anti-patterns
    if (clientId.includes('test') || clientId.includes('demo')) {
      issues.push('Using test/demo credentials in production configuration');
      recommendations.push('Use production credentials for live environments');
    }

    // Brale client secrets can be shorter than typical OAuth secrets
    if (clientSecret.length < 16) {
      issues.push('Client secret appears to be too short');
      recommendations.push('Ensure you\'re using the full client secret from Brale dashboard');
    }

    // Check for environment-based credential exposure
    if (process.env.NODE_ENV === 'development' && !process.env.BRALE_ALLOW_DEV_CREDS) {
      recommendations.push('Consider using separate development credentials');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Secure credential masking for logs
   */
  static maskCredential(credential: string): string {
    if (!credential || credential.length < 8) return '***';
    return credential.substring(0, 4) + '*'.repeat(credential.length - 8) + credential.substring(credential.length - 4);
  }

  /**
   * Check if credentials are potentially exposed
   */
  static detectCredentialExposure(config: any): string[] {
    const exposureRisks: string[] = [];

    // Check if credentials might be in logs
    if (config.debug && (config.clientSecret || config.clientId)) {
      exposureRisks.push('Debug mode enabled with credentials - risk of credential logging');
    }

    return exposureRisks;
  }
}