#!/usr/bin/env node
// Run Better Auth migrations
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running Better Auth migrations...');

try {
    // Run migrations
    execSync('npx @better-auth/cli migrate', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
}
