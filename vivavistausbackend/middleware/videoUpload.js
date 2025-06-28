const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

// Ensure temp upload directory exists
const tempDir = path.join(process.cwd(), 'uploads', 'temp');
fs.ensureDirSync(tempDir);

// ✅ Local disk storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Multer upload configuration for videos
const uploadVideos = multer({
  storage: localStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit per video
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-matroska", "video/x-msvideo"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only MP4, MPEG, MOV, MKV and AVI formats are allowed for videos"),
        false
      );
    }
    cb(null, true);
  },
}).array('videos', 3); // Field name 'videos', max 3 files

module.exports = {
  uploadVideos,
}; 