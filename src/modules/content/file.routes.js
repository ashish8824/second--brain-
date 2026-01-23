import express from "express";
import path from "path";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { serveFile } from "../../middlewares/serveFile.middleware.js";
import Content from "../../models/content.model.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /files/view/:filename
 */
router.get("/view/:filename", serveFile);

/**
 * GET /files/download/:contentId
 */
router.get("/download/:contentId", async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;

    const content = await Content.findOne({
      _id: contentId,
      userId,
      isDeleted: false,
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const filePath =
      content.metadata?.filePath || content.metadata?.originalPath;

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: "File not found for this content",
      });
    }

    res.download(filePath, content.metadata.fileName, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /files/preview/:contentId
 */
router.get("/preview/:contentId", async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;

    const content = await Content.findOne({
      _id: contentId,
      userId,
      isDeleted: false,
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const filePath =
      content.metadata?.filePath || content.metadata?.originalPath;

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: "No file attached to this content",
      });
    }

    const filename = path.basename(filePath);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      data: {
        contentId: content._id,
        title: content.title,
        type: content.type,
        fileUrl: `${baseUrl}/files/view/${filename}`,
        downloadUrl: `${baseUrl}/files/download/${contentId}`,
        fileName: content.metadata.fileName,
        fileSize: content.metadata.fileSize,
        mimeType: content.metadata.mimeType,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
