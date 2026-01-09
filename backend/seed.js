const db = require('./config/db');
const bcrypt = require('bcryptjs');

function getRandomEmail() {
    const firstNames = ['monuwar', 'sakib', 'ruhul', 'shawon', 'mithila', 'shurobhi', 'tamanna'];
    const words = ['mango', 'apple', 'banana', 'orange', 'peach'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const word = words[Math.floor(Math.random() * words.length)];

    return `${firstName}@${word}.com`;
}

async function seed() {
    // create a new user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const email = getRandomEmail();
    const [result] = await db.query(
        'INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())',
        [email, hashedPassword]
    );
    const userId = result.insertId;

    // generate URLs for this user
    for (let i = 1; i <= 98; i++) {
        await db.query(
            'INSERT INTO urls (user_id, original_url, short_code, created_at) VALUES (?, ?, ?, NOW())',
            [userId, `https://example.com/dummy-data-for-testing-url-shortener-project/john-doe-singing-a-random-song-that-nobody-has-ever-heard-of/page-${i}`, Math.random().toString(36).substring(2, 8)]
        );
    }

    console.log(`Seed complete! New user created. Email: ${email}, Password: 123456`);
    process.exit();
}

seed().catch(console.error);