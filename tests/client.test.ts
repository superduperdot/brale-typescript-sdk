/**
 * Tests for BraleClient
 */

import { BraleClient } from '../src/client';
import { BraleValidationError, BraleAPIError } from '../src/errors/api-error';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock services
jest.mock('../src/services/accounts');
jest.mock('../src/services/transfers');
jest.mock('../src/services/addresses');
jest.mock('../src/services/automations');

describe('BraleClient', () => {
  const validConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default axios mock
    const mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      defaults: {
        headers: {},
        timeout: 30000,
      },
    };
    
    mockedAxios.create.mockReturnValue(mockHttpClient as any);
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = new BraleClient(validConfig);
      
      expect(client).toBeInstanceOf(BraleClient);
      expect(client.accounts).toBeDefined();
      expect(client.transfers).toBeDefined();
      expect(client.addresses).toBeDefined();
      expect(client.automations).toBeDefined();
    });

    it('should merge config with defaults', () => {
      const client = new BraleClient(validConfig);
      const config = client.getConfig();
      
      expect(config.apiUrl).toBe('https://api.brale.xyz');
      expect(config.authUrl).toBe('https://auth.brale.xyz');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.debug).toBe(false);
    });

    it('should use custom config values', () => {
      const customConfig = {
        ...validConfig,
        apiUrl: 'https://custom-api.example.com',
        timeout: 60000,
        debug: true,
      };
      
      const client = new BraleClient(customConfig);
      const config = client.getConfig();
      
      expect(config.apiUrl).toBe('https://custom-api.example.com');
      expect(config.timeout).toBe(60000);
      expect(config.debug).toBe(true);
    });

    it('should throw error for missing clientId', () => {
      expect(() => {
        new BraleClient({
          clientId: '',
          clientSecret: 'test-secret',
        });
      }).toThrow(BraleValidationError);
    });

    it('should throw error for missing clientSecret', () => {
      expect(() => {
        new BraleClient({
          clientId: 'test-id',
          clientSecret: '',
        });
      }).toThrow(BraleValidationError);
    });

    it('should throw error for invalid timeout', () => {
      expect(() => {
        new BraleClient({
          ...validConfig,
          timeout: -1000,
        });
      }).toThrow(BraleValidationError);
    });

    it('should throw error for invalid API URL', () => {
      expect(() => {
        new BraleClient({
          ...validConfig,
          apiUrl: 'not-a-url',
        });
      }).toThrow(BraleValidationError);
    });
  });

  describe('testConnection', () => {
    it('should return success for valid connection', async () => {
      const mockResponse = {
        data: { data: [] },
        headers: {},
      };
      
      const mockHttpClient = {
        get: jest.fn().mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve(mockResponse), 1)
          )
        ),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        defaults: { headers: {}, timeout: 30000 },
      };
      
      mockedAxios.create.mockReturnValue(mockHttpClient as any);
      
      const client = new BraleClient(validConfig);
      const result = await client.testConnection();
      
      expect(result.connected).toBe(true);
      expect(result.authenticated).toBe(true);
      expect(result.latencyMs).toBeGreaterThan(0);
    });

    it('should handle authentication error', async () => {
      const mockError = new BraleAPIError('Unauthorized', 401);
      
      const mockHttpClient = {
        get: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        defaults: { headers: {}, timeout: 30000 },
      };
      
      mockedAxios.create.mockReturnValue(mockHttpClient as any);
      
      const client = new BraleClient(validConfig);
      const result = await client.testConnection();
      
      expect(result.connected).toBe(true);
      expect(result.authenticated).toBe(false);
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network error');
      
      const mockHttpClient = {
        get: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        defaults: { headers: {}, timeout: 30000 },
      };
      
      mockedAxios.create.mockReturnValue(mockHttpClient as any);
      
      const client = new BraleClient(validConfig);
      const result = await client.testConnection();
      
      expect(result.connected).toBe(false);
      expect(result.authenticated).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return config without client secret', () => {
      const client = new BraleClient(validConfig);
      const config = client.getConfig();
      
      expect(config.clientId).toBe(validConfig.clientId);
      expect(config).not.toHaveProperty('clientSecret');
    });
  });

  describe('updateConfig', () => {
    it('should update non-sensitive config values', () => {
      const client = new BraleClient(validConfig);
      
      client.updateConfig({
        timeout: 45000,
        debug: true,
      });
      
      const config = client.getConfig();
      expect(config.timeout).toBe(45000);
      expect(config.debug).toBe(true);
    });

    it('should update HTTP client timeout', () => {
      const mockHttpClient = {
        defaults: { headers: {}, timeout: 30000 },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockHttpClient as any);
      
      const client = new BraleClient(validConfig);
      client.updateConfig({ timeout: 45000 });
      
      expect(mockHttpClient.defaults.timeout).toBe(45000);
    });
  });

  describe('authentication methods', () => {
    let client: BraleClient;
    let mockAuth: any;

    beforeEach(() => {
      client = new BraleClient(validConfig);
      mockAuth = (client as any).auth;
      
      // Mock auth methods
      mockAuth.isAuthenticated = jest.fn();
      mockAuth.getTokenExpiration = jest.fn();
      mockAuth.getAccessToken = jest.fn();
      mockAuth.revokeToken = jest.fn();
      mockAuth.clearToken = jest.fn();
    });

    it('should delegate isAuthenticated to auth', () => {
      mockAuth.isAuthenticated.mockReturnValue(true);
      
      expect(client.isAuthenticated()).toBe(true);
      expect(mockAuth.isAuthenticated).toHaveBeenCalled();
    });

    it('should delegate getTokenExpiration to auth', () => {
      const expiration = new Date();
      mockAuth.getTokenExpiration.mockReturnValue(expiration);
      
      expect(client.getTokenExpiration()).toBe(expiration);
      expect(mockAuth.getTokenExpiration).toHaveBeenCalled();
    });

    it('should delegate refreshToken to auth', async () => {
      mockAuth.getAccessToken.mockResolvedValue('new-token');
      
      const token = await client.refreshToken();
      
      expect(token).toBe('new-token');
      expect(mockAuth.getAccessToken).toHaveBeenCalled();
    });

    it('should delegate revokeToken to auth', async () => {
      mockAuth.revokeToken.mockResolvedValue(undefined);
      
      await client.revokeToken();
      
      expect(mockAuth.revokeToken).toHaveBeenCalled();
    });

    it('should delegate clearToken to auth', () => {
      client.clearToken();
      
      expect(mockAuth.clearToken).toHaveBeenCalled();
    });
  });
});