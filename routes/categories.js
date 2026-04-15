const express = require("express");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const Category = require("../models/Category");
const router = express.Router();

router.post("/categories", authMiddleware, async (req, res) => {
  const newCategory = new Category({ name: req.body.name });
  await newCategory.save();
  res.json(newCategory);
});

router.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.delete("/categories/:id", authMiddleware, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
