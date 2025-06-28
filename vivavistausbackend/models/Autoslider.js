const mongoose = require("mongoose");

const AutosliderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: function() {
      // Make image required only when creating a new document
      // This allows updates to set it to empty when deleting just the image
      return this.isNew;
    }},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Autoslider", AutosliderSchema); 