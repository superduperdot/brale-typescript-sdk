/**
 * OAuth 2.0 Client Credentials authentication for Brale API
 */

import axios, { AxiosInstance } from 'axios';
import { BraleAuthError, BraleNetworkError } from './errors/api-error';
import { CredentialValidator } from './security/credential-validator';
import { CredentialRotationManager, RotationProvider, RotationEvent } from './security/credential-rotation';
import type { AuthConfig } from './types/config';

/**
 * OAuth token response from Brale auth server
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Stored token information with expiration tracking
 */
interface StoredToken {
  accessToken: string;
  tokenType: string;
  expiresAt: Date;
  scope?: string;
}

/**
 * OAuth 2.0 Client Credentials authentication manager
 * 
 * Handles token acquisition, storage, and automatic refresh using the OAuth 2.0
 * Client Credentials grant type for machine-to-machine authentication.
 */
export class BraleAuth {
  private readonly config: AuthConfig;
  private readonly httpClient: AxiosInstance;
  private storedToken: StoredToken | null = null;
  private tokenRefreshPromise: Promise<StoredToken> | null = null;
  private rotationManager: CredentialRotationManager | null = null;

  /**
   * Create a new BraleAuth instance
   * 
   * @param config - Authentication configuration
   */
  constructor(config: AuthConfig) {
    // Validate credentials on initialization
    const validation = CredentialValidator.validateCredentials(config.clientId, config.clientSecret);
    if (!validation.isValid) {
      console.warn('⚠️ Credential validation issues:', validation.issues);
      console.warn('💡 Recommendations:', validation.recommendations);
    }

    // Check for exposure risks
    const exposureRisks = CredentialValidator.detectCredentialExposure(config);
    if (exposureRisks.length > 0) {
      console.warn('🔒 Security warnings:', exposureRisks);
    }

    this.config = config;
    
    this.httpClient = axios.create({
      baseURL: config.authUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'BraleSDK/1.0.0',
      },
    });
    
    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            throw BraleAuthError.fromResponse(
              error.response.status,
              error.response.data,
              error.response.headers['x-request-id'] as string
            );
          }
          throw new BraleNetworkError(
            `Network error during authentication: ${error.message}`,
            error
          );
        }
        throw error;
      }
    );
  }

  /**
   * Get a valid access token, refreshing if necessary
   * 
   * @returns Promise resolving to the access token
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.storedToken && this.isTokenValid(this.storedToken)) {
      return this.storedToken.accessToken;
    }

    // If a refresh is already in progress, wait for it
    if (this.tokenRefreshPromise) {
      const token = await this.tokenRefreshPromise;
      return token.accessToken;
    }

    // Start a new token refresh
    this.tokenRefreshPromise = this.fetchNewToken();
    
    try {
      const token = await this.tokenRefreshPromise;
      return token.accessToken;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Create an authenticated HTTP client with automatic token injection
   * 
   * @param baseURL - Base URL for the API
   * @param timeout - Request timeout in milliseconds
   * @returns Configured axios instance
   */
  createAuthenticatedClient(baseURL: string, timeout: number): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'BraleSDK/1.0.0',
      },
    });

    // Add request interceptor to inject auth token
    client.interceptors.request.use(async (config) => {
      try {
        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    });

    return client;
  }

  /**
   * Revoke the current access token
   */
  async revokeToken(): Promise<void> {
    if (this.storedToken) {
      try {
        const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
        await this.httpClient.post('/oauth2/revoke', 
          `token=${this.storedToken.accessToken}`,
          {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          }
        );
      } catch (error) {
        // Ignore errors during revocation - token might already be invalid
      }
      
      this.storedToken = null;
    }
  }

  /**
   * Clear stored token without revoking
   */
  clearToken(): void {
    this.storedToken = null;
  }

  /**
   * Check if the current token is valid and not expired
   */
  isAuthenticated(): boolean {
    return this.storedToken !== null && this.isTokenValid(this.storedToken);
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    return this.storedToken?.expiresAt || null;
  }

  /**
   * Fetch a new access token using client credentials
   */
  private async fetchNewToken(): Promise<StoredToken> {
    // Use Basic Auth as required by Brale OAuth2 endpoint
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    
    try {
      const response = await this.httpClient.post<TokenResponse>('/oauth2/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );
      const tokenData = response.data;

      // Calculate expiration time with 5-minute buffer
      const expiresAt = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);

      const token: StoredToken = {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresAt,
        scope: tokenData.scope || '',
      };

      this.storedToken = token;
      return token;
    } catch (error) {
      this.storedToken = null;
      
      if (error instanceof BraleAuthError) {
        throw new BraleAuthError(
          `Failed to authenticate with Brale API: ${error.message}`,
          { clientId: this.config.clientId }
        );
      }
      
      throw error;
    }
  }

  /**
   * Check if a token is still valid (not expired)
   */
  private isTokenValid(token: StoredToken): boolean {
    return new Date() < token.expiresAt;
  }

  /**
   * Enable credential rotation monitoring
   * 
   * @param rotationProvider - Provider for fetching new credentials
   * @param config - Rotation configuration options
   */
  enableCredentialRotation(rotationProvider: RotationProvider, config?: { 
    warningThresholdDays?: number; 
    urgentThresholdDays?: number; 
    maxCredentialAgeDays?: number; 
  }): void {
    this.rotationManager = new CredentialRotationManager(config);
    this.rotationManager.setRotationProvider(rotationProvider);
    
    // Register current credentials for monitoring
    this.rotationManager.registerCredentials(this.config.clientId, {
      environment: process.env.NODE_ENV || 'unknown',
      tags: { service: 'brale-api' },
    });

    // Set up event listeners for rotation events
    this.rotationManager.on('rotation_event', (event: RotationEvent) => {
      this.handleRotationEvent(event);
    });

    // Start monitoring
    this.rotationManager.startMonitoring();
  }

  /**
   * Disable credential rotation monitoring
   */
  disableCredentialRotation(): void {
    if (this.rotationManager) {
      this.rotationManager.stopMonitoring();
      this.rotationManager.removeAllListeners();
      this.rotationManager = null;
    }
  }

  /**
   * Get current credential rotation status
   */
  getRotationStatus(): {
    enabled: boolean;
    status?: 'healthy' | 'warning' | 'urgent' | 'expired';
    daysSinceLastRotation?: number;
    daysUntilExpiration?: number;
    lastRotated?: Date;
  } {
    if (!this.rotationManager) {
      return { enabled: false };
    }

    const status = this.rotationManager.getCredentialStatus();
    return {
      enabled: true,
      status: status.status,
      daysSinceLastRotation: status.daysSinceLastRotation,
      daysUntilExpiration: status.daysUntilExpiration,
      lastRotated: status.metadata?.lastRotated,
    };
  }

  /**
   * Manually trigger credential rotation
   * 
   * @returns New credentials that should be used to update the SDK configuration
   */
  async rotateCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    if (!this.rotationManager) {
      throw new Error('Credential rotation is not enabled. Call enableCredentialRotation() first.');
    }

    // Perform the rotation
    const newCredentials = await this.rotationManager.rotateCredentials();

    // Clear any stored tokens since we now have new credentials
    this.clearToken();

    return newCredentials;
  }

  /**
   * Handle rotation events (logging, alerts, etc.)
   */
  private handleRotationEvent(event: RotationEvent): void {
    const logLevel = event.type === 'rotation_failed' ? 'error' : 
                    event.type === 'urgent' ? 'warn' : 'info';

    console[logLevel](`[Brale SDK] Credential Rotation Event: ${event.type}`, {
      message: event.message,
      credentialId: event.credentialId,
      timestamp: event.timestamp,
      context: event.context,
    });

    // In production, you might want to:
    // - Send alerts to monitoring systems
    // - Trigger automated rotation workflows
    // - Update configuration management systems
    // - Notify security teams for urgent/failed rotations
  }
}