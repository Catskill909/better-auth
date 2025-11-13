// Basic Node.js application setup for Better Auth integration

const express = require('express');
const path = require('path');
const { auth } = require('./better-auth');
const { toNodeHandler } = require('better-auth/node');
const app = express();
const port = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount Better Auth handler at /api/auth/*
app.all('/api/auth/*', toNodeHandler(auth));

// Home route - serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    console.log(`📱 Open http://localhost:${port} in your browser to get started!`);
});