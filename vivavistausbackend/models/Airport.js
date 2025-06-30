const mongoose = require("mongoose");

const AirportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Georgia",
        "Massachusetts",
        "Colorado",
        "Texas",
        "Michigan",
        "New Jersey",
        "Virginia",
        "New York",
        "Nevada",
        "California",
        "Florida",
        "Illinois",
        "Pennsylvania",
      ],
      required: true,
    },
  },
  { timestamps: true } // ✅ Correct placement for schema options
);

module.exports = mongoose.model("Airport", AirportSchema);
