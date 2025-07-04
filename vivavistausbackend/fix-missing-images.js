/**
 * Script to diagnose and fix missing images
 * This script will:
 * 1. Check all image URLs in the database
 * 2. Verify if the corresponding files exist in the uploads directory
 * 3. Report missing files
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
dotenv.config();

// Models that contain image fields
const Hotel = require('./models/Hotel');
const Deal = require('./models/Deal');
const Destination = require('./models/Destination');
const Blog = require('./models/Blog');
const Carousel = require('./models/Carousel');
const Autoslider = require('./models/Autoslider');

// Get the server URL from environment or use default
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5003";

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

/**
 * Check if a file exists at the given path
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if file exists, false otherwise
 */
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`Error checking if file exists: ${error.message}`);
    return false;
  }
};

/**
 * Extract the relative path from a full URL
 * @param {string} imageUrl - Full image URL
 * @returns {string} - Relative path
 */
const extractRelativePath = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's a relative URL starting with /uploads, return as is
  if (imageUrl.startsWith('/uploads')) {
    return imageUrl;
  }
  
  // If it's a full URL with SERVER_URL, extract the path
  if (imageUrl.startsWith(SERVER_URL)) {
    return imageUrl.replace(SERVER_URL, '');
  }
  
  // If it's another format, try to extract /uploads part
  const match = imageUrl.match(/\/uploads\/.*$/);
  if (match) {
    return match[0];
  }
  
  return null;
};

/**
 * Check images in a collection
 * @param {Model} Model - Mongoose model
 * @param {string|Array} imageFields - Field name(s) containing image URLs
 */
const checkImagesInCollection = async (Model, imageFields) => {
  try {
    const documents = await Model.find({});
    console.log(`\nChecking ${documents.length} documents in ${Model.modelName}`);
    
    let missingCount = 0;
    let existingCount = 0;
    
    for (const doc of documents) {
      if (Array.isArray(imageFields)) {
        // Handle multiple image fields
        for (const field of imageFields) {
          if (Array.isArray(doc[field])) {
            // Handle array of image URLs
            for (const imageUrl of doc[field]) {
              const relativePath = extractRelativePath(imageUrl);
              if (relativePath) {
                const fullPath = path.join(process.cwd(), relativePath);
                const exists = fileExists(fullPath);
                
                if (exists) {
                  existingCount++;
                } else {
                  missingCount++;
                  console.log(`❌ Missing image: ${imageUrl}`);
                  console.log(`   Expected at: ${fullPath}`);
                }
              }
            }
          } else if (doc[field]) {
            // Handle single image URL
            const imageUrl = doc[field];
            const relativePath = extractRelativePath(imageUrl);
            if (relativePath) {
              const fullPath = path.join(process.cwd(), relativePath);
              const exists = fileExists(fullPath);
              
              if (exists) {
                existingCount++;
              } else {
                missingCount++;
                console.log(`❌ Missing image: ${imageUrl}`);
                console.log(`   Expected at: ${fullPath}`);
              }
            }
          }
        }
      } else {
        // Handle single image field
        if (Array.isArray(doc[imageFields])) {
          // Handle array of image URLs
          for (const imageUrl of doc[imageFields]) {
            const relativePath = extractRelativePath(imageUrl);
            if (relativePath) {
              const fullPath = path.join(process.cwd(), relativePath);
              const exists = fileExists(fullPath);
              
              if (exists) {
                existingCount++;
              } else {
                missingCount++;
                console.log(`❌ Missing image: ${imageUrl}`);
                console.log(`   Expected at: ${fullPath}`);
              }
            }
          }
        } else if (doc[imageFields]) {
          // Handle single image URL
          const imageUrl = doc[imageFields];
          const relativePath = extractRelativePath(imageUrl);
          if (relativePath) {
            const fullPath = path.join(process.cwd(), relativePath);
            const exists = fileExists(fullPath);
            
            if (exists) {
              existingCount++;
            } else {
              missingCount++;
              console.log(`❌ Missing image: ${imageUrl}`);
              console.log(`   Expected at: ${fullPath}`);
            }
          }
        }
      }
    }
    
    console.log(`✅ ${Model.modelName}: Found ${existingCount} existing images, ${missingCount} missing images`);
  } catch (error) {
    console.error(`Error checking ${Model.modelName}:`, error);
  }
};

/**
 * Main function to check all images
 */
const checkAllImages = async () => {
  try {
    console.log('Starting image check process...');
    
    // Check Hotels
    await checkImagesInCollection(Hotel, ['image', 'images']);
    
    // Check Deals
    await checkImagesInCollection(Deal, ['image', 'images']);
    
    // Check Destinations
    await checkImagesInCollection(Destination, 'image');
    
    // Check Blogs
    await checkImagesInCollection(Blog, 'image');
    
    // Check Carousel
    await checkImagesInCollection(Carousel, 'images');
    
    // Check Autoslider
    await checkImagesInCollection(Autoslider, 'image');
    
    console.log('\nImage check completed!');
    
    // Provide guidance
    console.log('\nTo fix missing images:');
    console.log('1. Ensure the uploads directories exist: mkdir -p uploads/{hotel,deal,carousel,autoslider,destination,blog,general}');
    console.log('2. Upload the missing images to their respective directories');
    console.log('3. Or update the database to remove references to missing images');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking images:', error);
    process.exit(1);
  }
};

// Run the check process
checkAllImages();
