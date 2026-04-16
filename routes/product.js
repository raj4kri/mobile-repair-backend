const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload"); 
const uploadToCloudinary  = require("../utils/cloudinary");

router.get("/products", async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 6 } = req.query;
    let query = { name: { $regex: search, $options: "i" } };
    if (category) query.category = category;
    const skip = (page - 1) * limit;
    const products = await Product.find(query).skip(skip).limit(parseInt(limit));
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
    console.log("FILES:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Images required" });
    }

    const imageUrls = [];

    for (const file of req.files) {
      if (!file?.buffer) {
        throw new Error("File buffer missing");
      }

      const result = await uploadToCloudinary(file.buffer, "products");
      imageUrls.push(result.secure_url);
    }

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      images: imageUrls,
    });

    return res.status(201).json(product);

  } catch (err) {
    console.log("PRODUCT ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
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

module.exports = router;