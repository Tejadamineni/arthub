require("dotenv").config();
const db = require("./db");

// USERS TABLE
const usersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// ARTWORKS TABLE
const artworksTable = `
CREATE TABLE IF NOT EXISTS artworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(200),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(usersTable, (err) => {
    if (err) {
        console.error("❌ Users table error:", err);
    } else {
        console.log("✅ Users table created");
    }
});

db.query(artworksTable, (err) => {
    if (err) {
        console.error("❌ Artworks table error:", err);
    } else {
        console.log("✅ Artworks table created");
    }
});
