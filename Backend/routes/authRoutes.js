const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "User already exists" });
        }
        res.json({ message: "User registered successfully" });
    });
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1d" });

        res.json({ message: "Login successful", token, user });
    });
});
// DELETE ACCOUNT
router.delete("/delete/:id", (req, res) => {
    const userId = req.params.id;

    db.query("DELETE FROM artworks WHERE user_id = ?", [userId], () => {
        db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Delete failed" });
            }
            res.json({ message: "Account deleted successfully" });
        });
    });
});


module.exports = router;
