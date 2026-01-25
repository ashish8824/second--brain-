import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import Content from "../../models/content.model.js";
import { generateSignedUrl } from "../../config/s3.config.js"; // ✅ Import S3 helper

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /files/preview/:contentId
 * Get file preview with signed URL
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

    const s3Key = content.metadata?.s3Key;

    if (!s3Key) {
      return res.status(404).json({
        success: false,
        message: "No file attached to this content",
      });
    }

    // ✅ Generate signed URL (valid for 1 hour)
    const signedUrl = await generateSignedUrl(s3Key, 3600);

    res.json({
      success: true,
      data: {
        contentId: content._id,
        title: content.title,
        type: content.type,
        fileUrl: signedUrl, // ✅ S3 signed URL
        fileName: content.metadata.fileName,
        fileSize: content.metadata.fileSize,
        mimeType: content.metadata.mimeType,
        expiresIn: 3600, // 1 hour
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /files/download/:contentId
 * Generate download link (signed URL with content-disposition)
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

    const s3Key = content.metadata?.s3Key;

    if (!s3Key) {
      return res.status(404).json({
        success: false,
        message: "File not found for this content",
      });
    }

    // ✅ Generate signed URL for download
    const downloadUrl = await generateSignedUrl(s3Key, 3600);

    // Redirect to signed URL (browser will download)
    res.redirect(downloadUrl);
  } catch (error) {
    next(error);
  }
});

export default router;
