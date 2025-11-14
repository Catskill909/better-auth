# 🚀 Better Auth - Production Deployment Guide

**Production URL:** https://auth.supersoul.top

---

## ✅ Current Status

### Completed:
- ✅ Google OAuth configured (localhost + production URLs added)
- ✅ Privacy policy live at `/privacy.html`
- ✅ Terms of service live at `/terms.html`
- ✅ Production secret generated
- ✅ Local development working perfectly
- ✅ SQLite portable database configured
- ✅ Email templates (Material Design)
- ✅ Modal system (no browser alerts)
- ✅ Health check endpoint
- ✅ Graceful shutdown

### Ready to Deploy:
- ✅ Code is production-ready
- ✅ Environment variables documented
- ✅ Coolify configuration ready (nixpacks.toml)

---

## 📋 Next Steps to Go Live

### Step 1: Push to GitHub ✅ (Ready Now!)

```bash
cd /Users/paulhenshaw/Desktop/better-auh

git add .
git commit -m "Production ready for auth.supersoul.top"
git push origin main
```

### Step 2: Deploy in Coolify (10 minutes)

#### A. Create Application
1. Coolify Dashboard → **New Resource** → **Application**
2. **Source:** GitHub
3. **Repository:** `Catskill909/better-auth`
4. **Branch:** `main`
5. Click **Create**

#### B. Configure Domain
1. **Domains** tab → **Add Domain**
2. Enter: `auth.supersoul.top`
3. Enable **SSL** (Let's Encrypt)
4. Enable **Force HTTPS**
5. Click **Save**

#### C. Configure Persistent Storage (CRITICAL for SQLite!)
1. **Storage** tab → **Add Persistent Storage**
2. **Source:** `/app/data`
3. **Destination:** `/app/data`
4. **Is Directory:** ✅ Yes
5. Click **Save**

#### D. Set Environment Variables

Go to **Environment** tab and add:

```bash
# Production Secret (DIFFERENT from local!)
BETTER_AUTH_SECRET=y8ErFtvegNawDLtD2kvYMqko4xLbfKzzv8UA+WyXUBU=

# Production URL
BETTER_AUTH_URL=https://auth.supersoul.top
NODE_ENV=production

# Email (same as local)
SMTP_HOST=mail.starkey.digital
SMTP_PORT=587
SMTP_USER=auth@starkey.digital
SMTP_PASSWORD=wjff1960
SMTP_FROM=auth@starkey.digital

# Google OAuth (use your OAuth credentials from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

⚠️ **Note:** Your Google OAuth client now has BOTH localhost and production URLs, so the same credentials work everywhere!

#### E. Deploy!
1. Click **Deploy** button
2. Wait ~2-3 minutes
3. Check logs for "Deployed successfully" ✅

---

## ✅ Step 3: Verify Deployment

### Test Health Endpoint:
```bash
curl https://auth.supersoul.top/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T...",
  "env": "production"
}
```

### Test in Browser:
1. Visit: `https://auth.supersoul.top`
2. Sign up with your email
3. Check email for verification
4. Try "Sign in with Google"

---

## 👤 Step 4: Create First Admin User

### Option A: Via Coolify Terminal

1. Coolify → Your App → **Terminal** tab
2. Sign up first at `https://auth.supersoul.top`
3. Then run:
```bash
cd /app
node make-admin.js your-email@example.com
```

### Option B: Via SQLite

1. Coolify → **Terminal**
2. Run:
```bash
cd /app/data
sqlite3 sqlite.db "UPDATE user SET role = 'admin' WHERE email = 'your-email@example.com';"
```

---

## 💻 Daily Development Workflow

### Local Development (Unchanged):

```bash
# Start server
node app/index.js

# Make changes, test at http://localhost:3000
```

**Your Local .env stays the same:**
- URL: `http://localhost:3000`
- Development database: `./sqlite.db`
- Same Google OAuth credentials work!

### Deploy Changes to Production:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

✅ **Coolify auto-deploys!** Changes live in ~2-3 minutes.

---

## 🗄️ Two Separate Databases

| Environment | Database | Users |
|-------------|----------|-------|
| **Local** | `./sqlite.db` | Your test users |
| **Production** | `/app/data/sqlite.db` | Real users |

✅ **Independent** - local changes don't affect production
✅ **Portable** - SQLite, no external database needed
✅ **Persistent** - production data survives deployments

---

## 🔐 Google OAuth - How It Works Now

Your OAuth client has:

**Authorized JavaScript origins:**
- `http://localhost:3000` (local dev)
- `https://auth.supersoul.top` (production)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (local)
- `https://auth.supersoul.top/api/auth/callback/google` (production)

**Consent Screen:**
- App name: Better Auth
- Privacy: https://auth.supersoul.top/privacy.html
- Terms: https://auth.supersoul.top/terms.html
- Support email: paullnyc@gmail.com

✅ **One OAuth client, works everywhere!**

---

## 🔧 Quick Commands

