const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const router = express.Router();
const auth = require("../middleware/auth");







const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ username, password });

  res.json({
    token: generateToken(user._id)
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    token: generateToken(user._id)
  });
});

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

module.exports = router;