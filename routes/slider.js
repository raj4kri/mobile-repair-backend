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
  upload.single("image"),
  async (req, res) => {
    try {

      // ✅ check image
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      // ✅ upload to cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        "sliders"
      );

      // ✅ save in DB
      const slider = new Slider({
        image: result.secure_url,
      });

      await slider.save();

      res.status(201).json({
        success: true,
        message: "Slider uploaded successfully 🎉",
        slider,
      });

    } catch (err) {

      console.log("SLIDER ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message || "Upload failed",
      });
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