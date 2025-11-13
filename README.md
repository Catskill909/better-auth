# Better Auth - Complete Authentication System

A complete, portable authentication system built with Better Auth, featuring email verification, password reset, and admin user management.

## 🚀 Features

- ✅ **Email/Password Authentication** - Secure user signup and signin
- ✅ **Email Verification** - DirectAdmin SMTP integration for email verification
- ✅ **Password Reset** - Forgot password and password reset functionality
- ✅ **Admin Dashboard** - Comprehensive user management interface
- ✅ **Session Management** - View and manage active user sessions
- ✅ **User Roles** - User and admin role system
- ✅ **Beautiful UI** - Responsive design with purple gradient theme
- ✅ **SQLite Database** - Local file-based database (no external DB required)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone or download this directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (already exists):
   ```env
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
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
   - Click "Sign Up" and create an account
   - Check your email for verification link

3. **Make yourself an admin**
   ```bash
   node make-admin.js your-email@example.com
   ```

4. **Access the admin dashboard**
   - Sign in with your account
   - Click "Admin Dashboard" button on your dashboard
   - Or navigate to `http://localhost:3000/admin.html`

## 🔐 Admin Dashboard

The admin dashboard provides comprehensive user management capabilities:

### User Management
- **View all users** with pagination and search
- **Create new users** with custom roles
- **Edit user details** (name, email, role, verification status)
- **Delete users** permanently
- **Ban/Unban users** to control access
- **Change user roles** (user ↔ admin)

### Session Management
- **View active sessions** for all users
- **Revoke sessions** to force logout
- **Monitor user activity** with IP and user agent info

### Statistics
- Total users count
- Verified users count
- Banned users count
- Admin users count

## 📁 Project Structure

```
better-auth/
├── app/
│   ├── better-auth.js      # Better Auth configuration
│   ├── email-config.js     # Email sending configuration
│   └── index.js            # Express server
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

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Better Auth Email Verification](https://www.better-auth.com/docs/plugins/email-verification)

## 🔒 Security Notes

- Always use HTTPS in production
- Keep `BETTER_AUTH_SECRET` secure and random
- Don't commit `.env` file to version control
- Use strong passwords for admin accounts
- Regularly update dependencies
- Monitor admin actions and sessions

## 📝 License

This is a starter template for Better Auth. Customize as needed for your project.

## 🤝 Support

For Better Auth issues, visit: https://github.com/better-auth/better-auth

---

**Built with ❤️ using Better Auth**
