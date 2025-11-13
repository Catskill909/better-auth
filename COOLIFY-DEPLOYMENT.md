# Production Deployment Guide - Coolify with Nixpacks

**Target Platform:** Coolify  
**Build System:** Nixpacks  
**Date:** November 13, 2025  
**Status:** Production Ready Checklist

---

## 📋 Pre-Deployment Checklist

### 1. Code Security Hardening

#### ✅ Remove Hardcoded Secrets
- [ ] Remove SMTP password from `app/email-config.js`
- [ ] Remove any test credentials from code
- [ ] Verify no API keys in source files

#### ✅ Environment Variable Migration
- [ ] Move all secrets to Coolify environment variables
- [ ] Remove `.env` file from repository (already gitignored)
- [ ] Create `.env.example` template

#### ✅ Database Preparation
- [ ] Decision: Use PostgreSQL or keep SQLite
- [ ] If PostgreSQL: Set up managed database instance
- [ ] Configure database connection pooling

---

## 🔧 Step 1: Prepare Codebase for Production

### 1.1 Update Email Configuration

**File:** `app/email-config.js`

**Current Issue:** SMTP password hardcoded
```javascript
// ❌ REMOVE THIS
pass: 'wjff1960'
```

**Fix:** Use environment variables
```javascript
// ✅ SECURE
pass: process.env.SMTP_PASSWORD
```

### 1.2 Create Production-Ready Server

**File:** `app/index.js`

**Add:**
- Port configuration from environment
- Graceful shutdown handling
- Health check endpoint
- Production error handling

### 1.3 Add Nixpacks Configuration

**Create:** `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### 1.4 Add Health Check Endpoint

**Add to** `app/index.js`:
```javascript
// Health check for Coolify
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
```

---

## 🔐 Step 2: Security Hardening

### 2.1 Install Security Packages

```bash
npm install helmet express-rate-limit cors
```

### 2.2 Add Security Middleware

**Update** `app/index.js`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["https://accounts.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.BETTER_AUTH_URL,
    credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth/sign-in/email', authLimiter);
app.use('/api/auth/sign-up/email', authLimiter);
app.use('/api/auth/forget-password', authLimiter);
app.use('/api/auth', generalLimiter);
```

### 2.3 Configure Better Auth for Production

**Update** `app/better-auth.js`:
```javascript
const auth = betterAuth({
    database: process.env.DATABASE_URL 
        ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
        : new Database(path.join(__dirname, '..', 'sqlite.db')),
    
    trustedOrigins: [process.env.BETTER_AUTH_URL],
    
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 300 // 5 minutes
        }
    },
    
    advanced: {
        useSecureCookies: process.env.NODE_ENV === 'production',
        cookiePrefix: 'better-auth',
        crossSubdomainCookies: {
            enabled: false
        }
    },
    
    // ... rest of config
});
```

---

## 📦 Step 3: Prepare for Git

### 3.1 Update .gitignore

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.*
!.env.example

# Database
sqlite.db
*.db
*.db-journal

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db
.DS_Store?
._*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Local credentials and sensitive info
.credentials
.local-info.md
LOCAL-CREDENTIALS.md
google-login-bugs.md

# Test files
test-auth.js

# Production
dist/
build/
.env.production.local

# Coolify
.coolify/
```

### 3.2 Create .env.example

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://yourdomain.com
NODE_ENV=production

# Database (Optional - use PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Port (Coolify will set this)
PORT=3000
```

### 3.3 Update package.json

```json
{
  "name": "better-auth-app",
  "version": "1.0.0",
  "description": "Production-ready authentication system with Better Auth",
  "main": "app/index.js",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "start": "node app/index.js",
    "dev": "nodemon app/index.js",
    "migrate": "npx @better-auth/cli migrate",
    "build": "npx @better-auth/cli migrate"
  },
  "dependencies": {
    "better-auth": "^1.3.34",
    "better-sqlite3": "^11.0.0",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "nodemailer": "^7.0.10",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🚀 Step 4: Coolify Deployment Configuration

### 4.1 Coolify Environment Variables

**Set these in Coolify Dashboard → Your App → Environment Variables:**

```bash
# Required - Generate new secret
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>

# Required - Your production domain
BETTER_AUTH_URL=https://your-app.yourdomain.com

# Required
NODE_ENV=production

# Email Configuration
SMTP_HOST=mail.starkey.digital
SMTP_PORT=587
SMTP_USER=auth@starkey.digital
SMTP_PASSWORD=wjff1960
SMTP_FROM=auth@starkey.digital

# Google OAuth - Create NEW credentials for production
GOOGLE_CLIENT_ID=<new-production-client-id>
GOOGLE_CLIENT_SECRET=<new-production-client-secret>

