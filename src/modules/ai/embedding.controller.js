import { generateEmbeddingForContent } from "./embedding.service.js";

/**
 * Generate embedding for a content item
 */
export const generateEmbedding = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    const embedding = await generateEmbeddingForContent(
      contentId,
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      data: embedding,
    });
  } catch (error) {
    next(error);
  }
};
