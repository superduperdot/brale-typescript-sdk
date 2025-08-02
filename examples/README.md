# Examples

This directory contains example scripts demonstrating how to use the Brale SDK.

## Files

- `demo-sdk-working.js` - Basic SDK demonstration
- `test-auth-only.js` - Authentication testing example  
- `test-api-direct.js` - Direct API calls example
- `test-api-discovery.js` - API discovery example
- `test-real-auth.js` - Real authentication example (requires credentials)
- `test-working-api.js` - Working API example

## Usage

Before running examples that require authentication:

1. Create a `.env` file in the project root:
```bash
BRALE_CLIENT_ID=your-client-id
BRALE_CLIENT_SECRET=your-client-secret
BRALE_API_URL=https://api.brale.xyz
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run an example:
```bash
node examples/demo-sdk-working.js
```

## Security Note

Never commit real credentials to version control. Always use environment variables for sensitive data.