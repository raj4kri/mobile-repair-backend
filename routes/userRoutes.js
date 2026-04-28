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
    const users = await User.find().select("-password");
    res.json(users);
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

      const user = new User({ username, password, role });
      await user.save();

      res.json({ message: "User created" });
    } catch (err) {
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