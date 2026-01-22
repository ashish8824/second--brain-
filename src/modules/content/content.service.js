import Content from "../../models/content.model.js";
import ApiError from "../../utils/apiError.js";

import crypto from "crypto";
import urlScraper from "../../utils/urlScraper.js";
import aiSummaryService from "../../services/aiSummaryService.js";
import groqSummaryService from "../../services/groqSummaryService.js";

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

/**
 * Full-text search content for a user
 */
export const searchUserContent = async (userId, options) => {
  const { q, page = 1, limit = 20 } = options;

  if (!q || q.trim().length === 0) {
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        limit,
      },
    };
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageLimit = Math.min(Number(limit), 100);
  const skip = (pageNumber - 1) * pageLimit;

  const filter = {
    userId,
    isDeleted: false,
    $text: { $search: q },
  };

  const projection = {
    score: { $meta: "textScore" },
  };

  const [data, totalItems] = await Promise.all([
    Content.find(filter, projection)
      .sort({ score: { $meta: "textScore" } })
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
 * Add content to a collection
 */
export const addContentToCollection = async (
  contentId,
  collectionId,
  userId,
) => {
  const updated = await Content.findOneAndUpdate(
    {
      _id: contentId,
      userId,
      isDeleted: false,
    },
    {
      $addToSet: { collections: collectionId }, // prevents duplicates
    },
    { new: true },
  );

  if (!updated) {
    throw new ApiError(404, "Content not found");
  }

  return updated;
};

/**
 * Get all content inside a collection
 */
export const getContentByCollection = async (collectionId, userId) => {
  return Content.find({
    userId,
    isDeleted: false,
    collections: collectionId,
  }).sort({ createdAt: -1 });
};

/**
 * ✅ UPDATED: Create content from URL with AI summary
 * Don't store full body content to save database space
 */
/**
 * ✅ UPDATED: Create content from URL with Groq AI summary
 */
export const createContentFromURL = async (userId, data) => {
  const { url, tags: userTags } = data;

  console.log(`[Service] Processing URL for user ${userId}: ${url}`);

  // Step 1: Scrape the URL
  const scrapedData = await urlScraper.scrapeURL(url);

  // Step 2: Check for duplicate
  const existingContent = await Content.findOne({
    userId,
    sourceUrl: url,
    isDeleted: false,
  });

  if (existingContent) {
    throw new ApiError(
      409,
      "Content from this URL already exists in your collection",
    );
  }

  // Step 3: Generate AI summary
  let aiSummary;

  try {
    // Try Groq first (if API key is available)
    if (process.env.GROQ_API_KEY) {
      console.log("[Service] Using Groq for AI summary...");
      aiSummary = await groqSummaryService.generateCompleteSummary(scrapedData);
    } else {
      console.log("[Service] Using Hugging Face for AI summary...");
      aiSummary = await aiSummaryService.generateCompleteSummary(scrapedData);
    }
  } catch (error) {
    console.error("[Service] Primary AI failed, trying fallback...");
    aiSummary = await aiSummaryService.generateCompleteSummary(scrapedData);
  }

  // Step 4: Combine tags
  const allTags = [
    ...new Set([...(aiSummary.tags || []), ...(userTags || [])]),
  ].slice(0, 10);

  // Step 5: Generate content hash
  const contentHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        type: "link",
        title: scrapedData.title,
        url: scrapedData.url,
      }),
    )
    .digest("hex");

  // Step 6: Create content
  const content = await Content.create({
    userId,
    type: "link",
    title: scrapedData.title,
    body: scrapedData.content.substring(0, 500).trim() + "...",
    sourceUrl: scrapedData.url,
    summary: aiSummary.summary,
    keyPoints: aiSummary.keyPoints,
    tags: allTags,
    contentHash,
    metadata: {
      author: scrapedData.author,
      publishDate: scrapedData.publishDate,
      wordCount: scrapedData.wordCount,
      readingTime: scrapedData.readingTime,
      image: scrapedData.image,
      scrapedAt: scrapedData.scrapedAt,
      summarizedAt: aiSummary.generatedAt,
      isFallbackSummary: aiSummary.isFallback || false,
      aiModel: aiSummary.model,
    },
  });

  console.log(`[Service] Content created successfully: ${content._id}`);

  return content;
};
