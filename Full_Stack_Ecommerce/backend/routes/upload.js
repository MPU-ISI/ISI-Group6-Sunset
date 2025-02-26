const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({ storage: storage });

// Upload route
router.post("/", upload.single('product'), (req, res) => {
  try {
    res.json({
      success: 1,
      image_url: `/images/${req.file.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, error: "Upload failed" });
  }
});

module.exports = router;