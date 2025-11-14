// Production-ready Node.js application for Better Auth

const express = require('express');
const path = require('path');

// Initialize database schema first
console.log('🔧 Ensuring database schema exists...');
require('../scripts/init-db');

// Run migrations
console.log('🔄 Running schema migrations...');
require('../scripts/add-banned-field');
require('../scripts/add-avatar-fields');

// Load Better Auth (database is now ready)
const { auth } = require('./better-auth');
const { toNodeHandler } = require('better-auth/node');
const Database = require('better-sqlite3');
const fs = require('fs').promises;
const crypto = require('crypto');

// Load media utilities
const { uploadAvatar, cleanupTempFile } = require('./upload-middleware');
const { processAvatar, deleteProcessedImages, isValidImage } = require('./image-processor');
const { getUserAvatarUrls } = require('./media-utils');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Database connection
const dbPath = isProduction ? '/app/data/sqlite.db' : path.join(__dirname, '..', 'sqlite.db');
const db = new Database(dbPath);

// Trust proxy for Coolify/nginx
app.set('trust proxy', 1);

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Coolify
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded media files
app.use('/uploads/avatars/full', express.static(path.join(__dirname, '..', 'storage', 'avatars', 'full')));
app.use('/uploads/avatars/thumbnails', express.static(path.join(__dirname, '..', 'storage', 'avatars', 'thumbnails')));
app.use('/uploads/media', express.static(path.join(__dirname, '..', 'storage', 'media')));

// Mount Better Auth handler at /api/auth/*
app.all('/api/auth/*', toNodeHandler(auth));

// Authentication middleware
async function requireAuth(req, res, next) {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ error: 'No session token provided' });
        }

        // Verify session in database
        const session = db.prepare('SELECT * FROM session WHERE token = ? AND expiresAt > ?')
            .get(sessionToken, Date.now());

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Get user
        const user = db.prepare('SELECT * FROM user WHERE id = ?').get(session.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.banned) {
            return res.status(403).json({ error: 'User is banned', reason: user.banReason });
        }

        req.user = user;
        req.session = session;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// POST /api/user/avatar - Upload user avatar
app.post('/api/user/avatar', requireAuth, (req, res) => {
    uploadAvatar(req, res, async (err) => {
        let tempFilePath = null;

        try {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({
                    error: err.message || 'File upload failed'
                });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            tempFilePath = req.file.path;

            // Validate image
            const isValid = await isValidImage(tempFilePath);
            if (!isValid) {
                await cleanupTempFile(tempFilePath);
                return res.status(400).json({ error: 'Invalid image file' });
            }

            // Process avatar (resize, create thumbnail, convert to WebP)
            const result = await processAvatar(tempFilePath, req.user.id);

            // Delete old avatar files if they exist
            const oldUser = db.prepare('SELECT avatar, avatarThumbnail FROM user WHERE id = ?')
                .get(req.user.id);

            if (oldUser?.avatar || oldUser?.avatarThumbnail) {
                await deleteProcessedImages(
                    oldUser.avatar ? path.join(__dirname, '..', 'storage', 'avatars', 'full', oldUser.avatar) : null,
                    oldUser.avatarThumbnail ? path.join(__dirname, '..', 'storage', 'avatars', 'thumbnails', oldUser.avatarThumbnail) : null
                );
            }

            // Update user record with new avatar filenames
            db.prepare('UPDATE user SET avatar = ?, avatarThumbnail = ? WHERE id = ?')
                .run(result.filename, result.thumbnailFilename, req.user.id);

            // Record in media table
            const mediaId = crypto.randomBytes(16).toString('hex');
            db.prepare(`
                INSERT INTO media (id, filename, originalName, mimeType, size, path, thumbnailPath, uploadedBy, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                mediaId,
                result.filename,
                req.file.originalname,
                'image/webp',
                result.size,
                result.fullPath,
                result.thumbnailPath,
                req.user.id,
                'avatar'
            );

            // Clean up temp file
            await cleanupTempFile(tempFilePath);

            // Return avatar URLs
            const avatarUrls = getUserAvatarUrls({
                avatar: result.filename,
                avatarThumbnail: result.thumbnailFilename
            });

            res.json({
                success: true,
                avatar: avatarUrls.full,
                avatarThumbnail: avatarUrls.thumbnail,
                filename: result.filename
            });

        } catch (error) {
            console.error('Avatar upload error:', error);

            // Cleanup on error
            if (tempFilePath) {
                await cleanupTempFile(tempFilePath);
            }

            res.status(500).json({
                error: 'Failed to process avatar',
                details: process.env.NODE_ENV !== 'production' ? error.message : undefined
            });
        }
    });
});

// GET /api/user/avatar/:userId - Get user avatar URLs
app.get('/api/user/avatar/:userId', async (req, res) => {
    try {
        const user = db.prepare('SELECT avatar, avatarThumbnail FROM user WHERE id = ?')
            .get(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const avatarUrls = getUserAvatarUrls(user);
        res.json(avatarUrls);

    } catch (error) {
        console.error('Get avatar error:', error);
        res.status(500).json({ error: 'Failed to get avatar' });
    }
});

// DELETE /api/user/avatar - Delete user avatar
app.delete('/api/user/avatar', requireAuth, async (req, res) => {
    try {
        const user = db.prepare('SELECT avatar, avatarThumbnail FROM user WHERE id = ?')
            .get(req.user.id);

        if (!user?.avatar && !user?.avatarThumbnail) {
            return res.status(404).json({ error: 'No avatar to delete' });
        }

        // Delete physical files
        await deleteProcessedImages(
            user.avatar ? path.join(__dirname, '..', 'storage', 'avatars', 'full', user.avatar) : null,
            user.avatarThumbnail ? path.join(__dirname, '..', 'storage', 'avatars', 'thumbnails', user.avatarThumbnail) : null
        );

        // Update database
        db.prepare('UPDATE user SET avatar = NULL, avatarThumbnail = NULL WHERE id = ?')
            .run(req.user.id);

        // Delete from media table
        db.prepare('DELETE FROM media WHERE uploadedBy = ? AND category = ?')
            .run(req.user.id, 'avatar');

        res.json({ success: true, message: 'Avatar deleted successfully' });

    } catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({ error: 'Failed to delete avatar' });
    }
});

// GET /api/user/me - Get current user info (including avatar)
app.get('/api/user/me', requireAuth, (req, res) => {
    try {
        const { password, ...userWithoutPassword } = req.user;
        const avatarUrls = getUserAvatarUrls(req.user);

        res.json({
            ...userWithoutPassword,
            avatarUrls
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Home route - serve the main page
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

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Auth URL: ${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
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