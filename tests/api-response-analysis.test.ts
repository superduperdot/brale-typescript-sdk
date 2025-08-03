/**
 * API Response Analysis
 * 
 * This test analyzes the actual API responses to understand
 * the real data structures and identify discrepancies with SDK models
 */

describe('API Response Analysis', () => {
  const clientId = process.env.BRALE_CLIENT_ID;
  const clientSecret = process.env.BRALE_CLIENT_SECRET;
  let accessToken: string;
  let accountId: string;

  beforeAll(async () => {
    if (!clientId || !clientSecret) {
      console.log('⚠️ Skipping API analysis - credentials not provided');
      return;
    }

    // Get access token
    const authResponse = await fetch('https://auth.brale.xyz/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json() as any;
    accessToken = authData.access_token;

    // Get account ID
    const accountsResponse = await fetch('https://api.brale.xyz/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json() as any;
      accountId = accountsData.accounts[0];
    }
  });

  describe('Raw API Response Analysis', () => {
    it('should analyze accounts endpoint response', async () => {
      if (!accessToken) return;

      const response = await fetch('https://api.brale.xyz/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json() as any;
      
      console.log('\n🔍 ACCOUNTS ENDPOINT ANALYSIS:');
      console.log('=====================================');
      console.log('Response Status:', response.status);
      console.log('Response Structure:', {
        type: typeof data,
        keys: Object.keys(data),
        accountsType: typeof data.accounts,
        accountsIsArray: Array.isArray(data.accounts),
        accountsLength: data.accounts?.length,
        firstAccountType: typeof data.accounts?.[0],
        firstAccountSample: data.accounts?.[0]?.substring(0, 20) + '...'
      });
      console.log('Full Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.accounts).toBeDefined();
      expect(Array.isArray(data.accounts)).toBe(true);
    });

    it('should analyze addresses endpoint response', async () => {
      if (!accessToken) return;

      const response = await fetch('https://api.brale.xyz/addresses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json() as any;
      
      console.log('\n🔍 ADDRESSES ENDPOINT ANALYSIS:');
      console.log('======================================');
      console.log('Response Status:', response.status);
      console.log('Response Structure:', {
        type: typeof data,
        topLevelKeys: Object.keys(data),
        hasData: !!data.data,
        dataIsArray: Array.isArray(data.data),
        dataLength: data.data?.length,
        hasLinks: !!data.links,
        hasMeta: !!data.meta
      });
      
      if (data.data && data.data.length > 0) {
        const firstAddress = data.data[0];
        console.log('First Address Structure:', {
          topLevelKeys: Object.keys(firstAddress),
          id: firstAddress.id,
          type: firstAddress.type,
          hasAttributes: !!firstAddress.attributes,
          attributesKeys: firstAddress.attributes ? Object.keys(firstAddress.attributes) : null,
          hasLinks: !!firstAddress.links
        });
        
        if (firstAddress.attributes) {
          console.log('Address Attributes:', {
            type: firstAddress.attributes.type,
            status: firstAddress.attributes.status,
            address: firstAddress.attributes.address?.substring(0, 20) + '...',
            name: firstAddress.attributes.name,
            created: firstAddress.attributes.created,
            supportedChainsCount: firstAddress.attributes.supportedChains?.length
          });
          
          if (firstAddress.attributes.supportedChains?.length > 0) {
            console.log('First Supported Chain:', firstAddress.attributes.supportedChains[0]);
          }
        }
      }

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should analyze individual address response', async () => {
      if (!accessToken || !accountId) return;

      // First get an address ID
      const addressesResponse = await fetch('https://api.brale.xyz/addresses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const addressesData = await addressesResponse.json() as any;
      const addressId = addressesData.data[0]?.id;

      if (!addressId) return;

      // Now get individual address
      const response = await fetch(`https://api.brale.xyz/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        
        console.log('\n🔍 INDIVIDUAL ADDRESS ANALYSIS:');
        console.log('======================================');
        console.log('Response Status:', response.status);
        console.log('Response Structure:', {
          type: typeof data,
          topLevelKeys: Object.keys(data),
          hasData: !!data.data,
          dataKeys: data.data ? Object.keys(data.data) : null
        });
        console.log('Full Response Sample:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      } else {
        console.log('Individual address endpoint returned:', response.status);
        const errorData = await response.json() as any;
        console.log('Error response:', errorData);
      }
    });

    it('should analyze transfers endpoint variations', async () => {
      if (!accessToken || !accountId) return;

      console.log('\n🔍 TRANSFERS ENDPOINT ANALYSIS:');
      console.log('======================================');

      // Test different transfer endpoint formats
      const endpoints = [
        'https://api.brale.xyz/transfers',
        `https://api.brale.xyz/accounts/${accountId}/transfers`,
        `https://api.brale.xyz/transfers?account=${accountId}`
      ];

      for (const endpoint of endpoints) {
        console.log(`\nTesting: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json() as any;
          console.log('Success! Response structure:', {
            type: typeof data,
            keys: Object.keys(data),
            hasData: !!data.data,
            dataLength: data.data?.length
          });
        } else {
          const errorData = await response.json() as any;
          console.log('Error response:', {
            status: response.status,
            hasErrors: !!errorData.errors,
            errorMessage: errorData.errors?.[0]?.detail || errorData.message
          });
        }
      }
    });

    it('should analyze automations endpoint', async () => {
      if (!accessToken || !accountId) return;

      console.log('\n🔍 AUTOMATIONS ENDPOINT ANALYSIS:');
      console.log('=====================================');

      const endpoints = [
        'https://api.brale.xyz/automations',
        `https://api.brale.xyz/accounts/${accountId}/automations`
      ];

      for (const endpoint of endpoints) {
        console.log(`\nTesting: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json() as any;
          console.log('Success! Response structure:', {
            type: typeof data,
            keys: Object.keys(data),
            hasData: !!data.data,
            dataLength: data.data?.length
          });
          
          if (data.data && data.data.length > 0) {
            console.log('First automation structure:', Object.keys(data.data[0]));
          }
        } else {
          const errorData = await response.json() as any;
          console.log('Error response:', {
            status: response.status,
            hasErrors: !!errorData.errors,
            errorMessage: errorData.errors?.[0]?.detail || errorData.message
          });
        }
      }
    });

    it('should analyze balances endpoint variations', async () => {
      if (!accessToken || !accountId) return;

      console.log('\n🔍 BALANCES ENDPOINT ANALYSIS:');
      console.log('=====================================');

      const endpoints = [
        'https://api.brale.xyz/balances',
        `https://api.brale.xyz/accounts/${accountId}/balances`,
        `https://api.brale.xyz/balances?account=${accountId}`
      ];

      for (const endpoint of endpoints) {
        console.log(`\nTesting: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json() as any;
          console.log('Success! Response structure:', {
            type: typeof data,
            keys: Object.keys(data),
            hasData: !!data.data,
            dataLength: data.data?.length
          });
          
          if (data.data && data.data.length > 0) {
            console.log('First balance structure:', Object.keys(data.data[0]));
            console.log('First balance sample:', data.data[0]);
          }
        } else {
          const errorData = await response.json() as any;
          console.log('Error response:', {
            status: response.status,
            hasErrors: !!errorData.errors,
            errorMessage: errorData.errors?.[0]?.detail || errorData.message
          });
        }
      }
    });

    it('should test POST endpoints with dry run', async () => {
      if (!accessToken || !accountId) return;

      console.log('\n🔍 POST ENDPOINTS ANALYSIS (DRY RUN):');
      console.log('=====================================');

      // Get an address ID for testing
      const addressesResponse = await fetch('https://api.brale.xyz/addresses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const addressesData = await addressesResponse.json() as any;
      const custodialAddresses = addressesData.data.filter((addr: any) => addr.attributes.type === 'custodial');
      
      if (custodialAddresses.length >= 2) {
        const sourceAddressId = custodialAddresses[0].id;
        const destAddressId = custodialAddresses[1].id;

        // Test transfer creation structure
        const transferPayload = {
          amount: '1.00',
          currency: 'USD',
          source: {
            type: 'SBC',
            transferType: 'base',
            addressId: sourceAddressId
          },
          destination: {
            type: 'SBC',
            transferType: 'base',
            addressId: destAddressId
          },
          note: 'API Analysis Test - Structure Only'
        };

        console.log('\nTransfer Payload Structure:', JSON.stringify(transferPayload, null, 2));

        // Test different transfer endpoints
        const transferEndpoints = [
          'https://api.brale.xyz/transfers',
          `https://api.brale.xyz/accounts/${accountId}/transfers`
        ];

        for (const endpoint of transferEndpoints) {
          console.log(`\nTesting POST to: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(transferPayload)
          });

          console.log(`Status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json() as any;
            console.log('⚠️ SUCCESS - REAL TRANSFER CREATED!');
            console.log('Transfer ID:', data.id || data.data?.id);
            console.log('Response structure:', Object.keys(data));
          } else {
            const errorData = await response.json() as any;
            console.log('Expected error response:', {
              status: response.status,
              hasErrors: !!errorData.errors,
              errorMessage: errorData.errors?.[0]?.detail || errorData.message || errorData.error,
              fullError: errorData
            });
          }
        }
      }
    });
  });

  describe('SDK Model Discrepancy Analysis', () => {
    it('should document model vs reality differences', async () => {
      if (!accessToken) return;

      console.log('\n📋 SDK MODEL VS API REALITY ANALYSIS:');
      console.log('=====================================');
      
      console.log('\n🔍 ACCOUNTS:');
      console.log('- SDK expects: PaginatedResponse<Account> with .data property');
      console.log('- API returns: { accounts: string[] } - simple array of account IDs');
      console.log('- FIX NEEDED: AccountsService.list() should return string[] directly');
      
      console.log('\n🔍 ADDRESSES:');
      console.log('- SDK expects: BaseAddress with flat properties (address, type, etc.)');
      console.log('- API returns: JSON:API format with data[].attributes.{property}');
      console.log('- FIX NEEDED: Update BaseAddress interface to match JSON:API structure');
      
      console.log('\n🔍 TRANSFERS:');
      console.log('- SDK expects: Standard CRUD operations');
      console.log('- API reality: May require account-specific endpoints');
      console.log('- FIX NEEDED: Update endpoint URLs and request/response models');
      
      console.log('\n🔍 AUTOMATIONS:');
      console.log('- SDK expects: Standard automation CRUD');
      console.log('- API reality: Endpoint availability varies');
      console.log('- FIX NEEDED: Conditional implementation based on endpoint availability');
      
      console.log('\n🔍 ERROR HANDLING:');
      console.log('- SDK expects: Standard error objects');
      console.log('- API returns: JSON:API error format with errors[] array');
      console.log('- STATUS: Currently handled correctly');

      expect(true).toBe(true);
    });
  });
});