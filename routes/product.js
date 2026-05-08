const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/cloudinary");

const checkPermission = require("../middleware/checkPermission");

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

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/",
  authMiddleware,
  checkPermission("manage_products"),
  upload.array("images", 5),
  async (req, res) => {
    try {

      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "No images uploaded",
        });
      }

      const imageUrls = [];

      for (const file of req.files) {

        if (!file.buffer) {
          return res.status(400).json({
            error: "Invalid image file",
          });
        }

      const imageUrl = await uploadToCloudinary(file.buffer);

imageUrls.push(imageUrl);
      }

      const product = new Product({
        name: req.body.name,
        price: Number(req.body.price),
        discount: Number(req.body.discount || 0),
        category: req.body.category,
        images: imageUrls,
      });

      const saved = await product.save();

      res.status(201).json(saved);

    } catch (err) {

      console.log("PRODUCT ERROR:", err);

      res.status(500).json({
        error: err.message || "Product upload failed",
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("manage_products"), // ✅ ADD THIS
  async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE PRODUCT
router.put(
  "/:id",
  authMiddleware,
  checkPermission("manage_products"), // ✅ ADD THIS
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.name = req.body.name;
      product.price = Number(req.body.price);
      product.discount = Number(req.body.discount || 0);
      product.category = req.body.category;

      await product.save();

      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
