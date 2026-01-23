import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import validateObjectId from "../../middlewares/validateObjectId.js";
import {
  createShareSchema,
  updateShareSchema,
  accessShareSchema,
} from "./share.validation.js";

import {
  createContentShare,
  createCollectionShare,
  getSharedContent,
  getSharedCollection,
  getMyShares,
  updateShare,
  revokeShare,
  deleteShare,
  getShareAnalytics,
} from "./share.controller.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

/**
 * GET /shared/content/:token
 * Access shared content
 */
router.post("/content/:token", validate(accessShareSchema), getSharedContent);

/**
 * GET /shared/collection/:token
 * Access shared collection
 */
router.post(
  "/collection/:token",
  validate(accessShareSchema),
  getSharedCollection,
);

// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================

router.use(authMiddleware);

/**
 * POST /share/content/:contentId
 * Create share link for content
 */
router.post(
  "/content/:contentId",
  validateObjectId("contentId"),
  validate(createShareSchema),
  createContentShare,
);

/**
 * POST /share/collection/:collectionId
 * Create share link for collection
 */
router.post(
  "/collection/:collectionId",
  validateObjectId("collectionId"),
  validate(createShareSchema),
  createCollectionShare,
);

/**
 * GET /share/my-shares
 * Get all user's shares
 */
router.get("/my-shares", getMyShares);

/**
 * PUT /share/:shareId
 * Update share settings
 */
router.put(
  "/:shareId",
  validateObjectId("shareId"),
  validate(updateShareSchema),
  updateShare,
);

/**
 * POST /share/:shareId/revoke
 * Revoke share link
 */
router.post("/:shareId/revoke", validateObjectId("shareId"), revokeShare);

/**
 * DELETE /share/:shareId
 * Delete share permanently
 */
router.delete("/:shareId", validateObjectId("shareId"), deleteShare);

/**
 * GET /share/:shareId/analytics
 * Get share analytics
 */
router.get(
  "/:shareId/analytics",
  validateObjectId("shareId"),
  getShareAnalytics,
);

export default router;
