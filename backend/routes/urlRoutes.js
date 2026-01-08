const express = require('express');
const router = express.Router();
const { 
    createShortUrl, 
    getUserUrls, 
    deleteUrl,
    getUrlStats 
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// POST /api/urls 
router.post('/', createShortUrl);

// GET /api/urls 
router.get('/', getUserUrls);

// GET /api/urls/:id 
router.get('/:id', getUrlStats);

// DELETE /api/urls/:id 
router.delete('/:id', deleteUrl);

module.exports = router;