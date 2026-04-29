const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();



const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role, // ✅ REQUIRED
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "User exists" });
  }

  const user = await User.create({ username, password });

  res.json({
      token: generateToken(user),
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    token: generateToken(user),
  });
});

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

router.get("/verify", auth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;