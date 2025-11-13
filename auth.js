// Better Auth configuration file for CLI
require('dotenv').config();
const { betterAuth } = require('better-auth');
const Database = require('better-sqlite3');
const path = require('path');

const auth = betterAuth({
    database: new Database(path.join(__dirname, 'sqlite.db')),
    emailAndPassword: {
        enabled: true,
    },
});

module.exports = { auth };
