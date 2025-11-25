# Architecture Documentation

## System Overview

The Done-Now-Next-Explore roadmap tool is a full-stack web application that bridges AHA! product data with customer-facing roadmap visualization through AI-powered summarization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Customer View  │  │   Admin View    │                  │
│  │   (Public)      │  │  (Protected)    │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                             │
│           └────────┬───────────┘                             │
│                    │                                         │
│              ┌─────▼─────┐                                  │
│              │  API Client│                                  │
│              │   (axios)  │                                  │
│              └─────┬─────┘                                  │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     │ HTTP/REST
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Routes                         │  │
│  │  /auth  /initiatives  /sync  /config                 │  │
│  └───┬──────────────┬───────────────┬───────────────────┘  │
│      │              │               │                       │
│  ┌───▼──────┐  ┌───▼────────┐  ┌──▼──────────┐           │
│  │   Auth   │  │ Initiative │  │    Sync     │           │
│  │Middleware│  │   Logic    │  │   Service   │           │
│  └──────────┘  └────┬───────┘  └──┬──────────┘           │
│                     │              │                       │
│                ┌────▼──────────────▼────┐                 │
│                │   Database Service     │                 │
│                │     (PostgreSQL)       │                 │
│                └────────────────────────┘                 │
│                                                            │
│  ┌─────────────────┐         ┌─────────────────┐        │
│  │  AHA! Service   │         │   AI Service     │        │
│  │  Integration    │         │  (OneAdvanced/   │        │
│  │                 │         │    Gemini)       │        │
│  └────────┬────────┘         └────────┬─────────┘        │
└───────────┼──────────────────────────┼───────────────────┘
            │                          │
            │                          │
  ┌─────────▼────────┐      ┌─────────▼──────────┐
  │   AHA! API       │      │   AI APIs          │
  │  (External)      │      │  (External)        │
  └──────────────────┘      └────────────────────┘
            │                          │
  ┌─────────▼────────┐      ┌─────────▼──────────┐
  │  Product Data    │      │  AI Summarization  │
  └──────────────────┘      └────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Vite**: Build tool and dev server
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

### Database
- **PostgreSQL**: Relational database
- **pg**: Node.js PostgreSQL client

### External Services
- **AHA! API**: Product roadmap data
- **OneAdvanced AI**: Summarization
- **Gemini 3 Pro**: Alternative summarization

## Data Flow

### 1. Customer View Flow

```
User → React App → GET /api/initiatives → Database
  ↓
Filter visible initiatives
  ↓
Group by column (done/now/next/explore)
  ↓
Render in 4-column layout
```

### 2. Admin Sync Flow

```
Admin → Click "Sync" → POST /api/sync/refresh
  ↓
Fetch from AHA! API
  ↓
Transform AHA! data
  ↓
Generate AI summaries (batch)
  ↓
Upsert to database
  ↓
Log sync event
  ↓
Return success + count
```

### 3. Edit Initiative Flow

```
Admin → Click "Edit" → Open Modal
  ↓
Modify fields
  ↓
PUT /api/initiatives/:id
  ↓
Validate + Update database
  ↓
Return updated initiative
  ↓
Refresh view
```

## Directory Structure

```
now-next-later/
├── server/                      # Backend application
│   ├── index.js                # Express server entry point
│   ├── db/                     # Database layer
│   │   ├── connection.js       # PostgreSQL connection pool
│   │   ├── schema.sql          # Database schema
│   │   └── migrate.js          # Migration runner
│   ├── routes/                 # API route handlers
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── initiatives.js     # Initiative CRUD
│   │   ├── sync.js            # AHA! sync endpoints
│   │   └── config.js          # Configuration endpoints
│   ├── services/               # Business logic
│   │   ├── ahaService.js      # AHA! API integration
│   │   └── aiService.js       # AI summarization
│   └── middleware/             # Express middleware
│       └── auth.js            # JWT verification
│
├── client/                      # Frontend application
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Root component
│   │   ├── components/         # React components
│   │   │   ├── CustomerView.jsx    # Public roadmap
│   │   │   ├── AdminView.jsx       # Admin dashboard
│   │   │   ├── InitiativeCard.jsx  # Initiative display
│   │   │   ├── LoginModal.jsx      # Admin login
│   │   │   └── EditModal.jsx       # Initiative editor
│   │   └── utils/
│   │       └── api.js         # API client functions
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json           # Frontend dependencies
│
├── package.json               # Backend dependencies
├── .env                       # Environment variables (gitignored)
├── .env.example              # Environment template
├── README.md                 # Main documentation
└── SETUP_GUIDE.md           # Quick setup guide
```

