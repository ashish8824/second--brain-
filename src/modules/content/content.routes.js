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
import { uploadToS3 } from "../../config/s3.config.js"; // ✅ Import S3 upload
import { uploadImage, uploadPDF } from "./fileUpload.controller.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// ✅ UPLOAD ROUTES (must be before /:id routes)
router.post(
  "/upload/pdf",
  uploadToS3.single("file"), // ✅ Use S3 upload
  uploadPDF,
);

router.post(
  "/upload/image",
  uploadToS3.single("file"), // ✅ Use S3 upload
  uploadImage,
);

// ✅ CREATE FROM URL (must be before /:id routes)
router.post("/from-url", validate(createFromURLSchema), createFromURL);

// Standard CRUD routes
router.post("/", validate(createContentSchema), create);
router.get("/", list);
router.get("/search", search);

// ✅ UPDATE CONTENT
router.put(
  "/:id",
  validateObjectId("id"),
  validate(updateContentSchema),
  update,
);

// ✅ DELETE CONTENT
router.delete("/:id", validateObjectId("id"), remove);

// ✅ COLLECTION ASSIGNMENT
router.put(
  "/:contentId/collections/:collectionId",
  validateObjectId("contentId"),
  validateObjectId("collectionId"),
  addToCollection,
);

// ✅ GET CONTENT INSIDE A COLLECTION
router.get("/:id/content", validateObjectId("id"), getCollectionContent);

// ✅ GET SINGLE CONTENT (must be last)
router.get("/:id", validateObjectId("id"), getOne);

export default router;
