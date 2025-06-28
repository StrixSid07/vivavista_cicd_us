const mongoose = require("mongoose");

const ItineraryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  bulletpoints: {
    type: [String],
    default: [],
    required: false,
  },
});

const DealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Image URLs
    videos: [
      {
        url: { type: String },
        status: {
          type: String,
          enum: ["processing", "ready", "failed"],
          default: "processing",
        },
      },
    ], // Video URLs
    availableCountries: [{ type: String, required: true }], // ['UK', 'USA', 'Canada']
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false,
    },
    destinations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
    }],
    selectedPlaces: [{
      placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place"
      },
      destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination"
      }
    }],
    holidaycategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Holiday",
      },
    ],
    days: {
      type: Number,
      require: true,
    },
    rooms: { type: Number, require: true },
    guests: {
      type: Number,
      require: true,
    },
    // Airport-based pricing & flight details
    prices: [
      {
        priceswitch: { type: Boolean, default: false },
        country: { type: String, required: true, default: "Canada" },
        airport: [{ type: mongoose.Schema.Types.ObjectId, ref: "Airport" }],
        hotel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hotel",
        },
        startdate: { type: Date, required: true },
        enddate: { type: Date, required: true },
        price: { type: Number, required: true },
        flightDetails: {
          outbound: {
            departureTime: String,
            arrivalTime: String,
            airline: String,
            flightNumber: String,
          },
          returnFlight: {
            departureTime: String,
            arrivalTime: String,
            airline: String,
            flightNumber: String,
          },
        },
      },
    ],

    // Accommodations
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],

    boardBasis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardBasis",
      required: true,
    },
    tag: { type: String },
    LowDeposite: { type: String },
    isTopDeal: { type: Boolean, default: false },
    isHotdeal: { type: Boolean, default: false },
    itinerary: {
      type: [ItineraryItemSchema],
      default: [],
      required: false,
    },
    isFeatured: { type: Boolean, default: false },
    distanceToCenter: { type: String }, // Example: "500m away"
    distanceToBeach: { type: String }, // Example: "300m away"
    whatsIncluded: [{ type: String }], // List of included features
    exclusiveAdditions: [{ type: String }], // List of optional extras or upgrades
    termsAndConditions: [{ type: String }], //  List of T&Cs
  },
  { timestamps: true }
);

// Add a pre-save hook to handle duplicate dates in prices array by removing the duplicates
DealSchema.pre('save', function(next) {
  // Check if prices array exists and has items
  if (!this.prices || this.prices.length === 0) {
    return next();
  }
  
  // Create a map to track dates and keep only the first occurrence of each date
  const uniquePrices = new Map();
  const duplicateDates = [];
  
  // First pass: identify all dates and keep track of duplicates
  for (let i = 0; i < this.prices.length; i++) {
    const price = this.prices[i];
    if (!price || !price.startdate) continue;
    
    // Convert to date string for comparison (YYYY-MM-DD)
    const dateStr = new Date(price.startdate).toISOString().split('T')[0];
    
    if (uniquePrices.has(dateStr)) {
      // Found a duplicate date
      duplicateDates.push({
        dateStr,
        index: i,
        previousIndex: uniquePrices.get(dateStr).index
      });
    } else {
      // Mark this date as seen, keeping the price and its index
      uniquePrices.set(dateStr, { price, index: i });
    }
  }
  
  // If duplicates were found, remove them and keep only the first occurrence
  if (duplicateDates.length > 0) {
    console.log(`Removing ${duplicateDates.length} duplicate date entries.`);
    
    // Create a new array with only unique dates (keeping the first occurrence)
    const deduplicatedPrices = [];
    const seenDates = new Set();
    
    for (const price of this.prices) {
      if (!price || !price.startdate) {
        deduplicatedPrices.push(price); // Keep entries without dates
        continue;
      }
      
      const dateStr = new Date(price.startdate).toISOString().split('T')[0];
      
      if (!seenDates.has(dateStr)) {
        deduplicatedPrices.push(price);
        seenDates.add(dateStr);
      }
      // Skip duplicates - they won't be added to the deduplicatedPrices array
    }
    
    // Replace the prices array with the deduplicated version
    this.prices = deduplicatedPrices;
    
    console.log(`Removed duplicate prices. Remaining prices: ${this.prices.length}`);
  }
  
  next();
});

module.exports = mongoose.model("Deal", DealSchema);
