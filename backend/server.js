const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');

// Import redirect controller
const { redirectToUrl } = require('./controllers/urlController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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