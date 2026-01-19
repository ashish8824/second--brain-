import mongoose from "mongoose";

/**
 * User Schema
 * Represents a registered user in the system
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // ✅ CONDITIONAL REQUIRED (ONLY THIS)
      required: function () {
        return this.provider === "local";
      },
      minlength: 8,
      select: false,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // 🔐 Forgot password fields
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const User = mongoose.model("User", userSchema);

export default User;
