const express = require("express");
const multer = require("multer");
const db = require("../db");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

/* ================= AWS S3 CONFIG ================= */

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/* ================= MULTER CONFIG ================= */
// Store file in memory (NOT disk)
const upload = multer({ storage: multer.memoryStorage() });

/* ================= UPLOAD ARTWORK ================= */

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const { title, description, user_id } = req.body;
        const file = req.file;

        if (!title || !description || !file) {
            return res.status(400).json({ message: "All fields required" });
        }

        const fileName = Date.now() + "-" + file.originalname;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await s3.send(command);

        const image_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        const sql =
            "INSERT INTO artworks (user_id, title, description, image_url) VALUES (?, ?, ?, ?)";

        db.query(sql, [user_id, title, description, image_url], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Upload failed" });
            }

            res.json({
                message: "Artwork uploaded successfully",
                image_url
            });
        });

    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
});

/* ================= GET ALL ARTWORKS ================= */

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

/* ================= GET USER ARTWORKS ================= */

router.get("/user/:id", (req, res) => {
    const userId = req.params.id;

    const sql =
        "SELECT * FROM artworks WHERE user_id = ? ORDER BY created_at DESC";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching user artworks" });
        }
        res.json(result);
    });
});

module.exports = router;
