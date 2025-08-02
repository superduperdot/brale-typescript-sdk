/**
 * Test only the authentication part of the SDK
 */

const { BraleClient } = require('../dist/cjs/index.js');

async function testAuthOnly() {
  console.log('🔐 Testing Brale SDK Authentication Only...\n');

  const client = new BraleClient({
    clientId: process.env.BRALE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.BRALE_CLIENT_SECRET || 'your-client-secret',
  });

  try {
    console.log('✅ Step 1: Getting access token directly...');
    const token = await client.auth.getAccessToken();
    console.log('✅ SUCCESS!');
    console.log('Access token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);
    console.log();

    console.log('✅ Step 2: Checking token expiration...');
    const expiration = client.auth.getTokenExpiration();
    console.log('Token expires at:', expiration);
    console.log();

    console.log('🎉 Authentication is working correctly!');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.error('Error details:', {
      name: error.constructor.name,
      status: error.status,
      code: error.code,
      context: error.context
    });
    
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
    
    process.exit(1);
  }
}

testAuthOnly().catch(console.error);