const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();





const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes

const userRoutes = require("./routes/userRoutes");

app.use("/users", userRoutes);
app.use("/auth", require("./routes/auth"));
app.use("/slider", require("./routes/slider"));
app.use("/products", require("./routes/product"));
app.use("/categories", require("./routes/categories"));
app.use("/team", require("./routes/team"));
app.use("/contact", require("./routes/contact"));

// test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// server
app.listen(process.env.PORT || 1000, () => {
  console.log("Server running");
});