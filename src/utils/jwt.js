import jwt from "jsonwebtoken";

/**
 * Generate JWT access token
 * @param {Object} payload - data to store in token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d", // access token expiry
  });
};
