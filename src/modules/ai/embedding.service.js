import huggingface from "../../config/huggingface.js";
import ContentEmbedding from "../../models/contentEmbedding.model.js";
import Content from "../../models/content.model.js";
import ApiError from "../../utils/apiError.js";

/**
 * Build text for embedding
 */
const buildSourceText = (content) => {
  let text = "";
  if (content.title) text += `${content.title}\n`;
  if (content.body) text += `${content.body}\n`;
  if (content.tags?.length) {
    text += `Tags: ${content.tags.join(", ")}`;
  }
  return text.trim();
};

export const generateEmbeddingForContent = async (contentId, userId) => {
  const content = await Content.findOne({
    _id: contentId,
    userId,
    isDeleted: false,
  });

  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  const sourceText = buildSourceText(content);
  if (!sourceText) {
    throw new ApiError(400, "Content has no text to embed");
  }

  let embeddingVector;

  try {
    // 🌐 CORRECT HUGGING FACE URL
    const response = await huggingface.post(
      `/hf-inference/models/${process.env.HUGGINGFACE_EMBEDDING_MODEL}/pipeline/feature-extraction`,
      { inputs: sourceText },
    );

    // The API returns a 2D array
    embeddingVector = Array.isArray(response.data[0])
      ? response.data[0]
      : response.data;
  } catch (error) {
    console.error(
      "HuggingFace embedding error:",
      error?.response?.data || error.message,
    );
    throw new ApiError(500, "Failed to generate embedding");
  }

  const embeddingDoc = await ContentEmbedding.findOneAndUpdate(
    { contentId },
    {
      userId,
      contentId,
      embedding: embeddingVector,
      model: process.env.HUGGINGFACE_EMBEDDING_MODEL,
      sourceText,
    },
    { upsert: true, new: true },
  );

  return embeddingDoc;
};
