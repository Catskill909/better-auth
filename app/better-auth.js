// Integration of Better Auth into the application
// Only load .env in development (Coolify provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}
const { betterAuth } = require('better-auth');
const { admin } = require('better-auth/plugins');
const Database = require('better-sqlite3');
const path = require('path');
const { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } = require('./email-config');

// Database path - supports production persistent storage
const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/sqlite.db'
    : path.join(__dirname, '..', 'sqlite.db');

console.log(`📁 Database path: ${dbPath}`);

// Ensure data directory exists in production
if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        console.log(`📁 Creating data directory: ${dataDir}`);
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Initialize Better Auth
const auth = betterAuth({
    database: new Database(dbPath),
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

    // Session configuration
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30 // 30 days
        }
    },

    // Advanced configuration for production stability
    advanced: {
        generateId: undefined, // Use default ID generation
        useSecureCookies: process.env.NODE_ENV === 'production',
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
            path: '/',
            httpOnly: true
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    emailAndPassword: {
        enabled: true,
        createSessionOnSignUp: false, // Do NOT log in user on signup
        sendResetPassword: async ({ user, url }) => {
            console.log('Sending password reset email to:', user.email);
            console.log('Reset URL from Better Auth:', url);
            // Extract token from URL and clean it
            let token = url.split('token=')[1] || url.split('/').pop();
            // Remove any callbackURL or other query params
            if (token && token.includes('?')) {
                token = token.split('?')[0];
            }
            if (token && token.includes('&')) {
                token = token.split('&')[0];
            }
            console.log('Cleaned token:', token);
            await sendPasswordResetEmail(user.email, user.name, token);
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            console.log('Sending verification email to:', user.email);
            console.log('Verification URL from Better Auth:', url);
            // Extract token from URL and clean it
            let token = url.split('token=')[1] || url.split('/').pop();
            // Remove any callbackURL or other query params
            if (token && token.includes('?')) {
                token = token.split('?')[0];
            }
            if (token && token.includes('&')) {
                token = token.split('&')[0];
            }
            console.log('Cleaned token:', token);
            await sendVerificationEmail(user.email, user.name, token);
        },
    },
    plugins: [
        admin({
            defaultRole: 'user',
            adminRoles: ['admin'],
        })
    ],
});

module.exports = { auth, sendPasswordChangedEmail };