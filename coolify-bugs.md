# Coolify Deployment Issues - Tracking

## ✅ REAL PROBLEM FOUND!

**Error from Coolify logs:**
```
ERROR [Better Auth]: no such table: verification
ERROR [Better Auth]: no such table: user
```

**Root Cause:** 
- Database file `/app/data/sqlite.db` is created
- But it's EMPTY - no tables exist!
- Migrations never ran in production
- Better Auth tries to query tables that don't exist → 500 errors

**Why migrations didn't run:**
- Our build script doesn't run migrations anymore
- Changed it to just `mkdir -p /app/data && echo 'Build complete'`
- Need to run migrations when the app STARTS, not during build

---

## Solution:

Run Better Auth migrations at **runtime** (when app starts), not at build time.

**Fix:** Update `app/index.js` to run migrations before starting the server.
