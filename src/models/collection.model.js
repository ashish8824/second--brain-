import mongoose from "mongoose";

/**
 * Collection / Folder Schema
 */
const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate collection names per user
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
