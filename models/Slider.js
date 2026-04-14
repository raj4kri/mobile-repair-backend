const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
  image: String
  
});

module.exports = mongoose.model("Slider", sliderSchema);