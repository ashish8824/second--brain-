import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

/**
 * Protect routes middleware
 * Verifies JWT access token
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists
    if (!authHeader) {
      throw new ApiError(401, "Authorization header missing");
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Invalid authorization format");
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach user info to request (VERY IMPORTANT)
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // Token expired / invalid
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export default authMiddleware;
