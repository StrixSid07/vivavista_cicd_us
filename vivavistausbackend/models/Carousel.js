const mongoose = require("mongoose");

const CarouselSchema = new mongoose.Schema(
  {
    images: [{ type: String, required: true }], // Array of image URLs (max 5)
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: false, // Optional - carousel can exist without deal reference
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", CarouselSchema);
