const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
 

  if (!header || !header.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];
console.log("VERIFY SECRET:", process.env.JWT_SECRET); //

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// console.log("DECODED:", decoded);
    const user = await User.findById(decoded.id).select("-password");
    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = auth;
