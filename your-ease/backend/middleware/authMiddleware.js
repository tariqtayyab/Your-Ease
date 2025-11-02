import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ✅ Check if user is logged in (optional for guest routes)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Auth error:", error);
      // For guest orders, we don't throw error - just continue without user
      next();
    }
  } else {
    // No token - this might be a guest order
    req.user = null;
    next();
  }
};

// ✅ Optional auth - sets user if available but doesn't require it
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      console.error("❌ Optional auth error:", error);
      // Continue without user for guest access
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

// ✅ Allow only admin users
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

// ✅ Require user (logged in) OR guest data
export const requireUserOrGuest = (req, res, next) => {
  if (req.user || (req.body.isGuest && req.body.shippingAddress?.email)) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};