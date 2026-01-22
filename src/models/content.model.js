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

    // ✅ NEW FIELDS FOR AI SUMMARY
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
      // Extended metadata
      author: String,
      publishDate: Date,
      wordCount: Number,
      readingTime: Number,
      image: String,
      scrapedAt: Date,
      summarizedAt: Date,
      isFallbackSummary: Boolean,
      aiModel: String,
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
  },
  {
    timestamps: true,
  },
);

contentSchema.index({ userId: 1, contentHash: 1, isDeleted: 1 });

contentSchema.index(
  {
    title: "text",
    body: "text",
    tags: "text",
    summary: "text", // ✅ Add summary to text index
  },
  {
    name: "ContentTextIndex",
    weights: {
      title: 5,
      summary: 4, // ✅ Summary is also important
      body: 3,
      tags: 2,
    },
  },
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
