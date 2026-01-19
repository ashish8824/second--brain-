import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateObjectId from "../../middlewares/validateObjectId.js";
import { generateEmbedding } from "./embedding.controller.js";
import { search } from "./semanticSearch.controller.js";

const router = express.Router();

router.use(authMiddleware);

// 🔹 Generate embedding for content
router.post(
  "/content/:contentId/embedding",
  validateObjectId("contentId"),
  generateEmbedding,
);

// 🔍 Semantic search
router.get("/semantic-search", search);

export default router;
