const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const crypto = require('crypto');
const { convertToWebP, deleteLocalImage, ensureUploadDirectories } = require("./imageProcessor");
require("dotenv").config();

// Get the server URL from environment or use default
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5003";

// Generate a unique filename for an uploaded file
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const sanitizedFilename = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/--+/g, '-');
  
  return `${timestamp}-${randomString}-${sanitizedFilename}`;
};

// Ensure upload directories exist on server start
ensureUploadDirectories().catch(err => {
  console.error("Error creating upload directories:", err);
});

// ✅ Local disk storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use a temporary directory for initial upload
    const uploadPath = path.join(process.cwd(), 'uploads', 'temp');
    console.log(`📁 [mediaUpload] Storing ${file.fieldname} in temp directory: ${uploadPath}`);
    fs.ensureDirSync(uploadPath);
    console.log(`📁 [mediaUpload] Directory exists: ${fs.existsSync(uploadPath)}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    console.log(`🔤 [mediaUpload] Generated filename: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  },
});

// ✅ Multer upload configuration
const upload = multer({
  storage: localStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    console.log("📦 Uploading file:", {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size, // Might not be available here, but helpful to try
    });

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error("❌ Invalid file type:", file.mimetype);
      return cb(
        new Error("Only JPEG, PNG, and JPG formats are allowed"),
        false
      );
    }

    console.log("✅ File accepted:", file.originalname);
    cb(null, true);
  },
}); 

/**
 * Process uploaded file and convert to WebP
 * @param {Object} file - Multer file object
 * @param {string} component - Component name for directory organization
 * @returns {Promise<string>} - Full URL of the processed image
 */
const processUploadedFile = async (file, component = 'general') => {
  try {
    // Get the full path of the uploaded file
    const filePath = path.join(process.cwd(), 'uploads', 'temp', file.filename);
    
    // Convert the image to WebP format and move to component directory
    // This now returns a full URL with SERVER_URL included
    const webpPath = await convertToWebP(filePath, { 
      quality: 80,
      component: component
    });
    
    console.log(`✅ Image processed successfully: ${webpPath}`);
    return webpPath;
  } catch (error) {
    console.error(`❌ Error processing uploaded file: ${error.message}`);
    // If processing fails, return the original path with server URL
    return `${SERVER_URL}/uploads/temp/${file.filename}`;
  }
};

/**
 * Delete image from local storage
 * @param {string} imageUrl - URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log("⚠️ No image URL provided for deletion");
      return false;
    }
    
    // Delete from local storage
    const result = await deleteLocalImage(imageUrl);
    return result;
  } catch (error) {
    console.error(`❌ Failed to delete image: ${error.message}`);
    throw error;
  }
};

module.exports = {
  upload,
  processUploadedFile,
  deleteImage
};
