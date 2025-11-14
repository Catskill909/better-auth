
# Better Auth - Complete Authentication System

A portable authentication system using Better Auth, now with secure, persistent HTTP-only cookie sessions (no localStorage tokens), email verification, password reset, and admin user management.

## 🚀 Features

- ✅ **Email/Password Authentication** (Better Auth, secure cookies)
- ✅ **Google OAuth**
- ✅ **Email Verification**
- ✅ **Password Reset**
- ✅ **Admin Dashboard**
- ✅ **Session Management** (persistent, HTTP-only cookies)
- ✅ **User Roles** (admin/user)
- ✅ **Modern UI** (Material Design, dark/light mode)
- ✅ **Global Modal System**
- ✅ **Media Storage** (avatars, uploads)
- ✅ **Admin Media Library**
- ✅ **SQLite Database** (portable, persistent)

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## 🔧 Installation

1. **Clone or download this directory**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
4. **Run database migrations** (if needed)
   ```bash
   npm run migrate
   ```

## 🎯 Quick Start

1. **Start the server**
   ```bash
   npm start
   ```
   Server will run at `http://localhost:3000`
2. **Create your first account**
   - Open `http://localhost:3000` in your browser
   - Sign up and verify your email
3. **Make yourself an admin**
   ```bash
   node make-admin.js your-email@example.com
   ```
4. **Access the admin dashboard**
   - Sign in and go to `/admin.html`

## 🔐 Admin Dashboard

The admin dashboard provides user/session/media management. All admin access is session-based (Better Auth cookies, not tokens).

- View, create, edit, ban/unban, and delete users
- Change user roles (admin/user)
- View/revoke sessions
- Upload/manage media
- See user stats (total, verified, banned, admins)

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
2. Create a new project or select existing one
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Set **Application type** to **Web application**
5. Add **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
7. Copy **Client ID** and **Client Secret** to your `.env` file
8. Restart the server

Users can now click "Sign in with Google" button on the signin page!

## 📁 Project Structure

```
better-auth/
├── app/
│   ├── better-auth.js      # Better Auth configuration
│   ├── email-config.js     # Email sending configuration
│   ├── index.js            # Express server
│   ├── upload-middleware.js # File upload configuration
│   ├── image-processor.js  # Image resize/optimization
│   └── media-utils.js      # Media helper functions
├── storage/                # Uploaded files
│   ├── avatars/           # User avatars
│   ├── media/             # Admin uploads
│   └── temp/              # Temporary files
├── public/
│   ├── index.html          # Landing page
│   ├── signup.html         # Signup page
│   ├── signin.html         # Sign in page
│   ├── dashboard.html      # User dashboard
│   ├── admin.html          # Admin dashboard
│   ├── verify-email.html   # Email verification page
│   ├── forgot-password.html # Forgot password page
│   ├── reset-password.html # Password reset page
│   ├── styles.css          # Main styles
│   ├── admin-styles.css    # Admin dashboard styles
│   └── *.js                # Corresponding JavaScript files
├── make-admin.js           # Helper script to create admins
├── sqlite.db               # SQLite database (auto-created)
├── .env                    # Environment variables
└── package.json
```

## 🛠️ Better Auth Plugins Used

1. **Admin Plugin** - User and session management
2. **Email Verification Plugin** - Email verification workflow
3. **Password Reset** - Forgot password functionality

## 📧 Email Configuration

The system uses DirectAdmin SMTP for email delivery:

- **Host:** mail.starkey.digital
- **Port:** 587
- **From:** auth@starkey.digital

Email templates are defined in `app/email-config.js`:
- Verification emails
- Password reset emails
- Password changed confirmation emails

## 🔑 Making Users Admins

Use the `make-admin.js` script to grant admin privileges:

```bash
node make-admin.js user@example.com
```

Or manually update the database:

```bash
sqlite3 sqlite.db "UPDATE user SET role = 'admin' WHERE email = 'user@example.com';"
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create new user
- `POST /api/auth/sign-in` - Sign in user
- `POST /api/auth/sign-out` - Sign out user
- `GET /api/auth/get-session` - Get current session

### Email Verification
- `POST /api/auth/send-verification-email` - Send verification email
- `GET /api/auth/verify-email` - Verify email with token

### Password Reset
- `POST /api/auth/forget-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Media Endpoints
- `POST /api/user/avatar` - Upload user avatar
- `GET /api/user/avatar` - Get current user's avatar
- `DELETE /api/user/avatar` - Delete user avatar
- `GET /uploads/avatars/full/:filename` - Serve full-size avatar
- `GET /uploads/avatars/thumbnails/:filename` - Serve avatar thumbnail

### Admin Endpoints (Requires Admin Role)
- `GET /api/auth/admin/list-users` - List all users
- `POST /api/auth/admin/create-user` - Create new user
- `POST /api/auth/admin/update-user` - Update user details
- `POST /api/auth/admin/set-role` - Change user role
- `POST /api/auth/admin/ban-user` - Ban a user
- `POST /api/auth/admin/unban-user` - Unban a user
- `POST /api/auth/admin/remove-user` - Delete a user
- `GET /api/auth/admin/list-sessions` - List all sessions
- `POST /api/auth/admin/revoke-session` - Revoke a session
- `POST /api/admin/media/upload` - Upload media files
- `GET /api/admin/media/list` - List all media
- `DELETE /api/admin/media/:id` - Delete media file

## 🎨 Customization

### Change Theme Colors
Edit `public/styles.css` and `public/admin-styles.css` to customize the gradient:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Update Email Templates
Edit `app/email-config.js` to customize email content and styling.

### Add More Admin Features
The Better Auth admin plugin supports additional features:
- User impersonation
- Bulk user operations
- Custom filters and searches

See [Better Auth Admin Plugin Docs](https://www.better-auth.com/docs/plugins/admin)

## 🐛 Troubleshooting

### Can't access admin dashboard
- Ensure your user has `role = 'admin'` in the database
- Run: `node make-admin.js your-email@example.com`

### Emails not sending
- Check email credentials in `app/email-config.js`
- Verify SMTP server is accessible
- Check server logs for email errors

### Database errors
- Delete `sqlite.db` and restart (will lose all data)
- Run migrations: `npm run migrate`

### Port 3000 already in use
- Stop the existing process: `pkill -f "node app/index.js"`
- Or change the port in `app/index.js`

## 📖 Documentation

All detailed docs are now in the `/docs` folder:
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Audit](docs/SECURITY-AUDIT.md)

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Better Auth Email Verification](https://www.better-auth.com/docs/plugins/email-verification)

## 🚀 Production Deployment

See `/docs/DEPLOYMENT.md` for full production deployment steps, security, and troubleshooting.

**Production URL:** https://auth.supersoul.top

## 📝 License

This is a starter template for Better Auth. Customize as needed for your project.

## 🤝 Support

For Better Auth issues, visit: https://github.com/better-auth/better-auth

---

**Built with ❤️ using Better Auth**
