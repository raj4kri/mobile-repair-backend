const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    whatsapp: String, // ✅ ADD
    dob: Date, // ✅ ADD
    message: String,
    reply: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
