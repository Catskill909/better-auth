# Quick Start Guide - Admin Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Start the Server
```bash
npm start
```
Server will run at `http://localhost:3000`

### Step 2: Create Your Account
1. Open `http://localhost:3000` in your browser
2. Click "Sign Up"
3. Fill in your details and create account
4. Check email for verification link (optional)

### Step 3: Make Yourself an Admin
```bash
node make-admin.js your-email@example.com
```

### Step 4: Access Admin Dashboard
1. Sign in at `http://localhost:3000/signin.html`
2. Click "🔐 Admin Dashboard" button on your dashboard
3. Start managing users!

---

## 📊 What You Can Do

### User Management
- ✅ Create new users
- ✅ Edit user details
- ✅ Change user roles (user ↔ admin)
- ✅ Ban/unban users
- ✅ Delete users
- ✅ Manually verify emails
- ✅ Search users by email
- ✅ View user statistics

### Session Management
- ✅ View all active sessions
- ✅ See IP addresses and devices
- ✅ Revoke sessions (force logout)

---

## 🎯 Common Tasks

### Make Another User an Admin
**Via Admin Dashboard:**
1. Go to Admin Dashboard → Users
2. Click "Edit" on the user
3. Change "Role" to "Admin"
4. Click "Update User"

**Via Command Line:**
```bash
node make-admin.js their-email@example.com
```

### Reset a User's Password
1. Go to Admin Dashboard → Users
2. Click "Edit" on the user
3. You can change password or ask user to use "Forgot Password"

### Manually Verify a User's Email
1. Go to Admin Dashboard → Users
2. Click "Edit" on the user
3. Check the "Email Verified" checkbox
4. Click "Update User"

### Ban a Problematic User
1. Go to Admin Dashboard → Users
2. Click "Ban" (yellow button) on the user
3. User cannot sign in anymore
4. To unban: Click "Unban" (green button)

### Force Logout All Sessions
1. Go to Admin Dashboard → Sessions
2. Click "Revoke" on each session
3. Users will be signed out immediately

---

## 📂 Important Files

### Pages
- `public/admin.html` - Admin dashboard
- `public/dashboard.html` - User dashboard
- `public/signin.html` - Sign in page
- `public/signup.html` - Sign up page

### Scripts
- `make-admin.js` - Make users admin
- `app/better-auth.js` - Auth configuration
- `app/email-config.js` - Email templates

### Documentation
- `README.md` - Full project documentation
- `ADMIN-GUIDE.md` - Detailed admin guide
- `METHODS.md` - OAuth implementation plans

---

## 🔧 Troubleshooting

**Can't access admin dashboard?**
```bash
node make-admin.js your-email@example.com
```
Then sign out and sign in again.

**Server not starting?**
```bash
pkill -f "node app/index.js"
npm start
```

**Need to reset everything?**
```bash
rm sqlite.db
npm run migrate
npm start
```

---

## 📞 Support

- **Better Auth Docs:** https://www.better-auth.com/docs
- **Admin Plugin:** https://www.better-auth.com/docs/plugins/admin
- **Issues:** Check console logs and server terminal

---

**Ready to manage users!** 🎉
