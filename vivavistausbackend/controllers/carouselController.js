const Carousel = require("../models/Carousel");
const Deal = require("../models/Deal");
const { processUploadedFile, deleteImage } = require("../middleware/imageUpload");

// POST: Upload new carousel
exports.createCarousel = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed." });
    }

    // Process each uploaded file and convert to WebP
    let imageUrls = await Promise.all(
      req.files.map((file) => processUploadedFile(file, 'carousel'))
    );

    // Extract deal from form data if provided
    const dealId = req.body.deal && req.body.deal !== 'null' ? req.body.deal : null;

    const carousel = new Carousel({ 
      images: imageUrls,
      deal: dealId
    });
    const saved = await carousel.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating carousel:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET: All carousels
exports.getAllCarousels = async (req, res) => {
  try {
    const all = await Carousel.find()
      .populate({
        path: "deal",
        select: "title",
      })
      .sort({ createdAt: -1 });
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update carousel (images + deal)
exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findById(id);
    if (!carousel)
      return res.status(404).json({ message: "Carousel not found" });

    // Extract deal from form data if provided
    const dealId = req.body.deal && req.body.deal !== 'null' && req.body.deal !== '' ? req.body.deal : null;

    // Update deal regardless of whether new images are provided
    carousel.deal = dealId;

    // Only update images if new ones are provided
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: "Max 5 images allowed." });
      }

      // Delete existing images
      if (carousel.images && carousel.images.length > 0) {
        await Promise.all(
          carousel.images.map(async (imageUrl) => {
            try {
              await deleteImage(imageUrl);
            } catch (error) {
              console.error(`Error deleting image ${imageUrl}:`, error);
            }
          })
        );
      }

      // Process each uploaded file and convert to WebP
      let imageUrls = await Promise.all(
        req.files.map((file) => processUploadedFile(file, 'carousel'))
      );

      carousel.images = imageUrls;
    }

    const updated = await carousel.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating carousel:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove one
exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findById(id);
    
    if (!carousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }
    
    // Delete all images
    if (carousel.images && carousel.images.length > 0) {
      await Promise.all(
        carousel.images.map(async (imageUrl) => {
          try {
            await deleteImage(imageUrl);
          } catch (error) {
            console.error(`Error deleting image ${imageUrl}:`, error);
          }
        })
      );
    }
    
    await Carousel.findByIdAndDelete(id);
    res.status(200).json({ message: "Carousel deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: All deals for dropdown
exports.getAllDealsForDropdown = async (req, res) => {
  try {
    const deals = await Deal.find({}, '_id title').sort({ title: 1 });
    res.status(200).json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
