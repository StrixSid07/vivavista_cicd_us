const Destination = require("../models/Destination");
const Deal = require("../models/Deal");

const { processUploadedFile, deleteImage } = require("../middleware/imageUpload");
require("dotenv").config();
exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().populate("deals");
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getDestinationDropdown = async (req, res) => {
  try {
    const destinations = await Destination.find({}, "_id name").sort({
      name: 1,
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get places for a specific destination
exports.getDestinationPlaces = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    res.json(destination.places || []);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a place to a destination
exports.addPlaceToDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Place name is required" });
    }
    
    const destination = await Destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    const newPlace = {
      name
    };
    
    destination.places.push(newPlace);
    await destination.save();
    
    res.status(201).json({ 
      message: "Place added successfully", 
      place: newPlace 
    });
  } catch (error) {
    console.error("Error adding place:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a place within a destination
exports.updatePlace = async (req, res) => {
  try {
    const { destinationId, placeId } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Place name is required" });
    }
    
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    const placeIndex = destination.places.findIndex(
      place => place._id.toString() === placeId
    );
    
    if (placeIndex === -1) {
      return res.status(404).json({ message: "Place not found" });
    }
    
    destination.places[placeIndex].name = name;
    
    await destination.save();
    
    res.json({ 
      message: "Place updated successfully", 
      place: destination.places[placeIndex] 
    });
  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a place from a destination
exports.deletePlace = async (req, res) => {
  try {
    const { destinationId, placeId } = req.params;
    
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    const placeIndex = destination.places.findIndex(
      place => place._id.toString() === placeId
    );
    
    if (placeIndex === -1) {
      return res.status(404).json({ message: "Place not found" });
    }
    
    destination.places.splice(placeIndex, 1);
    await destination.save();
    
    res.json({ message: "Place deleted successfully" });
  } catch (error) {
    console.error("Error deleting place:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteDestinationImage = async (req, res) => {
  const { destinationId } = req.params;

  try {
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const imageUrl = destination.image;

    // Delete image from storage
    await deleteImage(imageUrl);

    // Remove image URL from MongoDB
    destination.image = "";
    await destination.save();

    console.log("Image deleted successfully");
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addDestination = async (req, res) => {
  const { name, isPopular, places } = req.body;
  try {
    console.log("📝 Adding new destination:", name);
    console.log("📁 File received:", req.file ? req.file.originalname : "No file");
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    
    let imageUrl = "";

    if (req.file) {
      try {
        // Process and convert image to WebP
        console.log("🖼️ Processing image for destination:", name);
        imageUrl = await processUploadedFile(req.file, 'destinations');
        console.log("✅ Image processed successfully:", imageUrl);
      } catch (imageError) {
        console.error("❌ Error processing image:", imageError);
        return res.status(500).json({ 
          message: "Error processing image", 
          error: imageError.message 
        });
      }
    }

    const destination = new Destination({
      name,
      isPopular: isPopular === 'true',
      image: imageUrl,
      places: places ? JSON.parse(places) : []
    });
    
    await destination.save();
    console.log("✅ Destination created successfully:", destination._id);
    return res.status(201).json({ 
      message: "Destination created successfully",
      destination
    });
  } catch (error) {
    console.error("❌ Error creating destination:", error);
    res.status(500).json({ 
      message: "Server error while creating destination", 
      error: error.message 
    });
  }
};

exports.updateDestination = async (req, res) => {
  const { id } = req.params;
  const { name, isPopular, places } = req.body;

  try {
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    let imageUrl = "";

    if (req.file) {
      // Process and convert image to WebP
      imageUrl = await processUploadedFile(req.file, 'destination');
    }

    if (name) destination.name = name;
    if (typeof isPopular !== "undefined") destination.isPopular = isPopular;
    if (imageUrl) destination.image = imageUrl;
    if (places) {
      try {
        destination.places = JSON.parse(places);
      } catch (error) {
        console.error("Error parsing places:", error);
      }
    }

    await destination.save();
    res.json({ message: "Destination updated successfully", destination });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFilterDealsByDestination = async (req, res) => {
  try {
    const rawName = req.query.name;

    if (!rawName || typeof rawName !== "string") {
      return res.status(400).json({ message: "Destination name is required" });
    }

    const name = rawName.trim();

    if (!name) {
      return res
        .status(400)
        .json({ message: "Destination name cannot be empty" });
    }

    console.log(`Looking for destination with name: ${name}`);

    // Case-insensitive search with more flexible matching
    const destination = await Destination.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    // If not found with exact match, try a more flexible search
    if (!destination) {
      console.log(`Exact match not found for '${name}', trying partial match`);
      const partialMatch = await Destination.findOne({
        name: { $regex: new RegExp(name, "i") },
      });
      
      if (!partialMatch) {
        return res
          .status(404)
          .json({ message: `Destination '${name}' not found` });
      }
      
      console.log(`Found partial match: ${partialMatch.name}`);
      
      // Use the partial match
      const deals = await Deal.find({
        $or: [
          { destination: partialMatch._id },
          { destinations: partialMatch._id }
        ]
      })
        .select("title destination images days prices tag isTopDeal isHotdeal destinations")
        .populate("holidaycategories", "name")
        .populate("boardBasis", "name")
        .populate("prices.hotel", "tripAdvisorRating tripAdvisorReviews")
        .populate("destination", "name")
        .populate("destinations", "name");

      // Clean up prices array
      const cleanedDeals = deals.map((deal) => {
        const cleanedPrices = deal.prices.map((price) => ({
          _id: price._id,
          price: price.price,
          hotel: price.hotel,
        }));

        return {
          _id: deal._id,
          title: deal.title,
          destination: deal.destination,
          destinations: deal.destinations,
          images: deal.images,
          days: deal.days,
          prices: cleanedPrices,
          boardBasis: deal.boardBasis,
          tag: deal.tag,
          isTopDeal: deal.isTopDeal,
          isHotdeal: deal.isHotdeal,
          holidaycategories: deal.holidaycategories,
        };
      });

      console.log(`Returning ${cleanedDeals.length} deals for partial match`);
      return res.status(200).json(cleanedDeals);
    }

    console.log(`Found destination: ${destination.name} (${destination._id})`);

    // Fetch deals where the destination is either:
    // 1. The primary destination, OR
    // 2. One of the destinations in the destinations array
    const deals = await Deal.find({
      $or: [
        { destination: destination._id },
        { destinations: destination._id }
      ]
    })
      .select("title destination images days prices tag isTopDeal isHotdeal destinations")
      .populate("holidaycategories", "name")
      .populate("boardBasis", "name")
      .populate("prices.hotel", "tripAdvisorRating tripAdvisorReviews")
      .populate("destination", "name")
      .populate("destinations", "name");

    // Clean up prices array
    const cleanedDeals = deals.map((deal) => {
      const cleanedPrices = deal.prices.map((price) => ({
        _id: price._id,
        price: price.price,
        hotel: price.hotel,
      }));

      return {
        _id: deal._id,
        title: deal.title,
        destination: deal.destination,
        destinations: deal.destinations,
        images: deal.images,
        days: deal.days,
        prices: cleanedPrices,
        boardBasis: deal.boardBasis,
        tag: deal.tag,
        isTopDeal: deal.isTopDeal,
        isHotdeal: deal.isHotdeal,
        holidaycategories: deal.holidaycategories,
      };
    });

    console.log(`Returning ${cleanedDeals.length} deals for destination ${destination.name}`);
    res.status(200).json(cleanedDeals);
  } catch (error) {
    console.error("Error in getFilterDealsByDestination:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
};
