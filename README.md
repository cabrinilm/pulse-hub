# Pulse Hub

Pulse Hub is a full-stack application for managing events, profiles, and signups. The project is structured as a monorepo with a Node.js/Express/TypeScript backend and a React/Vite frontend using Tailwind CSS for styling. This guide provides step-by-step instructions to run the project locally.

## Overview

- **Backend**: Handles authentication (Supabase + Google OAuth), events, profiles, and signups.
- **Frontend**: React app built with Vite and Tailwind CSS for UI/UX.
- **Database/Auth**: Supabase (PostgreSQL + Auth).
- **Key Features**: User login, event creation/listing, profile management, Google OAuth for calendar sync.

The local setup runs the backend on `http://localhost:3001` and frontend on `http://localhost:3000`.

---

## Hosted Online

- **Frontend**: [https://pulse-hub-frontend.vercel.app](https://pulse-hub-frontend.vercel.app)  
- **Backend**: [https://pulse-hub-backend.vercel.app](https://pulse-hub-backend.vercel.app)

---

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
├── backend/              # Node.js/Express/TypeScript API
│   ├── src/              # Source code (controllers, models, services)
│   ├── api/              # Compiled output (auto-generated on build)
│   ├── jest.config.ts    # Jest configuration for backend tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json       # Vercel config (CORS/routing)
├── frontend/             # React/Vite app with Tailwind CSS
│   ├── src/              # Source code (components, hooks)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS config for Tailwind
├── .env.example          # Template for env vars
├── .gitignore
└── README.md

```
## Installation & Running Locally

# Clone the repository
git clone https://github.com/yourusername/pulse-hub.git
cd pulse-hub

# Install backend dependencies
cd backend
npm install

# Start backend server (default port: 3001)
npm run dev

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

# Start frontend server (default port: 3000)
npm run dev



## Setup Environment Variables

Copy `.env.example` to `.env` in both `backend/` and `frontend/` (create separate files if needed). Fill in the values.

### Backend `.env` (in `backend/`)

Required for Supabase, Google OAuth, and local redirects:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-calendar/callback
FRONTEND_URL=http://localhost:3000


```



### Frontend `.env` (in `frontend/` – prefixed with `VITE_` for Vite)
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3001

```

**Notes**:
- Use `http://localhost:3001` for backend API in local dev.
- No Stripe or other services used.


## External Services Setup

### Supabase (Database & Auth)

1. **Sign Up**: Go to [supabase.com](https://supabase.com) and create a free account (email or GitHub).
2. **Create Project**:
   - Click "New Project".
   - Choose an organization (default is fine).
   - Name: `pulse-hub-local` (or similar).
   - Region: Closest to you (e.g., US East).
   - Password: Set a strong DB password (save it).
   - Click "Create new project" (takes ~2 min).
3. **Get Keys & URL**:
   - Go to Settings > API.
   - Copy `Project URL` (e.g., `https://abc123.supabase.co`) to `SUPABASE_URL`.
   - Under "Project API keys", copy `anon public` to `SUPABASE_ANON_KEY`.
4. **Enable Auth Providers**:
   - Go to Authentication > Providers > Enable "Google".
   - Add your Google Client ID/Secret (from next section).
5. **Test**: In Supabase dashboard > SQL Editor, run a query like `SELECT now();` to confirm connection.

### Google OAuth

1. **Create Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com) > Select/Create project `pulse-hub`.
   - APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs.
   - Application type: Web application.
   - Name: `Pulse Hub Local`.
   - Authorized redirect URIs: Add `http://localhost:3001/api/google-calendar/callback`.
   - Click Create – copy Client ID and Secret.
2. **Update in Env**: Paste into backend/frontend `.env` as above.
3. **Scopes** (if needed): In Google Console > OAuth consent screen, add scopes like `https://www.googleapis.com/auth/calendar` for Google Calendar integration.



## Running Tests (Backend)

cd backend
npm test












