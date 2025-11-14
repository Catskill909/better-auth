// Integration of Better Auth into the application
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
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

// Initialize Better Auth
const auth = betterAuth({
    database: new Database(dbPath),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    emailAndPassword: {
        enabled: true,
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