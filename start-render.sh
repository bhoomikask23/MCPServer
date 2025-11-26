#!/bin/bash

# Render Deployment Start Script
echo "🚀 Starting MCP Profile Server on Render..."

# Show environment info
echo "📋 Environment Variables:"
echo "   NODE_ENV: ${NODE_ENV:-'not set'}"
echo "   PORT: ${PORT:-'not set'}"
echo "   DEFAULT_PROFILE_ID: ${DEFAULT_PROFILE_ID:-'not set'}"
echo "   RENDER: ${RENDER:-'false'}"
echo "   RENDER_EXTERNAL_URL: ${RENDER_EXTERNAL_URL:-'not set'}"

# Ensure dist directory exists and is built
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found, running build..."
    npm run build
fi

# Start the server
echo "🎯 Starting server..."
node dist/standalone-profile-server.js