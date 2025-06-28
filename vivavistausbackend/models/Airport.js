const mongoose = require("mongoose");

const AirportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "British Columbia",
        "Alberta",
        "Saskatchewan",
        "Manitoba",
        "Ontario",
        "Quebec",
        "Nova Scotia",
      ],
      required: true,
    },
  },
  { timestamps: true } // ✅ Correct placement for schema options
);

module.exports = mongoose.model("Airport", AirportSchema);
