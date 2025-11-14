// Migration script to add 'banned' field to existing user table
// Run this once in production to fix the schema

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/sqlite.db'
    : path.join(__dirname, '..', 'sqlite.db');

console.log(`🔧 Migrating database at: ${dbPath}`);

const db = new Database(dbPath);

try {
    // Check if banned column exists
    const tableInfo = db.prepare("PRAGMA table_info(user)").all();
    const hasBanned = tableInfo.some(col => col.name === 'banned');

    if (!hasBanned) {
        console.log('📋 Adding banned, banReason, and banExpiresAt columns to user table...');

        db.exec(`
            ALTER TABLE user ADD COLUMN banned INTEGER DEFAULT 0;
            ALTER TABLE user ADD COLUMN banReason TEXT;
            ALTER TABLE user ADD COLUMN banExpiresAt INTEGER;
        `);

        console.log('✅ Migration completed successfully!');
    } else {
        console.log('✅ banned column already exists, no migration needed');
    }
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
