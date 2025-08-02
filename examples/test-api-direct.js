/**
 * Test API calls directly with working authentication
 */

const axios = require('axios');

async function testApiDirect() {
  console.log('🌐 Testing Brale API directly...\n');

  const credentials = {
    clientId: process.env.BRALE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.BRALE_CLIENT_SECRET || 'your-client-secret'
  };

  try {
    // Step 1: Get access token
    console.log('✅ Step 1: Getting access token...');
    const authCredentials = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
    
    const authResponse = await axios.post('https://auth.brale.xyz/oauth2/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );
    
    console.log('Token obtained:', authResponse.data.access_token.substring(0, 20) + '...');
    const accessToken = authResponse.data.access_token;
    console.log();

    // Step 2: Test API endpoints
    const apiEndpoints = [
      '/accounts',
      '/accounts?limit=1',
      '/health',
      '/ping',
      '/status',
      '/',
    ];

    for (const endpoint of apiEndpoints) {
      console.log(`Testing: https://api.brale.xyz${endpoint}`);
      
      try {
        const response = await axios.get(`https://api.brale.xyz${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'BraleSDK/1.0.0',
          },
          timeout: 10000,
        });
        
        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Headers:', Object.keys(response.headers));
        console.log('Data sample:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        console.log('---\n');
        break; // Found working endpoint
        
      } catch (error) {
        if (error.response) {
          console.log('❌ FAILED');
          console.log('Status:', error.response.status);
          console.log('Error:', error.response.data);
          
          // If we get a structured error, this is likely the right endpoint
          if (error.response.status === 401) {
            console.log('🔍 This looks like the right endpoint but auth issue');
          } else if (error.response.status === 403) {
            console.log('🔍 This looks like the right endpoint but permission issue');
          } else if (error.response.status === 400) {
            console.log('🔍 This looks like the right endpoint but request format issue');
          }
        } else {
          console.log('❌ NETWORK ERROR:', error.message);
        }
        console.log('---\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testApiDirect().catch(console.error);