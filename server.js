// /backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require("./models/user");
const Category = require("./models/Category");
const Slider = require("./models/Slider");
const contactRoutes = require("./routes/contact");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));
app.use("/contact", contactRoutes);

// ================= CONFIG =================
const PORT = process.env.PORT || 1000;
const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

if (!SECRET) {
  console.error("❌ SECRET missing");
  process.exit(1);
}

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  });

// ================= UPLOADS =================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, SECRET);
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
  try {
    const { username, password } = req.body;
    const user = new User({
      username,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
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
      page: Number(page),
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= TEAM =================
app.get("/team", async (req, res) => {
  try {
    res.json(await Team.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/team", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const imageUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const member = new Team({
      name: req.body.name,
      role: req.body.role,
      image: imageUrl,
    });

    await member.save();
    res.json(member);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CATEGORY =================
app.get("/categories", async (req, res) => {
  try {
    res.json(await Category.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SLIDER =================
app.get("/slider", async (req, res) => {
  try {
    res.json(await Slider.find());
  } catch (err) {
    console.error("SLIDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/slider", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const imageUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const slider = new Slider({ image: imageUrl });
    await slider.save();

    res.json(slider);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GLOBAL ERROR =================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});