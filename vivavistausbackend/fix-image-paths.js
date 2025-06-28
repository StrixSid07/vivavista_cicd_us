const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Carousel = require('./models/Carousel');
const Autoslider = require('./models/Autoslider');
const Deal = require('./models/Deal');
const Hotel = require('./models/Hotel');
const Destination = require('./models/Destination');
const Blog = require('./models/Blog');

// Function to check if file exists
const fileExists = (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    return fs.existsSync(fullPath);
  } catch (err) {
    console.error(`Error checking file ${filePath}:`, err);
    return false;
  }
};

// Function to list all files in a directory
const listFiles = (dirPath) => {
  try {
    const fullPath = path.join(__dirname, dirPath);
    if (!fs.existsSync(fullPath)) return [];
    return fs.readdirSync(fullPath);
  } catch (err) {
    console.error(`Error listing directory ${dirPath}:`, err);
    return [];
  }
};

// Fix Carousel images
const fixCarouselImages = async () => {
  try {
    const carousels = await Carousel.find();
    console.log(`Found ${carousels.length} carousels`);
    
    for (const carousel of carousels) {
      const fixedImages = [];
      
      for (const imageUrl of carousel.images) {
        console.log(`Checking image: ${imageUrl}`);
        
        // Check if file exists as is
        if (fileExists(imageUrl)) {
          console.log(`✅ File exists: ${imageUrl}`);
          fixedImages.push(imageUrl);
          continue;
        }
        
        // Try to find the file in the carousel directory
        const carouselDir = 'uploads/carousel';
        const files = listFiles(carouselDir);
        
        // Extract the filename without path
        const filename = path.basename(imageUrl);
        const filenameWithoutExt = path.parse(filename).name;
        
        // Look for similar files
        const similarFile = files.find(file => 
          file.includes(filenameWithoutExt) || 
          filenameWithoutExt.includes(file.replace(/\.[^/.]+$/, ""))
        );
        
        if (similarFile) {
          const newPath = `/${carouselDir}/${similarFile}`;
          console.log(`🔄 Found similar file: ${similarFile}`);
          console.log(`🔄 Replacing ${imageUrl} with ${newPath}`);
          fixedImages.push(newPath);
        } else {
          console.log(`❌ No similar file found for: ${imageUrl}`);
          fixedImages.push(imageUrl); // Keep the original even if not found
        }
      }
      
      // Update the carousel with fixed images
      if (JSON.stringify(carousel.images) !== JSON.stringify(fixedImages)) {
        console.log(`🔄 Updating carousel ${carousel._id} images`);
        carousel.images = fixedImages;
        await carousel.save();
        console.log(`✅ Updated carousel ${carousel._id}`);
      }
    }
  } catch (err) {
    console.error('Error fixing carousel images:', err);
  }
};

// Main function
const main = async () => {
  try {
    await fixCarouselImages();
    console.log('Image path fixing completed');
  } catch (err) {
    console.error('Error in main function:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
main(); 