## Component Architecture

### Frontend Components

#### CustomerView
- **Purpose**: Public-facing roadmap display
- **Data**: Fetches visible initiatives from `/api/initiatives`
- **State**: Loading, error, initiatives array
- **Renders**: 4-column layout with InitiativeCard components

#### AdminView
- **Purpose**: Administrative dashboard
- **Data**: Fetches all initiatives from `/api/initiatives/admin`
- **State**: Loading, syncing, initiatives, config, editingInitiative
- **Features**:
  - Sync from AHA! button
  - AI provider selector
  - Preview toggle
  - Edit capabilities
- **Protected**: Requires JWT authentication

#### InitiativeCard
- **Purpose**: Display individual initiative
- **Props**: initiative object, isAdmin flag, onEdit callback
- **Displays**: Title, description, tags, timeline
- **Conditional**: Shows edit button in admin mode

#### LoginModal
- **Purpose**: Admin authentication
- **State**: Password input, error, loading
- **Action**: Posts to `/api/auth/login`
- **Success**: Stores JWT token, calls onSuccess callback

#### EditModal
- **Purpose**: Edit initiative details
- **Props**: initiative object, onClose, onSave callbacks
- **State**: Form data, tags, saving, error
- **Actions**: Update or delete initiative
- **Validation**: Required fields (title, ai_summary, column)

### Backend Services

#### ahaService
- **Purpose**: Interface with AHA! API
- **Methods**:
  - `fetchInitiatives()`: Get product features from AHA!
  - `transformAhaData()`: Convert to internal format
  - `mapWorkflowStatusToColumn()`: Map status to column
  - `extractTimeline()`: Parse release date
- **Configuration**: Uses env vars (AHA_API_URL, AHA_API_KEY, AHA_PRODUCT_ID)

#### aiService
- **Purpose**: Generate customer-friendly summaries
- **Methods**:
  - `summarize()`: Single summarization
  - `summarizeWithOneAdvanced()`: OneAdvanced AI provider
  - `summarizeWithGemini()`: Gemini provider
  - `batchSummarize()`: Process multiple items
  - `createFallbackSummary()`: Fallback if AI fails
- **Configuration**: Dual provider support with fallback

## Database Schema

### initiatives Table

```sql
id                SERIAL PRIMARY KEY
aha_id           VARCHAR(255) UNIQUE
title            VARCHAR(500) NOT NULL
description      TEXT
ai_summary       TEXT
custom_tags      TEXT[]
timeline         VARCHAR(100)
column_name      VARCHAR(50) CHECK (done/now/next/explore)
sort_order       INTEGER DEFAULT 0
is_visible       BOOLEAN DEFAULT true
raw_aha_data     JSONB
created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Indexes:**
- `idx_initiatives_column` on `column_name`
- `idx_initiatives_visible` on `is_visible`
- `idx_initiatives_aha_id` on `aha_id`

### admin_config Table

```sql
id              SERIAL PRIMARY KEY
config_key      VARCHAR(100) UNIQUE NOT NULL
config_value    TEXT NOT NULL
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Default configs:**
- `ai_provider`: 'oneadvanced' or 'gemini'
- `product_name`: Display name

### sync_logs Table

```sql
id                  SERIAL PRIMARY KEY
sync_status        VARCHAR(50) NOT NULL
sync_message       TEXT
initiatives_synced INTEGER DEFAULT 0
synced_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
synced_by          VARCHAR(100)
```

## API Architecture

### Authentication Flow

```
1. User submits password
   ↓
2. POST /api/auth/login { password }
   ↓
3. Server validates password (bcrypt compare)
   ↓
4. Server generates JWT (24h expiry)
   ↓
5. Client stores token in localStorage
   ↓
6. Client adds token to Authorization header
   ↓
7. Middleware verifies token on protected routes
```

