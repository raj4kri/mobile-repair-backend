const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET
const app = express();
app.use(express.json());

const User = require("./models/User");





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
const SECRET = process.env.JWT_SECRET

require("dotenv").config();

// console.log("JWT_SECRET:", process.env.JWT_SECRET);

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));



// ================= ROUTES =================
app.use("/auth", require("./routes/auth"));
app.use("/slider", require("./routes/slider"));
app.use("/products", require("./routes/product"));
app.use("/categories", require("./routes/categories"));
app.use("/team", require("./routes/team"));
app.use("/contact", require("./routes/contact"));



// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});