# Optional: PostgreSQL (recommended for production)
# If not set, will use SQLite
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Optional: Port (Coolify usually sets this automatically)
PORT=3000
```

### 4.2 Coolify Build Configuration

**In Coolify Dashboard:**

1. **Build Pack:** Auto-detect (will use Nixpacks)
2. **Build Command:** `npm ci && npm run build`
3. **Start Command:** `npm start`
4. **Health Check Path:** `/health`
5. **Port:** 3000 (or auto-detect)

### 4.3 Coolify Domain & SSL

1. **Add Custom Domain:** your-app.yourdomain.com
2. **Enable SSL:** Auto-generate Let's Encrypt certificate
3. **Force HTTPS:** Enable redirect from HTTP to HTTPS

---

## 🔑 Step 5: Google OAuth Production Setup

### 5.1 Create Production OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type:** Web application
5. **Name:** Better Auth Production
6. **Authorized JavaScript origins:**
   ```
   https://your-app.yourdomain.com
   ```
7. **Authorized redirect URIs:**
   ```
   https://your-app.yourdomain.com/api/auth/callback/google
   ```
8. Copy new **Client ID** and **Client Secret**
9. Add to Coolify environment variables

### 5.2 Update OAuth Consent Screen

1. **Application home page:** https://your-app.yourdomain.com
2. **Privacy policy:** (if required)
3. **Terms of service:** (if required)
4. **Move to Production** (if currently in testing mode)

---

## 💾 Step 6: Database Setup (Recommended: PostgreSQL)

### Option A: PostgreSQL (Recommended)

**Via Coolify:**

1. Go to Coolify Dashboard → Databases
2. Click **New PostgreSQL Database**
3. Configure:
   - Name: better-auth-db
   - Version: 15 or 16
   - Username: betterauth
   - Password: <generate strong password>
4. Click **Create**
5. Copy the connection string
6. Add to Coolify environment variables as `DATABASE_URL`

**Install PostgreSQL driver:**
```bash
npm install pg
```

**Update** `app/better-auth.js`:
```javascript
const { Pool } = require('pg');

const auth = betterAuth({
    database: process.env.DATABASE_URL 
        ? new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' 
                ? { rejectUnauthorized: false } 
                : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        })
        : new Database(path.join(__dirname, '..', 'sqlite.db')),
    // ... rest of config
});
```

### Option B: SQLite (Development/Small Projects Only)

**If using SQLite in production:**

1. Enable persistent storage in Coolify
2. Set storage mount point: `/app/data`
3. Update database path:
   ```javascript
   new Database('/app/data/sqlite.db')
   ```

⚠️ **Not recommended for production due to:**
- No concurrent write support
- Limited scalability
- Backup complexity

---

## 📝 Step 7: Pre-Deployment Code Changes

### 7.1 Update app/email-config.js

```javascript
// Replace hardcoded credentials with environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.starkey.digital',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'auth@starkey.digital',
        pass: process.env.SMTP_PASSWORD // MUST be set via environment
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Update email 'from' field
from: `"${process.env.APP_NAME || 'Better Auth'}" <${process.env.SMTP_FROM || 'auth@starkey.digital'}>`
```

### 7.2 Update app/index.js

```javascript
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { auth } = require('./better-auth');
const { toNodeHandler } = require('better-auth/node');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (required for Coolify/nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["https://accounts.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
    origin: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/auth/sign-in/email', authLimiter);
app.use('/api/auth/sign-up/email', authLimiter);
app.use('/api/auth/forget-password', authLimiter);
app.use('/api/auth', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV 
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount Better Auth handler
app.all('/api/auth/*', toNodeHandler(auth));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: isProduction ? 'Internal server error' : err.message 
    });
});

