const express = require("express");
const authMiddleware = require("../middleware/auth");
const Category = require("../models/Category");
const upload = require("../middleware/upload");
// const { uploadToCloudinary } = require("../utils/cloudinary");
const router = express.Router();

const checkPermission = require("../middleware/checkPermission");

/**
 * POST /categories
 */
router.post(
  "/",
  authMiddleware,
  checkPermission("manage_categories"), // 👈 ADD THIS
  async (req, res) => {
    try {
      const name = req.body?.name;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Category name required" });
      }

      const clean = name.trim().toLowerCase();

      const category = await Category.create({ name: clean });

      res.status(201).json({
        message: "Category added",
        category,
      });

    } catch (err) {
      console.log("CATEGORY ERROR:", err);

      const isDuplicate =
        err?.code === 11000 ||
        err?.message?.includes("duplicate key");

      if (isDuplicate) {
        return res.status(409).json({
          message: "Category already exists",
        });
      }

      return res.status(500).json({
        message: err.message || "Internal Server Error",
      });
    }
  }
);

/**
 * GET /categories
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /categories/:id
 */
router.delete("/:id", authMiddleware, checkPermission("manage_categories"), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
