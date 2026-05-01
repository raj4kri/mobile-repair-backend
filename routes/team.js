const express = require("express");
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");
const upload = require("../middleware/upload"); 
const uploadToCloudinary = require("../utils/cloudinary");
const Team = require("../models/Team");

const router = express.Router();

// CREATE TEAM (ADMIN ONLY)
// CREATE TEAM
router.post(
  "/",
  authMiddleware,
  checkPermission("manage_team"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadToCloudinary(req.file.buffer, "team");

      const newTeam = new Team({
        image: result.secure_url,
        name: req.body.name,
        role: req.body.role,
      });

      const saved = await newTeam.save();

      res.status(201).json({
        message: "Team member added successfully ✅",
        data: saved
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE TEAM
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("manage_team"), // ✅ FIXED
  async (req, res) => {
    try {
      await Team.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET TEAM (PUBLIC)
router.get("/", async (req, res) => {
  const data = await Team.find();
  res.json(data);
});

module.exports = router;