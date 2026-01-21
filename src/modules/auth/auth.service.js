// src/modules/auth/auth.service.js
import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../services/emailService.js";

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Send welcome email (non-blocking - don't wait for it)
  sendWelcomeEmail(email, name).catch((err) =>
    console.error("Welcome email failed:", err),
  );

  return user;
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return user;
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // SECURITY: Do NOT reveal if user exists
  if (!user) {
    console.log("⚠️ Password reset requested for non-existent email:", email);
    return; // Still return success to user for security
  }

  // 1. Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token before saving
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Save hashed token + expiry
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // 4. Send email with reset link
  try {
    await sendPasswordResetEmail(email, resetToken);
    console.log("✅ Password reset email sent to:", email);
  } catch (error) {
    // Rollback - remove token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    console.error("❌ Failed to send password reset email:", error);
    throw new ApiError(
      500,
      "Failed to send password reset email. Please try again.",
    );
  }
};

/**
 * Reset password
 */
export const resetPassword = async (token, newPassword) => {
  // 1. Hash incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // 3. Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // 4. Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  console.log("✅ Password reset successful for user:", user.email);
};
