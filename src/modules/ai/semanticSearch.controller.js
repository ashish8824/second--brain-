import { semanticSearch } from "./semanticSearch.service.js";

export const search = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const results = await semanticSearch(req.user.userId, q, Number(limit));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
