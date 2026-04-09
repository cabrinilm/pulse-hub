# Pulse Hub

Full-stack event management platform where users can create, manage, and RSVP to events.

## Live Demo

Frontend: https://pulse-hub-frontend.vercel.app  
Backend: https://pulse-hub-backend.vercel.app

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database/Auth: Supabase (PostgreSQL + Auth)
- Integrations: Google OAuth / Google Calendar

## Features

- User authentication with Supabase and Google OAuth
- Event creation and event listing
- RSVP and signup management
- Profile management
- Google Calendar integration
- Responsive UI

The local setup runs the backend on `http://localhost:3000` and frontend on `http://localhost:5173`.

## Prerequisites

- Node.js (v18+)
- npm
- Supabase account
- Google OAuth credentials

## Project Structure

```text
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

## Installation

```bash
git clone https://github.com/cabrinilm/pulse-hub.git
cd pulse-hub

# Backend
cd backend
npm install
npm run build && npm start

# Frontend
cd ../frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files in both `backend/` and `frontend/` using `.env.example` as a reference.

### Backend

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-calendar/callback
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3000
```

## External Services

- Supabase (PostgreSQL + Authentication)
- Google OAuth for calendar integration

## Running Tests Backend

```bash
cd backend
npm test
```
