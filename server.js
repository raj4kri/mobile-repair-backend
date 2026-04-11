// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Category = require("./models/Category");
const Slider = require("./models/Slider");
const contactRoutes = require("./routes/contact");

require("dotenv").config();


// ================= CLOUDINARY =================
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ================= MULTER MEMORY =================
const storage = multer.memoryStorage();
const upload = multer({ storage });


const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));
app.use("/contact", contactRoutes);

// ================= CONFIG =================
const PORT = process.env.PORT || 1000;
const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET || "mysecretkey";

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= UPLOADS FOLDER =================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ================= FILE UPLOAD =================
<<<<<<< HEAD
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });
=======
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
>>>>>>> 5affc2a18e54ed21804bd35fcb227f38253d27d4

// serve images
app.use("/uploads", express.static("uploads"));

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
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
    console.error("LOGIN ERROR:", err);
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
    const products = await Product.find(query).skip(skip).limit(parseInt(limit));
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

app.put("/products/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated || { message: "No product found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/products/:id", authMiddleware, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= TEAM =================
app.get("/team", async (req, res) => {
  const data = await Team.find();
  res.json(data);
});

app.post("/team", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const protocol = "https";
    const imageUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const newMember = new Team({ name: req.body.name, role: req.body.role, image: imageUrl });
    await newMember.save();
    res.json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/team/:id", authMiddleware, async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= CATEGORY =================
app.post("/categories", authMiddleware, async (req, res) => {
  const newCategory = new Category({ name: req.body.name });
  await newCategory.save();
  res.json(newCategory);
});

app.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

app.delete("/categories/:id", authMiddleware, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= SLIDER =================
app.get("/slider", async (req, res) => {
  const data = await Slider.find();
  res.json(data);
});

a// FIXED SLIDER ROUTE
<<<<<<< HEAD
// ================= SLIDER ROUTE =================
app.post("/slider", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // upload buffer to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "slider" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const newSlider = new Slider({
      image: result.secure_url, // HTTPS URL
    });

    const saved = await newSlider.save();

=======
app.post("/slider", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;

    const imageUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const newSlider = new Slider({
      image: imageUrl,
    });

    const saved = await newSlider.save();

    console.log("SAVED:", saved);

>>>>>>> 5affc2a18e54ed21804bd35fcb227f38253d27d4
    res.json(saved);

  } catch (err) {
    console.error("SLIDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/slider/:id", async (req, res) => {
  await Slider.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});