// File upload middleware using Multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../storage/temp');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${timestamp}-${uniqueId}${ext}`;
        cb(null, filename);
    }
});

// File filter - only allow images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
};

// File filter - allow images and common documents
const mediaFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    const mimetype = allowedMimes.includes(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'));
    }
};

// Avatar upload (single file, images only, 5MB max)
const uploadAvatar = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    }
});

// Media upload (multiple files, various types, 10MB max per file)
const uploadMedia = multer({
    storage,
    fileFilter: mediaFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Max 10 files at once
    }
});

// Single image upload (generic)
const uploadSingleImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

// Multiple images upload
const uploadMultipleImages = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    }
});

// Helper to clean up temp files
function cleanupTempFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Cleaned up temp file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Failed to cleanup temp file: ${filePath}`, error.message);
    }
}

module.exports = {
    uploadAvatar,
    uploadMedia,
    uploadSingleImage,
    uploadMultipleImages,
    cleanupTempFile
};
