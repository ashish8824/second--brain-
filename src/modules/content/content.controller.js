import {
  createContent,
  getUserContents,
  getContentById,
  updateContent,
  deleteContent,
  searchUserContent,
  addContentToCollection,
  getContentByCollection,
  createContentFromURL,
} from "./content.service.js";

/**
 * Helper: Add file URLs to content
 */
const addFileUrls = (content, req) => {
  if (!content) return null;

  const contentObj = content.toObject ? content.toObject() : content;

  if (contentObj.type === "document" || contentObj.type === "image") {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    contentObj.fileUrl = `${baseUrl}/files/preview/${contentObj._id}`;
    contentObj.downloadUrl = `${baseUrl}/files/download/${contentObj._id}`;
  }

  return contentObj;
};

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

    // ✅ Add file URLs to each content
    const dataWithUrls = result.data.map((content) =>
      addFileUrls(content, req),
    );

    res.status(200).json({
      success: true,
      data: dataWithUrls,
      pagination: result.pagination,
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

    // ✅ Add file URLs
    const contentWithUrls = addFileUrls(content, req);

    res.status(200).json({
      success: true,
      data: contentWithUrls,
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

/**
 * Search content (full-text)
 */
export const search = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;

    const result = await searchUserContent(req.user.userId, {
      q,
      page,
      limit,
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
 * Add content to a collection
 */
export const addToCollection = async (req, res, next) => {
  try {
    const { contentId, collectionId } = req.params;

    const updated = await addContentToCollection(
      contentId,
      collectionId,
      req.user.userId,
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
 * Get content inside a collection
 */
export const getCollectionContent = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;

    const content = await getContentByCollection(collectionId, req.user.userId);

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ NEW: Create content from URL with AI summary
 */
export const createFromURL = async (req, res, next) => {
  try {
    const { url, tags } = req.body;

    const content = await createContentFromURL(req.user.userId, {
      url,
      tags,
    });

    res.status(201).json({
      success: true,
      message: "Content added successfully with AI summary",
      data: {
        id: content._id,
        title: content.title,
        summary: content.summary,
        keyPoints: content.keyPoints,
        tags: content.tags,
        url: content.sourceUrl,
        wordCount: content.metadata?.wordCount,
        readingTime: content.metadata?.readingTime,
        createdAt: content.createdAt,
        aiGenerated: !content.metadata?.isFallbackSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};