// Graceful shutdown
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Auth URL: ${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

---

## 🚢 Step 8: Deployment Process

### 8.1 Pre-Deployment Testing

```bash
# 1. Test locally with production-like settings
NODE_ENV=production npm start

# 2. Run security audit
npm audit

# 3. Check for outdated packages
npm outdated

# 4. Verify all environment variables are in .env.example
cat .env.example
```

### 8.2 Commit and Push to Git

```bash
# 1. Stage all changes
git add .

# 2. Commit
git commit -m "Production ready: Security hardening, environment variables, Coolify config"

# 3. Push to GitHub
git push origin main
```

### 8.3 Deploy to Coolify

**Option A: Automatic Deployment (Recommended)**

1. In Coolify Dashboard → **New Resource** → **Application**
2. **Source:** GitHub
3. **Repository:** Catskill909/better-auth
4. **Branch:** main
5. **Auto Deploy:** Enable (deploys on every push)
6. Click **Create**

**Option B: Manual Deployment**

1. Go to your app in Coolify
2. Click **Deploy** button
3. Monitor build logs

### 8.4 Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://your-app.yourdomain.com/health

# 2. Test signup (should return error without proper data)
curl https://your-app.yourdomain.com/api/auth/sign-up/email

# 3. Verify SSL
curl -I https://your-app.yourdomain.com

# 4. Test Google OAuth redirect
# Visit: https://your-app.yourdomain.com/signin.html
# Click "Sign in with Google"
```

---

## 🔧 Step 9: Post-Deployment Configuration

### 9.1 Create First Admin User

**Option A: Via Sign Up + Database**
```bash
# 1. Sign up via web interface
# 2. SSH into Coolify container or use database client
# 3. Update user role
UPDATE user SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Option B: Create migration script**

Create `scripts/create-admin.js`:
```javascript
require('dotenv').config();
const Database = require('better-sqlite3');

const email = process.argv[2];
if (!email) {
    console.error('Usage: node create-admin.js email@example.com');
    process.exit(1);
}

const db = new Database(process.env.DATABASE_URL || './sqlite.db');
db.prepare('UPDATE user SET role = ? WHERE email = ?').run('admin', email);
console.log(`✅ Made ${email} an admin`);
db.close();
```

### 9.2 Configure Coolify Backups

1. **Database Backups** (if using Coolify PostgreSQL):
   - Go to Database → Backups
   - Enable automatic backups
   - Schedule: Daily at 2 AM
   - Retention: 7 days

2. **Persistent Volume Backups** (if using SQLite):
   - Set up external backup solution
   - S3, Backblaze B2, or similar

### 9.3 Monitoring Setup

**Add to Coolify:**

1. **Health Check:**
   - Path: `/health`
   - Interval: 60 seconds
   - Timeout: 5 seconds

2. **Resource Limits:**
   - Memory: 512MB minimum
   - CPU: 0.5 cores minimum

3. **Notifications:**
   - Enable deployment notifications
   - Enable downtime alerts

---

## 📊 Step 10: Production Monitoring

### 10.1 Application Monitoring

**Add logging:**
```bash
npm install pino pino-pretty
```

```javascript
const pino = require('pino');
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' 
        ? { target: 'pino-pretty' } 
        : undefined
});

// Use in app
logger.info('Server started');
logger.error({ err }, 'Error occurred');
```

### 10.2 Security Monitoring

**Monitor these metrics:**
- Failed login attempts
- Rate limit violations
- Admin actions
- Database errors
- SSL certificate expiration

### 10.3 Regular Maintenance

**Weekly:**
- [ ] Review server logs
- [ ] Check for failed authentications
- [ ] Monitor disk space

**Monthly:**
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate secrets
- [ ] Test backup restoration
- [ ] Check SSL certificate status

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database cleanup
- [ ] Update Google OAuth configuration

---

## ⚠️ Critical Security Reminders

1. ✅ **NEVER commit .env file** - Already in .gitignore
2. ✅ **Generate NEW BETTER_AUTH_SECRET for production**
3. ✅ **Use HTTPS only** - Coolify provides Let's Encrypt
4. ✅ **Create NEW Google OAuth credentials for production**
5. ✅ **Use PostgreSQL for production** - Not SQLite
6. ✅ **Enable rate limiting** - Included in code
7. ✅ **Monitor admin actions** - Set up logging
8. ✅ **Regular backups** - Configure in Coolify
9. ✅ **Update dependencies** - Monthly schedule
10. ✅ **Rotate secrets** - Quarterly schedule

---

## 🆘 Troubleshooting

### Build Fails in Coolify

```bash
# Check Coolify build logs
# Common issues:
# 1. Missing environment variables
# 2. Node version mismatch
# 3. Database connection fails during build
```

**Solution:**
- Ensure NODE_ENV is NOT set during build
- Database migrations run after deployment
- Check nixpacks.toml is correct

### Google OAuth Fails

**Common issues:**
1. Redirect URI mismatch
2. Wrong credentials (using dev instead of prod)
3. HTTPS not configured

**Solution:**
- Verify redirect URI: `https://yourdomain.com/api/auth/callback/google`
- Check Google Cloud Console credentials
- Ensure SSL is working

### Database Connection Fails

**PostgreSQL:**
```bash
# Test connection string
psql "postgresql://user:pass@host:5432/dbname?sslmode=require"
```

**Solution:**
- Verify DATABASE_URL is correct
- Check SSL mode
- Ensure database is running

---

## ✅ Final Production Checklist

Before going live:

- [ ] All secrets moved to Coolify environment variables
- [ ] NEW BETTER_AUTH_SECRET generated
- [ ] Google OAuth production credentials configured
- [ ] PostgreSQL database set up (or persistent storage for SQLite)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Health check endpoint working
- [ ] Rate limiting tested
- [ ] Security headers verified
- [ ] CORS configured correctly
- [ ] Admin user created
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Domain DNS configured
- [ ] Email sending tested
- [ ] Password reset tested
- [ ] Google OAuth tested
- [ ] All endpoints tested
- [ ] Error handling verified
- [ ] Logs reviewed

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Production URL:** ___________  
**Database:** PostgreSQL / SQLite _(circle one)_  

**First Admin Email:** ___________

---

**Ready to deploy!** 🚀
