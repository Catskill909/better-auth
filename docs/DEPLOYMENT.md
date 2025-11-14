# 🚀 Better Auth - Production Deployment Guide

**Production URL:** https://auth.supersoul.top

---

## 🟢 Deployment Overview (v1.1.0+)

This app now uses Better Auth's secure, persistent HTTP-only cookie sessions for all authentication. No tokens in localStorage. All session logic is handled by Better Auth and validated server-side.

### Key Production Requirements
- **HTTPS enforced** (Coolify SSL, Force HTTPS)
- **Persistent storage** for `/app/data` (SQLite DB) and `/app/storage` (media)
- **Environment variables** for all secrets (never hardcoded)
- **Secure cookies** (`useSecureCookies: true`, `secure: true`)
- **Session persistence** (30-day expiry, httpOnly, path=/)
- **No localStorage tokens** (all session state is in cookies)

---

## 🏗️ Step-by-Step Deployment (Coolify)

### 1. Push to GitHub
```bash
cd /Users/paulhenshaw/Desktop/better-auh
git add .
git commit -m "Production ready for auth.supersoul.top"
git push origin main
```

### 2. Deploy in Coolify
- **Source:** GitHub
- **Branch:** main
- **Domains:** `auth.supersoul.top` (enable SSL, Force HTTPS)

#### Persistent Storage
- `/app/data` → `/app/data` (SQLite DB)
- `/app/storage` → `/app/storage` (media)

#### Environment Variables
```env
BETTER_AUTH_SECRET=your-production-secret
BETTER_AUTH_URL=https://auth.supersoul.top
NODE_ENV=production
SMTP_HOST=mail.starkey.digital
SMTP_PORT=587
SMTP_USER=auth@starkey.digital
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=auth@starkey.digital
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🧪 Post-Deploy Checklist
- [ ] Health check: `curl https://auth.supersoul.top/health`
- [ ] Sign up, verify email, login, test Google OAuth
- [ ] Make yourself admin: `cd /app && node make-admin.js your@email.com`
- [ ] Test admin dashboard, media upload, session persistence

---

## 🛡️ Security Notes
- All sessions are HTTP-only cookies (no tokens in JS)
- Cookies are `secure`, `httpOnly`, `sameSite=lax` (or `strict`)
- Persistent login: 30-day expiry, survives browser restarts
- Production and local DBs are separate
- Never commit `.env` or credentials to git

---

## 🐛 Troubleshooting
- **Session not persisting?** Check cookie settings, HTTPS, and persistent storage.
- **Emails not sending?** Check SMTP env vars and server logs.
- **DB errors?** Ensure `/app/data` is persistent and migrations run at app start.

---

## 📚 See also
- [README.md](../README.md)
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)
- [FUTURE-DEV.md](../FUTURE-DEV.md)
