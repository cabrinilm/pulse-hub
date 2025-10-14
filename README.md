# Pulse Hub

Pulse Hub is a full-stack application for managing events, profiles, and signups. The project is structured as a monorepo with a Node.js/Express/TypeScript backend and a React/Vite frontend. This guide provides step-by-step instructions to run the project locally.

## Overview

- **Backend**: Handles authentication (Supabase + Google OAuth), events, profiles, and signups.
- **Frontend**: React app built with Vite for UI/UX.
- **Database/Auth**: Supabase (PostgreSQL + Auth).
- **Key Features**: User login, event creation/listing, profile management, Google OAuth for calendar sync.

The local setup runs the backend on `http://localhost:3001` and frontend on `http://localhost:3000`.



## Prerequisites

- **Node.js**: Version 18+ (recommended: 20.x). Download from [nodejs.org](https://nodejs.org).
- **npm**: Version 9+ (comes with Node.js).
- **Git**: For cloning the repo.
- **Browser**: Modern browser (Chrome/Firefox) for testing.
- **Accounts/Services**:
  - [Supabase](https://supabase.com) account (free tier).
  - [Google Cloud Console](https://console.cloud.google.com) for OAuth credentials.
- **Optional**: Vercel CLI (`npm i -g vercel`) for local emulation; Jest for running tests.

Verify Node/npm:
```bash
node --version  # Should be >=18
npm --version   # Should be >=9



pulse-hub/
├── backend/          # Node.js/Express/TypeScript API
│   ├── src/          # Source code (controllers, models, services)
│   ├── api/          # Compiled output (auto-generated on build)
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json   # Vercel config (CORS/routing)
├── frontend/         # React/Vite app
│   ├── src/          # Source code (components, hooks)
│   ├── package.json
│   └── vite.config.js
├── .env.example      # Template for env vars
├── .gitignore
└── README.md
























