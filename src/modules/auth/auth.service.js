import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";
import crypto from "crypto";

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  // ❌ Instead of throw new Error()
  if (existingUser) {
    throw new ApiError(409, "Email already registered"); // 409 Conflict
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  // IMPORTANT: password is select:false in schema
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
    return;
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

  // 4. Reset link (normally emailed)
  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  console.log("🔗 PASSWORD RESET LINK:", resetLink);
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
};
