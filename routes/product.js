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

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
 try {
     console.log("BODY:", req.body);
     console.log("FILE:", req.file);
 
     if (!req.file) return res.status(400).json({ error: "Image required" });
 
     const result = await uploadToCloudinary(req.file.buffer, "products");
 
     const newProduct = new Product({
       name: req.body.name || "no-name",
       price: req.body.price || "0",
       category: req.body.category || "uncategorized",
       image: result.secure_url,
     });
 
     const saved = await newProduct.save();
 
     console.log("SAVED:", saved);
 
     res.json(saved);
 
   } catch (err) {
     console.log(err);
     res.status(500).json({ error: err.message });
   }});

router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
      const { name, price, category } = req.body;
  
      let imageUrl;
  
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "products");
        imageUrl = result.secure_url;
      }
  
      const updatedData = {
        name,
        price,
        category,
      };
  
      // only update image if new uploaded
      if (imageUrl) {
        updatedData.image = imageUrl;
      }
  
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;