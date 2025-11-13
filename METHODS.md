# Better Auth - Authentication Methods Implementation Plan

## Current Status ✅
- ✅ Email/Password authentication working
- ✅ User registration and login
- ✅ Session management
- ✅ Dashboard with user info
- ✅ Sign out functionality

---

## Phase 1: Email Verification Setup

### Prerequisites
- DirectAdmin email server details:
  - SMTP Server: `mail.starkey.digital`
  - Port: `587`
  - Username: `auth@starkey.digital`
  - Password: `wjff1960`

### Implementation Steps

#### 1.1 Install Email Dependencies
```bash
npm install nodemailer
```

#### 1.2 Configure Email Transport
Create `app/email-config.js`:
- Set up Nodemailer with DirectAdmin SMTP settings
- Configure email templates for verification

#### 1.3 Update Better Auth Configuration
In `app/better-auth.js`:
- Add email verification plugin
- Configure sendEmail callback
- Set verification URL

#### 1.4 Create Email Templates
Create `app/email-templates/`:
- `verification-email.html` - Welcome + verify email
- `password-reset.html` - Password reset email
- Email styling with brand colors

#### 1.5 Add Verification UI
- Update `dashboard.html` to show verification status
- Add "Resend Verification Email" button
- Create `verify-email.html` page for email confirmation
- Add success/error messages

#### 1.6 Test Email Flow
- Sign up new user
- Receive verification email
- Click verification link
- Confirm email verified in dashboard

---

## Phase 2: Google OAuth Setup

### Prerequisites
- Google Cloud Console account
- Create OAuth 2.0 credentials

### Implementation Steps

#### 2.1 Google Cloud Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Get Client ID and Client Secret

#### 2.2 Update Environment Variables
Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 2.3 Configure Better Auth
In `app/better-auth.js`:
- Add Google to socialProviders
- Configure scopes (email, profile)

#### 2.4 Update UI
Add to all auth pages:
- "Sign in with Google" button
- Google branding (logo, colors)
- OAuth flow handling

#### 2.5 Handle OAuth Callback
- Update `dashboard.js` to handle OAuth tokens
- Link existing accounts if email matches
- Create new account for new Google users

---

## Phase 3: Apple Sign In Setup

### Prerequisites
- Apple Developer Account ($99/year)
- App ID configuration

### Implementation Steps

#### 3.1 Apple Developer Configuration
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Register App ID with Sign in with Apple capability
3. Create Services ID
4. Configure Return URLs: `http://localhost:3000/api/auth/callback/apple`
5. Generate private key (.p8 file)
6. Get Team ID, Key ID, Client ID

#### 3.2 Update Environment Variables
Add to `.env`:
```env
APPLE_CLIENT_ID=your-apple-services-id
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=path-to-p8-file
```

#### 3.3 Configure Better Auth
In `app/better-auth.js`:
- Add Apple to socialProviders
- Configure certificates and keys
- Set scopes (name, email)

#### 3.4 Update UI
Add to all auth pages:
- "Sign in with Apple" button
- Apple branding (black button, Apple logo)
- Handle Apple's unique user flow

---

## Phase 4: Production Deployment Considerations

### 4.1 Update URLs for Production
- Change `BETTER_AUTH_URL` from localhost to production domain
- Update OAuth redirect URIs in Google/Apple consoles
- Update email verification links

### 4.2 Security Enhancements
- Enable HTTPS/SSL
- Set secure cookie flags
- Implement rate limiting
- Add CSRF protection
- Environment-specific configs

### 4.3 Database Migration
- Consider moving from SQLite to PostgreSQL/MySQL for production
- Set up database backups
- Plan migration strategy

---

## File Structure After Implementation

```
better-auh/
├── .env (updated with all OAuth keys)
├── app/
│   ├── better-auth.js (updated with all providers)
│   ├── email-config.js (new - email setup)
│   ├── email-templates/
│   │   ├── verification-email.html
│   │   └── password-reset.html
│   └── index.js
├── public/
│   ├── index.html (updated with social buttons)
│   ├── signup.html (updated with social buttons)
│   ├── signin.html (updated with social buttons)
│   ├── verify-email.html (new)
│   ├── dashboard.html (updated with verification status)
│   └── styles.css (updated for social buttons)
└── package.json (updated dependencies)
```

---

## Timeline Estimate

- **Phase 1 (Email Verification)**: 2-3 hours
- **Phase 2 (Google OAuth)**: 1-2 hours
- **Phase 3 (Apple Sign In)**: 2-3 hours
- **Phase 4 (Production Prep)**: 1-2 hours

**Total**: ~8-10 hours

---

## Next Steps

1. **Start with Phase 1** - Email verification is most critical
2. **Test thoroughly** - Each phase should be tested before moving on
3. **Document credentials** - Keep OAuth keys secure
4. **Consider staging environment** - Test OAuth flows before production

---

## Testing Checklist

### Email Verification
- [ ] User receives verification email
- [ ] Email contains working verification link
- [ ] Dashboard shows verified status after clicking link
- [ ] Resend verification works
- [ ] Email styling looks professional

### Google OAuth
- [ ] "Sign in with Google" button appears
- [ ] OAuth flow redirects correctly
- [ ] User data (name, email) imported correctly
- [ ] Existing users can link Google account
- [ ] New users create account via Google

### Apple Sign In
- [ ] "Sign in with Apple" button appears
- [ ] OAuth flow works on all browsers
- [ ] User data imported correctly
- [ ] Name/email handling works (Apple privacy features)
- [ ] Existing users can link Apple account

---

## Resources

- [Better Auth Email Verification](https://www.better-auth.com/docs/plugins/email-verification)
- [Better Auth Social Providers](https://www.better-auth.com/docs/authentication/social)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
- [Nodemailer Documentation](https://nodemailer.com/)
