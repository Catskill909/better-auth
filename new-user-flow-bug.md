# New User Registration Flow Bug: Groundplan and Fix

## Problem Summary
When a new user registers, the app:
- Sends a confirmation email (as expected)
- But immediately logs the user in and grants access (NOT expected)
- User should NOT be logged in until they confirm their email

## Expected Standard Flow
1. **User submits registration form**
2. **Server creates user with status `pending` or `unverified`**
3. **Server sends confirmation email**
4. **User is NOT logged in**
5. **User sees an intermediary screen:**
   - "Check your email to verify your account."
   - Optionally: "Resend email" button
6. **User clicks link in email**
7. **Server verifies token, sets user status to `authorized`/`verified`**
8. **User is now logged in (session created) and redirected to dashboard**

## Current Buggy Flow
- Step 4: User is logged in immediately after registration, even if not verified
- Step 5: No intermediary screen, user is taken directly to dashboard

## Risks
- Unverified users can access protected areas
- Security and compliance issues

## Safe Fix Plan
1. **Backend: Registration Endpoint**
   - After creating user and sending email, DO NOT create a session or set login cookie
   - Respond with success, but indicate that verification is required
2. **Frontend: Registration Handler**
   - After successful registration, redirect to a new `verify-instructions.html` page
   - This page tells user to check their email and verify
   - Optionally: Add "Resend email" button
3. **Login Endpoint**
   - If user tries to log in but is not verified, reject login and show message: "Please verify your email."
4. **Email Verification Endpoint**
   - When user clicks verification link, set status to `authorized`/`verified`, then log them in and redirect to dashboard
5. **Testing**
   - Register new user: should see instructions, not be logged in
   - Try logging in before verifying: should be blocked
   - After verifying: should be logged in and redirected

## Implementation Steps
- [ ] Add `public/verify-instructions.html` (and JS if needed)
- [ ] Update registration handler (frontend) to redirect to this page
- [ ] Update backend registration endpoint to NOT log in user
- [ ] Update login endpoint to block unverified users
- [ ] Ensure verification endpoint logs in user after verifying
- [ ] Test all flows

---

**This plan ensures new users cannot access the app until they verify their email, following standard secure auth practices.**
