import huggingface from "../../config/huggingface.js";
import ApiError from "../../utils/apiError.js";

/**
 * Generate embedding for search query
 */
export const generateQueryEmbedding = async (query) => {
  try {
    const response = await huggingface.post(
      `/hf-inference/models/${process.env.HUGGINGFACE_EMBEDDING_MODEL}/pipeline/feature-extraction`,
      { inputs: query },
    );

    return Array.isArray(response.data[0]) ? response.data[0] : response.data;
  } catch (error) {
    console.error("Query embedding error:", error?.response?.data);
    throw new ApiError(500, "Failed to embed search query");
  }
};
