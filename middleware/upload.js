const multer = require("multer");

// memory storage (Cloudinary ke liye best)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;   // ✅ IMPORTANT