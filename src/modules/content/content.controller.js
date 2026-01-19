import {
  createContent,
  getUserContents,
  getContentById,
  updateContent,
  deleteContent,
} from "./content.service.js";

/**
 * Create content
 */
export const create = async (req, res, next) => {
  try {
    const content = await createContent(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contents (paginated + filtered)
 */
export const list = async (req, res, next) => {
  try {
    const { page, limit, type, tag, sortBy, order } = req.query;

    const result = await getUserContents(req.user.userId, {
      page,
      limit,
      type,
      tag,
      sortBy,
      order,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single content
 */
export const getOne = async (req, res, next) => {
  try {
    const content = await getContentById(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update content
 */
export const update = async (req, res, next) => {
  try {
    const content = await updateContent(
      req.params.id,
      req.user.userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete content
 */
export const remove = async (req, res, next) => {
  try {
    await deleteContent(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
