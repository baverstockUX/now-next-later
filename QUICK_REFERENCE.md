# Quick Reference Card

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Create database
createdb roadmap_db

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Run migrations
node server/db/migrate.js

# 5. Start development
npm run dev
```

## 🌐 URLs

- **Customer View**: http://localhost:5173
- **Admin View**: http://localhost:5173/admin
- **API**: http://localhost:3000/api

## 🔑 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/roadmap_db
ADMIN_PASSWORD=your-password
JWT_SECRET=min-32-chars-secret
AHA_API_URL=https://company.aha.io/api/v1
AHA_API_KEY=your-key
AHA_PRODUCT_ID=PROD-XXX
GEMINI_API_KEY=your-key
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/index.js` | Express server entry |
| `server/routes/sync.js` | AHA! sync logic |
| `server/services/aiService.js` | AI summarization |
| `client/src/App.jsx` | React root |
| `client/src/components/AdminView.jsx` | Admin dashboard |
| `client/src/components/CustomerView.jsx` | Public roadmap |

## 🛠️ Commands

```bash
# Development
npm run dev              # Start both servers
npm run server:dev       # Backend only
npm run client:dev       # Frontend only

# Production
npm run build            # Build frontend
npm start                # Start production server

# Database
node server/db/migrate.js    # Run migrations
psql $DATABASE_URL           # Connect to DB
```

## 🔒 Admin Access

1. Navigate to `/admin`
2. Enter password from `.env`
3. JWT token (24h expiry)
4. Stored in localStorage

## 🔄 Sync Workflow

```
Admin → Sync Button → AHA! API → AI Summarization → Database → UI Update
```

## 🎨 Branding

**Colors**: `client/tailwind.config.js`
```javascript
colors: {
  'oneadvanced': {
    DEFAULT: '#e9510e',
    // ...
  }
}
```

**Font**: Montserrat (Google Fonts)

## 📊 Database Tables

- **initiatives**: Roadmap items
- **admin_config**: Settings (AI provider, product name)
- **sync_logs**: Sync history

## 🔌 API Endpoints

### Public
- `GET /api/initiatives` - Get visible items
- `POST /api/auth/login` - Login

### Protected (JWT)
- `POST /api/sync/refresh` - Sync from AHA!
- `PUT /api/initiatives/:id` - Update item
- `GET /api/config` - Get settings

## 🏛️ Architecture

```
React (Port 5173) → Express (Port 3000) → PostgreSQL
                 ↓
            AHA! API + AI APIs
```

## 🐛 Common Issues

**Login fails**
- Check `ADMIN_PASSWORD` in `.env`
- Clear browser localStorage
- Verify `JWT_SECRET` is set

**Sync fails**
- Verify AHA! credentials
- Check product ID is correct
- Review server console logs

**Database errors**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Run migrations

## 📚 Documentation

- `README.md` - Complete guide
- `SETUP_GUIDE.md` - Quick setup
- `ARCHITECTURE.md` - Technical details
- `PROJECT_SUMMARY.md` - Overview

## 🔐 Security Checklist

- [ ] Strong `ADMIN_PASSWORD`
- [ ] Random `JWT_SECRET` (32+ chars)
- [ ] Never commit `.env`
- [ ] Use HTTPS in production
- [ ] Update dependencies regularly

## 🎯 Core Features

✅ 4-column roadmap (Done/Now/Next/Explore)
✅ AHA! integration with manual sync
✅ Dual AI providers (OneAdvanced + Gemini)
✅ Admin dashboard with editing
✅ Custom tags and timelines
✅ Visibility control
✅ OneAdvanced branding
✅ Responsive design
✅ JWT authentication
✅ PostgreSQL storage

## 📦 Tech Stack

**Backend**: Node.js, Express, PostgreSQL, JWT
**Frontend**: React 18, Tailwind CSS, Vite
**External**: AHA! API, AI APIs

## 🚢 Production Deploy

```bash
# 1. Build
npm run build

# 2. Environment
export NODE_ENV=production
export DATABASE_URL=...
export ADMIN_PASSWORD=...
export JWT_SECRET=...

# 3. Start
npm start

# Or with PM2
pm2 start server/index.js --name roadmap
```

## 📞 Support

Check logs:
```bash
# Development
Check terminal where npm run dev is running

# Production (PM2)
pm2 logs roadmap
```

Database query:
```sql
-- Check initiatives
SELECT column_name, COUNT(*) FROM initiatives GROUP BY column_name;

-- Recent syncs
SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 5;
```

## 🎨 Customization Points

1. **Workflow Mapping**: `server/services/ahaService.js`
2. **AI Prompts**: `server/services/aiService.js`
3. **Colors**: `client/tailwind.config.js`
4. **Column Names**: Update schema and components

## ⚡ Performance Tips

- Add Redis caching for initiatives
- Index frequently queried fields
- Implement pagination for large datasets
- Use CDN for static assets
- Enable gzip compression

## 🔮 Future Enhancements

- Scheduled auto-sync
- Multi-user support
- Real-time updates (WebSockets)
- Analytics dashboard
- Email notifications
- Version history
- Comments/feedback

---

**Need Help?** Review README.md or SETUP_GUIDE.md
**Quick Setup**: Run `./setup.sh`
**Estimated Setup Time**: 10 minutes
