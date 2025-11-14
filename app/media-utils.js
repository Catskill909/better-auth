// Media utility functions
const path = require('path');

/**
 * Generate public URL for uploaded files
 * @param {string} filename - The filename (including extension)
 * @param {string} type - Type of media (avatars, media, thumbnails)
 * @returns {string} Full URL to the file
 */
function getMediaUrl(filename, type = 'media') {
    if (!filename) return null;

    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${type}/${filename}`;
}

/**
 * Get avatar URLs for a user
 * @param {Object} user - User object with avatar fields
 * @returns {Object} URLs for full and thumbnail avatars
 */
function getUserAvatarUrls(user) {
    if (!user) return { full: null, thumbnail: null };

    return {
        full: user.avatar ? getMediaUrl(user.avatar, 'avatars/full') : null,
        thumbnail: user.avatarThumbnail ? getMediaUrl(user.avatarThumbnail, 'avatars/thumbnails') : null
    };
}

/**
 * Generate unique ID for files
 * @returns {string} Unique identifier
 */
function generateFileId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize filename - remove dangerous characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file extension is allowed
 * @param {string} filename - Filename to check
 * @param {Array} allowedExtensions - Array of allowed extensions (e.g., ['.jpg', '.png'])
 * @returns {boolean} True if allowed
 */
function isAllowedExtension(filename, allowedExtensions) {
    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
}

module.exports = {
    getMediaUrl,
    getUserAvatarUrls,
    generateFileId,
    sanitizeFilename,
    formatFileSize,
    isAllowedExtension
};
