import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateObjectId from "../../middlewares/validateObjectId.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createCollectionSchema,
  updateCollectionSchema,
} from "./collection.validation.js";

import {
  create,
  list,
  update,
  remove,
  getCollectionContent,
} from "./collection.controller.js";
import validateOwnership from "../../middlewares/ownership.middleware.js";
import Collection from "../../models/collection.model.js";

const router = express.Router();

// 🔐 Protect all collection routes
router.use(authMiddleware);

// 📁 Collections
router.post("/", validate(createCollectionSchema), create);
router.get("/", list);
router.put(
  "/:id",
  validateObjectId("id"),
  validateOwnership(Collection, "id"),
  validate(updateCollectionSchema),
  update,
);
router.delete(
  "/:id",
  validateObjectId("id"),
  validateOwnership(Collection, "id"),
  remove,
);

// 📄 Content inside a collection
router.get(
  "/:id/content",
  validateObjectId("id"),
  validateOwnership(Collection, "id"),
  getCollectionContent,
);

export default router;
