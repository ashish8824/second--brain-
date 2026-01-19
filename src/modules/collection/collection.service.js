import Collection from "../../models/collection.model.js";
import ApiError from "../../utils/apiError.js";

/**
 * Create a new collection
 */
export const createCollection = async (userId, data) => {
  try {
    return await Collection.create({
      ...data,
      userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Collection already exists");
    }
    throw error;
  }
};

/**
 * Get all collections for a user
 */
export const getUserCollections = async (userId) => {
  return Collection.find({
    userId,
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

/**
 * Update (rename / edit) collection
 */
export const updateCollection = async (collectionId, userId, data) => {
  const updated = await Collection.findOneAndUpdate(
    {
      _id: collectionId,
      userId,
      isDeleted: false,
    },
    { $set: data },
    { new: true },
  );

  if (!updated) {
    throw new ApiError(404, "Collection not found");
  }

  return updated;
};

/**
 * Soft delete collection
 */
export const deleteCollection = async (collectionId, userId) => {
  const deleted = await Collection.findOneAndUpdate(
    {
      _id: collectionId,
      userId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!deleted) {
    throw new ApiError(404, "Collection not found");
  }

  return deleted;
};
