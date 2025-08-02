#!/bin/bash
# Script to publish @superduperdot/brale-sdk to GitHub Packages

echo "🚀 Publishing @superduperdot/brale-sdk to GitHub Packages"
echo "========================================================="

echo ""
echo "📋 Pre-requisites:"
echo "1. Create a GitHub Personal Access Token with 'write:packages' and 'read:packages' scopes"
echo "2. Export your token: export GITHUB_TOKEN=your_token_here"
echo "3. Run: npm login --scope=@superduperdot --registry=https://npm.pkg.github.com"
echo "   - Username: Your GitHub username"
echo "   - Password: Your GitHub Personal Access Token (NOT your GitHub password)"
echo "   - Email: Your GitHub email"

echo ""
echo "🔍 Current package configuration:"
echo "Package name: $(npm pkg get name | tr -d '\"')"
echo "Package version: $(npm pkg get version | tr -d '\"')"
echo "Registry: $(npm pkg get publishConfig.registry | tr -d '\"')"

echo ""
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set. Please run: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo "✅ GITHUB_TOKEN is set"
echo ""
echo "📦 Publishing package..."

# Publish the package
npm publish

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Package published to GitHub Packages"
    echo ""
    echo "📥 Users can now install with:"
    echo "   npm config set @superduperdot:registry https://npm.pkg.github.com"
    echo "   npm install @superduperdot/brale-sdk"
    echo ""
    echo "🌐 Package available at:"
    echo "   https://github.com/superduperdot/brale-typescript-api-sdk/packages"
else
    echo ""
    echo "❌ FAILED! Check the error messages above."
    echo ""
    echo "💡 Common issues:"
    echo "   - Not logged in: npm login --scope=@superduperdot --registry=https://npm.pkg.github.com"
    echo "   - Wrong credentials: Use GitHub Personal Access Token as password"
    echo "   - Package already exists: Bump version with npm version patch"
fi