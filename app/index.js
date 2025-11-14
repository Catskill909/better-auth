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
const { uploadAvatar, cleanupTempFile, uploadMedia } = require('./upload-middleware');
const { processAvatar, deleteProcessedImages, isValidImage, processMediaImage } = require('./image-processor');
const { getUserAvatarUrls, getMediaUrl } = require('./media-utils');

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

// ============================================
// Custom Admin Endpoints (must be before Better Auth handler)
// ============================================

// These need to be defined BEFORE the Better Auth catch-all handler
// because they use the /api/auth/* path that Better Auth intercepts

// GET /api/auth/admin/list-sessions - List all active sessions (admin only)
app.get('/api/auth/admin/list-sessions', async (req, res) => {
    try {
        // Manual auth check (requireAuth middleware needs to be defined first)
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionToken) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const session = db.prepare('SELECT * FROM session WHERE token = ? AND expiresAt > ?')
            .get(sessionToken, Date.now());

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const user = db.prepare('SELECT * FROM user WHERE id = ?').get(session.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const sessions = db.prepare(`
            SELECT 
                session.id,
                session.userId,
                session.token,
                session.expiresAt,
                session.createdAt,
                session.ipAddress,
                session.userAgent,
                user.email,
                user.name,
                user.role
            FROM session
            LEFT JOIN user ON session.userId = user.id
            WHERE session.expiresAt > ?
            ORDER BY session.createdAt DESC
        `).all(Date.now());

        const formattedSessions = sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            email: s.email,
            name: s.name,
            role: s.role,
            createdAt: s.createdAt,
            expiresAt: s.expiresAt,
            ipAddress: s.ipAddress || 'Unknown',
            userAgent: s.userAgent || 'Unknown',
            isActive: s.expiresAt > Date.now()
        }));

        res.json({
            sessions: formattedSessions,
            total: formattedSessions.length
        });

    } catch (error) {
        console.error('List sessions error:', error);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});

// POST /api/auth/admin/revoke-session - Revoke a session (admin only)
app.post('/api/auth/admin/revoke-session', async (req, res) => {
    try {
        // Manual auth check
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionToken) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const session = db.prepare('SELECT * FROM session WHERE token = ? AND expiresAt > ?')
            .get(sessionToken, Date.now());

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const user = db.prepare('SELECT * FROM user WHERE id = ?').get(session.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const targetSession = db.prepare('SELECT * FROM session WHERE id = ?').get(sessionId);

        if (!targetSession) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (targetSession.userId === user.id) {
            return res.status(400).json({ error: 'Cannot revoke your own session' });
        }

        db.prepare('DELETE FROM session WHERE id = ?').run(sessionId);

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });

    } catch (error) {
        console.error('Revoke session error:', error);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});

// Mount Better Auth handler at /api/auth/* (catches all other /api/auth routes)
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
                INSERT INTO media (id, filename, originalName, mimeType, size, path, thumbnailPath, uploadedBy, uploadedAt, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                mediaId,
                result.filename,
                req.file.originalname,
                'image/webp',
                req.file.size,
                result.fullPath,
                result.thumbPath,
                req.user.id,
                Date.now(),
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

// Admin middleware - require admin role
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// POST /api/admin/media/upload - Upload media files (admin only)
app.post('/api/admin/media/upload', requireAuth, requireAdmin, (req, res) => {
    uploadMedia(req, res, async (err) => {
        const uploadedFiles = [];
        const errors = [];

        try {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({ error: err.message || 'File upload failed' });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            // Process each file
            for (const file of req.files) {
                try {
                    const tempFilePath = file.path;

                    // Validate image
                    const isValid = await isValidImage(tempFilePath);
                    if (!isValid) {
                        await cleanupTempFile(tempFilePath);
                        errors.push({ filename: file.originalname, error: 'Invalid image file' });
                        continue;
                    }

                    // Process media image
                    const result = await processMediaImage(tempFilePath, {
                        maxWidth: 1920,
                        maxHeight: 1920,
                        quality: 85
                    });

                    // Record in media table
                    const mediaId = crypto.randomBytes(16).toString('hex');
                    db.prepare(`
                        INSERT INTO media (id, filename, originalName, mimeType, size, path, thumbnailPath, uploadedBy, uploadedAt, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        mediaId,
                        result.filename,
                        file.originalname,
                        'image/webp',
                        file.size,
                        result.path,
                        null,
                        req.user.id,
                        Date.now(),
                        'media'
                    );

                    // Clean up temp file
                    await cleanupTempFile(tempFilePath);

                    uploadedFiles.push({
                        id: mediaId,
                        filename: result.filename,
                        originalName: file.originalname,
                        url: getMediaUrl(result.filename, 'media'),
                        size: result.size
                    });

                } catch (error) {
                    console.error('Error processing file:', file.originalname, error);
                    errors.push({ filename: file.originalname, error: error.message });
                }
            }

            res.json({
                success: true,
                uploaded: uploadedFiles,
                errors: errors.length > 0 ? errors : undefined,
                count: uploadedFiles.length
            });

        } catch (error) {
            console.error('Media upload error:', error);
            res.status(500).json({
                error: 'Failed to process media',
                details: process.env.NODE_ENV !== 'production' ? error.message : undefined
            });
        }
    });
});

// GET /api/admin/media/list - List all media files (admin only)
app.get('/api/admin/media/list', requireAuth, requireAdmin, async (req, res) => {
    try {
        const category = req.query.category;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        let query = 'SELECT * FROM media';
        let countQuery = 'SELECT COUNT(*) as total FROM media';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            countQuery += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
        const queryParams = [...params, limit, offset];

        const mediaFiles = db.prepare(query).all(...queryParams);
        const { total } = db.prepare(countQuery).get(...params);

        // Add URLs to each file
        const mediaWithUrls = mediaFiles.map(file => ({
            ...file,
            url: getMediaUrl(file.filename, file.category === 'avatar' ? 'avatars/full' : 'media'),
            thumbnailUrl: file.thumbnailPath ? getMediaUrl(path.basename(file.thumbnailPath), 'avatars/thumbnails') : null
        }));

        // Calculate stats
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as totalFiles,
                SUM(CASE WHEN category = 'avatar' THEN 1 ELSE 0 END) as avatarCount,
                SUM(CASE WHEN category = 'media' THEN 1 ELSE 0 END) as mediaCount,
                SUM(size) as totalSize
            FROM media
        `).get();

        res.json({
            files: mediaWithUrls,
            total,
            stats: {
                totalFiles: stats.totalFiles || 0,
                avatars: stats.avatarCount || 0,
                media: stats.mediaCount || 0,
                totalSize: stats.totalSize || 0
            },
            pagination: {
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });

    } catch (error) {
        console.error('List media error:', error);
        res.status(500).json({ error: 'Failed to list media' });
    }
});

// DELETE /api/admin/media/:fileId - Delete media file (admin only)
app.delete('/api/admin/media/:fileId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const file = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Don't allow deleting avatars through this endpoint
        if (file.category === 'avatar') {
            return res.status(400).json({ error: 'Use the avatar delete endpoint to remove user avatars' });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '..', file.path);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error('Error deleting file:', err);
        }

        // Delete from database
        db.prepare('DELETE FROM media WHERE id = ?').run(req.params.fileId);

        res.json({ success: true, message: 'File deleted successfully' });

    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ error: 'Failed to delete media' });
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