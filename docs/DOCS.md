# 📚 Better Auth - Documentation Index (v1.1.0+)

All documentation for your Better Auth application is now consolidated in the `/docs` folder.

---

## Main Documentation
- [README.md](../README.md) — Project overview, features, install, quick start
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment, Coolify, env vars, troubleshooting
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) — Security checklist, session/cookie model
- [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) — Admin dashboard, user/session/media management
- [LOCAL-CREDENTIALS.md](./LOCAL-CREDENTIALS.md) — Local dev/test accounts, SMTP, DB access

---

## Quick Start
- For local dev: see [README.md](../README.md) and [LOCAL-CREDENTIALS.md](./LOCAL-CREDENTIALS.md)
- For production: see [DEPLOYMENT.md](./DEPLOYMENT.md)
- For admin features: see [ADMIN-GUIDE.md](./ADMIN-GUIDE.md)
- For security: see [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)

---

## Project Status
- All session logic is now handled by Better Auth cookies (no localStorage)
- Persistent login is default (30-day expiry)
- Root URL (`/`) redirects to dashboard if logged in
- All docs are up to date as of Nov 14, 2025
