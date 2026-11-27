const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () =>
  process.env.JWT_SECRET || "topper_ai_jwt_super_secret_key_2026";

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found with this token" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Attaches req.user when a valid Bearer token is present, otherwise continues as guest.
const optionalProtect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select("-password");
  } catch {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalProtect };
