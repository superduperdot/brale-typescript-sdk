# Examples

This directory contains comprehensive working examples of how to use the Brale TypeScript SDK.

## 🚀 Featured Examples

### CLI Automation Manager (`cli-automation-manager.js`)
**A complete end-to-end CLI application demonstrating:**
- Environment configuration and validation
- Authentication and connection testing  
- Account and automation management
- Error handling and recovery patterns
- Real-world CLI UX with colors and progress indicators

```bash
# Make executable
chmod +x examples/cli-automation-manager.js

# List automations
node examples/cli-automation-manager.js list --account-id=your-account-id

# Create daily transfer automation
node examples/cli-automation-manager.js create \
  --account-id=your-account-id \
  --amount=100.00 \
  --destination=0x1234...

# Check automation status
node examples/cli-automation-manager.js status \
  --automation-id=auto-123 \
  --account-id=your-account-id

# Pause/resume automations
node examples/cli-automation-manager.js pause --automation-id=auto-123 --account-id=your-account-id
node examples/cli-automation-manager.js resume --automation-id=auto-123 --account-id=your-account-id
```

## 📚 Basic Examples

- `demo-sdk-working.js` - Basic SDK demonstration
- `test-auth-only.js` - Authentication testing example  
- `test-api-direct.js` - Direct API calls example
- `test-api-discovery.js` - API discovery example
- `test-real-auth.js` - Real authentication example (requires credentials)
- `test-working-api.js` - Working API example

## 🔒 Security & Environment Setup

All examples use environment variables for secure credential management:

```bash
# Required environment variables
export BRALE_CLIENT_ID="your-client-id"
export BRALE_CLIENT_SECRET="your-client-secret"
export BRALE_ENVIRONMENT="sandbox"  # or "production"

# Optional debugging
export DEBUG="true"
```

### Environment File (.env)
Create a `.env` file in the project root:

```env
BRALE_CLIENT_ID=your-client-id-here
BRALE_CLIENT_SECRET=your-client-secret-here
BRALE_ENVIRONMENT=sandbox
DEBUG=false
```

## 🏗️ Building and Running

```bash
# Build the SDK first
npm run build

# Run any example
node examples/cli-automation-manager.js help
node examples/demo-sdk-working.js
```

## 📖 Learning Path

1. **Start with**: `demo-sdk-working.js` - Basic SDK usage
2. **Authentication**: `test-real-auth.js` - OAuth flow
3. **API Patterns**: `test-working-api.js` - Common operations
4. **Production Ready**: `cli-automation-manager.js` - Complete application

## 🔧 Troubleshooting

### Common Issues

**"Cannot find module" errors:**
```bash
npm run build  # Build the SDK first
```

**Authentication failures:**
```bash
# Verify your credentials
echo $BRALE_CLIENT_ID
echo $BRALE_CLIENT_SECRET
```

**Network issues:**
```bash
# Test connection
node -e "console.log(process.env.BRALE_ENVIRONMENT || 'sandbox')"
```

## 💡 Best Practices Demonstrated

- ✅ Environment variable configuration
- ✅ Proper error handling with typed errors
- ✅ Connection testing before operations
- ✅ Idempotency key management
- ✅ Pagination handling
- ✅ Decimal precision for financial amounts
- ✅ CLI UX patterns (colors, progress, help)
- ✅ Graceful shutdown and cleanup

## 🚨 Security Reminders

- Never commit credentials to version control
- Use environment variables or secure secret management
- Validate all inputs in production applications
- Implement proper error handling and logging
- Test with sandbox environment first