/**
 * Script to update all existing image URLs in the database to use full server URLs
 * Run with: node update-image-urls.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
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
 * Convert relative image URLs to absolute URLs
 * @param {string} imageUrl - The image URL to convert
 * @returns {string} - The converted image URL
 */
const convertToAbsoluteUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative URL starting with /uploads, prepend the server URL
  if (imageUrl.startsWith('/uploads')) {
    return `${SERVER_URL}${imageUrl}`;
  }
  
  // Otherwise, return as is
  return imageUrl;
};

/**
 * Update image URLs in a collection
 * @param {Model} Model - Mongoose model
 * @param {string|Array} imageFields - Field name(s) containing image URLs
 */
const updateImagesInCollection = async (Model, imageFields) => {
  try {
    const documents = await Model.find({});
    console.log(`Updating ${documents.length} documents in ${Model.modelName}`);
    
    for (const doc of documents) {
      let updated = false;
      
      if (Array.isArray(imageFields)) {
        // Handle multiple image fields
        for (const field of imageFields) {
          if (Array.isArray(doc[field])) {
            // Handle array of image URLs
            doc[field] = doc[field].map(url => convertToAbsoluteUrl(url));
            updated = true;
          } else if (doc[field]) {
            // Handle single image URL
            doc[field] = convertToAbsoluteUrl(doc[field]);
            updated = true;
          }
        }
      } else {
        // Handle single image field
        if (Array.isArray(doc[imageFields])) {
          // Handle array of image URLs
          doc[imageFields] = doc[imageFields].map(url => convertToAbsoluteUrl(url));
          updated = true;
        } else if (doc[imageFields]) {
          // Handle single image URL
          doc[imageFields] = convertToAbsoluteUrl(doc[imageFields]);
          updated = true;
        }
      }
      
      if (updated) {
        await doc.save();
        console.log(`Updated document ${doc._id} in ${Model.modelName}`);
      }
    }
  } catch (error) {
    console.error(`Error updating ${Model.modelName}:`, error);
  }
};

/**
 * Main function to update all image URLs
 */
const updateAllImageUrls = async () => {
  try {
    console.log('Starting image URL update process...');
    
    // Update Hotels
    await updateImagesInCollection(Hotel, ['image', 'images']);
    
    // Update Deals
    await updateImagesInCollection(Deal, ['image', 'images']);
    
    // Update Destinations
    await updateImagesInCollection(Destination, 'image');
    
    // Update Blogs
    await updateImagesInCollection(Blog, 'image');
    
    // Update Carousel
    await updateImagesInCollection(Carousel, 'images');
    
    // Update Autoslider
    await updateImagesInCollection(Autoslider, 'image');
    
    console.log('All image URLs have been updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating image URLs:', error);
    process.exit(1);
  }
};

// Run the update process
updateAllImageUrls(); 