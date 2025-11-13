#!/usr/bin/env node

/**
 * Make a user an admin
 * Usage: node make-admin.js <email>
 */

const Database = require('better-sqlite3');
const path = require('path');

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node make-admin.js <email>');
    process.exit(1);
}

try {
    const dbPath = path.join(__dirname, 'sqlite.db');
    const db = new Database(dbPath);

    // Check if user exists
    const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);

    if (!user) {
        console.error(`❌ User with email "${email}" not found`);
        process.exit(1);
    }

    // Update user role to admin
    db.prepare('UPDATE user SET role = ? WHERE email = ?').run('admin', email);

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.name}`);

    db.close();
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
