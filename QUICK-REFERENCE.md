# 🚀 Better Auth - Quick Reference Card

## 📍 Production URL
**https://auth.supersoul.top**

---

## 🎯 Admin Quick Start

### 1. Create Your Account
```
Visit: https://auth.supersoul.top
Click: Sign Up
Fill in: Email, Name, Password
Check email for verification link
```

### 2. Make Yourself Admin
**In Coolify Terminal:**
```bash
cd /app
node make-admin.js your-email@example.com
```

### 3. Access Admin Dashboard
```
1. Sign in at https://auth.supersoul.top
2. Click "Dashboard"
3. Click "🔐 Admin Dashboard"
```

---

## 🔑 Environment Variables (Coolify)

```bash
NODE_ENV=production
BETTER_AUTH_SECRET=y8ErFtvegNawDLtD2kvYMqko4xLbfKzzv8UA+WyXUBU=
BETTER_AUTH_URL=https://auth.supersoul.top

# Email
SMTP_HOST=mail.starkey.digital
SMTP_PORT=587
SMTP_USER=auth@starkey.digital
SMTP_PASSWORD=wjff1960
SMTP_FROM=auth@starkey.digital

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🛠️ Common Commands

### Local Development
```bash
# Start server
node app/index.js

# Make admin (local)
node make-admin.js email@example.com

# Check database
sqlite3 sqlite.db "SELECT email, role FROM user;"
```

### Production (Coolify Terminal)
```bash
# Make admin
cd /app && node make-admin.js email@example.com

# Check database
cd /app/data && sqlite3 sqlite.db "SELECT email, role FROM user;"

# View logs
# (Use Coolify web interface)

# Backup database
cp /app/data/sqlite.db /app/data/backup-$(date +%Y%m%d).db
```

### Health Checks
```bash
# Local
curl http://localhost:3000/health

# Production
curl https://auth.supersoul.top/health
```

---

## 📁 Key Files

```
app/
  ├── index.js              # Express server
  ├── better-auth.js        # Better Auth config
  └── email-config.js       # SMTP email templates

scripts/
  ├── init-db.js            # Database schema creation
  └── add-banned-field.js   # Migration for banned field

public/
  ├── index.html            # Landing page
  ├── signup.html           # Sign up page
  ├── signin.html           # Sign in page
  ├── dashboard.html        # User dashboard
  ├── admin.html            # Admin dashboard
  ├── privacy.html          # Privacy policy
  └── terms.html            # Terms of service

make-admin.js              # Make user admin script
```

---

## 🎨 Admin Dashboard Features

### User Management
- ✅ View all users (paginated)
- ✅ Search users by email
- ✅ Create new users
- ✅ Edit user details
- ✅ Ban/unban users
- ✅ Delete users
- ✅ Set admin role

### Session Management
- ✅ View all active sessions
- ✅ Revoke sessions
- ✅ See IP addresses
- ✅ Track user agents

### Statistics
- 📊 Total users
- ✅ Verified users
- 🚫 Banned users
- 👑 Admin users

---

## 🔐 User Features

### Authentication
- ✅ Email + Password signup
- ✅ Google OAuth sign-in
- ✅ Email verification
- ✅ Password reset
- ✅ Session management

### User Dashboard
- ✅ View profile
- ✅ Update name
- ✅ Change password
- ✅ Sign out
- ✅ Access admin (if admin)

---

## 🚨 Troubleshooting

### Server won't start locally
```bash
lsof -ti:3000 | xargs kill -9
node app/index.js
```

### Can't access admin dashboard
```bash
# Make sure you're admin
node make-admin.js your-email@example.com

# Sign out and sign in again
```

### Google OAuth not working
- Wait 5 minutes after changing OAuth settings
- Verify redirect URI: `/api/auth/callback/google`
- Check both localhost and production URLs in Google Console

### Database issues
```bash
# Check tables exist
sqlite3 sqlite.db ".tables"
# Should see: account, session, user, verification

# Check schema
sqlite3 sqlite.db "PRAGMA table_info(user);"
# Should have: banned, banReason, banExpiresAt fields
```

### 500 Errors
1. Check Coolify logs for error details
2. Verify persistent storage mounted at `/app/data`
3. Check database exists: `ls /app/data/sqlite.db`
4. Verify env vars are set

---

## 📊 Deployment Flow

```
1. Local Development
   ├─ Make changes
   ├─ Test locally (localhost:3000)
   └─ Commit to git

2. Git Push
   └─ git push origin main

3. Coolify Auto-Deploy (2-3 min)
   ├─ Pull latest code
   ├─ Build container
   ├─ Initialize database
   ├─ Run migrations
   └─ Start server

4. Verify
   └─ curl https://auth.supersoul.top/health
```

---

## 🔒 Security Checklist

✅ Different secrets for local vs production  
✅ HTTPS enforced (Coolify SSL)  
✅ Passwords encrypted (bcrypt)  
✅ Email verification enabled  
✅ Session management  
✅ Role-based access control  
✅ SMTP credentials in env vars  
✅ Banned user support  
✅ Admin-only endpoints protected  

---

## 📞 Support

- **Better Auth Docs:** https://www.better-auth.com
- **GitHub Repo:** https://github.com/Catskill909/better-auth
- **Production URL:** https://auth.supersoul.top

---

**Last Updated:** November 14, 2025  
**Status:** ✅ **LIVE and Working!**
