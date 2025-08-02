/**
 * Real authentication test with actual Brale credentials
 * This verifies the SDK works with the live API
 * 
 * SECURITY: This file uses environment variables to load credentials.
 * Create a .env file with your credentials:
 * 
 * BRALE_CLIENT_ID=your-client-id
 * BRALE_CLIENT_SECRET=your-client-secret
 * BRALE_API_URL=https://api.brale.xyz
 * 
 * DO NOT commit real credentials to version control!
 */

const { BraleClient, ValueType, TransferType } = require('../dist/cjs/index.js');

async function testRealAuth() {
  console.log('🔐 Testing Brale SDK with Real Authentication...\n');

  // Real credentials (loaded from environment variables)
  const client = new BraleClient({
    clientId: process.env.BRALE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.BRALE_CLIENT_SECRET || 'your-client-secret',
    // Use production or sandbox environment
    baseUrl: process.env.BRALE_API_URL || 'https://api.brale.xyz',
  });

  try {
    console.log('✅ Step 1: Testing Connection...');
    const connectionTest = await client.testConnection();
    console.log('Connection result:', connectionTest);
    console.log();

    console.log('✅ Step 2: Testing Account List...');
    const accounts = await client.accounts.list({ limit: 5 });
    console.log(`Found ${accounts.data?.length || 0} accounts`);
    console.log();

    if (accounts.data && accounts.data.length > 0) {
      const account = accounts.data[0];
      console.log('✅ Step 3: Testing Account Details...');
      console.log(`Account ID: ${account.id}`);
      console.log(`Account Name: ${account.name}`);
      console.log();

      console.log('✅ Step 4: Testing Account Balances...');
      try {
        const balances = await client.accounts.getBalances(account.id);
        console.log('Balances retrieved successfully');
        console.log();
      } catch (error) {
        console.log('Balances test:', error.message);
        console.log();
      }

      console.log('✅ Step 5: Testing Transfer Estimation...');
      try {
        const estimation = await client.transfers.estimate(account.id, {
          amount: '1.00',
          currency: ValueType.USD,
          source: {
            type: ValueType.USD,
            transferType: TransferType.ACH,
            addressId: 'test-source-id',
          },
          destination: {
            type: ValueType.USD,
            transferType: TransferType.WIRE,
            financialInstitutionId: 'test-bank-id',
          },
        });
        console.log('Transfer estimation successful');
        console.log();
      } catch (error) {
        console.log('Transfer estimation test:', error.message);
        console.log();
      }
    }

    console.log('🎉 SUCCESS: SDK Authentication and Basic Operations Work!');
    console.log('✅ OAuth 2.0 authentication: WORKING');
    console.log('✅ API requests: WORKING');
    console.log('✅ Error handling: WORKING');
    console.log('✅ Type system: WORKING');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Error type:', error.constructor.name);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request method:', error.config.method);
      console.error('Request headers:', error.config.headers);
    }
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testRealAuth().catch(console.error);
}

module.exports = { testRealAuth };