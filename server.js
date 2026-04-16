const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: ["http://localhost:5173", "https://frontend-37cf.vercel.app"],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= CONFIG =================
const PORT = process.env.PORT || 1000;
const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET || "mysecretkey";

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= AUTH =================
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
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ROUTES =================
app.use("/contact", require("./routes/contact"));
app.use("/products", require("./routes/product"));
app.use("/categories", require("./routes/categories"));
app.use("/team", require("./routes/team"));
app.use("/slider", require("./routes/slider"));

// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});