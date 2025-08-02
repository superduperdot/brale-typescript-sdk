/**
 * Tests for BraleAuth
 */

import { BraleAuth } from '../src/auth';
import { BraleAuthError } from '../src/errors/api-error';
import axios, { AxiosInstance } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BraleAuth', () => {
  let auth: BraleAuth;
  let mockHttpClient: jest.Mocked<AxiosInstance>;
  
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authUrl: 'https://auth.test.com',
    timeout: 30000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create proper mock HTTP client with interceptors
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    // Mock axios.create to return our mock client
    mockedAxios.create.mockReturnValue(mockHttpClient);
    
    // Now create the auth instance
    auth = new BraleAuth(mockConfig);
  });

  describe('constructor', () => {
    it('should create auth instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.authUrl,
        timeout: mockConfig.timeout,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'BraleSDK/1.0.0',
        },
      });
    });
  });

  describe('getAccessToken', () => {
    it('should fetch new token on first call', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const token = await auth.getAccessToken();

      expect(token).toBe('test-token');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth2/token', 'grant_type=client_credentials', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }));
    });

    it('should return cached token if valid', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      // First call should fetch token
      const token1 = await auth.getAccessToken();
      // Second call should return cached token
      const token2 = await auth.getAccessToken();

      expect(token1).toBe(token2);
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication error', async () => {
      const mockError = new BraleAuthError('Failed to authenticate with Brale API: invalid_client');

      mockHttpClient.post.mockRejectedValueOnce(mockError);

      await expect(auth.getAccessToken()).rejects.toThrow(BraleAuthError);
    });
  });

  describe('createAuthenticatedClient', () => {
    it('should create client with authentication interceptor', () => {
      const mockClient = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockClient as any);

      auth.createAuthenticatedClient('https://api.test.com', 30000);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com',
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'BraleSDK/1.0.0',
        },
      });

      expect(mockClient.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('revokeToken', () => {
    it('should call revoke endpoint with token', async () => {
      mockHttpClient.post.mockResolvedValueOnce({});

      // Set a stored token first
      (auth as any).storedToken = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      await auth.revokeToken();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth2/revoke', 'token=test-token', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }));
    });

    it('should not fail if no token exists', async () => {
      await expect(auth.revokeToken()).resolves.not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      (auth as any).storedToken = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should return true when token is valid', () => {
      (auth as any).storedToken = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600 * 1000), // Valid for 1 hour
      };

      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe('clearToken', () => {
    it('should clear stored token', () => {
      (auth as any).storedToken = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      auth.clearToken();

      expect((auth as any).storedToken).toBeNull();
    });
  });
});