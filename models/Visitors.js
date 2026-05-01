const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  date: { type: String, unique: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Visitors", visitorSchema);