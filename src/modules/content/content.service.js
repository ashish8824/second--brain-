import Content from "../../models/content.model.js";
import ApiError from "../../utils/apiError.js";

import crypto from "crypto";

/**
 * Generate content hash
 */
const generateContentHash = (data) => {
  // Create a normalized version of the content
  const normalizedContent = {
    type: data.type,
    title: data.title?.toLowerCase().trim() || "",
    body: data.body?.toLowerCase().trim() || "",
    sourceUrl: data.sourceUrl?.toLowerCase().trim() || "",
  };

  const contentString = JSON.stringify(normalizedContent);
  return crypto.createHash("sha256").update(contentString).digest("hex");
};

/**
 * Create new content with comprehensive duplicate check
 */
export const createContent = async (userId, data) => {
  // Generate content hash
  const contentHash = generateContentHash(data);

  // Check for exact duplicate using hash
  const duplicateByHash = await Content.findOne({
    userId,
    contentHash,
    isDeleted: false,
  });

  if (duplicateByHash) {
    throw new ApiError(409, "This exact content already exists");
  }

  // Additional check: same URL (for link type)
  if (data.type === "link" && data.sourceUrl) {
    const duplicateByUrl = await Content.findOne({
      userId,
      type: "link",
      sourceUrl: data.sourceUrl,
      isDeleted: false,
    });

    if (duplicateByUrl) {
      throw new ApiError(409, "A content item with this URL already exists");
    }
  }

  // Create content with hash
  const content = await Content.create({
    ...data,
    userId,
    contentHash,
  });

  return content;
};

/**
 * Get paginated & filtered content for a user
 */
export const getUserContents = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    tag,
    sortBy = "createdAt",
    order = "desc",
  } = options;

  // 1️⃣ Build filter
  const filter = {
    userId,
    isDeleted: false,
  };

  if (type) {
    filter.type = type;
  }

  if (tag) {
    filter.tags = tag;
  }

  // 2️⃣ Pagination math
  const pageNumber = Math.max(Number(page), 1);
  const pageLimit = Math.min(Number(limit), 100); // hard cap
  const skip = (pageNumber - 1) * pageLimit;

  // 3️⃣ Sorting
  const sortOrder = order === "asc" ? 1 : -1;

  // 4️⃣ Execute queries in parallel (performance)
  const [data, totalItems] = await Promise.all([
    Content.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageLimit),

    Content.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / pageLimit),
      currentPage: pageNumber,
      limit: pageLimit,
    },
  };
};

/**
 * Get single content
 */
export const getContentById = async (contentId, userId) => {
  const content = await Content.findOne({
    _id: contentId,
    userId,
    isDeleted: false,
  });

  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  return content;
};

/**
 * Update content (partial update)
 */
export const updateContent = async (contentId, userId, data) => {
  const updated = await Content.findOneAndUpdate(
    {
      _id: contentId,
      userId,
      isDeleted: false,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
      context: "query",
    },
  );

  if (!updated) {
    throw new ApiError(404, "Content not found");
  }

  return updated;
};

/**
 * Soft delete content
 */
export const deleteContent = async (contentId, userId) => {
  const content = await Content.findOneAndUpdate(
    { _id: contentId, userId },
    { isDeleted: true },
    { new: true },
  );

  if (!content) {
    throw new ApiError(404, "Content not found");
  }
};
