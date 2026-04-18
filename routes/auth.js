const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();



const generateToken = (id) => {
  console.log("SIGN SECRET:", process.env.JWT_SECRET);
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    
    { expiresIn: process.env.JWT_EXPIRES_IN }
    
  );
  
};

// REGISTER

router.post("/register", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ username, password });

  res.json({
    token: generateToken(user._id)
  });
}));

// LOGIN
router.post("/login", (req, res, next) => {
  Promise.resolve((async () => {
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
  })()).catch(next);
});

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

module.exports = router;