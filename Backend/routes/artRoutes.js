const express = require("express");
const multer = require("multer");
const db = require("../db");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Upload artwork
router.post("/upload", upload.single("image"), (req, res) => {
    const { title, description, user_id } = req.body;
    const image_url = req.file ? req.file.path : null;

    if (!title || !description || !image_url) {
        return res.status(400).json({ message: "All fields required" });
    }

    const sql = "INSERT INTO artworks (user_id, title, description, image_url) VALUES (?, ?, ?, ?)";
    db.query(sql, [user_id, title, description, image_url], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Upload failed" });
        }
        res.json({ message: "Artwork uploaded successfully" });
    });
});

// Get all artworks
router.get("/all", (req, res) => {
    const sql = "SELECT * FROM artworks ORDER BY created_at DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching artworks" });
        }
        res.json(result);
    });
});

// Get artworks by user
// Get artworks by user
router.get("/user/:id", (req, res) => {
    const userId = req.params.id;

    const sql = "SELECT * FROM artworks WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching user artworks" });
        }
        res.json(result);
    });
});



module.exports = router;
