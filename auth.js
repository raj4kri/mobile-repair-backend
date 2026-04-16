const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "mysecretkey";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  console.log("HEADER:", header); // debug

  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // 🔥 ADD THIS
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;