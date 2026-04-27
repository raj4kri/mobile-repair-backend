const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },

    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },

    category: String,
    images: [String],
  },
  { timestamps: true }
);

productSchema.pre("save", async function () {
  const price = Number(this.price);
  const discount = Number(this.discount || 0);

  this.finalPrice = price - (price * discount) / 100;
});
module.exports = mongoose.model("Product", productSchema);