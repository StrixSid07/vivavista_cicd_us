const Deal = require("../models/Deal");

/**
 * Get all multicenter deals
 * @route GET /api/multicenter
 * @access Public
 */
exports.getAllMulticenterDeals = async (req, res) => {
  try {
    const { sort = "updated" } = req.query;
    
    const sortOptions = {};
    if (sort === "updated") {
      sortOptions.updatedAt = -1;
    } else if (sort === "created") {
      sortOptions.createdAt = -1;
    } else if (sort === "price-low") {
      sortOptions["prices.0.price"] = 1;
    } else if (sort === "price-high") {
      sortOptions["prices.0.price"] = -1;
    }
    
    const multicenterDeals = await Deal.find({ 
      destinations: { $exists: true, $ne: [] } // Find deals with non-empty destinations array
    })
      .select("title images isHotdeal isTopDeal destination destinations prices days tag boardBasis createdAt updatedAt")
      .populate({
        path: "destination",
        select: "name image",
      })
      .populate({
        path: "destinations",
        select: "name",
      })
      .populate({
        path: "boardBasis",
        select: "name",
      })
      .populate({
        path: "prices.hotel",
        select: "name tripAdvisorRating tripAdvisorReviews",
      })
      .sort(sortOptions);
    
    res.json(multicenterDeals);
  } catch (error) {
    console.error("Error fetching multicenter deals:", error);
    res.status(500).json({ error: "Failed to fetch multicenter deals" });
  }
};

/**
 * Get featured multicenter deals (for homepage)
 * @route GET /api/multicenter/featured
 * @access Public
 */
exports.getFeaturedMulticenterDeals = async (req, res) => {
  try {
    const featuredMulticenterDeals = await Deal.find({ 
      destinations: { $exists: true, $ne: [] },
      isFeatured: true
    })
      .select("title images isHotdeal isTopDeal destination destinations prices days tag boardBasis")
      .populate({
        path: "destination",
        select: "name image",
      })
      .populate({
        path: "destinations",
        select: "name",
      })
      .populate({
        path: "boardBasis",
        select: "name",
      })
      .populate({
        path: "prices.hotel",
        select: "name tripAdvisorRating tripAdvisorReviews",
      })
      .sort({ updatedAt: -1 })
      .limit(6);
    
    res.json(featuredMulticenterDeals);
  } catch (error) {
    console.error("Error fetching featured multicenter deals:", error);
    res.status(500).json({ error: "Failed to fetch featured multicenter deals" });
  }
};

/**
 * Get multicenter deals by destination
 * @route GET /api/multicenter/destination/:destinationId
 * @access Public
 */
exports.getMulticenterDealsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    
    // Find multicenter deals that include this destination either as primary or one of the additional destinations
    const multicenterDeals = await Deal.find({
      $or: [
        { destination: destinationId },
        { destinations: destinationId }
      ],
      destinations: { $exists: true, $ne: [] } // Ensure it's a multicenter deal
    })
      .select("title images isHotdeal isTopDeal destination destinations prices days tag boardBasis")
      .populate({
        path: "destination",
        select: "name image",
      })
      .populate({
        path: "destinations",
        select: "name",
      })
      .populate({
        path: "boardBasis",
        select: "name",
      })
      .populate({
        path: "prices.hotel",
        select: "name tripAdvisorRating tripAdvisorReviews",
      })
      .sort({ updatedAt: -1 });
    
    res.json(multicenterDeals);
  } catch (error) {
    console.error("Error fetching multicenter deals by destination:", error);
    res.status(500).json({ error: "Failed to fetch multicenter deals by destination" });
  }
}; 