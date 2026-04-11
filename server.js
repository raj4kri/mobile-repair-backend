// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

require("dotenv").config();

const User = require("./models/user");
const Category = require("./models/Category");
const Slider = require("./models/Slider");
const contactRoutes = require("./routes/contact");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));
app.use("/contact", contactRoutes);

// ================= CONFIG =================
const PORT = process.env.PORT || 1000;
const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET;

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// IMPORTANT: correct usage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mobile-repair",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= MODELS =================
const Product = mongoose.model("Product", {
  name: String,
  price: String,
  image: String,
  category: String,
});

const Team = mongoose.model("Team", {
  name: String,
  role: String,
  image: String,
});

// ================= AUTH ROUTES =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });

  await user.save();
  res.json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PRODUCTS =================
app.get("/products", async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 6 } = req.query;

    let query = { name: { $regex: search, $options: "i" } };
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/products", authMiddleware, async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

// ================= TEAM =================
app.post("/team", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const newMember = new Team({
      name: req.body.name,
      role: req.body.role,
      image: req.file.path, // cloud url
    });

    await newMember.save();
    res.json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SLIDER =================
app.get("/slider", async (req, res) => {
  try {
    const data = await Slider.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/slider", upload.single("image"), async (req, res) => {
  try {
    const newSlider = new Slider({
      image: req.file.path, // cloud url
    });

    await newSlider.save();
    res.json(newSlider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});