const express = require("express");
const Slider = require("../models/Slider");
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/cloudinary");

const router = express.Router();

// CREATE SLIDER
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      // ✅ upload image
      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "sliders"
      );

      // ✅ save slider
      const slider = new Slider({
        image: imageUrl,
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
  checkPermission("manage_slider"),
  async (req, res) => {
    try {
      await Slider.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Deleted successfully",
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// GET SLIDER
router.get("/", async (req, res) => {
  try {
    const data = await Slider.find();
    res.json(data);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;