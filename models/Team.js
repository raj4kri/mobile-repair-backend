const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  image: String,
  name: String,
  role: String,
});

module.exports = mongoose.model("Team", teamSchema);