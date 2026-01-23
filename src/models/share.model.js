import mongoose from "mongoose";
import crypto from "crypto";

const shareSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // What is being shared
    shareType: {
      type: String,
      enum: ["content", "collection"],
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      index: true,
    },

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      index: true,
    },

    // Share settings
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Access control
    requirePassword: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      select: false, // Don't return in queries
    },

    allowedEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // Expiration
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    uniqueViewers: [
      {
        ip: String,
        userAgent: String,
        viewedAt: Date,
      },
    ],

    lastViewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Generate unique share token before save
shareSchema.pre("save", function (next) {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(16).toString("hex");
  }
  next();
});

// Virtual for share URL
shareSchema.virtual("shareUrl").get(function () {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${baseUrl}/shared/${this.shareToken}`;
});

// Check if share is valid and active
shareSchema.methods.isValid = function () {
  if (!this.isActive) {
    return { valid: false, reason: "Share link has been deactivated" };
  }

  if (this.expiresAt && this.expiresAt < new Date()) {
    return { valid: false, reason: "Share link has expired" };
  }

  return { valid: true };
};

// Check password
shareSchema.methods.checkPassword = function (password) {
  if (!this.requirePassword) return true;
  return this.password === password;
};

// Record a view
shareSchema.methods.recordView = async function (ip, userAgent) {
  this.viewCount += 1;
  this.lastViewedAt = new Date();

  // Check if this is a unique viewer
  const existingViewer = this.uniqueViewers.find((v) => v.ip === ip);

  if (!existingViewer) {
    this.uniqueViewers.push({
      ip,
      userAgent,
      viewedAt: new Date(),
    });
  }

  await this.save();
};

// Index for cleanup of expired shares
shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Share = mongoose.model("Share", shareSchema);

export default Share;
