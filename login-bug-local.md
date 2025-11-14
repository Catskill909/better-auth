# Login Bug Analysis - Local Development

## Root Cause Identified

The persistent login issue has multiple layers:

### Problem 1: Old Account Format
- `test999@example.com` was created with OLD authentication system
- Password hash uses Better Auth's format: `salt:hash` (not bcrypt)
- Account was created BEFORE we switched to cookie-based authentication
- **This account CANNOT be used with the new authClient system**

### Problem 2: Manual Account Creation Failed
- Tried creating `admin@test.com` with bcrypt hashing
- Better Auth uses different hash format (not standard bcrypt)
- Manual password hashing doesn't match Better Auth's expectations
- Result: "Invalid password hash" error

### Problem 3: Authentication System Mismatch
- Changed frontend from `fetch()` + localStorage to `authClient`
- Changed backend from Bearer tokens to cookie-based sessions
- Old accounts created before these changes are incompatible

## Current Database State

```sql
-- Users in database:
test999@example.com | admin | (OLD format - won't work)
admin@test.com | (doesn't exist or broken hash)
```

## The ACTUAL Fix

**You MUST create a fresh account through the signup UI:**

1. Go to: http://localhost:3000/signup.html
2. Fill out form:
   - Name: Admin User
   - Email: admin@test.com
   - Password: Admin123!
3. Click "Sign Up"
4. After signup succeeds, run:
   ```bash
   node make-admin.js admin@test.com
   ```
5. Then sign in at: http://localhost:3000/signin.html

## Why This Must Be Done Through UI

- Better Auth's signup endpoint creates the correct hash format
- Password is hashed using Better Auth's internal hashing (not bcrypt)
- Account record is created with proper structure
- Manual SQL inserts or bcrypt hashing DON'T WORK

## Alternative: Reset test999 Password

Instead of creating new account, reset test999's password:

```bash
# Delete test999 account completely
sqlite3 sqlite.db "DELETE FROM account WHERE userId = (SELECT id FROM user WHERE email = 'test999@example.com');"

# Then signup through UI with:
# Email: test999@example.com
# Password: Test123!

# Already admin, no need to run make-admin
```

## Server Status

- Server IS running on port 3000 (PID: 29242)
- Database exists and is accessible
- Issue is purely authentication credential format mismatch

## Action Items

1. ✅ Server running
2. ✅ Cookie-based auth implemented
3. ✅ Frontend using authClient
4. ❌ Need FRESH account created through signup UI
5. ⏳ Waiting for user to signup

## DO NOT TRY

- ❌ Manual SQL INSERT with bcrypt hash
- ❌ Using test999@example.com (old format)
- ❌ Creating accounts via curl/API directly
- ❌ Copying password hashes from other accounts

## ONLY DO THIS

✅ Use the signup form in browser: http://localhost:3000/signup.html
✅ Let Better Auth create the account properly
✅ Run make-admin.js after signup succeeds

---

**Date:** November 14, 2025
**Issue:** Login failing with 401 Unauthorized
**Cause:** Incompatible account format from pre-migration system
**Fix:** Create fresh account through signup UI
