#!/bin/bash

# Local Development Startup Script for CodeAble AI
# This script starts both Convex dev server and Vite frontend

set -e

echo "🚀 Starting CodeAble AI Local Development Environment"
echo "=================================================="

# Set required environment variables
export WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
export CONVEX_OAUTH_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J

# Create logs directory if it doesn't exist
mkdir -p /tmp/chef-dev-logs

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    pkill -9 -f "convex dev" 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo "✅ Servers stopped"
}

# Trap signals to cleanup
trap cleanup SIGINT SIGTERM

# Start Convex dev server
echo ""
echo "📦 Starting Convex dev server..."
nohup npx convex dev > /tmp/chef-dev-logs/convex-dev.log 2>&1 &
CONVEX_PID=$!
echo "   Convex dev server started (PID: $CONVEX_PID)"
echo "   Log file: /tmp/chef-dev-logs/convex-dev.log"

# Wait for Convex to start
echo "   Waiting for Convex to be ready..."
sleep 8

# Check if Convex is running
if curl -s http://127.0.0.1:3210/ > /dev/null; then
    echo "   ✅ Convex is running on http://127.0.0.1:3210"
else
    echo "   ❌ Convex failed to start. Check log: /tmp/chef-dev-logs/convex-dev.log"
    exit 1
fi

# Start Vite dev server
echo ""
echo "🎨 Starting Vite dev server..."
nohup npm run dev > /tmp/chef-dev-logs/vite-dev.log 2>&1 &
VITE_PID=$!
echo "   Vite dev server started (PID: $VITE_PID)"
echo "   Log file: /tmp/chef-dev-logs/vite-dev.log"

# Wait for Vite to start
echo "   Waiting for Vite to be ready..."
sleep 12

# Check if Vite is running
if curl -s http://127.0.0.1:5173/ > /dev/null; then
    echo "   ✅ Vite is running on http://127.0.0.1:5173"
else
    echo "   ❌ Vite failed to start. Check log: /tmp/chef-dev-logs/vite-dev.log"
    exit 1
fi

# Display access information
echo ""
echo "=================================================="
echo "✅ CodeAble AI is ready!"
echo "=================================================="
echo ""
echo "📱 Application URL:"
echo "   http://127.0.0.1:5173"
echo ""
echo "🔧 Convex Dashboard:"
echo "   http://127.0.0.1:6790/?d=anonymous-chef-local-dev"
echo ""
echo "📊 Convex Backend:"
echo "   http://127.0.0.1:3210"
echo ""
echo "📋 Log Files:"
echo "   Convex: tail -f /tmp/chef-dev-logs/convex-dev.log"
echo "   Vite:   tail -f /tmp/chef-dev-logs/vite-dev.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================================="

# Keep script running
wait
