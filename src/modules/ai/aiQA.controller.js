import aiQAService from "../../services/aiQAService.js";

/**
 * Ask a question to your knowledge base
 * POST /ai/ask
 */
export const askQuestion = async (req, res, next) => {
  try {
    const { question, tags, limit } = req.body;
    const userId = req.user.userId;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Question is too long. Please keep it under 500 characters.",
      });
    }

    console.log(`[Controller] User ${userId} asked: "${question}"`);

    const result = await aiQAService.answerQuestion(userId, question, {
      tags,
      limit: limit || 5,
    });

    // ✅ NEW: Add file URLs to sources
    const sourcesWithFiles = result.sources.map((source) => {
      const hasFile = source.type === "document" || source.type === "image";

      return {
        ...source,
        hasFile,
        fileUrl: hasFile
          ? `${req.protocol}://${req.get("host")}/files/preview/${source.id}`
          : null,
      };
    });

    res.status(200).json({
      success: true,
      answer: result.answer,
      sources: sourcesWithFiles,
      confidence: result.confidence,
      contentCount: result.contentCount,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("[Controller] AI Q&A error:", error);
    next(error);
  }
};

/**
 * Get Q&A statistics
 * GET /ai/qa/stats
 */
export const getQAStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // TODO: Implement Q&A statistics
    // For now, return basic stats
    const stats = {
      totalQuestions: 0,
      averageConfidence: 0,
      mostQueriedTags: [],
      lastAsked: null,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
