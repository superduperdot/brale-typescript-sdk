/**
 * Enhanced credential validation and security utilities
 * Based on industry best practices from Stripe, Google Cloud, and security research
 */
export interface CredentialValidationResult {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
}
export declare class CredentialValidator {
    /**
     * Validate client credentials for security issues
     */
    static validateCredentials(clientId: string, clientSecret: string): CredentialValidationResult;
    /**
     * Secure credential masking for logs
     */
    static maskCredential(credential: string): string;
    /**
     * Check if credentials are potentially exposed
     */
    static detectCredentialExposure(config: any): string[];
}
//# sourceMappingURL=credential-validator.d.ts.map