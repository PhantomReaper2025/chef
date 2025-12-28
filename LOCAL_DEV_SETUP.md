# Local Development Setup for CodeAble AI

This document provides instructions for running the CodeAble AI app locally with Convex backend.

## Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Docker (optional, for Convex local storage)

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Frontend environment variables (for Vite)
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
VITE_WORKOS_REDIRECT_URI=http://127.0.0.1:5173
VITE_WORKOS_API_HOSTNAME=apiauth.convex.dev

# Convex deployment configuration
CONVEX_DEPLOYMENT=anonymous:anonymous-chef-local-dev
CONVEX_URL=http://127.0.0.1:3210
WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
CONVEX_OAUTH_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J

# Model provider API keys (at least one required)
OPENAI_API_KEY=sk-your-openai-api-key
# OR use other providers:
# ANTHROPIC_API_KEY=your-anthropic-key
# GOOGLE_API_KEY=your-google-key
# XAI_API_KEY=your-xai-key

# Feature flags
DISABLE_USAGE_REPORTING=1
DISABLE_BEDROCK=1
```

## Starting the Development Servers

### Method 1: Start Both Servers (Recommended)

Open two terminal windows:

**Terminal 1 - Convex Dev Server:**
```bash
export WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
export CONVEX_OAUTH_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
npx convex dev
```

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```

### Method 2: Start Servers in Background

```bash
# Start Convex dev server
export WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
export CONVEX_OAUTH_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
nohup npx convex dev > /tmp/convex-dev.log 2>&1 &

# Start Vite dev server
nohup npm run dev > /tmp/vite-dev.log 2>&1 &

# Check logs
tail -f /tmp/convex-dev.log
tail -f /tmp/vite-dev.log
```

### Initial Convex Setup (First Time Only)

If this is your first time running Convex locally:

1. Run: `npx convex dev --once`
2. Follow the prompts:
   - Select "Start without an account (run Convex locally)"
   - Enter project name: `chef-local-dev`
   - Confirm to continue
3. This will create the `.env.local` file with CONVEX_URL and CONVEX_DEPLOYMENT

## Accessing the Application

Once both servers are running:

- **Frontend:** http://127.0.0.1:5173
- **Convex Dashboard:** http://127.0.0.1:6790/?d=anonymous-chef-local-dev
- **Convex Backend:** http://127.0.0.1:3210

## Verifying Setup

Check that both servers are responding:

```bash
# Check Convex
curl http://127.0.0.1:3210/
# Expected: "This Convex deployment is running. See https://docs.convex.dev/."

# Check Vite
curl http://127.0.0.1:5173/
# Expected: HTML content with "CodeAble AI" in the title
```

## Troubleshooting

### Port Already in Use

If you see "Port 5173 is already in use":

```bash
# Find and kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

### Convex Environment Variable Error

If you see "Environment variable WORKOS_CLIENT_ID is used in auth config file but its value was not set":

```bash
# Make sure to export the environment variable before starting Convex
export WORKOS_CLIENT_ID=client_01K0YV0SNPRYJ5AV4AS0VG7T1J
npx convex dev
```

### Missing API Keys

If you see "No environment variables for model providers are set":

- Add at least one API key to your `.env.local` file (see Environment Variables section above)
- For local testing, you can use a placeholder, but actual functionality requires a valid key

### Convex Dev Not Starting

If Convex dev fails to start:

1. Check the log: `tail -50 /tmp/convex-dev.log`
2. Ensure no other Convex processes are running: `pkill -9 -f "convex dev"`
3. Remove the Convex state cache and retry: `rm -rf ~/.convex/anonymous-convex-backend-state/`

## Stopping the Servers

```bash
# Stop Convex
pkill -9 -f "convex dev"

# Stop Vite
lsof -ti:5173 | xargs kill -9
```

## Architecture Overview

- **Convex Backend:** Runs on port 3210, provides real-time database, functions, and HTTP actions
- **Vite Dev Server:** Runs on port 5173, serves the Remix/Vite frontend
- **Convex Dashboard:** Runs on port 6790, provides UI for viewing and managing Convex data

## Data Persistence

The local Convex backend uses SQLite for data storage:
- Location: `~/.convex/anonymous-convex-backend-state/`
- Data is persisted between server restarts
- Clear data by deleting the backend state directory

## Development Workflow

1. Make changes to Convex functions in the `convex/` directory
2. Changes are automatically pushed to the local Convex deployment
3. Frontend hot-reloads automatically with Vite HMR
4. View logs in both terminal windows or use the log files:
   - `/tmp/convex-dev.log`
   - `/tmp/vite-dev.log`

## Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Remix Documentation](https://remix.run/docs)
- [Vite Documentation](https://vitejs.dev/)
