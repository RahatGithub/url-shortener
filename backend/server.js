const express = require('express');
const cors = require('cors');       
require('dotenv').config();

const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');

const { redirectToUrl } = require('./controllers/urlController');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API is running!' });
});

app.get('/:shortCode', redirectToUrl);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
