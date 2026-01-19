import ContentEmbedding from "../../models/contentEmbedding.model.js";
import Content from "../../models/content.model.js";
import { cosineSimilarity } from "../../utils/cosineSimilarity.js";
import { generateQueryEmbedding } from "./queryEmbedding.service.js";

/**
 * Semantic search across user's content
 */
export const semanticSearch = async (userId, query, limit = 5) => {
  // 1️⃣ Embed query
  const queryVector = await generateQueryEmbedding(query);

  // 2️⃣ Fetch all user embeddings
  const embeddings = await ContentEmbedding.find({ userId });

  // 3️⃣ Score each embedding
  const scored = embeddings.map((doc) => ({
    contentId: doc.contentId,
    score: cosineSimilarity(queryVector, doc.embedding),
  }));

  // 4️⃣ Sort by relevance
  const topMatches = scored.sort((a, b) => b.score - a.score).slice(0, limit);

  // 5️⃣ Fetch content documents
  const contents = await Content.find({
    _id: { $in: topMatches.map((m) => m.contentId) },
    isDeleted: false,
  });

  // 6️⃣ Attach score
  return contents.map((content) => ({
    ...content.toObject(),
    score: topMatches.find(
      (m) => m.contentId.toString() === content._id.toString(),
    )?.score,
  }));
};
