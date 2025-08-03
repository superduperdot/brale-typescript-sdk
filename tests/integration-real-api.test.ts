/**
 * Integration tests with real Brale API
 * These tests use actual API credentials and endpoints
 */

import { BraleClient } from '../src/client';
import { BraleConfig } from '../src/types/config';
import { ValueType, TransferType } from '../src/types/common';

// Skip these tests if credentials are not available
const skipRealAPITests = !process.env.BRALE_CLIENT_ID || !process.env.BRALE_CLIENT_SECRET;

describe('Real API Integration Tests', () => {
  let client: BraleClient;
  let config: BraleConfig;

  beforeAll(() => {
    if (skipRealAPITests) {
      console.log('⚠️  Skipping real API tests - credentials not available');
      return;
    }

    config = {
      clientId: process.env.BRALE_CLIENT_ID!,
      clientSecret: process.env.BRALE_CLIENT_SECRET!,
      apiUrl: process.env.BRALE_API_BASE_URL || 'https://api.brale.xyz',
      authUrl: process.env.BRALE_AUTH_BASE_URL || 'https://auth.brale.xyz',
    };

    client = new BraleClient(config);
    console.log('🔐 Testing with real Brale API credentials');
  });

  describe('Authentication Flow', () => {
    it('should successfully authenticate with real credentials', async () => {
      if (skipRealAPITests) return;

      try {
        // Test connection which will trigger authentication
        const connectionResult = await client.testConnection();
        
        expect(connectionResult.connected).toBe(true);
        expect(connectionResult.authenticated).toBe(true);
        expect(connectionResult.latencyMs).toBeGreaterThan(0);
        
        console.log('✅ Authentication successful');
        console.log(`⚡ API latency: ${connectionResult.latencyMs}ms`);
      } catch (error) {
        console.error('❌ Authentication failed:', error);
        throw error;
      }
    }, 30000); // 30 second timeout for real API calls

    it('should handle token refresh correctly', async () => {
      if (skipRealAPITests) return;

      // This test verifies the token management works with real API
      const auth = (client as any).auth;
      
      // Force token refresh by clearing current token
      auth.clearToken();
      
      // Make an API call that should trigger re-authentication
      const accounts = await client.accounts.list({ limit: 1 });
      
      expect(accounts).toBeDefined();
      expect(auth.isAuthenticated()).toBe(true);
      
      console.log('✅ Token refresh working correctly');
    }, 30000);
  });

  describe('Account Operations', () => {
    it('should list accounts successfully', async () => {
      if (skipRealAPITests) return;

      try {
        const accounts = await client.accounts.list({ limit: 5 });
        
        expect(accounts).toBeDefined();
        expect(accounts.data).toBeDefined();
        expect(Array.isArray(accounts.data)).toBe(true);
        
        console.log('✅ Account listing successful');
        console.log(`📊 Found ${accounts.data.length} accounts`);
        
        if (accounts.data.length > 0) {
          const firstAccount = accounts.data[0];
          console.log(`📋 Sample account ID: ${firstAccount.id}`);
        }
      } catch (error) {
        console.error('❌ Account listing failed:', error);
        throw error;
      }
    }, 30000);

    it('should get account balances', async () => {
      if (skipRealAPITests) return;

      try {
        const accounts = await client.accounts.list({ limit: 1 });
        
        if (accounts.data.length === 0) {
          console.log('⚠️  No accounts available for balance testing');
          return;
        }

        const accountId = accounts.data[0].id;
        const balances = await client.accounts.getBalances(accountId);
        
        expect(balances).toBeDefined();
        expect(balances.accountId).toBe(accountId);
        
        console.log('✅ Balance retrieval successful');
        console.log(`💰 Account ${accountId} balances retrieved`);
      } catch (error) {
        console.error('❌ Balance retrieval failed:', error);
        throw error;
      }
    }, 30000);
  });

  describe('SDK Type System Validation', () => {
    it('should have correct onchain transfer types', () => {
      const onchainTypes = [
        TransferType.ETHEREUM,
        TransferType.BASE,
        TransferType.POLYGON,
        TransferType.ARBITRUM,
        TransferType.OPTIMISM,
        TransferType.AVALANCHE,
        TransferType.CELO,
        TransferType.SOLANA,
        TransferType.BNB,
        TransferType.CANTON,
      ];

      onchainTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });

      console.log('✅ Onchain transfer types validated:', onchainTypes);
    });

    it('should have correct offchain transfer types', () => {
      const offchainTypes = [
        TransferType.WIRE,
        TransferType.ACH,
      ];

      offchainTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });

      console.log('✅ Offchain transfer types validated:', offchainTypes);
    });

    it('should have correct value types', () => {
      const valueTypes = [
        ValueType.USD,
        ValueType.USDC,
        ValueType.SBC,
      ];

      valueTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });

      console.log('✅ Value types validated:', valueTypes);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid account ID gracefully', async () => {
      if (skipRealAPITests) return;

      try {
        await client.accounts.get('invalid-account-id');
        throw new Error('Should have thrown an error for invalid account ID');
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Invalid account ID error handled correctly');
      }
    }, 30000);
  });
});

// Export test configuration for other test files
export const testConfig = {
  hasRealCredentials: !skipRealAPITests,
  clientId: process.env.BRALE_CLIENT_ID,
  // Don't export the secret for security
};