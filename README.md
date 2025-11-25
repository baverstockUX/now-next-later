# Done-Now-Next-Explore Roadmap Tool

A customer-facing product roadmap tool that integrates with AHA! and uses AI to generate customer-friendly summaries of product initiatives.

## Features

- **Customer View**: Clean, professional roadmap display with 4 columns (Done, Now, Next, Explore)
- **Admin Dashboard**: Manage initiatives, sync from AHA!, and edit AI-generated summaries
- **AHA! Integration**: Manual sync to pull latest product data
- **Dual AI Support**: Choose between OneAdvanced AI or Gemini 3 Pro for summarization
- **Customizable**: Add custom tags and timelines to each initiative
- **Secure**: Password-protected admin area with JWT authentication
- **OneAdvanced Branding**: Professional design with orange accent colors and Montserrat font

## Tech Stack

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- AHA! API integration
- AI summarization (OneAdvanced AI / Gemini)

**Frontend:**
- React 18
- Tailwind CSS
- React Router
- Vite

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AHA! API credentials
- AI API keys (OneAdvanced AI and/or Gemini)

## Installation

### 1. Clone and Install Dependencies

```bash
cd now-next-later

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
createdb roadmap_db
```

Or using psql:

```sql
CREATE DATABASE roadmap_db;
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/roadmap_db

# Admin Configuration
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# AHA! API Configuration
AHA_API_URL=https://your-domain.aha.io/api/v1
AHA_API_KEY=your-aha-api-key
AHA_PRODUCT_ID=your-product-id

# AI Summarization APIs
ONEADVANCED_AI_URL=https://your-oneadvanced-ai-endpoint
ONEADVANCED_AI_KEY=your-oneadvanced-ai-key

GEMINI_API_KEY=your-gemini-api-key

# Default AI Provider (oneadvanced or gemini)
DEFAULT_AI_PROVIDER=oneadvanced
```

**Important Security Notes:**
- Use a strong password for `ADMIN_PASSWORD`
- Generate a secure random string for `JWT_SECRET` (at least 32 characters)
- Never commit your `.env` file to version control

### 4. Run Database Migrations

```bash
node server/db/migrate.js
```

This will create all necessary tables and initial configuration.

### 5. Start the Application

**Development Mode (both frontend and backend):**

```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3000
- Frontend dev server on http://localhost:5173

**Production Mode:**

```bash
# Build the frontend
npm run build

# Start the server
npm start
```

The production server will serve both the API and the built frontend on port 3000.

## Usage

### Customer View

Navigate to http://localhost:5173 (dev) or http://localhost:3000 (production)

The customer view displays all visible initiatives organized in 4 columns:
- **Done**: Completed features
- **Now**: Currently in development
- **Next**: Planned for near future
- **Explore**: Under consideration

Each initiative shows:
- Title
- Customer-friendly description
- Custom tags
- Timeline/month

### Admin Dashboard

1. Click "Admin" in the top right corner
2. Login with your admin password (from `.env`)
3. Access admin features:
   - **Sync from AHA!**: Manually refresh data from AHA! and generate AI summaries
   - **Edit Initiatives**: Click "Edit" on any card to modify details
   - **AI Provider**: Switch between OneAdvanced AI and Gemini
   - **Preview**: Toggle between admin and customer views
   - **Visibility Control**: Show/hide initiatives from customers

### Syncing from AHA!

1. Log into the admin dashboard
2. Click "Sync from AHA!" button
3. The system will:
   - Fetch latest initiatives from AHA!
   - Generate AI summaries using your selected provider
   - Update the database
   - Display a success message with the number of synced items

### Editing Initiatives

1. In admin view, click "Edit" on any initiative card
2. Modify:
   - **Customer-Facing Summary**: What customers see (required)
   - **Internal Description**: Admin-only notes
   - **Custom Tags**: Add/remove tags for categorization
   - **Timeline**: Display month/quarter information
   - **Column**: Move between Done/Now/Next/Explore
   - **Visibility**: Toggle customer visibility
3. Click "Save Changes" or "Delete" to remove

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/initiatives` - Get all visible initiatives
- `POST /api/auth/login` - Admin login

### Protected Endpoints (Require JWT)

- `GET /api/initiatives/admin` - Get all initiatives (including hidden)
- `GET /api/initiatives/:id` - Get single initiative
- `PUT /api/initiatives/:id` - Update initiative
- `DELETE /api/initiatives/:id` - Delete initiative
- `POST /api/sync/refresh` - Sync from AHA!
- `GET /api/sync/history` - Get sync history
- `GET /api/config` - Get configuration
- `PUT /api/config` - Update configuration

## Database Schema

### initiatives
- `id` - Primary key
- `aha_id` - Unique AHA! identifier
- `title` - Initiative title
- `description` - Internal description
- `ai_summary` - Customer-facing summary
- `custom_tags` - Array of tags
- `timeline` - Display timeline
- `column_name` - Column (done/now/next/explore)
- `sort_order` - Display order
- `is_visible` - Customer visibility
- `raw_aha_data` - Original AHA! data (JSONB)
- `created_at`, `updated_at` - Timestamps

### admin_config
- `id` - Primary key
- `config_key` - Configuration key
- `config_value` - Configuration value
- `updated_at` - Timestamp

### sync_logs
- `id` - Primary key
- `sync_status` - Status (success/failed)
- `sync_message` - Message
- `initiatives_synced` - Count
- `synced_at` - Timestamp
- `synced_by` - User

## Customization

### Branding

The OneAdvanced branding is configured in `client/tailwind.config.js`:

```javascript
colors: {
  'oneadvanced': {
    DEFAULT: '#e9510e',
    // ... color variations
  }
}
```

To customize, update the color values and restart the dev server.

### AHA! Workflow Mapping

The system maps AHA! workflow statuses to columns in `server/services/ahaService.js`:

```javascript
mapWorkflowStatusToColumn(status) {
  // Customize based on your AHA! workflow
  if (statusLower.includes('shipped')) return 'done';
  if (statusLower.includes('in progress')) return 'now';
  // ...
}
```

### AI Prompts

Modify the AI summarization prompts in `server/services/aiService.js` to adjust the tone and style of generated summaries.

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running:
```bash
pg_ctl status
```

Check your `DATABASE_URL` in `.env` matches your PostgreSQL configuration.

### AHA! Sync Fails

1. Verify your AHA! credentials in `.env`
2. Check the sync logs: Navigate to admin dashboard and check console
3. Ensure your AHA! product ID is correct
4. Verify API permissions in AHA!

### AI Summarization Errors

1. Check API keys are valid
2. Verify endpoint URLs
3. Check API rate limits
4. Review error messages in server console

### Login Issues

1. Verify `ADMIN_PASSWORD` in `.env`
2. Check `JWT_SECRET` is set (minimum 32 characters)
3. Clear localStorage in browser and try again

## Production Deployment

1. Set `NODE_ENV=production` in your `.env`
2. Build the frontend: `npm run build`
3. Set up PostgreSQL with proper security
4. Use environment variables (not `.env` file) on production server
5. Set up SSL/HTTPS
6. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server/index.js --name roadmap-app
pm2 save
```

## Security Considerations

- Always use HTTPS in production
- Keep API keys secure and never commit them
- Use strong passwords and JWT secrets
- Regularly update dependencies
- Set up database backups
- Monitor API rate limits
- Implement IP whitelisting if needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for detailed error messages
3. Verify all environment variables are correctly set

## License

MIT
