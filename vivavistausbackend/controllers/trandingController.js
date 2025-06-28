const mongoose = require("mongoose");
const Deal = require("../models/Deal");

exports.getHotDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isHotDeal: true })
      .sort({ updatedAt: -1, createdAt: -1 }) // Sort by most recently updated, then created
      .populate("destination", "name")
      .populate("boardBasis", "name")
      .populate("destinations", "name");

    res.json(deals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Hot deals", error: error.message });
  }
};

// exports.getTopDeals = async (req, res) => {
//   try {
//     const deals = await Deal.find({ isTopDeal: true })
//       .populate("prices.hotel")
//       .populate("destination", "name")
//       .populate("boardBasis", "name")
//       .select(
//         "title destination description prices boardBasis days images isTopDeal isHotdeal"
//       );

//     res.json(deals);
//   } catch {
//     res
//       .status(500)
//       .json({ message: "Error fetching Top deals by destination", error });
//   }
// };

// exports.getTopDealsByDestination = async (req, res) => {
//   try {
//     const { destinationId, dealId } = req.params;

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(destinationId)) {
//       return res.status(400).json({ message: "Invalid destinationId" });
//     }

//     const query = {
//       destination: new mongoose.Types.ObjectId(destinationId),
//       isTopDeal: true,
//     };

//     // Exclude this deal from results
//     if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
//       query._id = { $ne: new mongoose.Types.ObjectId(dealId) };
//     }

//     const deals = await Deal.find(query)
//       .limit(6)
//       .populate("destination")
//       .populate("noardBasis")
//       .populate("prices.hotel")
//       .populate("hotels");

//     return res.json(deals);
//   } catch (error) {
//     console.error("getTopDealsByDestination error:", error);
//     return res.status(500).json({
//       message: "Error fetching top deals for destination",
//       error: error.message,
//     });
//   }
// };

exports.getTopDeals = async (req, res) => {
  try {
    // Fetch Top Deals
    const topDeals = await Deal.find({ isTopDeal: true })
      .sort({ updatedAt: -1, createdAt: -1 }) // Sort by most recently updated, then created
      .populate("prices.hotel")
      .populate("destination", "name")
      .populate("boardBasis", "name")
      .populate("destinations", "name")
      .select(
        "title destination description prices boardBasis days images isTopDeal isHotdeal updatedAt createdAt destinations"
      );

    // Fetch Hot Deals (excluding already-included Top Deals by _id)
    const topDealIds = topDeals.map((deal) => deal._id.toString());

    const hotDeals = await Deal.find({
      isHotdeal: true,
      _id: { $nin: topDealIds }, // prevent duplicates
    })
      .sort({ updatedAt: -1, createdAt: -1 }) // Sort by most recently updated, then created
      .populate("prices.hotel")
      .populate("destination", "name")
      .populate("boardBasis", "name")
      .populate("destinations", "name")
      .select(
        "title destination description prices boardBasis days images isTopDeal isHotdeal updatedAt createdAt destinations"
      );

    // Combine: Top Deals first, then Hot Deals
    const combinedDeals = [...topDeals, ...hotDeals];

    res.json(combinedDeals);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Top and Hot deals",
      error: error.message,
    });
  }
};

exports.getTopDealsByDestination = async (req, res) => {
  try {
    const { destinationId, dealId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({ message: "Invalid destinationId" });
    }

    const destinationObjectId = new mongoose.Types.ObjectId(destinationId);

    const baseQuery = {
      isTopDeal: true,
    };

    // Exclude this deal if dealId provided
    if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
      baseQuery._id = { $ne: new mongoose.Types.ObjectId(dealId) };
    }

    // First try: fetch deals for the given destination
    const destinationQuery = { ...baseQuery, destination: destinationObjectId };

    let deals = await Deal.find(destinationQuery)
      .sort({ updatedAt: -1, createdAt: -1 }) // Sort by most recently updated, then created
      .limit(6)
      .populate("destination")
      .populate("boardBasis")
      .populate("prices.hotel")
      .populate("hotels")
      .populate("destinations", "name");

    // If no deals found, fetch from other destinations
    if (deals.length === 0) {
      const fallbackQuery = {
        ...baseQuery,
        destination: { $ne: destinationObjectId }, // destination not equal to requested one
      };

      deals = await Deal.find(fallbackQuery)
        .sort({ updatedAt: -1, createdAt: -1 }) // Sort by most recently updated, then created
        .limit(6)
        .populate("destination")
        .populate("boardBasis")
        .populate("prices.hotel")
        .populate("hotels")
        .populate("destinations", "name");
    }

    return res.json(deals);
  } catch (error) {
    console.error("getTopDealsByDestination error:", error);
    return res.status(500).json({
      message: "Error fetching top deals for destination",
      error: error.message,
    });
  }
};
