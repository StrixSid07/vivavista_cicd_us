const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String },
    facilities: [{ type: String }], // List of facilities
    roomfacilities: [{ type: String }],
    boardBasis: { type: mongoose.Schema.Types.ObjectId, ref: "BoardBasis" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    location: { type: String, required: true },
    locationId: { type: String }, // TripAdvisor location ID - now optional
    rooms: [
      {
        numberofrooms: { type: Number, required: true }, // E.g., "Single", "Double", "Suite"
        guestCapacity: { type: Number, required: true }, // Max guests allowed
      },
    ],
    roomType: { type: String }, // Room type field for any string value
    tripAdvisorRating: { type: Number }, // Auto-fetched from TripAdvisor
    tripAdvisorReviews: { type: Number }, // Number of reviews
    tripAdvisorPhotos: [{ type: String }], // Store up to 5 photo URLs
    tripAdvisorLatestReviews: [
      {
        review: { type: String },
        rating: { type: Number },
      },
    ], // Store up to 5 latest reviews
    tripAdvisorLink: { type: String }, // Link to TripAdvisor page
    externalBookingLink: { type: String }, // Admin-added booking link
    images: [{ type: String }], // Image URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", HotelSchema);