### Local:
```bash
# Start server
node app/index.js

# Make admin
node make-admin.js email@example.com

# Check database
sqlite3 sqlite.db "SELECT email, role FROM user;"
```

### Production (Coolify Terminal):
```bash
# Make admin
cd /app && node make-admin.js email@example.com

# Check database
cd /app/data && sqlite3 sqlite.db "SELECT email, role FROM user;"

# Backup database
cp /app/data/sqlite.db /app/data/backup-$(date +%Y%m%d).db
```

### Health Checks:
```bash
# Local
curl http://localhost:3000/health

# Production
curl https://auth.supersoul.top/health
```

---

## 🚨 Troubleshooting

### Local server won't start:
```bash
lsof -ti:3000 | xargs kill -9
node app/index.js
```

### Google OAuth not working:
- Wait 5 minutes after changing OAuth settings (Google delay)
- Check redirect URI is exact: `/api/auth/callback/google`
- Verify both localhost and production URLs are in Google Console

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

### **Root Causes Discovered:**

#### 1. **Migration Prompt Hanging in Production**
- **Issue:** `npx @better-auth/cli migrate` was waiting for `(y/N)` prompt
- **No interactive terminal in production** → migrations never ran → no tables created
- **Fix:** Added `--yes` flag to auto-approve migrations
  ```javascript
  execSync('npx @better-auth/cli migrate --yes', { stdio: 'inherit' });
  ```

#### 2. **Better Auth CLI Couldn't Find Database Config**
- **Issue:** Migration CLI didn't know WHERE to create tables
- **Created tables in wrong location** (or not at all)
- **App looked for tables in `/app/data/sqlite.db`** but they didn't exist
- **Fix:** Created `/better-auth.js` at project root:
  ```javascript
  // better-auth.js (root level - for CLI to discover)
  const { betterAuth } = require('better-auth');
  const Database = require('better-sqlite3');
  const path = require('path');

  const dbPath = process.env.NODE_ENV === 'production'
      ? '/app/data/sqlite.db'
      : path.join(__dirname, 'sqlite.db');

  module.exports.auth = betterAuth({
      database: new Database(dbPath),
  });
  ```

### **Failed Attempts (What Didn't Work):**

1. ❌ **Separate migration script** (`scripts/migrate.js`)
   - Problem: Healthcheck timeout (migrations took too long)
   
2. ❌ **Running migrations in package.json build script**
   - Problem: Build runs before env vars available
   
3. ❌ **Creating Docker files**
   - Problem: Coolify uses Nixpacks, not Docker
   
4. ❌ **Manual database file creation**
   - Problem: File created but empty (no tables)
   
5. ❌ **Setting DATABASE_URL environment variable**
   - Problem: Better Auth CLI doesn't read env vars for config

### **Working Solution (Final):**

1. ✅ **Root-level `better-auth.js` config file**
   - CLI auto-discovers this file
   - Points to correct database path
   - Works in both dev and production

2. ✅ **Inline migration at startup with `--yes` flag**
   - In `app/index.js` BEFORE loading Better Auth:
   ```javascript
   execSync('npx @better-auth/cli migrate --yes', { 
       stdio: 'inherit',
       cwd: path.join(__dirname, '..')
   });
   ```

3. ✅ **Persistent storage properly configured in Coolify**
   - Source: `/app/data`
   - Destination: `/app/data`
   - Is Directory: ✅ Yes

### **Deployment Sequence (Correct Order):**

```bash
# 1. Coolify starts container
# 2. Sets NODE_ENV=production
# 3. Runs: npm start (→ node app/index.js)
# 4. app/index.js executes migration with --yes flag
# 5. CLI finds /better-auth.js config
# 6. Creates tables in /app/data/sqlite.db
# 7. App loads Better Auth from app/better-auth.js
# 8. Server starts listening on port 3000
# 9. All endpoints work! ✅
```

### **Key Files for Deployment:**

| File | Purpose | Critical For |
|------|---------|-------------|
| `/better-auth.js` | CLI config (auto-discovery) | Migrations finding DB |
| `app/better-auth.js` | App runtime config | Better Auth instance |
| `app/index.js` | Server + inline migration | Startup sequence |
| `/app/data/` | Persistent storage mount | Database survival |

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

### **Verification After Deployment:**

```bash
# 1. Check migrations ran
# Look for in logs: "✅ Migrations completed"

# 2. Check tables exist
# In Coolify Terminal:
cd /app/data
sqlite3 sqlite.db ".tables"
# Should see: user, session, account, verification

# 3. Test endpoints
curl https://auth.supersoul.top/health
curl -X POST https://auth.supersoul.top/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
```

### **If Still Getting 500 Errors:**

1. Check Coolify logs for actual error message
2. Verify persistent storage mounted: `ls /app/data/`
3. Verify database exists: `ls /app/data/sqlite.db`
4. Check tables: `sqlite3 /app/data/sqlite.db ".tables"`
5. Verify env vars set: `echo $NODE_ENV` should be "production"
6. Check migrations log: Should see "migration was completed successfully"

---

## 📂 Important Files

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
