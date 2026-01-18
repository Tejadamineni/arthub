require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const db = require("../db");

const router = express.Router();

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// 🔥 Upload artwork
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { title, description, user_id } = req.body;
    const file = req.file;

    if (!title || !description || !file) {
      return res.status(400).json({ message: "All fields required" });
    }

    const fileName = Date.now() + "_" + file.originalname;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    const sql = `
      INSERT INTO artworks (user_id, title, description, image_url)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, title, description, imageUrl], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Artwork uploaded successfully",
        imageUrl,
      });
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
