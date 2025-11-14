// Configuration file for Better Auth CLI
// This file is used by @better-auth/cli migrate command
// The actual app uses app/better-auth.js

const { betterAuth } = require('better-auth');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/sqlite.db'
    : path.join(__dirname, 'sqlite.db');

console.log(`📁 Migration will use database: ${dbPath}`);

module.exports.auth = betterAuth({
    database: new Database(dbPath),
});
