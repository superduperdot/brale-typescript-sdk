/**
 * Discover working API endpoints for Brale
 */

const axios = require('axios');

async function discoverEndpoints() {
  console.log('🔍 Discovering Brale API endpoints...\n');

  const credentials = {
    clientId: process.env.BRALE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.BRALE_CLIENT_SECRET || 'your-client-secret'
  };

  try {
    // Get access token
    const authCredentials = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
    const authResponse = await axios.post('https://auth.brale.xyz/oauth2/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );
    
    const accessToken = authResponse.data.access_token;
    console.log('✅ Token obtained\n');

    // Test various account endpoint variations
    const accountEndpoints = [
      '/accounts',
      '/account',
      '/users',
      '/user',
      '/profile',
      '/me',
      '/client',
      '/client/accounts',
      '/client/account',
      '/api/accounts',
      '/api/account',
      '/v1/accounts',
      '/v1/account',
      '/',
    ];

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'BraleSDK/1.0.0',
    };

    for (const endpoint of accountEndpoints) {
      console.log(`Testing: https://api.brale.xyz${endpoint}`);
      
      try {
        const response = await axios.get(`https://api.brale.xyz${endpoint}`, {
          headers,
          timeout: 5000,
        });
        
        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('='.repeat(50));
        
      } catch (error) {
        let status = 'UNKNOWN';
        let errorData = 'No response';
        
        if (error.response) {
          status = error.response.status;
          errorData = error.response.data;
          
          // Log interesting non-404 errors
          if (status !== 404) {
            console.log(`❌ FAILED - Status: ${status}`);
            console.log('Error data:', JSON.stringify(errorData, null, 2));
            console.log('---');
          } else {
            console.log(`❌ 404 - Not found`);
          }
        } else {
          console.log('❌ NETWORK ERROR:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
  }
}

discoverEndpoints().catch(console.error);