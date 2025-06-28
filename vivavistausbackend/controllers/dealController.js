const mongoose = require("mongoose");
const Deal = require("../models/Deal");
const Airport = require("../models/Airport");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const { processUploadedFile, deleteImage } = require("../middleware/imageUpload");
const { deleteLocalVideo } = require("../middleware/videoProcessor");
const { videoQueue } = require('../config/queue');

// Maximum number of featured deals allowed
const MAX_FEATURED_DEALS = 21;

// Helper function to manage featured deals count
const manageFeaturedDealsLimit = async (newDealId) => {
  try {
    // Count current featured deals
    const featuredCount = await Deal.countDocuments({ isFeatured: true });
    
    console.log(`Current featured deals count: ${featuredCount}`);
    
    // If we're over the limit, remove the oldest featured deal
    if (featuredCount > MAX_FEATURED_DEALS) {
      console.log(`Exceeded limit of ${MAX_FEATURED_DEALS} featured deals. Removing oldest.`);
      
      // Find the oldest featured deal (excluding the newly added one)
      const oldestFeatured = await Deal.findOne({
        isFeatured: true,
        _id: { $ne: newDealId } // Exclude the new deal
      }).sort({ updatedAt: 1 }); // Sort by oldest first
      
      if (oldestFeatured) {
        console.log(`Removing featured status from deal: ${oldestFeatured._id} (${oldestFeatured.title})`);
        
        // Update the oldest deal to not be featured
        await Deal.findByIdAndUpdate(oldestFeatured._id, {
          isFeatured: false
        });
        
        return {
          success: true,
          removedDeal: oldestFeatured._id,
          message: `Removed featured status from deal: ${oldestFeatured.title}`
        };
      }
    }
    
    return { 
      success: true,
      message: "No need to remove any featured deals"
    };
  } catch (error) {
    console.error("Error managing featured deals limit:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Create a New Deal with Image Upload
const createDeal = async (req, res) => {
  try {
    console.log("🚀 ~ createDeal ~ Request received with files:", req.files ? Object.keys(req.files) : "No files");
    
    const parsedData = JSON.parse(req.body.data);
    console.log("🚀 ~ createDeal ~ Parsed data received:", { 
      title: parsedData.title, 
      hasImages: req.files && req.files.images ? req.files.images.length : 0,
      hasVideos: req.files && req.files.videos ? req.files.videos.length : 0
    });
    
    const {
      title,
      description,
      availableCountries,
      destination,
      destinations = [],
      selectedPlaces = [],
      prices,
      hotels,
      holidaycategories,
      itinerary = [],
      boardBasis,
      isTopDeal,
      isHotdeal,
      isFeatured,
      distanceToCenter,
      distanceToBeach,
      days,
      whatsIncluded,
      exclusiveAdditions,
      termsAndConditions,
      rooms,
      guests,
      tag,
      LowDeposite,
      priceswitch,
    } = parsedData;

    // Basic validations
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
    if (!Array.isArray(availableCountries) || !availableCountries.length) {
      return res
        .status(400)
        .json({ message: "At least one country must be selected." });
    }
    if ((!destination || !mongoose.Types.ObjectId.isValid(destination)) && 
        (!Array.isArray(destinations) || destinations.length === 0)) {
      return res
        .status(400)
        .json({ message: "At least one destination must be selected." });
    }
    if (!boardBasis || !mongoose.Types.ObjectId.isValid(boardBasis)) {
      return res
        .status(400)
        .json({ message: "A valid board basis must be selected." });
    }
    if (!Array.isArray(hotels) || !hotels.length) {
      return res
        .status(400)
        .json({ message: "At least one hotel must be added." });
    }
    if (!Array.isArray(prices) || !prices.length) {
      return res
        .status(400)
        .json({ message: "At least one price entry is required." });
    }

    // Validate itinerary items
    const cleanItinerary = itinerary.filter(
      (item) => item.title && item.description
    );

    // Validate price entries
    for (const [index, priceObj] of prices.entries()) {
      const { country, startdate, enddate, hotel, price } = priceObj;
      if (!country) {
        return res
          .status(400)
          .json({ message: `Price #${index + 1}: country is required.` });
      }
      if (!startdate || !enddate) {
        return res.status(400).json({
          message: `Price #${index + 1}: startdate and enddate are required.`,
        });
      }
      if (!hotel || !mongoose.Types.ObjectId.isValid(hotel)) {
        return res.status(400).json({
          message: `Price #${index + 1}: a valid hotel ID is required.`,
        });
      }
      if (!price) {
        return res.status(400).json({
          message: `Price #${index + 1}: price is required.`,
        });
      }
    }

    // Extract image URLs
    let imageUrls = [];
    if (req.files && req.files.images && req.files.images.length) {
      console.log("🚀 ~ createDeal ~ Processing images:", req.files.images.length);
      try {
      imageUrls = await Promise.all(
          req.files.images.map(async (file) => {
            try {
              const url = await processUploadedFile(file, 'deal');
              console.log(`✅ Image processed successfully: ${url}`);
              return url;
            } catch (err) {
              console.error(`❌ Error processing image: ${err.message}`);
              throw err;
            }
          })
        );
        console.log("🚀 ~ createDeal ~ All images processed:", imageUrls);
      } catch (error) {
        console.error("❌ Error processing images:", error);
        return res.status(500).json({ message: "Error processing images", error: error.message });
      }
    }

    // Prepare video data without processing
    const videoData = [];
    if (req.files && req.files.videos && req.files.videos.length) {
      console.log("🚀 ~ createDeal ~ Processing videos:", req.files.videos.length);
      try {
      req.files.videos.forEach(file => {
          console.log(`✅ Video received: ${file.originalname}, path: ${file.path}`);
        videoData.push({
          url: file.path, // Temporary path
          status: 'processing',
        });
      });
      } catch (error) {
        console.error("❌ Error processing videos:", error);
        return res.status(500).json({ message: "Error processing videos", error: error.message });
      }
    }

    // Create deal
    const newDeal = new Deal({
      title,
      description,
      images: imageUrls,
      videos: videoData,
      availableCountries,
      destination,
      destinations,
      selectedPlaces,
      holidaycategories,
      hotels,
      boardBasis,
      rooms,
      guests,
      days,
      distanceToCenter,
      distanceToBeach,
      whatsIncluded,
      exclusiveAdditions,
      termsAndConditions,
      tag,
      LowDeposite,
      priceswitch,
      itinerary: cleanItinerary,
      prices,
      isTopDeal,
      isHotdeal,
      isFeatured,
    });

    console.log("🚀 ~ createDeal ~ Saving deal to database");
    await newDeal.save();
    console.log("✅ Deal saved successfully with ID:", newDeal._id);
    
    // Add video processing jobs to the queue
    if (newDeal.videos && newDeal.videos.length > 0) {
      console.log("🚀 ~ createDeal ~ Adding video processing jobs to queue");
      try {
      newDeal.videos.forEach(video => {
        if (video.status === 'processing') {
          videoQueue.add('process-video', {
            dealId: newDeal._id,
            videoId: video._id,
            tempFilePath: video.url,
          });
            console.log(`✅ Video job added to queue: ${video._id}`);
        }
      });
      } catch (error) {
        console.error("❌ Error adding video jobs to queue:", error);
        // Continue execution even if queue fails
      }
    }

    // Link to single destination (legacy support)
    if (destination && mongoose.Types.ObjectId.isValid(destination)) {
      await Destination.findByIdAndUpdate(
        destination,
        { $addToSet: { deals: newDeal._id } },
        { new: true }
      );
    }
    
    // Link to multiple destinations
    if (Array.isArray(destinations) && destinations.length > 0) {
      await Promise.all(
        destinations.map(destId => 
          Destination.findByIdAndUpdate(
            destId,
            { $addToSet: { deals: newDeal._id } },
            { new: true }
          )
        )
      );
    }
    
    // If this is a featured deal, manage the featured deals limit
    let featuredResult = { success: true };
    if (isFeatured) {
      featuredResult = await manageFeaturedDealsLimit(newDeal._id);
    }

    console.log("✅ Deal creation complete, sending response");
    return res
      .status(201)
      .json({ 
        message: "Deal created successfully", 
        deal: newDeal,
        featuredResult
      });
  } catch (error) {
    console.error("❌ CreateDeal Error:", error);
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Deals (Restricted to User's Selected Country)
const getAllDeals = async (req, res) => {
  try {
    const {
      country,
      airport,
      fromdate,
      todate,
      minPrice,
      destination,
      maxPrice,
      boardBasis,
      rating,
      holidayType,
      facilities,
      rooms,
      guests,
      sort,
      search,
      category,
      isHotdeal,
    } = req.query;

    // 🧠 Helper function to build the query object
    const buildQuery = (useAirport, useDestination, useDate, useRoomGuest) => {
      let query = {};

      if (country) query.availableCountries = country;

      // Destination filter
      if (useDestination && destination) {
        query.$or = [
          { destination: destination },
          { destinations: destination },
        ];
      }
      
      // Holiday category filter
      if (category) query.holidaycategories = category;
      
      // Hot deal filter
      if (isHotdeal === 'true') query.isHotdeal = true;

      // Price range
      if (minPrice || maxPrice) {
        query["prices.price"] = {};
        if (minPrice) query["prices.price"].$gte = Number(minPrice);
        if (maxPrice) query["prices.price"].$lte = Number(maxPrice);
      }

      // Board basis
      if (boardBasis) query.boardBasis = boardBasis;

      // Rating
      if (rating) query["hotels.tripAdvisorRating"] = { $gte: Number(rating) };

      // Facilities
      if (holidayType) query["hotels.facilities"] = { $in: holidayType.split(",") };
      if (facilities) query["hotels.facilities"] = { $all: facilities.split(",") };

      // Hotel name search
      if (search) query["hotels.name"] = { $regex: search, $options: "i" };

      // Room & guest filters
      if (useRoomGuest && rooms) query.rooms = Number(rooms);
      if (useRoomGuest && guests) query.guests = Number(guests);

      // ✅ Airport + Date filter in $elemMatch
      if (useAirport || useDate) {
        const priceMatch = {};
        if (useAirport && airport) {
          const airportArray = Array.isArray(airport) ? airport : [airport];
          priceMatch.airport = { $in: airportArray };
        }
        if (useDate && fromdate && todate) {
          priceMatch.startdate = {
            $gte: new Date(fromdate),
            $lte: new Date(todate),
          };
        }
        if (Object.keys(priceMatch).length > 0) {
          query["prices"] = { $elemMatch: priceMatch };
        }
      }

      return query;
    };

    // 🧠 Helper to fetch deals using a query
    const getDeals = async (query) => {
      return await Deal.find(query)
        .populate("destination")
        .populate({
          path: "destinations",
          select: "name", // Only populate destinations with the name field
        })
        .populate("boardBasis", "name")
        .populate("hotels", "name tripAdvisorRating facilities location images")
        .populate({
          path: "prices.hotel",
          select: "name tripAdvisorRating tripAdvisorReviews",
        })
        .populate("prices.airport")
        .populate({
          path: "prices.airport",
          select: "name code location category"
        })
        .select(
          "title tag priceswitch boardBasis LowDeposite availableCountries description rooms guests prices distanceToCenter distanceToBeach days images isTopDeal isHotdeal isFeatured holidaycategories itinerary whatsIncluded exclusiveAdditions termsAndConditions destinations"
        )
        .sort(
          sort === "highest-price"
            ? { "prices.price": -1 }
            : sort === "best-rating"
            ? { "hotels.tripAdvisorRating": -1 }
            : { "prices.price": 1 }
        )
        .limit(50)
        .lean();
    };

    // 🚀 Filter Priority Cases (from strictest to fallback)
    const filterCases = [
      { useAirport: true, useDestination: true, useDate: true, useRoomGuest: true }, // Strict match
      { useAirport: true, useDestination: true, useDate: true, useRoomGuest: false }, // Relax rooms/guests
      { useAirport: true, useDestination: true, useDate: false, useRoomGuest: true }, // Relax date
      { useAirport: false, useDestination: true, useDate: true, useRoomGuest: true }, // Relax airport
      { useAirport: false, useDestination: true, useDate: false, useRoomGuest: true }, // Relax airport + date
      { useAirport: false, useDestination: false, useDate: true, useRoomGuest: true }, // Relax destination
      { useAirport: false, useDestination: false, useDate: false, useRoomGuest: true }, // Only room match
    ];

    let deals = [];
    let usedCase = -1;

    for (let i = 0; i < filterCases.length; i++) {
      const filter = filterCases[i];
      const query = buildQuery(
        filter.useAirport,
        filter.useDestination,
        filter.useDate,
        filter.useRoomGuest
      );

      deals = await getDeals(query);

      if (deals.length) {
        usedCase = i + 1;
        break;
      }
    }
    console.log("🚀 ~ getAllDeals ~ deals:", deals);

    // ✅ Sort prices inside each deal and expand airports
    deals = deals.map((deal) => {
      if (sort === "highest-price") {
        deal.prices.sort((a, b) => b.price - a.price);
      } else {
        deal.prices.sort((a, b) => a.price - b.price);
      }

    // Expand prices by each airport if it's an array
    const expandedPrices = [];
      if (deal.prices && deal.prices.length > 0) {
    deal.prices.forEach(priceObj => {
      if (Array.isArray(priceObj.airport)) {
        for (const airport of priceObj.airport) {
          expandedPrices.push({
                ...priceObj,
            airport: airport
          });
        }
      } else {
        expandedPrices.push(priceObj);
      }
    });
        
        // Replace the original prices array with the expanded one
    deal.prices = expandedPrices;
      }
      
      return deal;
    });

    console.log("🚀 ~ getAllDeals ~ deals:", deals);
    res.json(deals);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Deals for Admin
const getAllDealsAdmin = async (req, res) => {
  try {
    const deals = await Deal.find()
      .sort({ createdAt: -1 })
      .populate("destination")
      .populate("destinations")
      .populate("hotels")
      .populate("boardBasis")
      .populate("prices.hotel")
      .populate("prices.airport")
      .populate("holidaycategories");

    res.json(deals);
  } catch (error) {
    console.error("Error fetching all deals for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get a Single Deal (Only If Available in User's Selected Country)
const getDealById = async (req, res) => {
  try {
    console.log("Deal ID requested:", req.params.id);
    
    let deal;
    
    // First try to find by MongoDB ID
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deal = await Deal.findById(req.params.id)
        .populate("destination")
        .populate({
          path: "destinations",
          select: "name places",
        })
        .populate({
          path: "holidaycategories",
          select: "name",
        })
        .populate({
          path: "boardBasis",
          select: "name",
        })
        .populate({
          path: "hotels",
          select: "name stars about destination rooms roomType tripAdvisorRating facilities roomfacilities boardBasis location images tripAdvisorPhotos tripAdvisorReviews tripAdvisorLatestReviews tripAdvisorLink externalBookingLink",
          populate: [
            {
              path: "boardBasis",
              select: "name"
            },
            {
              path: "destination",
              select: "name"
            }
          ]
        })
        .populate({
          path: "prices.hotel",
          select: "name tripAdvisorRating tripAdvisorReviews",
        })
        .populate({
          path: "prices.airport",
          select: "name code location category",
        });
    }
    
    // If not found by ID, try to find by title (slugified)
    if (!deal) {
      const allDeals = await Deal.find()
        .populate("destination")
        .populate({
          path: "destinations",
          select: "name places",
        })
        .populate({
          path: "holidaycategories",
          select: "name",
        })
        .populate({
          path: "boardBasis",
          select: "name",
        })
        .populate({
          path: "hotels",
          select: "name stars about destination rooms roomType tripAdvisorRating facilities roomfacilities boardBasis location images tripAdvisorPhotos tripAdvisorReviews tripAdvisorLatestReviews tripAdvisorLink externalBookingLink",
          populate: [
            {
              path: "boardBasis",
              select: "name"
            },
            {
              path: "destination",
              select: "name"
            }
          ]
        })
        .populate({
          path: "prices.hotel",
          select: "name tripAdvisorRating tripAdvisorReviews",
        })
        .populate({
          path: "prices.airport",
          select: "name code location category",
        });
      
      // Find deal by slugified title (supports multiple slug formats)
      deal = allDeals.find(d => {
        // Old format: remove spaces and special characters (lowercase)
        const oldSlugifiedTitle = d.title
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "");
        
        // New readable format: preserve capitalization, use underscores
        const readableSlugifiedTitle = d.title
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters except spaces, hyphens, and word characters
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/_+/g, '_') // Replace multiple underscores with single underscore
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
        // Previous hyphen format (lowercase)
        const hyphenSlugifiedTitle = d.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const requestId = req.params.id;
        return oldSlugifiedTitle === requestId.toLowerCase() || 
               readableSlugifiedTitle === requestId || 
               hyphenSlugifiedTitle === requestId.toLowerCase();
      });
    }

    console.log("Raw deal data:", JSON.stringify(deal, null, 2));

    if (!deal) {
      console.log("Deal not found");
      return res.status(404).json({ message: "Deal not found" });
    }

    // Calculate date threshold for future prices
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Expand prices by each airport if it's an array
    const expandedPrices = [];
    for (const price of deal.prices || []) {
      const priceObj = price.toObject ? price.toObject() : price;

      if (Array.isArray(priceObj.airport)) {
        for (const airport of priceObj.airport) {
          expandedPrices.push({
            ...priceObj,
            airport,
          });
        }
      } else {
        expandedPrices.push(priceObj);
      }
    }

    // Filter for future dates
    let filteredPrices = expandedPrices.filter((price) => {
      const startDate = new Date(price.startdate);
      return startDate >= threeDaysFromNow;
    });

    // Sort prices by startdate
    filteredPrices.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));

    console.log("Filtered prices count:", filteredPrices.length);

    // Create a new deal object with filtered prices
    const dealWithFilteredPrices = {
      ...deal.toObject(),
      prices: filteredPrices,
    };

    console.log("Final deal data:", JSON.stringify(dealWithFilteredPrices, null, 2));

    return res.json(dealWithFilteredPrices);
  } catch (error) {
    console.error("Error in getDealById:", error);
    res.status(500).json({ message: "Error fetching deal", error: error.message });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedData = JSON.parse(req.body.data);

    let deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Handle Image Deletion
    if (parsedData.deletedImages && Array.isArray(parsedData.deletedImages)) {
      console.log("Deleting images:", parsedData.deletedImages);
      
      // Delete each image from the filesystem
      for (const imageUrl of parsedData.deletedImages) {
        try {
          await deleteImage(imageUrl);
          console.log(`Successfully deleted image: ${imageUrl}`);
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      }
      
      // Remove deleted images from the deal's images array
      deal.images = deal.images.filter(
        (url) => !parsedData.deletedImages.includes(url)
      );
    }

    // Handle Video Deletion
    if (parsedData.deletedVideos && Array.isArray(parsedData.deletedVideos)) {
      console.log("Deleting videos:", parsedData.deletedVideos);
      
      // Delete each video from the filesystem
      for (const videoUrl of parsedData.deletedVideos) {
        try {
          await deleteLocalVideo(videoUrl);
          console.log(`Successfully deleted video: ${videoUrl}`);
        } catch (err) {
          console.error(`Failed to delete video ${videoUrl}:`, err);
        }
      }
      
      // Remove deleted videos from the deal's videos array
      deal.videos = deal.videos.filter(
        (video) => !parsedData.deletedVideos.includes(video.url)
      );
    }

    // Handle New Image Uploads
    if (req.files && req.files.images && req.files.images.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.images.map((file) => processUploadedFile(file, 'deal'))
      );
      deal.images.push(...newImageUrls);
    }

    // Handle New Video Uploads
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      req.files.videos.forEach(file => {
        deal.videos.push({
          url: file.path, // Temporary path
          status: 'processing',
        });
      });
    }
    
    // Update other deal fields
    for (const key in parsedData) {
      if (key !== 'images' && key !== 'videos' && key !== 'deletedImages' && key !== 'deletedVideos') {
        deal[key] = parsedData[key];
      }
    }

    // If 'isFeatured' is being set to true, manage the limit
    if (parsedData.isFeatured && !deal.isFeatured) {
      await manageFeaturedDealsLimit(deal._id);
    }

    const updatedDeal = await deal.save();

    // Add new video processing jobs to the queue
    if (updatedDeal.videos && updatedDeal.videos.length > 0) {
      updatedDeal.videos.forEach(video => {
        // Find the original file from req.files to check if it's a new upload
        const isNew = req.files && req.files.videos && req.files.videos.some(f => f.path === video.url);
        if (video.status === 'processing' && isNew) {
            videoQueue.add('process-video', {
                dealId: updatedDeal._id,
                videoId: video._id,
                tempFilePath: video.url,
            });
        }
      });
    }

    res.status(200).json({ message: "Deal updated successfully", deal: updatedDeal });
  } catch (error) {
    console.error("UpdateDeal Error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDealImage = async (req, res) => {
  const { dealId } = req.params;
  const deal = await Deal.findById(dealId);

  if (!deal) {
    return res.status(404).json({ message: "Deal not found" });
  }

  // Delete associated images from local storage
  if (deal.images && deal.images.length > 0) {
    await Promise.all(deal.images.map((url) => deleteImage(url)));
  }

  // Delete associated videos from local storage
  if (deal.videos && deal.videos.length > 0) {
    await Promise.all(deal.videos.map((url) => deleteLocalVideo(url)));
  }

  // Unlink from single destination (legacy)
  if (deal.destination) {
    await Destination.findByIdAndUpdate(deal.destination, {
      $pull: { deals: deal._id },
    });
  }

  // Unlink from multiple destinations
  if (deal.destinations && deal.destinations.length > 0) {
    await Destination.updateMany(
      { _id: { $in: deal.destinations } },
      { $pull: { deals: deal._id } }
    );
  }
  
  await Deal.findByIdAndDelete(dealId);

  res.json({ message: "Deal deleted successfully" });
};

const deleteDealVideo = async (req, res) => {
  try {
    const { dealId, videoUrl } = req.body;

    if (!dealId || !videoUrl) {
      return res.status(400).json({ message: "Deal ID and video URL are required" });
    }

    // Delete the video file from storage
    await deleteLocalVideo(videoUrl);

    // Remove the video URL from the deal's videos array
    const deal = await Deal.findByIdAndUpdate(
      dealId,
      { $pull: { videos: { url: videoUrl } } },
      { new: true }
    );

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json({ message: "Video deleted successfully", deal });
  } catch (error) {
    console.error("Error deleting deal video:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete a Deal (Admin Only)
const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Delete associated images from local storage
    if (deal.images && deal.images.length > 0) {
      await Promise.all(deal.images.map((url) => deleteImage(url)));
    }

    // Delete associated videos from local storage
    if (deal.videos && deal.videos.length > 0) {
      await Promise.all(deal.videos.map((url) => deleteLocalVideo(url)));
    }

    // Unlink from single destination (legacy)
    if (deal.destination) {
      await Destination.findByIdAndUpdate(deal.destination, {
        $pull: { deals: deal._id },
      });
    }

    // Unlink from multiple destinations
    if (deal.destinations && deal.destinations.length > 0) {
      await Destination.updateMany(
        { _id: { $in: deal.destinations } },
        { $pull: { deals: deal._id } }
      );
    }
    
    await Deal.findByIdAndDelete(id);

    res.json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.error("DeleteDeal Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDealsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    // Find deals where the destinationId matches either the primary destination or is in the destinations array
    const deals = await Deal.find({
      $or: [
        { destination: destinationId },
        { destinations: destinationId }
      ]
    })
      .populate("destination")
      .populate({
        path: "destinations",
        select: "name", // Only populate destinations with the name field
      })
      .populate("hotels");

    res.json(deals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching deals by destination", error });
  }
};

// ✅ Search Deals with Filters (Airport, Destination, Nights)
const searchDeals = async (req, res) => {
  try {
    const { airport, destination, nights } = req.query;

    let query = {};

    // ✅ Filter by Airport
    if (airport) query["prices.airport"] = airport;

    // ✅ Filter by Destination (if provided)
    if (destination) {
      query["$or"] = [
        { "destination.name": { $regex: destination, $options: "i" } },
        { "destinations.name": { $regex: destination, $options: "i" } }
      ];
    }

    // ✅ Filter by Nights (if provided)
    if (nights) {
      if (nights === "10+") {
        // If nights is 10+, filter for deals with 10 or more days
        query["days"] = { $gte: 10 };
      } else {
        // Otherwise filter for the exact number of nights
        query["days"] = parseInt(nights, 10);
      }
    }

    // ✅ Fetch Deals with Filters
    let deals = await Deal.find(query)
      .populate("destination", "name")
      .populate("destinations", "name")
      .populate("hotels", "name tripAdvisorRating facilities location")
      .select("title prices boardBasis distanceToCenter distanceToBeach destinations days")
      .limit(50)
      .lean();

    // ✅ Filter Flight Details Based on Selected Airport
    deals = deals
      .map((deal) => {
        const relevantPrices = deal.prices.filter((p) => p.airport === airport);
        return relevantPrices.length > 0
          ? { ...deal, prices: relevantPrices }
          : null;
      })
      .filter(Boolean);

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDealsAdmin,
  searchDeals,
  deleteDealImage,
  deleteDealVideo,
  getDealsByDestination,
};
