const express = require("express");
const router = express.Router();
const User = require("../models/User");

const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

// ✅ GET ALL USERS
router.get(
  "/",
  authMiddleware,
  checkPermission("manage_users"),
  async (req, res) => {
    try {
      console.log("GET USERS HIT"); // ✅ debug

      const users = await User.find().select("-password");

      res.json(users);
    } catch (err) {
      console.error("GET USERS ERROR:", err); // 🔥 THIS WILL SHOW REAL ISSUE
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ CREATE USER
router.post(
  "/",
  authMiddleware,
  checkPermission("manage_users"),
  async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be 6+ chars" });
      }

      const user = new User({ username, password, role });
      await user.save();

      res.json({ message: "User created" });

    } catch (err) {
      console.error("CREATE USER ERROR:", err.message); // 🔥 IMPORTANT
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("manage_users"),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  }
);

module.exports = router;