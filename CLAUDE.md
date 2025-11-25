# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow - CRITICAL

**AFTER EVERY MAJOR CHANGE, COMMIT AND PUSH TO GITHUB**

This is a hard requirement. Whenever you make significant changes (new features, bug fixes, refactoring, documentation updates), you must:

1. Stage changes: `git add -A`
2. Commit with descriptive message: `git commit -m "Description of changes"`
3. Push to remote: `git push`

Major changes include:
- Adding new features or components
- Fixing bugs
- Updating configuration
- Database schema changes
- Documentation updates
- Dependency changes
- Refactoring

Use clear, descriptive commit messages that explain what changed and why.

## Project Overview

Done-Now-Next-Explore is a customer-facing roadmap tool that syncs with AHA! product management platform and uses AI (OneAdvanced AI or Gemini) to generate customer-friendly summaries. It has two views: a public customer view showing the 4-column roadmap and a password-protected admin dashboard for managing initiatives.

## Development Commands

### Initial Setup
```bash
# Install dependencies (both backend and frontend)
npm install
cd client && npm install && cd ..

# Create PostgreSQL database
createdb roadmap_db
# Or if createdb not in PATH: /opt/homebrew/Cellar/postgresql@15/15.15/bin/createdb roadmap_db

# Run database migrations
node server/db/migrate.js

# Start PostgreSQL service (if not running)
brew services start postgresql@15
```

### Development
```bash
# Start both backend (port 3000) and frontend (port 5173) concurrently
npm run dev

# Start only backend
npm run server:dev

# Start only frontend
cd client && npm run dev
```

### Production
```bash
# Build frontend for production
npm run build

# Start production server (serves API + built frontend)
npm start
```

### Database Operations
```bash
# Run migrations
node server/db/migrate.js

# Connect to database
psql postgresql://localhost:5432/roadmap_db

# Check initiatives by column
psql -d roadmap_db -c "SELECT column_name, COUNT(*) FROM initiatives GROUP BY column_name;"
```

## Architecture

### Two-Tier Structure
- **Backend**: `server/` - Express.js API with PostgreSQL (port 3000)
- **Frontend**: `client/` - React + Vite SPA (port 5173 in dev)

### Key Data Flow: AHA! Sync
1. Admin clicks "Sync from AHA!" → POST `/api/sync/refresh`
2. `server/services/ahaService.js` fetches features from AHA! API
3. `mapWorkflowStatusToColumn()` maps AHA! workflow statuses to columns (done/now/next/explore)
4. `server/services/aiService.js` batch-processes titles/descriptions through AI
5. Database upsert via `aha_id` (updates existing, inserts new)
6. Sync logged to `sync_logs` table

### Authentication Flow
- Admin password stored in `.env` (bcrypt in production)
- Login generates JWT (24h expiry) stored in localStorage
- Protected routes use `server/middleware/auth.js` to verify JWT
- Customer view is public, admin routes require authentication

## Database Schema

**initiatives** - Main roadmap data
- `aha_id` (unique) - Links to AHA! feature
- `ai_summary` - Customer-facing text (editable by admin)
- `description` - Internal notes (not shown to customers)
- `custom_tags` - Array of PM-defined tags
- `column_name` - Must be: 'done', 'now', 'next', or 'explore'
- `is_visible` - Controls customer visibility
- `raw_aha_data` - JSONB original AHA! response

**admin_config** - Settings (ai_provider, product_name)

**sync_logs** - Audit trail of AHA! syncs

## Critical Customization Points

### AHA! Workflow Mapping
Edit `server/services/ahaService.js` → `mapWorkflowStatusToColumn()` to match your AHA! workflow status names to columns. Default logic:
- "shipped", "released", "done" → 'done'
- "in progress", "development", "building" → 'now'
- "planned", "ready" → 'next'
- Everything else → 'explore'

### AI Prompt Tuning
Edit `server/services/aiService.js` → `summarizeWithOneAdvanced()` or `summarizeWithGemini()` to adjust the prompt sent to AI providers for summary generation.

### Branding
- Colors: `client/tailwind.config.js` → `colors.oneadvanced`
- Font: `client/index.html` → Google Fonts link (currently Montserrat)

## Environment Configuration

Required `.env` variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Admin login password
- `JWT_SECRET` - Token signing key (32+ chars)
- `AHA_API_URL`, `AHA_API_KEY`, `AHA_PRODUCT_ID` - AHA! credentials
- `GEMINI_API_KEY` or `ONEADVANCED_AI_URL` + `ONEADVANCED_AI_KEY` - At least one AI provider

## Common Issues

### Port 3000 Conflict
If backend returns HTML instead of JSON, another process is on port 3000:
```bash
lsof -i :3000 | grep LISTEN
kill <PID>  # Kill conflicting process
npm run dev  # Restart
```

### PostgreSQL Not Found
If `psql` or `createdb` commands fail, PostgreSQL isn't in PATH. Use full path:
```bash
/opt/homebrew/Cellar/postgresql@15/15.15/bin/createdb roadmap_db
```

### Infinite Render Loop
Avoid calling state setters directly in JSX. Use event handlers or useEffect instead.

## API Endpoints

### Public
- `GET /api/initiatives` - Customer-visible initiatives only
- `POST /api/auth/login` - Returns JWT token

### Protected (JWT required)
- `GET /api/initiatives/admin` - All initiatives including hidden
- `PUT /api/initiatives/:id` - Update initiative
- `DELETE /api/initiatives/:id` - Delete initiative
- `POST /api/sync/refresh` - Trigger AHA! sync
- `GET /api/config` - Get admin config (AI provider, etc.)
- `PUT /api/config` - Update admin config

## React Component Hierarchy

```
App (BrowserRouter, auth state)
├── CustomerView (public roadmap)
│   └── InitiativeCard (repeats per initiative)
└── AdminView (protected dashboard)
    ├── InitiativeCard (with edit button)
    ├── EditModal (initiative editor)
    └── LoginModal (when not authenticated)
```

## File Change Impact

- `server/db/schema.sql` → Run `node server/db/migrate.js` after changes
- `client/tailwind.config.js` → Restart Vite dev server (Ctrl+C, `npm run dev`)
- `.env` → Restart backend (nodemon should auto-reload)
- `server/services/ahaService.js` → Test sync after changes to ensure mapping works

## Testing the Application

1. Open http://localhost:5173 → Should see empty 4-column layout
2. Click "Admin" → Login with `ADMIN_PASSWORD` from `.env`
3. Click "Sync from AHA!" → Pulls data, generates AI summaries
4. Click "Edit" on any card → Modify summary, tags, timeline, column
5. Toggle "Visible to customers" → Controls public visibility
6. Return to customer view → See updated roadmap

## Notes for Future Development

- AHA! sync is synchronous and blocks during AI summarization. For large datasets, consider implementing a job queue (Bull/BullMQ).
- Only one admin account supported. Multi-user requires additional `users` table and role system.
- No automated sync scheduling. Implement cron jobs or scheduled tasks if needed.
- Frontend uses Vite proxy in dev (`/api` → `localhost:3000`). In production, Express serves static files from `client/dist`.
