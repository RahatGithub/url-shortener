const express = require('express');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');

// Import redirect controller
const { redirectToUrl } = require('./controllers/urlController');

const app = express();

// Manual CORS Middleware - MUST BE FIRST
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log('=== REQUEST ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Authorization Header:', req.headers.authorization);
    console.log('================');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API is running!' });
});

// Redirect route (Public - must be after other routes)
app.get('/:shortCode', redirectToUrl);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});