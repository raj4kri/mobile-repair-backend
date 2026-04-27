const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
<<<<<<< HEAD

    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },

    category: String,
    images: [String],
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  const price = Number(this.price);
  const discount = Number(this.discount || 0);

  this.finalPrice = price - (price * discount) / 100;

  next(); // 🔥 MUST

=======

    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },

    category: String,
    images: [String],
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  const price = Number(this.price);
  const discount = Number(this.discount || 0);

  this.finalPrice = price - (price * discount) / 100;

  next();
>>>>>>> 383f118593963a5e1911a521816c5e683ef6951f
});
module.exports = mongoose.model("Product", productSchema);