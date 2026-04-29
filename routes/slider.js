const express = require("express");
const Slider = require("../models/Slider");
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/cloudinary");

const router = express.Router();

// CREATE SLIDER (ADMIN ONLY)
// CREATE SLIDER
router.post(
  "/",
  authMiddleware,
  checkPermission("manage_slider"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadToCloudinary(req.file.buffer, "slider");

      const newSlider = new Slider({
        image: result.secure_url,
      });

      const saved = await newSlider.save();
      res.json(saved);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE SLIDER
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("manage_slider"), // ✅ FIXED
  async (req, res) => {
    try {
      await Slider.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET SLIDER (PUBLIC)
router.get("/", async (req, res) => {
  const data = await Slider.find();
  res.json(data);
});




module.exports = router;