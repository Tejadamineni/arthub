const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "sql5.freesqldatabase.com",
    user: "sql5813693",
    password: "EIX5T7qTVT",
    database: "sql5813693"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("MySQL Connected...");
    }
});

module.exports = db;
