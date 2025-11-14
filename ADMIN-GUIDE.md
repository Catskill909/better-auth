# Admin User Management Guide

## 🎯 Quick Start

### **How to Access Admin Dashboard:**

**Step 1: Sign up at your production site**
```
Visit: https://auth.supersoul.top
Create an account with your email
```

**Step 2: Make yourself admin (in Coolify Terminal)**
```bash
cd /app
node make-admin.js your-email@example.com
```

**Step 3: Access the dashboard**
```
1. Sign in at https://auth.supersoul.top
2. Click "Dashboard" button
3. Click "🔐 Admin Dashboard" button
```

**That's it!** You're now an admin and can manage all users.

---

## Overview

The admin dashboard provides a complete user management interface built with Better Auth's admin plugin. This guide covers all admin features and how to use them.

## Accessing the Admin Dashboard

### 1. Create an Admin User

There are three ways to make a user an admin:

**Option A: Using the helper script (Recommended)**
```bash
node make-admin.js user@example.com
```

**Option B: Directly via SQLite**
```bash
sqlite3 sqlite.db "UPDATE user SET role = 'admin' WHERE email = 'user@example.com';"
```

**Option C: Via the Admin Dashboard** (if you're already an admin)
- Navigate to Admin Dashboard → Users
- Click "Edit" on any user
- Change "Role" dropdown to "Admin"
- Click "Update User"

### 2. Access the Dashboard

Once you have admin privileges:
1. Sign in to your account at `http://localhost:3000/signin.html`
2. From your dashboard, click the "🔐 Admin Dashboard" button
3. Or navigate directly to `http://localhost:3000/admin.html`

**Security Note:** Only users with `role = 'admin'` can access the admin dashboard. Others will be redirected to their regular dashboard.

## Dashboard Sections

### 👥 Users

The main user management interface with comprehensive controls.

#### Statistics Cards
Four quick stats displayed at the top:
- **Total Users** - Total number of registered users
- **Verified** - Users who have verified their email
- **Banned** - Users who are currently banned
- **Admins** - Users with admin role

#### User Table
Displays all users with the following information:
- **Name** - User's display name
- **Email** - User's email address
- **Role** - User role (user/admin) with colored badge
- **Verified** - Email verification status
- **Status** - Account status (Active/Banned)
- **Created** - Account creation date
- **Actions** - Edit, Ban/Unban, Delete buttons

#### Search and Filter
- **Search Bar** - Search users by email address
  - Type email and press Enter or click Search
  - Click Clear to reset search
- **Pagination** - Navigate through users (10 per page)
  - Previous/Next buttons
  - Current page indicator

### Creating New Users

1. Click the "**+ Create User**" button
2. Fill in the form:
   - **Name** - User's display name (required)
   - **Email** - Must be unique (required)
   - **Password** - Minimum 8 characters (required)
   - **Role** - Select "User" or "Admin" (default: User)
3. Click "**Create User**"

**Note:** Created users will receive a verification email automatically.

### Editing Users

1. Click "**Edit**" button on any user
2. Modify the following:
   - **Name** - Change display name
   - **Email** - Email cannot be changed (disabled field)
   - **Role** - Switch between User and Admin
   - **Email Verified** - Manually verify email (checkbox)
3. Click "**Update User**"

**Use Cases:**
- Promote a user to admin
- Manually verify a user's email
- Update user's display name

### Banning/Unbanning Users

**To Ban a User:**
1. Click the "**Ban**" button (yellow) on any active user
2. User will immediately lose access to their account
3. Button changes to "Unban" (green)

**To Unban a User:**
1. Click the "**Unban**" button on any banned user
2. User regains access to their account
3. Button changes back to "Ban"

**What happens when banned:**
- User cannot sign in
- Existing sessions remain valid until expiry
- User can still receive emails
- Account data is preserved

### Deleting Users

1. Click the "**Delete**" button (red) on any user
2. Confirm the deletion in the popup
3. User is permanently removed from the database

**⚠️ Warning:** This action cannot be undone. All user data will be lost.

**Best Practice:** Consider banning users instead of deleting them to preserve data.

## 🔄 Sessions

Manage active user sessions across the system.

### Sessions Table
Displays all active sessions with:
- **User Email** - Which user owns the session
- **IP Address** - User's IP address
- **User Agent** - Browser/device information
- **Created At** - When session was created
- **Expires At** - When session will expire
- **Actions** - Revoke button

### Revoking Sessions

1. Click "**Revoke**" button on any session
2. Confirm the action
3. User will be immediately signed out

**Use Cases:**
- Force logout suspicious sessions
- Clear sessions after password change
- Remove sessions from lost/stolen devices
- Troubleshoot login issues

### Refresh Sessions

Click the "**🔄 Refresh**" button to reload the sessions list.

## ⚙️ Settings

View current admin configuration.

**Current Settings:**
- **Default User Role:** user
- **Admin Roles:** admin
- **Email Verification:** Enabled
- **Password Reset:** Enabled

**Note:** These settings are defined in `app/better-auth.js` and currently display-only.

## Better Auth Admin API

The admin dashboard uses Better Auth's admin plugin endpoints:

### User Management Endpoints
```javascript
// List users with pagination and filtering
GET /api/auth/admin/list-users
  ?limit=10
  &offset=0
  &searchField=email
  &searchValue=user@example.com
  &filterField=emailVerified
  &filterValue=true

// Create new user
POST /api/auth/admin/create-user
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "user"
}

// Update user
POST /api/auth/admin/update-user
{
  "userId": "user-id",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "emailVerified": true
  }
}

// Set user role
POST /api/auth/admin/set-role
{
  "userId": "user-id",
  "role": "admin"
}

// Ban user
POST /api/auth/admin/ban-user
{
  "userId": "user-id"
}

// Unban user
POST /api/auth/admin/unban-user
{
  "userId": "user-id"
}

// Delete user
POST /api/auth/admin/remove-user
{
  "userId": "user-id"
}
```

### Session Management Endpoints
```javascript
// List all sessions
GET /api/auth/admin/list-sessions

// Revoke specific session
POST /api/auth/admin/revoke-session
{
  "sessionToken": "session-token"
}
```

## Security Considerations

### Admin Access Control
- Only users with `role = 'admin'` can access admin endpoints
- Authorization checked on every request via Bearer token
- Non-admin users redirected to regular dashboard

### Best Practices
1. **Limit Admin Accounts** - Only create admin accounts for trusted users
2. **Monitor Admin Actions** - Regularly review user changes
3. **Use Strong Passwords** - Especially for admin accounts
4. **Regular Audits** - Check sessions and active users
5. **Secure Environment** - Use HTTPS in production
6. **Rotate Secrets** - Change `BETTER_AUTH_SECRET` periodically

### Admin Permissions
Admins can perform any action, including:
- ✅ Create users without email verification
- ✅ Manually verify any email
- ✅ Change any user's role (including making others admin)
- ✅ Ban/unban any user
- ✅ Delete any user (except themselves)
- ✅ Revoke any session
- ✅ View all user data

## Troubleshooting

### "Access denied. Admin privileges required."
**Solution:** Make sure your user has admin role:
```bash
node make-admin.js your-email@example.com
```

### Cannot see admin dashboard button
**Solution:** Sign out and sign in again to refresh your session.

### Admin endpoints return 403 Forbidden
**Solution:** Check that:
1. You're signed in as an admin user
2. Your token is valid (check localStorage)
3. Better Auth admin plugin is enabled in `app/better-auth.js`

### Users list not loading
**Solution:** 
1. Check browser console for errors
2. Verify server is running: `http://localhost:3000`
3. Ensure database exists and has user table

### Cannot create users
**Possible Issues:**
1. **Email already exists** - Try a different email
2. **Password too short** - Minimum 8 characters
3. **Missing fields** - All fields are required

## Advanced Features

### Bulk Operations (Future Enhancement)
The Better Auth admin plugin supports bulk operations. To implement:

```javascript
// Bulk ban users
for (const userId of userIds) {
  await fetch('/api/auth/admin/ban-user', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });
}
```

### Custom Filters
Add custom filter buttons in `admin.html`:

```html
<button onclick="filterUsers('verified')">Show Verified</button>
<button onclick="filterUsers('admin')">Show Admins</button>
```

### Export Users
Add export functionality to download user list:

```javascript
function exportUsers() {
  const csv = usersArray.map(u => 
    `${u.email},${u.name},${u.role},${u.emailVerified}`
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
}
```

## Keyboard Shortcuts

- **Enter** in search box - Execute search
- **Esc** - Close modal (requires custom implementation)

## UI/UX Features

- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Stats update after each action
- **Confirmation Dialogs** - Prevents accidental deletions
- **Loading States** - Shows "Loading..." during API calls
- **Color-Coded Badges** - Quick visual status indicators
  - 🟣 Admin (purple)
  - ⚪ User (gray)
  - 🟢 Verified (green)
  - 🟡 Unverified (yellow)
  - 🔴 Banned (red)

## Files Reference

- **Frontend:**
  - `public/admin.html` - Admin dashboard structure
  - `public/admin.js` - Admin dashboard functionality
  - `public/admin-styles.css` - Admin dashboard styles

- **Backend:**
  - `app/better-auth.js` - Better Auth config with admin plugin
  - `app/index.js` - Express server with Better Auth handler

- **Utilities:**
  - `make-admin.js` - Helper script to create admin users

---

**Need Help?** 
- Better Auth Docs: https://www.better-auth.com/docs/plugins/admin
- Check server logs in terminal for error messages
- Review browser console for frontend errors
