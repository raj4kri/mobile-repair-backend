const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,

  // 👇 multiple images
  images: [
    {
      type: String,
    },
  ],
});
module.exports = mongoose.model("Product", productSchema);