const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
require("dotenv").config();

// Get the server URL from environment or use default
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5003";

/**
 * Generate a unique filename for an uploaded file
 * @param {string} originalFilename - Original filename
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const sanitizedFilename = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/--+/g, '-');
  
  return `${timestamp}-${randomString}-${sanitizedFilename}`;
};

/**
 * Convert an image to WebP format
 * @param {string} filePath - Path to the original image file
 * @param {Object} options - Options for WebP conversion
 * @param {number} options.quality - WebP quality (1-100)
 * @param {string} options.component - Component name for directory organization
 * @returns {Promise<string>} - Full URL path to the converted WebP file
 */
const convertToWebP = async (filePath, options = { quality: 80, component: 'general' }) => {
  try {
    console.log(`🔍 convertToWebP called with filePath: ${filePath}, component: ${options.component}`);
    
    // Create component directory if it doesn't exist
    const component = options.component || 'general';
    const uploadDir = path.join(process.cwd(), 'uploads', component);
    console.log(`📁 Ensuring directory exists: ${uploadDir}`);
    
    try {
    await fs.ensureDir(uploadDir);
      console.log(`✅ Directory ensured: ${uploadDir}`);
    } catch (dirError) {
      console.error(`❌ Error ensuring directory: ${dirError.message}`);
      throw dirError;
    }
    
    // Create WebP output path by changing the extension and moving to component directory
    const parsedPath = path.parse(filePath);
    // Generate unique filename for the WebP file
    const uniqueBasename = generateUniqueFilename(parsedPath.name);
    const filename = `${uniqueBasename}.webp`;
    const webpPath = path.join(uploadDir, filename);
    console.log(`🖼️ WebP output path: ${webpPath}`);
    
    // Convert to WebP using sharp
    try {
      console.log(`🔄 Starting WebP conversion for: ${filePath}`);
    await sharp(filePath)
      .webp({ quality: options.quality })
      .toFile(webpPath);
      console.log(`✅ WebP conversion successful: ${webpPath}`);
    } catch (sharpError) {
      console.error(`❌ Sharp conversion error: ${sharpError.message}`);
      throw sharpError;
    }
    
    // Delete the original file if WebP conversion was successful
    try {
    await fs.unlink(filePath);
      console.log(`🗑️ Original file deleted: ${filePath}`);
    } catch (unlinkError) {
      console.error(`⚠️ Warning: Could not delete original file: ${unlinkError.message}`);
      // Continue execution even if deletion fails
    }
    
    // Return the full server URL path for database storage
    const fullUrl = `${SERVER_URL}/uploads/${component}/${filename}`;
    console.log(`🔗 Returning URL: ${fullUrl}`);
    return fullUrl;
  } catch (error) {
    console.error(`❌ Error in convertToWebP: ${error.message}`);
    console.error(error.stack);
    // If conversion fails, return the original path with server URL
    const relativePath = filePath.replace(process.cwd(), '');
    const fallbackUrl = `${SERVER_URL}${relativePath}`;
    console.log(`⚠️ Returning fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
  }
};

/**
 * Delete an image file from the local filesystem
 * @param {string} imageUrl - URL or path of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteLocalImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log("⚠️ No image URL provided for deletion");
      return false;
    }
    
    // Extract the file path from the URL by removing the server URL part
    let filePath = imageUrl;
    if (imageUrl.startsWith(SERVER_URL)) {
      filePath = imageUrl.replace(SERVER_URL, '');
    }
    
    // Join with current working directory
    filePath = path.join(process.cwd(), filePath);
    
    console.log(`Attempting to delete file at path: ${filePath}`);
    
    // Check if the file exists before attempting to delete
    if (fs.existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log(`✅ Local image file deleted: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ Local image file not found: ${filePath}`);
      // Try alternate path formats if the file wasn't found
      const alternativePath = filePath.replace(/\\/g, '/');
      if (fs.existsSync(alternativePath)) {
        await fs.unlink(alternativePath);
        console.log(`✅ Local image file deleted (alternative path): ${alternativePath}`);
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting local file: ${error.message}`);
    return false; // Return false instead of throwing to prevent breaking the flow
  }
};

/**
 * Ensure component upload directories exist
 * @returns {Promise<void>}
 */
const ensureUploadDirectories = async () => {
  try {
    // Create main uploads directory
    await fs.ensureDir(path.join(process.cwd(), 'uploads'));
    console.log('✅ Main uploads directory created');
    
    // Create component-specific directories with proper permissions
    const components = [
      'temp', 'destinations', 'hotels', 'deals', 'carousel',
      'holidays', 'autoslider', 'blogs', 'general'
    ];
    
    for (const component of components) {
      const dirPath = path.join(process.cwd(), 'uploads', component);
      await fs.ensureDir(dirPath);
      
      // Set directory permissions to 0755 (rwxr-xr-x)
      try {
        await fs.chmod(dirPath, 0o755);
      } catch (err) {
        console.warn(`⚠️ Could not set permissions for ${dirPath}: ${err.message}`);
      }
      
      console.log(`✅ Created directory: ${dirPath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating directories: ${error.message}`);
    throw error;
  }
};

module.exports = {
  convertToWebP,
  deleteLocalImage,
  ensureUploadDirectories
}; 