// Image processing utilities using Sharp
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Process and save an avatar image
 * Creates both full-size (500x500) and thumbnail (150x150) versions
 * @param {string} tempFilePath - Path to uploaded temp file
 * @param {string} userId - User ID for organizing files
 * @returns {Object} Paths to full and thumbnail images
 */
async function processAvatar(tempFilePath, userId) {
    try {
        const timestamp = Date.now();
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const filename = `${userId}-${timestamp}-${uniqueId}`;

        // Directories
        const fullDir = path.join(__dirname, '../storage/avatars/full');
        const thumbDir = path.join(__dirname, '../storage/avatars/thumbnails');

        // Ensure directories exist
        fs.mkdirSync(fullDir, { recursive: true });
        fs.mkdirSync(thumbDir, { recursive: true });

        // File paths
        const fullPath = path.join(fullDir, `${filename}.webp`);
        const thumbPath = path.join(thumbDir, `${filename}.webp`);

        // Process full-size image (500x500, WebP format)
        await sharp(tempFilePath)
            .resize(500, 500, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toFile(fullPath);

        // Process thumbnail (150x150)
        await sharp(tempFilePath)
            .resize(150, 150, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(thumbPath);

        console.log(`✅ Avatar processed: ${filename}`);

        return {
            fullPath,
            thumbPath,
            filename: `${filename}.webp`,
            thumbnailFilename: `${filename}.webp`
        };
    } catch (error) {
        console.error('Error processing avatar:', error);
        throw new Error('Failed to process avatar image');
    }
}

/**
 * Process a general media image
 * Creates optimized version and optional thumbnail
 * @param {string} tempFilePath - Path to uploaded temp file
 * @param {string} userId - User ID for tracking
 * @param {Object} options - Processing options
 * @returns {Object} Paths to processed images
 */
async function processMediaImage(tempFilePath, userId, options = {}) {
    try {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 85,
            createThumbnail = true,
            thumbnailSize = 300
        } = options;

        const timestamp = Date.now();
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const filename = `${userId}-${timestamp}-${uniqueId}`;

        // Directory
        const mediaDir = path.join(__dirname, '../storage/media');
        fs.mkdirSync(mediaDir, { recursive: true });

        // Main image path
        const mainPath = path.join(mediaDir, `${filename}.webp`);

        // Get image metadata
        const metadata = await sharp(tempFilePath).metadata();

        // Resize if larger than max dimensions
        let processedImage = sharp(tempFilePath);

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            processedImage = processedImage.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Convert to WebP and save
        await processedImage
            .webp({ quality })
            .toFile(mainPath);

        const result = {
            mainPath,
            filename: `${filename}.webp`,
            originalWidth: metadata.width,
            originalHeight: metadata.height
        };

        // Create thumbnail if requested
        if (createThumbnail) {
            const thumbPath = path.join(mediaDir, `${filename}-thumb.webp`);

            await sharp(tempFilePath)
                .resize(thumbnailSize, thumbnailSize, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 75 })
                .toFile(thumbPath);

            result.thumbPath = thumbPath;
            result.thumbFilename = `${filename}-thumb.webp`;
        }

        console.log(`✅ Media image processed: ${filename}`);

        return result;
    } catch (error) {
        console.error('Error processing media image:', error);
        throw new Error('Failed to process media image');
    }
}

/**
 * Get image dimensions without loading full image
 * @param {string} filePath - Path to image file
 * @returns {Object} Width and height
 */
async function getImageDimensions(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        };
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        return null;
    }
}

/**
 * Delete processed images (full and thumbnail)
 * @param {string} filename - Base filename without extension
 * @param {string} type - 'avatar' or 'media'
 */
function deleteProcessedImages(filename, type = 'avatar') {
    try {
        if (type === 'avatar') {
            const fullPath = path.join(__dirname, '../storage/avatars/full', filename);
            const thumbPath = path.join(__dirname, '../storage/avatars/thumbnails', filename);

            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

            console.log(`🗑️ Deleted avatar: ${filename}`);
        } else if (type === 'media') {
            const mainPath = path.join(__dirname, '../storage/media', filename);
            const thumbFilename = filename.replace('.webp', '-thumb.webp');
            const thumbPath = path.join(__dirname, '../storage/media', thumbFilename);

            if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

            console.log(`🗑️ Deleted media: ${filename}`);
        }
    } catch (error) {
        console.error(`Error deleting images (${type}):`, error.message);
    }
}

/**
 * Validate if file is actually an image (magic bytes check)
 * @param {string} filePath - Path to file
 * @returns {boolean} True if valid image
 */
async function isValidImage(filePath) {
    try {
        await sharp(filePath).metadata();
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    processAvatar,
    processMediaImage,
    getImageDimensions,
    deleteProcessedImages,
    isValidImage
};
