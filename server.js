const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Category = require("./models/Category");
const Slider = require("./models/Slider");
const contactRoutes = require("./routes/contact");
require("dotenv").config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/contact", contactRoutes);



// const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Error ❌", err));

// ================= CONFIG =================
const SECRET = "mysecretkey";




// ================= DATABASE =================
// mongoose.connect("mongodb://127.0.0.1:27017/mobile-shop")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// ================= FILE UPLOAD (ONLY ONCE) =================
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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

// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.json({ message: "User registered" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

// ================= PRODUCTS =================
app.get("/products", async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 6 } = req.query;

    let query = {
      name: { $regex: search, $options: "i" },
    };

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

// ADD PRODUCT
app.post("/products", authMiddleware, async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

// UPDATE
app.put("/products/:id", authMiddleware, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

// DELETE
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
  const newMember = new Team({
    name: req.body.name,
    role: req.body.role,
    image: req.file.filename,
  });

  await newMember.save();
  res.json(newMember);
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

app.post("/slider", upload.single("image"), async (req, res) => {
  const newSlider = new Slider({
    image: req.file.filename, // ✅ store filename only
  });

  await newSlider.save();
  res.json({ message: "Slider image added" });
});

app.delete("/slider/:id", async (req, res) => {
  await Slider.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});