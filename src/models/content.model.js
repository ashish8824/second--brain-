import mongoose from "mongoose";

/**
 * Content Schema
 * Represents a saved knowledge item (Second Brain)
 */
const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "link", "image", "document"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    body: {
      type: String, // text / extracted text
    },

    sourceUrl: {
      type: String, // for links
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    metadata: {
      type: Object, // flexible (author, platform, etc.)
    },
    contentHash: {
      // ✅ Add this field
      type: String,
      index: true, // Index for faster duplicate checks
    },

    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Add compound index for efficient duplicate detection
contentSchema.index({ userId: 1, contentHash: 1, isDeleted: 1 });

// 🔍 Full-text search index
contentSchema.index(
  {
    title: "text",
    body: "text",
    tags: "text",
  },
  {
    name: "ContentTextIndex",
    weights: {
      title: 5, // title more important
      body: 3,
      tags: 2,
    },
  },
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
