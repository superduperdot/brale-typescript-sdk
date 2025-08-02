# Testing Guide for Brale TypeScript SDK

This document outlines the comprehensive testing strategy for ensuring the Brale SDK works properly in production environments.

## 🧪 Testing Strategy Overview

### Test Types & Coverage
- **Unit Tests**: ~905 lines across 3 test suites
- **Integration Tests**: End-to-end workflow testing  
- **Smoke Tests**: Quick functionality verification
- **Type Safety**: TypeScript compilation validation
- **Build Tests**: Package integrity verification

## 🚀 Quick Test Commands

### Essential Tests (Run Before Release)
```bash
# Complete test suite
npm run test:comprehensive

# Individual test types
npm run test:smoke          # Quick functionality check
npm run test:unit           # Core unit tests
npm run test:integration    # End-to-end workflows
npm run typecheck           # TypeScript validation
npm run audit:security      # Security vulnerability check
```

### Development Tests
```bash
# Watch mode for development
npm run test:watch

# Code coverage analysis
npm run test:coverage

# Lint checking
npm run lint
npm run lint:fix
```

## 📋 Test Categories

### 1. Unit Tests (`tests/*.test.ts`)

**Authentication Tests** (`auth.test.ts`)
- OAuth 2.0 client credentials flow
- Token storage and refresh logic
- Error handling for auth failures

**Transfer Tests** (`transfers.test.ts`)  
- CRUD operations for transfers
- Input validation
- Cost estimation
- Retry and cancellation logic

**Client Tests** (`client.test.ts`)
- SDK initialization
- Configuration validation
- Connection testing

### 2. Integration Tests (`tests/integration.test.ts`)

**End-to-End Workflows**
- Complete transfer workflow (list accounts → create transfer)
- Error handling integration
- Rate limiting with retry logic

**Type Safety Integration**
- Onchain/offchain transfer type enforcement
- Value type validation
- Mixed transfer scenarios

### 3. Smoke Tests (`tests/smoke.test.ts`)

**Quick Verification**
- SDK exports and imports
- Client initialization
- Terminology compliance (onchain vs offchain)

### 4. Build & Package Tests

**TypeScript Compilation**
```bash
npm run typecheck
```

**Build Outputs**
```bash
npm run build:cjs          # CommonJS build
npm run build:esm          # ES Module build  
npm run build:types        # Type definitions
```

**Package Integrity**
```bash
npm pack --dry-run         # Verify package contents
```

## 🛡️ Production Readiness Checklist

### Before Deployment
- [ ] All unit tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] All build targets work (`npm run build`)
- [ ] Security audit passes (`npm run audit:security`)
- [ ] Integration tests pass (`npm run test:integration`)

### Before Publishing to NPM
- [ ] Comprehensive test suite passes (`npm run test:comprehensive`)
- [ ] Package builds successfully (`npm pack`)
- [ ] Import/export verification works
- [ ] Documentation is up to date

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript support via `ts-jest`
- Test environment: Node.js
- Coverage reporting enabled
- Mock support for axios and external dependencies

### TypeScript Test Configuration
- Strict mode enabled for maximum type safety
- Module resolution set to Node.js
- Declaration files generated for type checking

## 🐛 Debugging Test Issues

### Common Issues & Solutions

**TypeScript Compilation Errors**
```bash
# Check for strict mode issues
npx tsc --noEmit --strict

# Fix import/export issues
npm run lint:fix
```

**Jest Test Failures**
```bash
# Run specific test file
npm test -- tests/auth.test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots if needed
npm test -- --updateSnapshot
```

**Build Failures**
```bash
# Clean and rebuild
npm run clean && npm run build

# Check for missing dependencies
npm run audit:deps
```

## 📊 Test Metrics

### Current Coverage
- **Unit Tests**: 3 test suites, ~905 lines of test code
- **Mock Coverage**: Complete API response mocking
- **Error Scenarios**: Authentication, rate limiting, validation failures
- **Type Safety**: Comprehensive enum and interface testing

### Performance Benchmarks
- **Test Execution**: < 5 seconds for full suite
- **Build Time**: < 30 seconds for all targets
- **Bundle Size**: Monitor via bundlesize (if configured)

## 🎯 Testing Best Practices

### Writing New Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Mock External Dependencies**: Use Jest mocks for axios/HTTP calls
3. **Test Edge Cases**: Error conditions, edge inputs, boundary conditions
4. **Verify Types**: Ensure TypeScript types are correctly enforced
5. **Test Real Workflows**: Integration tests should mirror actual usage

### Maintaining Tests
1. **Keep Tests Updated**: Update mocks when API changes
2. **Regular Dependency Updates**: Keep test dependencies current
3. **Performance Monitoring**: Watch for test execution time increases
4. **Coverage Goals**: Maintain >90% code coverage where practical

## 🚀 Continuous Integration

### Recommended CI Pipeline
```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci
  
- name: Run comprehensive tests  
  run: npm run test:comprehensive
  
- name: Upload coverage
  uses: codecov/codecov-action@v1
```

### Pre-commit Hooks (Recommended)
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:smoke && npm run lint"
```

This comprehensive testing approach ensures the Brale SDK maintains high quality and reliability for production use.