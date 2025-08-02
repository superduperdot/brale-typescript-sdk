# Brale TypeScript SDK

**Unofficial TypeScript SDK for the Brale API** - A comprehensive, type-safe client for interacting with Brale's digital asset infrastructure platform.

> ⚠️ **Important**: This is an unofficial, community-developed SDK. It is not officially supported or endorsed by Brale. Use at your own discretion and ensure compliance with Brale's terms of service.

This SDK provides type-safe access to Brale's stablecoin issuance platform, enabling developers to integrate accounts, transfers, addresses, and automation flows with precision and excellent developer experience.

[![npm version](https://badge.fury.io/js/@brale/sdk.svg)](https://badge.fury.io/js/@brale/sdk)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Key Concepts](#key-concepts)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
  - [Accounts](#accounts)
  - [Transfers](#transfers)
  - [Addresses](#addresses)
  - [Automations](#automations)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔐 **OAuth 2.0 Client Credentials Flow** - Secure machine-to-machine authentication
- 💰 **Precise Decimal Arithmetic** - Uses `decimal.js` for accurate monetary calculations
- 🔄 **Automatic Retry Logic** - Built-in exponential backoff for transient failures
- 🔑 **Idempotency Support** - Prevents duplicate operations with automatic key generation
- 📄 **Pagination Handling** - Automatic pagination with iterator support
- 🛡️ **Type Safety** - Full TypeScript support with strict typing
- 🌐 **Multi-Network Support** - Supports all onchain and offchain transfer types
- 💱 **All Value Types** - Handles USD, USDC, SBC, and other stablecoins (Value Types)
- 🤖 **Smart Recovery** - Automatic cross-chain transfers and balance optimization
- ⚡ **High Performance** - Optimized for production use with connection pooling
- 📚 **Comprehensive Documentation** - Complete API reference and real-world examples

## Installation

```bash
npm install @brale/sdk

# Note: This installs the unofficial community SDK
```

Or with yarn:

```bash
yarn add @brale/sdk
```

## Quick Start

```typescript
import { BraleClient } from '@brale/sdk';

// Initialize the client
const client = new BraleClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Create a simple transfer
async function sendStablecoins() {
  try {
    // Get your account
    const accounts = await client.accounts.list();
    const account = accounts.data[0];

    if (!account) {
      throw new Error('No accounts found');
    }

    // Send 100 SBC to an external wallet on Base network
    const transfer = await client.transfers.simpleTransfer(
      account.id,
      '100',                                    // Amount
      '0x742d35Cc6634C0532925a3b8D46e6a3C8b5c2442', // Destination address
      'SBC',                                    // Value type (form of money)
      'base',                                   // Transfer type (onchain network)
      {
        note: 'Payment for services',
        smartRecovery: true, // Enable automatic funding if insufficient balance
      }
    );

    console.log('Transfer created:', transfer.id);
    console.log('Status:', transfer.status);
  } catch (error) {
    console.error('Transfer failed:', error);
  }
}

sendStablecoins();
```

## Key Concepts

Understanding Brale's API terminology is crucial for effective SDK usage:

### Transfer Types vs Value Types

- **Transfer Types**: Onchain and offchain transfer methods
  - **Onchain**: Blockchain networks (`ethereum`, `base`, `polygon`, `arbitrum`, etc.)
  - **Offchain**: Traditional payment rails (`wire`, `ach`, etc.)
- **Value Types**: Forms of money (`USD`, `USDC`, `SBC`, or other stablecoin names)

```typescript
// Transfer Types = HOW money moves (onchain vs offchain)
// Value Types = WHAT form of money (the currency or asset)

await client.transfers.create('account-id', {
  amount: '100',
  currency: 'SBC',                    // Value Type (what)
  source: {
    type: 'SBC',                      // Value Type
    transferType: 'canton',           // Transfer Type (onchain network)
    addressId: 'source-address-id',
  },
  destination: {
    type: 'SBC',                      // Value Type  
    transferType: 'base',             // Transfer Type (onchain network)
    addressId: 'dest-address-id',
  },
});
```

### Account ID vs Address ID

A common source of confusion is the distinction between `account_id` and `address_id`:

- **Account ID**: Your main Brale account (like a bank account)
- **Address ID**: Specific blockchain addresses within that account (like account numbers)

```typescript
// ✅ Correct: Get balances for an account
const balances = await client.accounts.getBalances('account-id');

// ✅ Correct: Get details of a specific address within that account  
const address = await client.addresses.get('account-id', 'address-id');

// ✅ Correct: Create transfer between addresses
const transfer = await client.transfers.create('account-id', {
  // ... transfer details
});
```

### Development Tips

- **CORS in Development**: When testing locally, you may encounter CORS issues. The Brale API is designed for server-to-server communication.
- **Idempotency**: Always use idempotency keys for transfer operations to prevent duplicates
- **Smart Recovery**: Enable smart recovery for automatic cross-chain funding when balances are insufficient
- **Onchain vs Offchain**: Choose the right transfer type based on your needs:
  - **Onchain**: For blockchain transfers (faster, programmable, global)
  - **Offchain**: For traditional banking (ACH, wire transfers)

## Authentication

The SDK uses OAuth 2.0 Client Credentials flow for authentication. Get your credentials from the [Brale Dashboard](https://app.brale.xyz):

```typescript
import { BraleClient } from '@brale/sdk';

const client = new BraleClient({
  clientId: process.env.BRALE_CLIENT_ID!,
  clientSecret: process.env.BRALE_CLIENT_SECRET!,
  // Optional: customize API endpoints
  apiUrl: 'https://api.brale.xyz',    // Production (default)
  authUrl: 'https://auth.brale.xyz',  // Production (default)
});

// Test connection
const status = await client.testConnection();
console.log('Connected:', status.connected);
console.log('Authenticated:', status.authenticated);
```

## Usage Examples

### Accounts

```typescript
// List all accounts
const accounts = await client.accounts.list();
console.log('Accounts:', accounts.data.length);

// Get a specific account
const account = await client.accounts.get('account-id');
console.log('Account:', account.name);

// Get account balances
const balances = await client.accounts.getBalances('account-id');
console.log('Total value:', balances.totalValueUsd);

// Create a new account
const newAccount = await client.accounts.create({
  name: 'My Business Account',
  type: 'business',
  metadata: {
    department: 'treasury',
    costCenter: 'CC-001',
  },
});

// Update account settings
const updatedAccount = await client.accounts.update('account-id', {
  name: 'Updated Account Name',
  settings: {
    defaultCurrency: 'SBC',
    notifications: {
      email: true,
      transactions: true,
    },
  },
});
```

### Transfers

```typescript
// Simple external wallet transfer
const transfer = await client.transfers.simpleTransfer(
  'account-id',
  '250.50',                           // Amount
  '0x742d35Cc6634C0532925a3b8D46e6a3C8b5c2442', // Destination address
  'SBC',                              // Value type (form of money)
  'base',                             // Transfer type (onchain network)
  {
    note: 'Supplier payment',
    memo: 'INV-2024-001',
    smartRecovery: true,
  }
);

// Advanced transfer creation
const advancedTransfer = await client.transfers.create('account-id', {
  amount: '1000',
  currency: 'SBC',
  source: {
    type: 'SBC',                      // Value type (form of money)
    transferType: 'canton',           // Transfer type (source onchain network)
    addressId: 'internal-address-id',
  },
  destination: {
    type: 'SBC',                      // Value type (form of money)
    transferType: 'base',             // Transfer type (destination onchain network)
    addressId: 'external-address-id',
  },
  note: 'Cross-chain transfer',
  smartRecovery: true,
  idempotencyKey: 'my-unique-key-123',
});

// Estimate transfer costs (onchain to onchain)
const estimation = await client.transfers.estimate('account-id', {
  amount: '100',
  currency: 'SBC',
  source: {
    type: 'SBC',
    transferType: 'base',                 // Onchain network
    addressId: 'source-address-id',
  },
  destination: {
    type: 'SBC',
    transferType: 'ethereum',             // Onchain network
    addressId: 'dest-address-id',
  },
});

console.log('Estimated fees:', estimation.fees);
console.log('Total cost:', estimation.totalCost.toString());
console.log('Sufficient balance:', estimation.sufficientBalance);

// List transfers with filters
const transfers = await client.transfers.list('account-id', {
  status: ['completed', 'pending'],
  currency: 'SBC',
  minAmount: '100',
  createdAfter: new Date('2024-01-01'),
}, {
  limit: 50,
  offset: 0,
});

// Get transfer details
const transferDetails = await client.transfers.get('account-id', 'transfer-id');
console.log('Transfer status:', transferDetails.status);
console.log('Transaction hash:', transferDetails.metadata?.transactionHash);

// Cancel a pending transfer
const cancelledTransfer = await client.transfers.cancel('account-id', 'transfer-id');

// Retry a failed transfer
const retriedTransfer = await client.transfers.retry('account-id', 'transfer-id');
```

### Addresses

```typescript
// List all addresses
const addresses = await client.addresses.list('account-id');
console.log('Total addresses:', addresses.data.length);

// Get internal (custodial) addresses
const internalAddresses = await client.addresses.listInternal('account-id');
console.log('Internal addresses:', internalAddresses.data.length);

// Get external addresses
const externalAddresses = await client.addresses.listExternal('account-id', {
  network: 'base',
  verified: true,
});

// Create external address for transfers
const externalAddress = await client.addresses.createExternal('account-id', {
  address: '0x742d35Cc6634C0532925a3b8D46e6a3C8b5c2442',
  network: 'base',
  label: 'Supplier Wallet',
  whitelist: true,
});

// Get shareable addresses for receiving funds
const sharableAddresses = await client.addresses.getSharable('account-id', 'base');
console.log('Base network addresses:', sharableAddresses);

// Validate an address
const validation = await client.addresses.validate(
  '0x742d35Cc6634C0532925a3b8D46e6a3C8b5c2442',
  'ethereum'
);
console.log('Valid address:', validation.valid);
console.log('Network:', validation.network);

// Find or create external address
const address = await client.addresses.findOrCreateExternal(
  'account-id',
  '0x742d35Cc6634C0532925a3b8D46e6a3C8b5c2442',
  'base',
  'Partner Wallet'
);

// Get address with balances
const addressWithBalance = await client.addresses.getWithBalances('account-id', 'address-id');
console.log('Address balances:', addressWithBalance.balances);
```

### Automations

```typescript
// Create a scheduled transfer automation
const automation = await client.automations.create('account-id', {
  name: 'Monthly Supplier Payment',
  description: 'Automated monthly payment to supplier',
  type: 'scheduled_transfer',
  triggers: [{
    type: 'scheduled',
    config: {
      schedule: '0 0 1 * *', // First day of every month
      timezone: 'UTC',
    },
  }],
  conditions: [{
    type: 'balance_check',
    config: {
      token: 'SBC',
      network: 'base',
      minBalance: '1000',
    },
    operator: 'AND',
  }],
  actions: [{
    type: 'transfer',
    config: {
      amount: '500',
      currency: 'SBC',
      source: {
        type: 'SBC',
        transferType: 'base',
      },
      destination: {
        type: 'SBC',
        transferType: 'base',
        addressId: 'supplier-address-id',
      },
      note: 'Automated monthly payment',
      smartRecovery: true,
    },
    order: 1,
  }],
  config: {
    maxExecutionsPerDay: 1,
    notifications: {
      onSuccess: true,
      onFailure: true,
    },
  },
});

// Start the automation
const activeAutomation = await client.automations.start('account-id', automation.id);

// Create a balance rebalancing automation
const rebalancer = await client.automations.create('account-id', {
  name: 'Cross-Chain Rebalancer',
  type: 'balance_rebalancing',
  triggers: [{
    type: 'balance_threshold',
    config: {
      token: 'SBC',
      network: 'canton',
      thresholdType: 'maximum',
      threshold: '10000',
    },
  }],
  actions: [{
    type: 'transfer',
    config: {
      amount: {
        type: 'percentage',
        base: 'balance',
        percentage: '50',
        reference: {
          token: 'SBC',
          network: 'canton',
        },
      },
      currency: 'SBC',
      source: {
        type: 'SBC',
        transferType: 'canton',
      },
      destination: {
        type: 'SBC',
        transferType: 'base',
      },
    },
    order: 1,
  }],
});

// List automations
const automations = await client.automations.list('account-id', {
  status: 'active',
  type: 'scheduled_transfer',
});

// Get execution history
const executions = await client.automations.getExecutions('account-id', 'automation-id');
console.log('Recent executions:', executions.data.length);

// Manually trigger an automation
const execution = await client.automations.trigger('account-id', 'automation-id');
console.log('Execution result:', execution.status);

// Pause automation for maintenance
const pausedAutomation = await client.automations.pause('account-id', 'automation-id', 3600); // 1 hour

// Test automation configuration
const testResult = await client.automations.test('account-id', {
  name: 'Test Automation',
  type: 'scheduled_transfer',
  triggers: [/* ... */],
  actions: [/* ... */],
});
console.log('Configuration valid:', testResult.valid);
console.log('Estimated cost:', testResult.estimatedCost);
```

## Configuration

### Full Configuration Options

```typescript
const client = new BraleClient({
  // Required
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  
  // Optional
  apiUrl: 'https://api.brale.xyz',        // API base URL
  authUrl: 'https://auth.brale.xyz',      // Auth server URL
  timeout: 30000,                         // Request timeout (ms)
  maxRetries: 3,                          // Max retry attempts
  userAgent: 'MyApp/1.0.0',              // Custom user agent
  debug: false,                           // Enable debug logging
});

// Update configuration at runtime
client.updateConfig({
  timeout: 60000,
  debug: true,
});
```

### Environment Variables

```bash
# .env file
BRALE_CLIENT_ID=your-client-id
BRALE_CLIENT_SECRET=your-client-secret
BRALE_API_URL=https://api.brale.xyz
BRALE_AUTH_URL=https://auth.brale.xyz
```

```typescript
import { BraleClient } from '@brale/sdk';

const client = new BraleClient({
  clientId: process.env.BRALE_CLIENT_ID!,
  clientSecret: process.env.BRALE_CLIENT_SECRET!,
  apiUrl: process.env.BRALE_API_URL,
  authUrl: process.env.BRALE_AUTH_URL,
});
```

## Error Handling

The SDK provides comprehensive error handling with typed error classes:

```typescript
import { 
  BraleAPIError, 
  BraleAuthError, 
  BraleValidationError, 
  BraleRateLimitError,
  BraleNetworkError 
} from '@brale/sdk';

try {
  const transfer = await client.transfers.create('account-id', {
    amount: 'invalid-amount',
    currency: 'SBC',
    // ... other fields
  });
} catch (error) {
  if (error instanceof BraleValidationError) {
    console.error('Validation error:', error.message);
    console.error('Context:', error.context);
  } else if (error instanceof BraleAuthError) {
    console.error('Authentication failed:', error.message);
    // Refresh credentials or re-authenticate
  } else if (error instanceof BraleRateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
    // Implement exponential backoff
  } else if (error instanceof BraleAPIError) {
    console.error('API error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Request ID:', error.requestId);
    
    if (error.isRetryable()) {
      // Implement retry logic
    }
  } else if (error instanceof BraleNetworkError) {
    console.error('Network error:', error.message);
    console.error('Original error:', error.originalError);
  }
}
```

## Pagination

The SDK provides multiple ways to handle paginated responses:

```typescript
// Manual pagination
const firstPage = await client.transfers.list('account-id', {}, { limit: 20, offset: 0 });
const secondPage = await client.transfers.list('account-id', {}, { limit: 20, offset: 20 });

// Using pagination iterator
import { PaginatedIterator } from '@brale/sdk';

const iterator = new PaginatedIterator(
  (params) => client.transfers.list('account-id', {}, params),
  { limit: 50 }
);

// Iterate through all pages
for await (const transfers of iterator) {
  console.log(`Processing ${transfers.length} transfers`);
  
  for (const transfer of transfers) {
    console.log(`Transfer ${transfer.id}: ${transfer.status}`);
  }
}

// Get all items at once (use with caution for large datasets)
const allTransfers = await iterator.all(10); // Max 10 pages
console.log(`Total transfers: ${allTransfers.length}`);
```

## Using with Decimal.js

The SDK uses `decimal.js` for all monetary calculations to ensure precision:

```typescript
import { Amount } from '@brale/sdk';

// Create amounts
const amount1 = new Amount('100.50', 'SBC');
const amount2 = new Amount('25.25', 'SBC');

// Perform calculations
const sum = amount1.add(amount2);       // 125.75 SBC
const difference = amount1.subtract(amount2); // 75.25 SBC
const doubled = amount1.multiply(2);     // 201.00 SBC

// Comparisons
console.log(amount1.greaterThan(amount2)); // true
console.log(amount1.equals(new Amount('100.50', 'SBC'))); // true

// Convert to different formats
console.log(sum.toString());     // "125.75"
console.log(sum.toFixed(2));     // "125.75"
console.log(sum.toNumber());     // 125.75 (use with caution)

// JSON serialization
const json = amount1.toJSON();
const restored = Amount.fromJSON(json);
```

## Testing

The SDK includes comprehensive test coverage. Run tests with:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Mocking the SDK

For testing your application that uses the SDK:

```typescript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@brale/sdk$': '<rootDir>/__mocks__/@brale/sdk.ts',
  },
};

// __mocks__/@brale/sdk.ts
export const BraleClient = jest.fn().mockImplementation(() => ({
  accounts: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    get: jest.fn().mockResolvedValue({ id: 'test-account' }),
  },
  transfers: {
    create: jest.fn().mockResolvedValue({ 
      id: 'test-transfer', 
      status: 'pending' 
    }),
    simpleTransfer: jest.fn().mockResolvedValue({ 
      id: 'test-transfer', 
      status: 'pending' 
    }),
  },
  // ... other services
}));
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Brale-xyz/brale-typescript-api-sdk.git
cd brale-typescript-api-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build the SDK
npm run build

# Lint code
npm run lint
npm run lint:fix
```

## Disclaimer & Legal

⚠️ **This is an unofficial SDK developed by the community and is not endorsed, supported, or maintained by Brale.**

### Important Considerations

- **No Official Support**: This SDK is not officially supported by Brale. For official API support, contact Brale directly.
- **Use at Your Own Risk**: While this SDK is thoroughly tested, use it at your own discretion in production environments.
- **Terms of Service**: Ensure your usage complies with [Brale's Terms of Service](https://docs.brale.xyz/terms).
- **API Changes**: Brale may update their API without notice. This unofficial SDK may not immediately reflect those changes.
- **Community Maintained**: Updates and maintenance depend on community contributions.

### Reporting Issues

For issues with this unofficial SDK:
- 🐛 **SDK Issues**: [GitHub Issues](https://github.com/Brale-xyz/brale-typescript-api-sdk/issues)

For official Brale API issues:
- 📧 **Contact Brale**: [support@brale.xyz](mailto:support@brale.xyz)

## Support & Resources

- 📚 **Brale Documentation**: [https://docs.brale.xyz](https://docs.brale.xyz)
- 🔗 **API Reference**: [https://docs.brale.xyz/reference](https://docs.brale.xyz/reference) 
- 🏠 **Brale Dashboard**: [https://app.brale.xyz](https://app.brale.xyz)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Stablecoins are for everyone.