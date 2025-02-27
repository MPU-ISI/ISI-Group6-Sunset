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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
});

// Upload route
router.post("/", upload.single('product'), (req, res) => {
  try {
    // 检查文件是否存在
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        errors: "No file uploaded"
      });
    }

    res.json({
      success: true, // 将1改为true以与前端代码匹配
      image_url: `/images/${req.file.filename}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false, 
      errors: error.message || "Upload failed" // 将error改为errors
    });
  }
});

module.exports = router;