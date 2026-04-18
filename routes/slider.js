const express = require("express");
const Slider = require("../models/Slider");

const router = express.Router();
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/cloudinary");

console.log("authMiddleware TYPE:", typeof authMiddleware);
console.log("upload.single TYPE:", typeof upload.single);
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploading to cloudinary...");

    const result = await uploadToCloudinary(req.file.buffer, "slider");

    console.log("CLOUDINARY SUCCESS:", result.secure_url);
    const slider = await Slider.create({
      image: result.secure_url,
    });

    res.json(slider);
  } catch (err) {
    console.log("SLIDER ERROR:", err); // 🔥 MOST IMPORTANT
    res.status(500).json({ message: err.message });
  }
});
// router.post("/", (req, res) => {
//   res.send("WORKING");
// });

router.get("/", async (req, res) => {
  const data = await Slider.find();
  res.json(data);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
