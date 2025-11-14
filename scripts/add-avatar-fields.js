// Migration script to add avatar fields to user table
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/sqlite.db'
    : path.join(__dirname, '..', 'sqlite.db');

console.log(`🔧 Migrating database at: ${dbPath}`);

const db = new Database(dbPath);

try {
    // Check if avatar column exists
    const tableInfo = db.prepare("PRAGMA table_info(user)").all();
    const hasAvatar = tableInfo.some(col => col.name === 'avatar');

    if (!hasAvatar) {
        console.log('📋 Adding avatar and avatarThumbnail columns to user table...');

        db.exec(`
            ALTER TABLE user ADD COLUMN avatar TEXT;
            ALTER TABLE user ADD COLUMN avatarThumbnail TEXT;
        `);

        console.log('✅ Avatar fields migration completed successfully!');
    } else {
        console.log('✅ Avatar columns already exist, no migration needed');
    }
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
