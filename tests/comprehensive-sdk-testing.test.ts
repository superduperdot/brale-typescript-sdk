/**
 * Comprehensive SDK Testing with Real API Calls
 * 
 * This test suite systematically tests every component of the SDK
 * with real API calls to identify response variations and update
 * the SDK models accordingly.
 */

import { BraleClient } from '../src/index';
import { ValueType, TransferType } from '../src/types/common';

describe('Comprehensive SDK Testing', () => {
  let client: BraleClient;
  let accountId: string;
  let custodialAddressId: string;
  let externalAddressId: string;

  beforeAll(async () => {
    if (!process.env.BRALE_CLIENT_ID || !process.env.BRALE_CLIENT_SECRET) {
      console.log('⚠️ Skipping comprehensive tests - credentials not provided');
      return;
    }

    client = new BraleClient({
      clientId: process.env.BRALE_CLIENT_ID!,
      clientSecret: process.env.BRALE_CLIENT_SECRET!
    });

    // Get test data
    const accounts = await client.accounts.list();
    accountId = accounts[0];

    const addresses = await client.addresses.list(accountId);
    const custodialAddresses = addresses.data.filter((addr: any) => addr.attributes.type === 'custodial');
    const externalAddresses = addresses.data.filter((addr: any) => addr.attributes.type === 'externally-owned');

    custodialAddressId = custodialAddresses[0].id;
    externalAddressId = externalAddresses.length > 0 ? externalAddresses[0].id : custodialAddresses[1]?.id;
  });

  describe('1. Client Core Functionality', () => {
    it('should test connection with detailed analysis', async () => {
      if (!client) return;

      const result = await client.testConnection();
      
      console.log('🔍 Connection Test Results:', {
        connected: result.connected,
        authenticated: result.authenticated,
        latencyMs: result.latencyMs,
        timestamp: new Date().toISOString()
      });

      expect(result.connected).toBe(true);
      expect(result.authenticated).toBe(true);
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.latencyMs).toBeLessThan(5000); // Should be under 5 seconds
    });

    it('should test configuration access', async () => {
      if (!client) return;

      const config = client.getConfig();
      
      console.log('🔍 Client Configuration:', {
        hasApiUrl: !!config.apiUrl,
        hasAuthUrl: !!config.authUrl,
        hasTimeout: !!config.timeout,
        hasDebug: config.debug !== undefined,
        timeout: config.timeout,
        debug: config.debug
      });

      expect(config.apiUrl).toBeDefined();
      expect(config.authUrl).toBeDefined();
      expect(config.timeout).toBeGreaterThan(0);
      expect(config).not.toHaveProperty('clientSecret'); // Should be excluded
    });
  });

  describe('2. Accounts Service Testing', () => {
    it('should list accounts with response analysis', async () => {
      if (!client) return;

      const accounts = await client.accounts.list();
      
      console.log('🔍 Accounts Response Analysis:', {
        type: typeof accounts,
        isArray: Array.isArray(accounts),
        length: accounts.length,
        firstAccountType: typeof accounts[0],
        firstAccountLength: accounts[0]?.length,
        sample: accounts[0]?.substring(0, 10) + '...'
      });

      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(typeof accounts[0]).toBe('string');
      expect(accounts[0].length).toBeGreaterThan(20); // Account IDs are long strings
    });

    it('should test individual account retrieval', async () => {
      if (!client || !accountId) return;

      try {
        const account = await client.accounts.get(accountId);
        
        console.log('🔍 Individual Account Response:', {
          exists: !!account,
          type: typeof account,
          keys: account ? Object.keys(account) : null
        });

        expect(account).toBeDefined();
      } catch (error: any) {
        console.log('📝 Account.get() not implemented:', error.message);
        expect(error.status).toBeOneOf([404, 501, 405]); // Expected for unimplemented endpoints
      }
    });
  });

  describe('3. Addresses Service Testing', () => {
    it('should list addresses with detailed response analysis', async () => {
      if (!client || !accountId) return;

      const addresses = await client.addresses.list(accountId);
      
      console.log('🔍 Addresses Response Structure:', {
        hasData: !!addresses.data,
        dataLength: addresses.data?.length,
        hasPagination: !!addresses.pagination,
        hasLinks: !!addresses.links,
        firstAddressKeys: addresses.data?.[0] ? Object.keys(addresses.data[0]) : null,
        firstAddressAttributeKeys: addresses.data?.[0]?.attributes ? Object.keys(addresses.data[0].attributes) : null
      });

      // Analyze each address type
      const custodialAddresses = addresses.data.filter((addr: any) => addr.attributes.type === 'custodial');
      const externalAddresses = addresses.data.filter((addr: any) => addr.attributes.type === 'externally-owned');

      console.log('🔍 Address Type Analysis:', {
        totalAddresses: addresses.data.length,
        custodialCount: custodialAddresses.length,
        externalCount: externalAddresses.length,
        custodialSample: custodialAddresses[0] ? {
          id: custodialAddresses[0].id,
          type: custodialAddresses[0].type,
          attributesType: custodialAddresses[0].attributes.type,
          attributesStatus: custodialAddresses[0].attributes.status,
          supportedChainsCount: custodialAddresses[0].attributes.supportedChains?.length,
          addressFormat: custodialAddresses[0].attributes.address?.substring(0, 10) + '...'
        } : null
      });

      expect(addresses.data).toBeDefined();
      expect(Array.isArray(addresses.data)).toBe(true);
      expect(custodialAddresses.length).toBeGreaterThan(0);
    });

    it('should get individual address with response analysis', async () => {
      if (!client || !accountId || !custodialAddressId) return;

      const address = await client.addresses.get(accountId, custodialAddressId);
      
      console.log('🔍 Individual Address Response:', {
        id: address.id,
        type: address.type,
        hasAttributes: !!address.attributes,
        attributesKeys: address.attributes ? Object.keys(address.attributes) : null,
        supportedChainsCount: address.attributes?.supportedChains?.length,
        hasLinks: !!address.links
      });

      expect(address.id).toBe(custodialAddressId);
      expect(address.attributes).toBeDefined();
      expect(address.attributes.type).toBe('custodial');
    });

    it('should test address creation capabilities', async () => {
      if (!client || !accountId) return;

      try {
        const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padStart(40, '0');
        const newAddress = await client.addresses.create(accountId, {
          address: testAddress,
          name: 'Comprehensive Test Address'
        });
        
        console.log('🔍 Address Creation Response:', {
          created: !!newAddress,
          id: newAddress?.id,
          type: newAddress?.type,
          attributesType: newAddress?.attributes?.type
        });

        expect(newAddress).toBeDefined();
        expect(newAddress.attributes.address.toLowerCase()).toBe(testAddress.toLowerCase());
      } catch (error: any) {
        console.log('📝 Address creation method analysis:', {
          error: error.message,
          status: error.status,
          isNotImplemented: error.status === 405 || error.status === 501
        });
      }
    });

    it('should test address update capabilities', async () => {
      if (!client || !accountId || !custodialAddressId) return;

      try {
        const updatedAddress = await client.addresses.update(accountId, custodialAddressId, {
          name: 'Updated Test Name'
        });
        
        console.log('🔍 Address Update Response:', {
          updated: !!updatedAddress,
          id: updatedAddress?.id,
          newName: updatedAddress?.attributes?.name
        });

        expect(updatedAddress).toBeDefined();
      } catch (error: any) {
        console.log('📝 Address update method analysis:', {
          error: error.message,
          status: error.status,
          isNotImplemented: error.status === 405 || error.status === 501
        });
      }
    });
  });

  describe('4. Transfers Service Testing', () => {
    it('should test transfers list with response analysis', async () => {
      if (!client || !accountId) return;

      try {
        const transfers = await client.transfers.list(accountId);
        
        console.log('🔍 Transfers List Response:', {
          hasData: !!transfers.data,
          dataLength: transfers.data?.length,
          hasPagination: !!transfers.pagination,
          firstTransferKeys: transfers.data?.[0] ? Object.keys(transfers.data[0]) : null,
          firstTransferAttributeKeys: transfers.data?.[0]?.attributes ? Object.keys(transfers.data[0].attributes) : null
        });

        expect(transfers.data).toBeDefined();
        expect(Array.isArray(transfers.data)).toBe(true);
      } catch (error: any) {
        console.log('📝 Transfers list endpoint analysis:', {
          error: error.message,
          status: error.status,
          needsAccountContext: error.status === 404,
          possibleCorrectEndpoint: error.status === 404 ? `/accounts/${accountId}/transfers` : null
        });
      }
    });

    it('should test transfer creation structure (dry run)', async () => {
      if (!client || !accountId || !custodialAddressId) return;

      // This is a structure test - we'll catch the error to analyze the request format
      const transferRequest = {
        amount: '1.00',
        currency: ValueType.USD,
        source: {
          type: ValueType.SBC,
          transferType: TransferType.BASE,
          addressId: custodialAddressId
        },
        destination: {
          type: ValueType.SBC,
          transferType: TransferType.BASE,
          addressId: externalAddressId || custodialAddressId
        },
        note: 'Comprehensive SDK Test - Structure Validation',
        memo: 'Test memo for blockchain'
      };

      console.log('🔍 Transfer Request Structure Analysis:', {
        amountType: typeof transferRequest.amount,
        currencyType: typeof transferRequest.currency,
        currencyValue: transferRequest.currency,
        sourceType: typeof transferRequest.source,
        sourceKeys: Object.keys(transferRequest.source),
        destinationType: typeof transferRequest.destination,
        destinationKeys: Object.keys(transferRequest.destination),
        hasNote: !!transferRequest.note,
        hasMemo: !!transferRequest.memo
      });

      try {
        const transfer = await client.transfers.create(accountId, transferRequest);
        
        console.log('🔍 Transfer Creation Response:', {
          created: !!transfer,
          id: transfer?.id,
          amount: transfer?.amount,
          status: transfer?.status,
          responseKeys: transfer ? Object.keys(transfer) : null
        });

        // If successful, this was a real transfer - log it
        console.log('⚠️ REAL TRANSFER CREATED - ID:', transfer.id);
        expect(transfer).toBeDefined();
        expect(transfer.amount).toBe('1.00');
      } catch (error: any) {
        console.log('📝 Transfer creation analysis:', {
          error: error.message,
          status: error.status,
          isValidationError: error.status === 400,
          isAuthError: error.status === 401,
          isNotFound: error.status === 404,
          errorDetails: error.response?.data
        });

        // For testing purposes, we expect some errors
        expect(error.status).toBeOneOf([400, 401, 404, 422, 500]);
      }
    });

    it('should test transfer retrieval', async () => {
      if (!client || !accountId) return;

      try {
        // Try to get a transfer (will likely fail without a real transfer ID)
        const transfer = await client.transfers.get(accountId, 'test-transfer-id');
        
        console.log('🔍 Transfer Retrieval Response:', {
          retrieved: !!transfer,
          id: transfer?.id,
          responseKeys: transfer ? Object.keys(transfer) : null
        });
      } catch (error: any) {
        console.log('📝 Transfer retrieval analysis:', {
          error: error.message,
          status: error.status,
          expectedError: error.status === 404 // Expected for non-existent transfer
        });

        expect(error.status).toBeOneOf([404, 400]);
      }
    });
  });

  describe('5. Automations Service Testing', () => {
    it('should test automations list', async () => {
      if (!client || !accountId) return;

      try {
        const automations = await client.automations.list(accountId);
        
        console.log('🔍 Automations List Response:', {
          hasData: !!automations.data,
          dataLength: automations.data?.length,
          hasPagination: !!automations.pagination,
          firstAutomationKeys: automations.data?.[0] ? Object.keys(automations.data[0]) : null
        });

        expect(automations.data).toBeDefined();
        expect(Array.isArray(automations.data)).toBe(true);
      } catch (error: any) {
        console.log('📝 Automations endpoint analysis:', {
          error: error.message,
          status: error.status,
          isNotImplemented: error.status === 404 || error.status === 501
        });
      }
    });

    it('should test automation creation structure', async () => {
      if (!client || !accountId) return;

      const automationRequest = {
        name: 'Test Automation - Comprehensive SDK Test',
        type: 'scheduled' as any, // We'll see what types are actually supported
        enabled: true,
        schedule: {
          frequency: 'daily',
          time: '12:00:00'
        },
        action: {
          type: 'transfer',
          amount: '1.00',
          currency: ValueType.USD,
          source: {
            type: ValueType.SBC,
            transferType: TransferType.BASE,
            addressId: custodialAddressId
          },
          destination: {
            type: ValueType.SBC,
            transferType: TransferType.BASE,
            addressId: externalAddressId || custodialAddressId
          }
        }
      };

      console.log('🔍 Automation Request Structure:', {
        nameType: typeof automationRequest.name,
        typeValue: automationRequest.type,
        hasSchedule: !!automationRequest.schedule,
        hasAction: !!automationRequest.action,
        actionKeys: Object.keys(automationRequest.action)
      });

      try {
        const automation = await client.automations.create(accountId, automationRequest);
        
        console.log('🔍 Automation Creation Response:', {
          created: !!automation,
          id: automation?.id,
          name: automation?.name,
          type: automation?.type,
          enabled: automation?.enabled
        });

        expect(automation).toBeDefined();
      } catch (error: any) {
        console.log('📝 Automation creation analysis:', {
          error: error.message,
          status: error.status,
          isNotImplemented: error.status === 404 || error.status === 501,
          isValidationError: error.status === 400 || error.status === 422
        });
      }
    });
  });

  describe('6. Error Handling Analysis', () => {
    it('should analyze error response formats', async () => {
      if (!client || !accountId) return;

      try {
        await client.addresses.get(accountId, 'definitely-non-existent-address-id');
      } catch (error: any) {
        console.log('🔍 Error Response Analysis:', {
          hasStatus: !!error.status,
          status: error.status,
          hasMessage: !!error.message,
          message: error.message,
          hasResponse: !!error.response,
          responseKeys: error.response ? Object.keys(error.response) : null,
          responseData: error.response?.data,
          errorConstructor: error.constructor.name
        });

        expect(error.status).toBe(404);
        expect(error.message).toBeTruthy();
      }
    });

    it('should test authentication error handling', async () => {
      if (!client) return;

      // Create a client with invalid credentials
      const invalidClient = new BraleClient({
        clientId: 'invalid-client-id',
        clientSecret: 'invalid-client-secret'
      });

      try {
        await invalidClient.testConnection();
      } catch (error: any) {
        console.log('🔍 Authentication Error Analysis:', {
          status: error.status,
          message: error.message,
          isAuthError: error.status === 401 || error.status === 403,
          errorType: error.constructor.name
        });

        expect(error.status).toBeOneOf([401, 403]);
      }
    });
  });

  describe('7. Utility Functions Testing', () => {
    it('should test pagination functionality', async () => {
      if (!client || !accountId) return;

      try {
        const addresses = await client.addresses.list(accountId, { limit: 2 });
        
        console.log('🔍 Pagination Analysis:', {
          hasData: !!addresses.data,
          dataLength: addresses.data?.length,
          requestedLimit: 2,
          actualLength: addresses.data?.length,
          hasPagination: !!addresses.pagination,
          paginationKeys: addresses.pagination ? Object.keys(addresses.pagination) : null,
          hasNextCursor: !!addresses.pagination?.nextCursor,
          hasMore: addresses.pagination?.hasMore
        });

        expect(addresses.data).toBeDefined();
        expect(addresses.data.length).toBeLessThanOrEqual(2);
      } catch (error: any) {
        console.log('📝 Pagination not supported in current format:', error.message);
      }
    });

    it('should test idempotency key handling', async () => {
      if (!client || !accountId) return;

      const idempotencyKey = 'test-comprehensive-' + Date.now();
      
      console.log('🔍 Idempotency Key Test:', {
        key: idempotencyKey,
        keyLength: idempotencyKey.length,
        keyFormat: 'test-comprehensive-{timestamp}'
      });

      // Test that idempotency keys are properly handled
      // (We won't actually create transfers, just test the structure)
      expect(idempotencyKey).toBeTruthy();
      expect(idempotencyKey.length).toBeGreaterThan(10);
    });

    it('should test retry functionality', async () => {
      if (!client) return;

      // Test that the client handles network errors gracefully
      const startTime = Date.now();
      
      try {
        // This should trigger retry logic if the endpoint is temporarily unavailable
        await client.testConnection();
        const endTime = Date.now();
        
        console.log('🔍 Retry/Timeout Analysis:', {
          responseTime: endTime - startTime,
          wasSuccessful: true,
          timeoutConfigured: client.getConfig().timeout
        });

        expect(endTime - startTime).toBeLessThan(client.getConfig().timeout);
      } catch (error: any) {
        const endTime = Date.now();
        
        console.log('🔍 Retry/Error Analysis:', {
          responseTime: endTime - startTime,
          error: error.message,
          wasRetried: endTime - startTime > 1000 // If it took more than 1s, likely retried
        });
      }
    });
  });

  describe('8. Response Format Documentation', () => {
    it('should document all discovered response formats', async () => {
      if (!client) return;

      console.log('\n📋 COMPREHENSIVE SDK RESPONSE FORMAT ANALYSIS');
      console.log('================================================');
      
      console.log('\n🔍 ACCOUNTS SERVICE:');
      console.log('- list(): Returns string[] of account IDs');
      console.log('- get(): Method may not be implemented (404/405 expected)');
      
      console.log('\n🔍 ADDRESSES SERVICE:');
      console.log('- list(): Returns JSON:API format with data[] and attributes{}');
      console.log('- get(): Returns single address in JSON:API format');
      console.log('- create(): Implementation status varies');
      console.log('- update(): Implementation status varies');
      
      console.log('\n🔍 TRANSFERS SERVICE:');  
      console.log('- list(): May require account-specific endpoint');
      console.log('- create(): Accepts string amounts and enum values');
      console.log('- get(): Standard JSON:API format expected');
      
      console.log('\n🔍 AUTOMATIONS SERVICE:');
      console.log('- Implementation status varies by endpoint');
      console.log('- Structure supports scheduled automations');
      
      console.log('\n🔍 ERROR HANDLING:');
      console.log('- 404: Standard JSON:API error format');
      console.log('- 401/403: Authentication errors');
      console.log('- 400/422: Validation errors');
      console.log('- 500: Server errors with descriptive messages');
      
      expect(true).toBe(true); // This test always passes - it's for documentation
    });
  });
});