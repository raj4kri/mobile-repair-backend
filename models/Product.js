const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },

    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },

    category: { type: String, required: true },
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);