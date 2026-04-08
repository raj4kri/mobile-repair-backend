const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All required fields missing ❌" });
    }

    // 💾 Save in DB
    const newMsg = new Contact({ name, email, phone, message });
    await newMsg.save();

    // ✉️ AUTO EMAIL SEND
    await transporter.sendMail({
  from: "yourgmail@gmail.com",
  to: email,
  subject: "Thank you for contacting Deepak Communication",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Thank You, ${name}! 🙏</h2>
      
      <p>We have successfully received your message.</p>
      
      <p><strong>Your Message:</strong></p>
      <blockquote style="background:#f4f4f4; padding:10px; border-left:4px solid #3498db;">
        ${message}
      </blockquote>

      <p>Our team will review your request and get back to you as soon as possible.</p>

      <hr />

      <p><strong>Deepak Communication</strong><br/>
      Mobile Repair & Accessories<br/>
      📞 Contact: +91-XXXXXXXXXX</p>

      <p style="color: gray; font-size: 12px;">
        This is an automated response. Please do not reply directly to this email.
      </p>
    </div>
  `
});

    res.json({ message: "Message sent + email delivered ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed ❌" });
  }
});

router.get("/", async (req, res) => {
  const data = await Contact.find().sort({ createdAt: -1 });
  res.json(data);
});

// ================delete contact msg================
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// ================reply msg================
router.put("/reply/:id", async (req, res) => {
  try {
    const { reply } = req.body;

    const msg = await Contact.findById(req.params.id);

    msg.reply = reply;
    await msg.save();

    // 📧 SEND EMAIL
    await transporter.sendMail({
      from: "yourgmail@gmail.com",
      to: msg.email,
      subject: "Reply from Admin",
      text: reply,
    });

    res.json({ message: "Reply sent + email delivered ✅" });
  } catch (err) {
    res.status(500).json({ error: "Reply failed ❌" });
  }
});


// ================ toggle read/unread================
router.put("/read/:id", async (req, res) => {
  try {
    const msg = await Contact.findById(req.params.id);

    msg.isRead = !msg.isRead; // toggle
    await msg.save();

    res.json(msg);
  } catch {
    res.status(500).json({ error: "Failed ❌" });
  }
});

// const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rajaryannasa@gmail.com",
    pass: "psit rwhb pzez mxxq", // ⚠️ use app password
  },
});

module.exports = router;