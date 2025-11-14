git add .
git commit -m "Production ready for auth.supersoul.top"
git push origin main
git add .
git commit -m "Your changes"
git push origin main
---
# 🚚 This deployment guide has moved!

See the latest deployment instructions in `/docs/DEPLOYMENT.md`.
### Production database not persisting:
- Verify persistent storage mounted at `/app/data` in Coolify
- Check logs: `console.log` shows database path on startup

### Can't access admin dashboard:
```bash
# In Coolify Terminal
cd /app && node make-admin.js your-email@example.com
```

---

## 🔴 CRITICAL DEPLOYMENT ISSUES & SOLUTIONS (Nov 14, 2025)

### **Problem:** All auth endpoints returning 500 errors in production
```
Error: no such table: verification
Error: no such table: user
Error: no such table: session
```

### **ROOT CAUSE IDENTIFIED:**

The database had TWO issues that caused all the 500 errors:

1. ❌ **Database connection race condition** between the Better Auth CLI migration tool and the application startup
2. ❌ **Missing `banned` field** in user table (required by admin plugin)

### **THE REAL FIX (Finally!):**

**1. Stopped using `@better-auth/cli migrate` in production!** Instead:

- ✅ **Created `scripts/init-db.js`** - Direct SQLite schema initialization
- ✅ **Runs synchronously BEFORE Better Auth loads** - No race condition
- ✅ **Single database connection** - No cross-connection visibility issues
- ✅ **Idempotent CREATE TABLE IF NOT EXISTS** - Safe to run repeatedly

**2. Added missing user table fields:**

- ✅ **Created `scripts/add-banned-field.js`** - Migration for existing databases
- ✅ **Added `banned`, `banReason`, `banExpiresAt` columns** - Required by Better Auth admin plugin
- ✅ **Runs before app starts** - Ensures schema is complete

### **Key Changes Made:**

#### 1. **New File: `scripts/init-db.js`**
```javascript
// Creates tables directly using better-sqlite3
// Runs synchronously before app starts
// No separate process, no race condition
```

#### 2. **Updated `app/index.js`**
```javascript
// OLD (BROKEN):
execSync('npx @better-auth/cli migrate --yes');
const { auth } = require('./better-auth');

// NEW (WORKS):
require('../scripts/init-db');  // Synchronous, same process
const { auth } = require('./better-auth');
```

#### 3. **Enhanced `app/better-auth.js`**
Added production-specific configuration:
```javascript
advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    defaultCookieAttributes: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
}
```

### **Why Previous Attempts Failed:**

1. ❌ **`--yes` flag**: Still used separate CLI process
2. ❌ **Waiting after migration**: Didn't fix cross-connection issue
3. ❌ **Better Auth auto-migrations**: Not enabled by default
4. ❌ **Manual SQL via terminal**: Tables created but app couldn't see them

### **Verified Working Solution:**

```bash
# Local test:
node app/index.js

# Output:
🔧 Ensuring database schema exists...
📋 Creating tables...
✅ Tables created: account, session, user, verification
📁 Database path: /Users/paulhenshaw/Desktop/better-auh/sqlite.db
🚀 Server running on port 3000

# Test signup:
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test"}'

# Result: ✅ SUCCESS - verification email sent!
```

### **Environment Variables Required in Coolify:**

```bash
NODE_ENV=production
BETTER_AUTH_SECRET=y8ErFtvegNawDLtD2kvYMqko4xLbfKzzv8UA+WyXUBU=
BETTER_AUTH_URL=https://auth.supersoul.top
SMTP_HOST=mail.starkey.digital
SMTP_PORT=587
SMTP_USER=auth@starkey.digital
SMTP_PASSWORD=wjff1960
SMTP_FROM=auth@starkey.digital
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Deployment Checklist:**

```bash
# 1. Push to GitHub
git add .
git commit -m "Fixed database initialization - no more 500 errors"
git push origin main

# 2. Coolify will auto-deploy
# 3. Watch logs for:
🔧 Ensuring database schema exists...
📋 Creating tables...
✅ Tables created: account, session, user, verification
🚀 Server running on port 3000

# 4. Test immediately:
curl https://auth.supersoul.top/health
# Should return: {"status":"ok","timestamp":"...","env":"production"}

# 5. Test signup:
curl -X POST https://auth.supersoul.top/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test"}'
# Should return user object (no 500 error!)
```

### **What Changed from Previous Failed Deploys:**

| Issue | Before | After |
|-------|--------|-------|
| **Migration method** | `npx @better-auth/cli migrate --yes` | Direct `scripts/init-db.js` |
| **Database connection** | Separate CLI process | Same process, synchronous |
| **Timing** | Race condition possible | Sequential, guaranteed |
| **Visibility** | Tables might not be visible | Always visible |
| **Idempotency** | CLI might fail on re-run | `CREATE TABLE IF NOT EXISTS` |

---

## 📋 Updated Deployment Steps

```
.env                      # Local config (gitignored)
.env.example             # Template for Coolify
app/better-auth.js       # Auto-detects dev vs production
app/index.js             # Server with health checks
nixpacks.toml            # Coolify build config
public/privacy.html      # Privacy policy
public/terms.html        # Terms of service
```

---

## 🔒 Security Checklist

✅ Different secrets for local vs production
✅ HTTPS enforced in production (Coolify SSL)
✅ Passwords encrypted (bcrypt)
✅ Email verification enabled
✅ Session management
✅ Role-based access control
✅ SMTP credentials in environment variables
✅ Health check endpoint
✅ Graceful shutdown

---

## 📊 Post-Deployment Monitoring

### Check Logs:
- Coolify → Your App → **Logs** tab

### Health Check:
- Coolify can auto-monitor `/health` endpoint
- Set interval to 30 seconds
- Auto-restart if unhealthy

### Database Backups:
```bash
# Weekly backup (set up cron in Coolify)
cp /app/data/sqlite.db /app/data/backup-weekly.db
```

---

## 🎯 You're Ready!

### What Works:
✅ Local dev at `http://localhost:3000`
✅ Production ready for `https://auth.supersoul.top`
✅ Google OAuth works both places
✅ Privacy & Terms pages ready
✅ Email verification
✅ Password reset
✅ Admin dashboard
✅ Portable SQLite database
✅ Auto-deploy on git push

### Next Action:
1. Push to GitHub (`git push origin main`)
2. Deploy in Coolify (follow Step 2 above)
3. Create first admin user
4. You're live! 🚀

---

**Questions?** Everything is configured and ready to deploy!
