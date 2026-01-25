import mongoose from "mongoose";

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
      type: String,
    },

    sourceUrl: {
      type: String,
    },

    summary: {
      type: String,
      trim: true,
    },

    keyPoints: [
      {
        type: String,
        trim: true,
      },
    ],

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    metadata: {
      type: Object,
      // File metadata
      fileName: String,
      fileSize: Number,
      mimeType: String,

      // ✅ S3 metadata (NEW)
      s3Key: String,
      s3Bucket: String,
      s3Location: String,

      // ✅ Legacy local path (for backward compatibility)
      filePath: String,
      originalPath: String,

      // PDF specific
      numPages: Number,
      author: String,
      publishDate: Date,

      // Image specific
      dimensions: String,
      hasText: Boolean,
      ocrConfidence: Number,

      // General metadata
      wordCount: Number,
      readingTime: Number,
      image: String,
      scrapedAt: Date,
      summarizedAt: Date,
      isFallbackSummary: Boolean,
      aiModel: String,
      uploadDate: Date,
      processedAt: Date,
    },

    contentHash: {
      type: String,
      index: true,
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

    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
contentSchema.index({ userId: 1, contentHash: 1, isDeleted: 1 });

contentSchema.index(
  {
    title: "text",
    body: "text",
    tags: "text",
    summary: "text",
  },
  {
    name: "ContentTextIndex",
    weights: {
      title: 5,
      summary: 4,
      body: 3,
      tags: 2,
    },
  },
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
