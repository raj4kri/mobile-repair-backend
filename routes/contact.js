const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

const nodemailer = require("nodemailer");
// const { uploadToCloudinary } = require("../utils/cloudinary");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
   const { name, email, phone, whatsapp, dob, message } = req.body;

  if (!name || !email || !message || !whatsapp) {
  return res.status(400).json({ error: "Required fields missing ❌" });
}

    // 💾 Save in DB
    const newMsg = new Contact({
  name,
  email,
  phone,
  whatsapp,
  dob,
  message,
});
    await newMsg.save();

    // ✉️ AUTO EMAIL SEND
await transporter.sendMail({
  from: `"Deepak Communication" <${process.env.EMAIL_USER}>`,
  to: email, // ✅ only user gets email
  subject: "Thank you for contacting Deepak Communication",
 html: `
<div style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        
        <!-- MAIN CARD -->
        <table width="600" style="max-width:600px;background:#020617;border-radius:12px;overflow:hidden;border:1px solid #1e293b;">
          
          <!-- HEADER -->
          <tr>
            <td style="padding:20px;text-align:center;background:linear-gradient(90deg,#3b82f6,#06b6d4);">
              <h1 style="margin:0;color:#fff;font-size:22px;">
                Deepak Communication
              </h1>
              <p style="margin:5px 0 0;color:#e0f2fe;font-size:13px;">
                Mobile Repair & Accessories
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:25px;color:#e2e8f0;">
              
              <h2 style="color:#38bdf8;margin-bottom:10px;">
                Hello ${name} 👋
              </h2>

              <p style="font-size:14px;line-height:1.6;">
                Thank you for contacting us. We’ve received your message and our team will get back to you shortly.
              </p>

              <!-- MESSAGE BOX -->
              <div style="background:#0f172a;border-left:4px solid #38bdf8;padding:15px;margin:20px 0;border-radius:8px;">
                <p style="margin:0;font-size:13px;color:#cbd5f5;">
                  ${message}
                </p>
              </div>

              <!-- CTA BUTTON -->
              <div style="text-align:center;margin:25px 0;">
                <a href="https://wa.me/919060211167" 
                   style="background:#22c55e;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;font-size:14px;display:inline-block;">
                  Chat on WhatsApp
                </a>
              </div>

              <p style="font-size:13px;color:#94a3b8;">
                📍 Rukanpura, Patna <br/>
                📞 +91 9060211167
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:15px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #1e293b;">
              © ${new Date().getFullYear()} Deepak Communication. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
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


router.get("/birthdays/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(5, 10);

    const users = await Contact.find({
      dob: { $exists: true, $ne: null },
    });

    const birthdayUsers = users.filter((u) =>
      u.dob?.slice(5, 10) === today
    );

    res.json(birthdayUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed ❌" });
  }
});

module.exports = router;