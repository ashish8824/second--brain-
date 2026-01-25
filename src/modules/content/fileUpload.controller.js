import pdfProcessingService from "../../services/pdfProcessingService.js";
import imageProcessingService from "../../services/imageProcessingService.js";
import groqSummaryService from "../../services/groqSummaryService.js";
import aiSummaryService from "../../services/aiSummaryService.js";
import Content from "../../models/content.model.js";
import { deleteFromS3 } from "../../config/s3.config.js";
import crypto from "crypto";

/**
 * Upload and process PDF file to S3
 * POST /content/upload/pdf
 */
export const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    const userId = req.user.userId;
    const { tags: userTags, title: userTitle } = req.body;

    console.log("📄 [PDF Upload] File received:", {
      originalName: file.originalname,
      s3Key: file.key,
      size: file.size,
      bucket: file.bucket,
      location: file.location,
    });

    // TODO: Add PDF processing here (extract text, generate summary)
    // For now, we'll create a basic content entry

    // Generate content hash
    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "document",
          title: userTitle || file.originalname,
          s3Key: file.key,
        }),
      )
      .digest("hex");

    // Prepare tags
    const allTags = [
      ...(userTags ? userTags.split(",").map((t) => t.trim()) : []),
      "pdf",
      "document",
    ].slice(0, 10);

    // Create content in database
    const content = await Content.create({
      userId,
      type: "document",
      title: userTitle || file.originalname.replace(".pdf", ""),
      body: "", // Will be filled by PDF text extraction
      summary: "PDF uploaded successfully. Processing pending...",
      tags: allTags,
      contentHash,
      metadata: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key: file.key, // ✅ Store S3 key
        s3Bucket: file.bucket,
        s3Location: file.location,
        uploadDate: new Date(),
      },
    });

    console.log(`✅ [PDF Upload] Content created: ${content._id}`);

    res.status(201).json({
      success: true,
      message: "PDF uploaded successfully to S3",
      data: {
        id: content._id,
        title: content.title,
        type: content.type,
        s3Key: file.key,
        fileName: file.originalname,
        fileSize: file.size,
        tags: content.tags,
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    // Clean up S3 file on error
    if (req.file && req.file.key) {
      try {
        await deleteFromS3(req.file.key);
        console.log("🗑️ Cleaned up S3 file after error");
      } catch (deleteError) {
        console.error("❌ Failed to clean up S3 file:", deleteError);
      }
    }
    next(error);
  }
};

/**
 * Upload and process image file to S3
 * POST /content/upload/image
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const file = req.file;
    const userId = req.user.userId;
    const { tags: userTags, title: userTitle } = req.body;

    console.log("🖼️ [Image Upload] File received:", {
      originalName: file.originalname,
      s3Key: file.key,
      size: file.size,
      bucket: file.bucket,
      location: file.location,
    });

    // Generate content hash
    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "image",
          title: userTitle || file.originalname,
          s3Key: file.key,
        }),
      )
      .digest("hex");

    // Prepare tags
    const allTags = [
      ...(userTags ? userTags.split(",").map((t) => t.trim()) : []),
      "image",
    ].slice(0, 10);

    // Create content in database
    const content = await Content.create({
      userId,
      type: "image",
      title: userTitle || file.originalname,
      body: "",
      summary: "Image uploaded successfully. Processing pending...",
      tags: allTags,
      contentHash,
      metadata: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key: file.key, // ✅ Store S3 key
        s3Bucket: file.bucket,
        s3Location: file.location,
        uploadDate: new Date(),
      },
    });

    console.log(`✅ [Image Upload] Content created: ${content._id}`);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully to S3",
      data: {
        id: content._id,
        title: content.title,
        type: content.type,
        s3Key: file.key,
        fileName: file.originalname,
        fileSize: file.size,
        tags: content.tags,
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    // Clean up S3 file on error
    if (req.file && req.file.key) {
      try {
        await deleteFromS3(req.file.key);
        console.log("🗑️ Cleaned up S3 file after error");
      } catch (deleteError) {
        console.error("❌ Failed to clean up S3 file:", deleteError);
      }
    }
    next(error);
  }
};
