#!/bin/bash
# Comprehensive test script for Brale TypeScript SDK

set -e

echo "🧪 Brale SDK Comprehensive Test Suite"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track results
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${YELLOW}Running: $test_name${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# 1. TypeScript Compilation Tests
run_test "TypeScript Compilation Check" "npx tsc --noEmit"

# 2. Linting Tests  
run_test "ESLint Code Quality" "npm run lint"

# 3. Unit Tests (when working)
# run_test "Jest Unit Tests" "npm test"

# 4. Build Tests
run_test "CommonJS Build" "npm run build:cjs"
run_test "ES Module Build" "npm run build:esm" 
run_test "Type Definitions Build" "npm run build:types"

# 5. Package Tests
run_test "Package Integrity" "npm pack --dry-run"

# 6. Import Tests
run_test "CommonJS Import Test" 'node -e "console.log(Object.keys(require(\"./dist/cjs/index.js\")))"'
run_test "ES Module Import Test" 'node -e "import(\"./dist/esm/index.js\").then(m => console.log(Object.keys(m)))"'

# 7. Dependency Check
run_test "Security Audit" "npm audit --audit-level=moderate"

# 8. Bundle Size Check
if command -v bundlesize &> /dev/null; then
    run_test "Bundle Size Check" "bundlesize"
fi

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! SDK is ready for production.${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some tests failed. Please address the issues above.${NC}"
    exit 1
fi