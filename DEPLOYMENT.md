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
