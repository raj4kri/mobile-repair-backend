const express = require("express");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload"); 
const { uploadToCloudinary } = require("../utils/cloudinary");
const Team = require("../models/Team");
const router = express.Router();

console.log("auth:", authMiddleware);
console.log("upload:", upload);

router.post("/",authMiddleware,upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file); // 🔥 debug
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const result = await uploadToCloudinary(req.file.buffer, "team");

    const newTeam = new Team({
       image: result.secure_url,
      name: req.body.name,
      role: req.body.role,
     
    });

    const saved = await newTeam.save();

    res.json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  const data = await Team.find();
  res.json(data);
});

module.exports = router;