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

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

// Mount Better Auth handler at /api/auth/*
app.all('/api/auth/*', toNodeHandler(auth));

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