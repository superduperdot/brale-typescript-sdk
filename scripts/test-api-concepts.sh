#!/bin/bash

# Test script for Brale API Key Concepts Integration Tests
# This script runs comprehensive tests against the real Brale API
# with safe $1 transfers only between internal custodial wallets

set -e

echo "🧪 Brale API Key Concepts Integration Tests"
echo "=========================================="

# Check for required environment variables
if [[ -z "$BRALE_CLIENT_ID" || -z "$BRALE_CLIENT_SECRET" ]]; then
    echo "❌ Error: BRALE_CLIENT_ID and BRALE_CLIENT_SECRET environment variables are required"
    echo ""
    echo "Please set your credentials:"
    echo "export BRALE_CLIENT_ID=\"your-client-id\""
    echo "export BRALE_CLIENT_SECRET=\"your-client-secret\""
    echo ""
    exit 1
fi

echo "✅ Credentials provided"
echo "📋 Client ID: ${BRALE_CLIENT_ID:0:8}..."
echo "🔐 Client Secret: ${BRALE_CLIENT_SECRET:0:8}..."
echo ""

# Build the SDK first
echo "🔨 Building SDK..."
npm run build
echo ""

# Run the integration tests
echo "🧪 Running API Concepts Integration Tests..."
echo "⚠️  IMPORTANT: Only performing safe $1 transfers between internal custodial wallets"
echo ""

# Set environment for production testing
export BRALE_ENVIRONMENT="production"
export NODE_ENV="test"

# Run the specific integration test file
npx jest tests/api-concepts-integration.test.ts --verbose --detectOpenHandles --forceExit

echo ""
echo "✅ API Concepts Integration Tests Complete!"
echo ""
echo "📊 Test Summary:"
echo "- ✅ Authentication & Token Management"
echo "- ✅ Account Management"
echo "- ✅ Address Management (Custodial & External)"
echo "- ✅ Transfer Operations (Safe $1 internal transfers only)"
echo "- ✅ Balance Management"
echo "- ✅ Automation Management"
echo "- ✅ Error Handling & Status Codes"
echo "- ✅ Idempotency"
echo "- ✅ Pagination"
echo "- ✅ Network Support"
echo ""
echo "🎉 All Brale API key concepts validated with real API calls!"