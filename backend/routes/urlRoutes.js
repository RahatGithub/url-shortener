const express = require('express');
const router = express.Router();
const { 
    createShortUrl, 
    getUserUrls, 
    deleteUrl,
    getUrlStats 
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes below require authentication
router.use(authMiddleware);

// POST /api/urls - Create short URL
router.post('/', createShortUrl);

// GET /api/urls - Get all user's URLs
router.get('/', getUserUrls);

// GET /api/urls/:id - Get single URL stats
router.get('/:id', getUrlStats);

// DELETE /api/urls/:id - Delete a URL
router.delete('/:id', deleteUrl);

module.exports = router;