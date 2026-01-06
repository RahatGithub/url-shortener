 
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// convert to promise-based API
const db = pool.promise();

// Test connection
db.getConnection()
    .then(connection => {
        console.log('MySQL Connected Successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('MySQL Connection Failed:', err.message);
    });

module.exports = db;