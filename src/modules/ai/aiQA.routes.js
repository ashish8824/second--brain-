import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { askQuestionSchema } from "./aiQA.validation.js";
import { askQuestion, getQAStats } from "./aiQA.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /ai/ask - Ask a question to your knowledge base
 */
router.post("/ask", validate(askQuestionSchema), askQuestion);

/**
 * GET /ai/qa/stats - Get Q&A statistics
 */
router.get("/qa/stats", getQAStats);

export default router;
