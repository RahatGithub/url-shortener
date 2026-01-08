const db = require('../config/db');
const { nanoid } = require('nanoid');
require('dotenv').config();

const MAX_URLS_FREE_TIER = 100;

const createShortUrl = async (req, res) => {
    try {
        const { originalUrl } = req.body;
        const userId = req.user.id;


        if (!originalUrl) {
            return res.status(400).json({ message: 'URL is required.' });
        }


        try {
            new URL(originalUrl);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid URL format. Include http:// or https://' });
        }


        const [urlCount] = await db.query(
            'SELECT COUNT(*) as count FROM urls WHERE user_id = ?',
            [userId]
        );

        if (urlCount[0].count >= MAX_URLS_FREE_TIER) {
            return res.status(403).json({ 
                message: 'You have reached the maximum limit of 100 URLs. Please upgrade to premium for unlimited URLs!',
                limitReached: true
            });
        }


        const [existingUrl] = await db.query(
            'SELECT * FROM urls WHERE user_id = ? AND original_url = ?',
            [userId, originalUrl]
        );

        if (existingUrl.length > 0) {
            const shortUrl = `${process.env.BASE_URL}/${existingUrl[0].short_code}`;
            return res.json({
                message: 'URL already shortened!',
                url: {
                    id: existingUrl[0].id,
                    originalUrl: existingUrl[0].original_url,
                    shortCode: existingUrl[0].short_code,
                    shortUrl,
                    clicks: existingUrl[0].clicks,
                    createdAt: existingUrl[0].created_at
                }
            });
        }

        const shortCode = nanoid(7);

        const [result] = await db.query(
            'INSERT INTO urls (user_id, original_url, short_code) VALUES (?, ?, ?)',
            [userId, originalUrl, shortCode]
        );

        const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

        res.status(201).json({
            message: 'URL shortened successfully!',
            url: {
                id: result.insertId,
                originalUrl,
                shortCode,
                shortUrl,
                clicks: 0,
                createdAt: new Date()
            }
        });

    } catch (error) {
        console.error('Create URL error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

const getUserUrls = async (req, res) => {
    try {
        const userId = req.user.id;

        const [urls] = await db.query(
            'SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        const [countResult] = await db.query(
            'SELECT COUNT(*) as count FROM urls WHERE user_id = ?',
            [userId]
        );

        const urlsWithShortUrl = urls.map(url => ({
            id: url.id,
            originalUrl: url.original_url,
            shortCode: url.short_code,
            shortUrl: `${process.env.BASE_URL}/${url.short_code}`,
            clicks: url.clicks,
            createdAt: url.created_at
        }));

        res.json({
            urls: urlsWithShortUrl,
            totalUrls: countResult[0].count,
            maxUrls: MAX_URLS_FREE_TIER,
            remainingUrls: MAX_URLS_FREE_TIER - countResult[0].count
        });

    } catch (error) {
        console.error('Get URLs error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

const deleteUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [urls] = await db.query(
            'SELECT * FROM urls WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (urls.length === 0) {
            return res.status(404).json({ message: 'URL not found or access denied.' });
        }

        await db.query('DELETE FROM urls WHERE id = ?', [id]);

        res.json({ message: 'URL deleted successfully!' });

    } catch (error) {
        console.error('Delete URL error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};


const redirectToUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const [urls] = await db.query(
            'SELECT * FROM urls WHERE short_code = ?',
            [shortCode]
        );

        if (urls.length === 0) {
            return res.status(404).json({ message: 'Short URL not found.' });
        }

        const url = urls[0];

        await db.query(
            'UPDATE urls SET clicks = clicks + 1 WHERE id = ?',
            [url.id]
        );

        res.redirect(url.original_url);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};


const getUrlStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [urls] = await db.query(
            'SELECT * FROM urls WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (urls.length === 0) {
            return res.status(404).json({ message: 'URL not found or access denied.' });
        }

        const url = urls[0];

        res.json({
            url: {
                id: url.id,
                originalUrl: url.original_url,
                shortCode: url.short_code,
                shortUrl: `${process.env.BASE_URL}/${url.short_code}`,
                clicks: url.clicks,
                createdAt: url.created_at
            }
        });

    } catch (error) {
        console.error('Get URL stats error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

module.exports = { 
    createShortUrl, 
    getUserUrls, 
    deleteUrl, 
    redirectToUrl,
    getUrlStats 
}; 
