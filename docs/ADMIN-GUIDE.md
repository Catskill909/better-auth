# Admin User Management Guide (Better Auth v1.1.0+)

## Quick Start

1. **Sign up at your production site**
   - Visit: https://auth.supersoul.top
   - Create an account and verify your email
2. **Make yourself admin (in Coolify Terminal):**
   ```bash
   cd /app
   node make-admin.js your-email@example.com
   ```
3. **Access the dashboard:**
   - Sign in and go to `/admin.html`

---

## Overview

The admin dashboard uses Better Auth's admin plugin and cookie-based sessions (no tokens in JS). Only users with `role = 'admin'` can access admin features.

### Features
- View, create, edit, ban/unban, and delete users
- Change user roles (admin/user)
- View/revoke sessions
- Upload/manage media
- See user stats (total, verified, banned, admins)

### Security Note
- All admin access is session-based (Better Auth cookies, httpOnly, secure)
- If you lose admin access, re-run `make-admin.js` or update the DB directly

---

## Troubleshooting
- **Can't access admin dashboard?**
  - Ensure your user has `role = 'admin'` in the database
  - Run: `node make-admin.js your-email@example.com`
- **Session expired?**
  - Log in again; sessions are persistent for 30 days by default
- **Emails not sending?**
  - Check SMTP env vars and server logs

---

## See Also
- [README.md](../README.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)
