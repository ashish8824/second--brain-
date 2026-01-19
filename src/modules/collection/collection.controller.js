import {
  createCollection,
  getUserCollections,
  updateCollection,
  deleteCollection,
} from "./collection.service.js";

import { getContentByCollection } from "../content/content.service.js";

/**
 * Create collection
 */
export const create = async (req, res, next) => {
  try {
    const collection = await createCollection(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List collections
 */
export const list = async (req, res, next) => {
  try {
    const collections = await getUserCollections(req.user.userId);

    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update collection
 */
export const update = async (req, res, next) => {
  try {
    const updated = await updateCollection(
      req.params.id,
      req.user.userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete collection
 */
export const remove = async (req, res, next) => {
  try {
    await deleteCollection(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get content inside a collection
 */
export const getCollectionContent = async (req, res, next) => {
  try {
    const content = await getContentByCollection(
      req.params.id,
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};
