const Holiday = require("../models/Holiday");
const Deal = require("../models/Deal");

// Get all holidays (no deals to populate since not in schema)
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ name: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get holiday dropdown (returns _id and name only)
exports.getHolidayDropdown = async (req, res) => {
  try {
    const holidays = await Holiday.find({}, "_id name").sort({ name: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add a new holiday
exports.addHoliday = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const trimmedName = name.trim();
    const holiday = new Holiday({ name: trimmedName });
    await holiday.save();

    res.status(201).json({ message: "Holiday created successfully", holiday });
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing holiday
exports.updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    if (name) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      holiday.name = trimmedName;
    }

    await holiday.save();
    res.json({ message: "Holiday updated successfully", holiday });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a holiday
exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Helper function to convert slug back to name for database search
const slugToName = (slug) => {
  // Create a mapping of common slug patterns to their corresponding names
  const slugMappings = {
    'centraleurope': 'Central Europe',
    'beachholidays': 'Beach Holidays',
    'citybreaks': 'City Breaks', 
    'luxuryholidays': 'Luxury Holidays',
    'familyholidays': 'Family Holidays',
    'honeymoon': 'Honeymoon',
    'adventure': 'Adventure',
    'cruise': 'Cruise',
    'ski': 'Ski',
    'golf': 'Golf'
  };
  
  const lowerSlug = slug.toLowerCase();
  
  // First check direct mapping
  if (slugMappings[lowerSlug]) {
    return slugMappings[lowerSlug];
  }
  
  // If no direct mapping, try to reconstruct the name
  // Handle camelCase conversion: "centralEurope" -> "Central Europe"
  let reconstructed = slug.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle space insertion for concatenated words
  // This is a simple approach - you might need to enhance this based on your data
  reconstructed = reconstructed.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize first letter of each word
  return reconstructed.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

exports.getFilterDealsByHoliday = async (req, res) => {
  try {
    const rawSlug = req.query.slug;
    const rawName = req.query.name; // Keep backward compatibility

    let searchName;
    
    if (rawSlug) {
      // New slug-based approach
      if (!rawSlug || typeof rawSlug !== "string") {
        return res
          .status(400)
          .json({ message: "Holiday category slug is required" });
      }
      
      const slug = rawSlug.trim();
      if (!slug) {
        return res
          .status(400)
          .json({ message: "Holiday category slug cannot be empty" });
      }
      
      // Convert slug to name for database search
      searchName = slugToName(slug);
    } else if (rawName) {
      // Backward compatibility with name-based approach
      if (!rawName || typeof rawName !== "string") {
        return res
          .status(400)
          .json({ message: "Holiday category name is required" });
      }
      
      const name = rawName.trim();
      if (!name) {
        return res
          .status(400)
          .json({ message: "Holiday category name cannot be empty" });
      }
      
      searchName = name;
    } else {
      return res
        .status(400)
        .json({ message: "Holiday category slug or name is required" });
    }

    // Case-insensitive search for the holiday category, handling spaces
    const holidayCategory = await Holiday.findOne({
      name: { $regex: new RegExp(`^\\s*${searchName.trim()}\\s*$`, "i") },
    });

    if (!holidayCategory) {
      return res
        .status(404)
        .json({ 
          message: `Holiday category not found for: ${searchName}`,
          searchedFor: searchName 
        });
    }

    // Fetch deals by holiday ID, and populate prices.hotel
    const deals = await Deal.find({
      holidaycategories: holidayCategory._id,
    })
      .select("title images days prices tag isTopDeal isHotdeal destinations")
      .populate("destination", "name")
      .populate("boardBasis", "name")
      .populate("prices.hotel", "tripAdvisorRating tripAdvisorReviews")
      .populate("destinations", "name");

    // Manually filter out unwanted fields from prices[]
    const cleanedDeals = deals.map((deal) => {
      const cleanedPrices = deal.prices.map((price) => ({
        _id: price._id,
        price: price.price,
        hotel: price.hotel,
      }));

      return {
        _id: deal._id,
        title: deal.title,
        images: deal.images,
        days: deal.days,
        prices: cleanedPrices,
        boardBasis: deal.boardBasis,
        tag: deal.tag,
        isTopDeal: deal.isTopDeal,
        isHotdeal: deal.isHotdeal,
        destination: deal.destination,
        destinations: deal.destinations,
      };
    });

    res.status(200).json(cleanedDeals);
  } catch (error) {
    console.error("Error in getFilterDealsByHoliday:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
