import mongoose from "mongoose";

/**
 * Content Embedding Schema
 * Stores AI-generated embeddings for semantic search
 */
const contentEmbeddingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
      unique: true, // one embedding per content (for now)
    },

    embedding: {
      type: [Number],
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    sourceText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

contentEmbeddingSchema.index({ userId: 1 });

const ContentEmbedding = mongoose.model(
  "ContentEmbedding",
  contentEmbeddingSchema,
);

export default ContentEmbedding;
