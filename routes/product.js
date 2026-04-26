const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/cloudinary");

router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 6 } = req.query;

    let query = { name: { $regex: search, $options: "i" } };
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    console.log("BODY:", req.body);

    // const price = Number(req.body.price);
    // const discount = Number(req.body.discount || 0);

    // // 🔥 FINAL PRICE ALWAYS CALCULATED HERE
    // const finalPrice = price - (price * discount) / 100;

    const imageUrls = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "products");
      imageUrls.push(result.secure_url);
    }
const product = new Product({
  name: req.body.name,
  price: req.body.price,
  discount: req.body.discount || 0,
  category: req.body.category,
  images: imageUrls,
});

    const saved = await product.save();

    res.status(201).json(saved);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name;
    product.price = Number(req.body.price);
    product.discount = Number(req.body.discount || 0);
    product.category = req.body.category;

    await product.save(); // 🔥 hook auto runs here

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