### API Endpoints

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/initiatives` | Get visible initiatives |
| POST | `/api/auth/login` | Admin login |

#### Protected Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/initiatives/admin` | Get all initiatives |
| GET | `/api/initiatives/:id` | Get single initiative |
| PUT | `/api/initiatives/:id` | Update initiative |
| DELETE | `/api/initiatives/:id` | Delete initiative |
| POST | `/api/sync/refresh` | Sync from AHA! |
| GET | `/api/sync/history` | Get sync logs |
| GET | `/api/config` | Get configuration |
| PUT | `/api/config` | Update configuration |

## Security Architecture

### Authentication
- JWT-based token authentication
- 24-hour token expiry
- Bcrypt password hashing (12 salt rounds)
- Token stored in localStorage
- Automatic token injection via axios interceptor

### Authorization
- Middleware checks JWT on protected routes
- Admin-only endpoints (all except public initiatives)
- No role hierarchy (single admin user)

### Data Protection
- Environment variables for sensitive data
- `.env` file gitignored
- No API keys in client code
- CORS configuration
- Helmet security headers
- Input validation with express-validator

### Database Security
- SQL injection protection (parameterized queries)
- Connection pooling with pg
- SSL support for production
- Database-level constraints

## Scalability Considerations

### Current Architecture
- Single server instance
- Synchronous AHA! sync
- In-memory JWT verification
- Single database connection pool

### Future Enhancements
- **Caching**: Redis for initiative data
- **Queue**: Bull/BullMQ for background sync jobs
- **Load Balancing**: Multiple server instances
- **Database**: Read replicas for scaling reads
- **CDN**: Static asset delivery
- **Monitoring**: Error tracking (Sentry), APM
- **Rate Limiting**: Protect external API calls

## Deployment Architecture

### Development
```
localhost:5173 (Vite dev server)
     ↓
localhost:3000 (Express API)
     ↓
localhost:5432 (PostgreSQL)
```

### Production
```
Domain → HTTPS → Load Balancer
              ↓
         Express Server (static + API)
              ↓
         PostgreSQL Database
```

## Error Handling

### Frontend
- Try-catch blocks on async operations
- Error state in components
- User-friendly error messages
- Loading states for async operations

### Backend
- Express error handling middleware
- Try-catch in async route handlers
- Detailed error logging (console)
- Generic error messages to client (security)
- HTTP status codes (400, 401, 403, 404, 500)

### Database
- Connection pool error handling
- Transaction rollback on failures
- Constraint violations (unique, check)

## Testing Strategy

### Recommended Tests

#### Frontend
- Component rendering tests (React Testing Library)
- User interaction tests (login, edit, sync)
- API integration tests (mocked axios)
- Responsive design tests

#### Backend
- API endpoint tests (Supertest)
- Service unit tests (AHA!, AI)
- Authentication tests
- Database integration tests

#### End-to-End
- Full user flows (Cypress/Playwright)
- Admin sync workflow
- Edit initiative workflow
- Authentication flow

## Performance Considerations

### Frontend
- React.memo for expensive components
- Lazy loading for modals
- Debouncing on search/filter inputs
- Optimistic UI updates

### Backend
- Database indexing on frequently queried fields
- Connection pooling (reuse connections)
- Batch operations for AI summarization
- Rate limiting on AI API calls

### Database
- Indexes on column_name, is_visible
- JSONB for flexible raw data storage
- Automatic updated_at triggers

## Monitoring & Logging

### Current Logging
- Console.log for key operations
- Sync log table for audit trail
- Error logging to console

### Recommended Additions
- Winston/Bunyan for structured logging
- Log levels (debug, info, warn, error)
- Request ID tracking
- Performance metrics
- Error tracking service (Sentry)

## Maintenance

### Regular Tasks
- Database backups (daily)
- Dependency updates (monthly)
- Security patches (as needed)
- Log rotation
- Performance monitoring

### Database Maintenance
```sql
-- Vacuum and analyze
VACUUM ANALYZE initiatives;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;

-- Monitor table sizes
SELECT pg_size_pretty(pg_total_relation_size('initiatives'));
```

## Future Architecture Considerations

1. **Microservices**: Separate sync service from API
2. **Event-Driven**: Webhook support from AHA!
3. **Multi-Tenancy**: Support multiple products/companies
4. **Real-time**: WebSocket updates for collaborative editing
5. **Internationalization**: Multi-language support
6. **Analytics**: Track customer engagement with roadmap
7. **API Versioning**: Support multiple API versions
8. **GraphQL**: Consider GraphQL for flexible queries
