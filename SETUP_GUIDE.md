# Quick Setup Guide

This guide will help you get the Done-Now-Next-Explore roadmap tool running in under 10 minutes.

## Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

## Step 2: Set Up Database (2 minutes)

### Create PostgreSQL Database

```bash
# Using createdb command
createdb roadmap_db

# OR using psql
psql -U postgres
CREATE DATABASE roadmap_db;
\q
```

## Step 3: Configure Environment (3 minutes)

### Create .env file

```bash
cp .env.example .env
```

### Edit .env with your details

**Minimum required configuration:**

```env
# Database
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/roadmap_db

# Admin Access
ADMIN_PASSWORD=YourSecurePassword123
JWT_SECRET=your-very-long-secret-key-at-least-32-characters-long

# AHA! Credentials
AHA_API_URL=https://your-company.aha.io/api/v1
AHA_API_KEY=your-aha-api-key
AHA_PRODUCT_ID=PROD-123

# AI API (choose at least one)
GEMINI_API_KEY=your-gemini-api-key
# OR
ONEADVANCED_AI_URL=https://your-ai-endpoint
ONEADVANCED_AI_KEY=your-ai-key
```

### Where to find your credentials:

**AHA! API Key:**
1. Log into AHA!
2. Go to Settings → Personal → Developer
3. Generate API key
4. Find your Product ID in the URL: `aha.io/products/PROD-123`

**Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

## Step 4: Initialize Database (1 minute)

```bash
node server/db/migrate.js
```

You should see: `✓ Database migration completed successfully`

## Step 5: Start the Application (1 minute)

```bash
npm run dev
```

This starts:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Step 6: Test the Application (1 minute)

### Test Customer View
1. Open http://localhost:5173
2. You should see the 4-column roadmap (currently empty)

### Test Admin Login
1. Click "Admin" in the top right
2. Enter your `ADMIN_PASSWORD` from `.env`
3. You should be redirected to the admin dashboard

### Test AHA! Sync
1. In admin dashboard, click "Sync from AHA!"
2. Wait for the sync to complete
3. You should see your initiatives appear in the columns

## Quick Verification Checklist

- [ ] Database created and connected
- [ ] Dependencies installed (backend and client)
- [ ] `.env` file configured
- [ ] Database migrated successfully
- [ ] Dev server running (both backend and frontend)
- [ ] Customer view loads at http://localhost:5173
- [ ] Can login to admin dashboard
- [ ] Can sync from AHA! successfully

## Common Issues

### "Database connection failed"
- Check PostgreSQL is running: `pg_ctl status`
- Verify `DATABASE_URL` in `.env` is correct
- Test connection: `psql $DATABASE_URL`

### "Admin login fails"
- Check `ADMIN_PASSWORD` and `JWT_SECRET` are set in `.env`
- Clear browser localStorage and try again
- Check server console for errors

### "AHA! sync fails"
- Verify AHA! credentials in `.env`
- Check Product ID is correct
- Ensure you have API access enabled in AHA!

### "AI summarization fails"
- Verify at least one AI API key is configured
- Check API endpoint URLs
- Review rate limits on your AI provider

## Next Steps

Once everything is working:

1. **Customize the workflow mapping** in `server/services/ahaService.js` to match your AHA! statuses
2. **Add your branding** by updating colors in `client/tailwind.config.js`
3. **Test editing initiatives** in the admin dashboard
4. **Configure auto-refresh** if you want scheduled syncs (requires additional setup)

## Need Help?

Check the main README.md for:
- Detailed API documentation
- Customization options
- Production deployment guide
- Security best practices

## Production Checklist

Before deploying to production:

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Generate a secure random `JWT_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend: `npm run build`
- [ ] Set up HTTPS/SSL
- [ ] Configure database backups
- [ ] Use environment variables (not `.env` file)
- [ ] Set up monitoring and logging
- [ ] Test all features thoroughly

Estimated setup time: **10 minutes** (excluding API credential acquisition)
