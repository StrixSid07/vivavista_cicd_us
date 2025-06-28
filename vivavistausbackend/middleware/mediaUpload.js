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

// ✅ Multer upload configuration for both images and videos
const upload = multer({
  storage: localStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    console.log(`🔍 [mediaUpload] Filtering file: ${file.originalname}, mimetype: ${file.mimetype}, fieldname: ${file.fieldname}`);
    
    if (file.fieldname === "images") {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.mimetype)) {
        console.error(`❌ [mediaUpload] Rejected image file: ${file.originalname}, invalid mimetype: ${file.mimetype}`);
        return cb(new Error("Only JPEG, PNG, JPG and WebP formats are allowed for images"), false);
      }
      console.log(`✅ [mediaUpload] Accepted image file: ${file.originalname}`);
    } else if (file.fieldname === "videos") {
      const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-matroska", "video/x-msvideo"];
      if (!allowedTypes.includes(file.mimetype)) {
        console.error(`❌ [mediaUpload] Rejected video file: ${file.originalname}, invalid mimetype: ${file.mimetype}`);
        return cb(new Error("Only MP4, MPEG, MOV, MKV, and AVI formats are allowed for videos"), false);
      }
      console.log(`✅ [mediaUpload] Accepted video file: ${file.originalname}`);
    }
    
    cb(null, true);
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]);

/**
 * Process uploaded file and convert to WebP
 * @param {Object} file - Multer file object
 * @param {string} component - Component name for directory organization
 * @returns {Promise<string>} - Full URL of the processed image
 */
const processUploadedFile = async (file, component = 'general') => {
  try {
    console.log(`🚀 [processUploadedFile] Processing file: ${file.originalname}, component: ${component}`);
    
    // Get the full path of the uploaded file
    const filePath = path.join(process.cwd(), 'uploads', 'temp', file.filename);
    console.log(`📄 [processUploadedFile] File path: ${filePath}, exists: ${fs.existsSync(filePath)}`);
    
    // Convert the image to WebP format and move to component directory
    // This now returns a full URL with SERVER_URL included
    const webpPath = await convertToWebP(filePath, { 
      quality: 80,
      component: component
    });
    
    console.log(`✅ [processUploadedFile] Image processed successfully: ${webpPath}`);
    return webpPath;
  } catch (error) {
    console.error(`❌ [processUploadedFile] Error processing uploaded file: ${error.message}`);
    console.error(error.stack);
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

// Middleware wrapper to handle errors properly
const uploadMediaMiddleware = (req, res, next) => {
  console.log('📤 Starting media upload middleware');
  console.log(`📤 Request body keys: ${Object.keys(req.body)}`);
  console.log(`📤 Request has files: ${req.files ? 'Yes' : 'No'}`);
  
  // Log headers to check content type
  console.log('📤 Request headers:');
  console.log(`📤 Content-Type: ${req.headers['content-type']}`);
  
  upload(req, res, (err) => {
    if (err) {
      console.error(`❌ Media upload error: ${err.message}`);
      return res.status(400).json({ message: err.message });
    }
    
    console.log(`✅ Media upload successful: ${req.files ? JSON.stringify(Object.keys(req.files)) : 'No files'}`);
    if (req.files) {
      if (req.files.images) {
        console.log(`📸 Received ${req.files.images.length} images`);
        req.files.images.forEach((file, i) => {
          console.log(`📸 Image ${i+1}: ${file.originalname}, size: ${file.size}, path: ${file.path}`);
        });
      }
      if (req.files.videos) {
        console.log(`🎥 Received ${req.files.videos.length} videos`);
        req.files.videos.forEach((file, i) => {
          console.log(`🎥 Video ${i+1}: ${file.originalname}, size: ${file.size}, path: ${file.path}`);
        });
      }
    } else {
      console.log('❌ No files received in the request');
    }
    next();
  });
};

module.exports = {
  uploadMedia: uploadMediaMiddleware,
  processUploadedFile,
  deleteImage
}; 