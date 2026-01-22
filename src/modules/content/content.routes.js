import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createContentSchema,
  createFromURLSchema,
  updateContentSchema,
} from "./content.validation.js";

import {
  create,
  list,
  getOne,
  update,
  remove,
  search,
  addToCollection,
  getCollectionContent,
  createFromURL,
} from "./content.controller.js";
import validateObjectId from "../../middlewares/validateObjectId.js";
import validateOwnership from "../../middlewares/ownership.middleware.js";
import Content from "../../models/content.model.js";

const router = express.Router();

// all routes are protected
router.use(authMiddleware);

router.post("/", validate(createContentSchema), create);
router.get("/", list);
router.get("/search", search);
router.get("/:id", getOne);
// router.put("/:id", validate(updateContentSchema), update);
router.delete("/:id", remove);

// ✅ UPDATE CONTENT
router.put(
  "/:id",
  validateObjectId("id"),
  validate(updateContentSchema),
  update,
);

// ✅ COLLECTION ASSIGNMENT (must be before :id)
router.put(
  "/:contentId/collections/:collectionId",
  validateObjectId("contentId"),
  validateObjectId("collectionId"),
  addToCollection,
);

// ✅ GET CONTENT INSIDE A COLLECTION
router.get("/:id/content", validateObjectId("id"), getCollectionContent);

// ✅ NEW ROUTE: Create from URL (must be before /:id routes)
router.post("/from-url", validate(createFromURLSchema), createFromURL);

export default router;
