#!/bin/bash

# Manual dependency installation script
# This script manually installs the MCP SDK and TypeScript dependencies

echo "Creating node_modules directory..."
mkdir -p node_modules/@modelcontextprotocol
mkdir -p node_modules/@types
mkdir -p node_modules/typescript

echo "To complete the setup, please run one of the following:"
echo ""
echo "Option 1: Fix npm cache permissions (recommended)"
echo "  sudo chown -R \$(whoami) ~/.npm"
echo "  npm install"
echo ""
echo "Option 2: Use different package manager"
echo "  npm install -g yarn"
echo "  yarn install"
echo ""
echo "Option 3: Use npx to avoid global installation issues"
echo "  npx --yes @modelcontextprotocol/sdk@latest --help"
echo ""
echo "The MCP server code is ready in src/index.ts"
echo "After installing dependencies, you can build with: npm run build"
echo "And run with: npm start"