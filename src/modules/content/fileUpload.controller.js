import pdfProcessingService from "../../services/pdfProcessingService.js";
import imageProcessingService from "../../services/imageProcessingService.js";
import groqSummaryService from "../../services/groqSummaryService.js";
import aiSummaryService from "../../services/aiSummaryService.js";
import Content from "../../models/content.model.js";
import crypto from "crypto";

/**
 * Upload and process PDF file
 * POST /content/upload/pdf
 */
export const uploadPDF = async (req, res, next) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;
    const userId = req.user.userId;
    const { tags: userTags, title: userTitle } = req.body;

    console.log("[Controller] Processing PDF upload:", req.file.originalname);

    // Step 1: Extract text from PDF
    const pdfData = await pdfProcessingService.extractFromPDF(filePath);

    // Step 2: Generate AI summary
    let aiSummary;
    const scrapedData = {
      title: userTitle || pdfData.metadata.title,
      content: pdfData.text,
      description: "",
      url: null,
    };

    try {
      if (process.env.GROQ_API_KEY) {
        aiSummary =
          await groqSummaryService.generateCompleteSummary(scrapedData);
      } else {
        aiSummary = await aiSummaryService.generateCompleteSummary(scrapedData);
      }
    } catch (error) {
      console.error("[Controller] AI summary failed, using fallback");
      aiSummary = {
        summary: pdfData.text.substring(0, 300) + "...",
        keyPoints: [],
        tags: [],
        isFallback: true,
      };
    }

    // Step 3: Combine tags
    const allTags = [
      ...new Set([
        ...(aiSummary.tags || []),
        ...(userTags ? userTags.split(",").map((t) => t.trim()) : []),
        "pdf",
      ]),
    ].slice(0, 10);

    // Step 4: Generate content hash
    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "document",
          title: scrapedData.title,
          text: pdfData.text.substring(0, 1000),
        }),
      )
      .digest("hex");

    // Step 5: Save to database
    const content = await Content.create({
      userId,
      type: "document",
      title: scrapedData.title,
      body: pdfData.text.substring(0, 10000), // Store first 10k chars
      summary: aiSummary.summary,
      keyPoints: aiSummary.keyPoints,
      tags: allTags,
      contentHash,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        filePath: filePath,
        mimeType: req.file.mimetype,
        ...pdfData.metadata,
        numPages: pdfData.numPages,
        wordCount: pdfData.wordCount,
        processedAt: pdfData.extractedAt,
        summarizedAt: aiSummary.generatedAt,
        isFallbackSummary: aiSummary.isFallback || false,
        aiModel: aiSummary.model,
      },
    });

    console.log(`[Controller] PDF content saved: ${content._id}`);

    res.status(201).json({
      success: true,
      message: "PDF processed successfully",
      data: {
        id: content._id,
        title: content.title,
        summary: content.summary,
        keyPoints: content.keyPoints,
        tags: content.tags,
        numPages: pdfData.numPages,
        wordCount: pdfData.wordCount,
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (filePath) {
      await pdfProcessingService.deleteFile(filePath).catch(() => {});
    }
    next(error);
  }
};

/**
 * Upload and process image file
 * POST /content/upload/image
 */
export const uploadImage = async (req, res, next) => {
  let filePath = null;
  let optimizedPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;
    const userId = req.user.userId;
    const { tags: userTags, title: userTitle, extractText } = req.body;

    console.log("[Controller] Processing image upload:", req.file.originalname);

    // Step 1: Process image (optimize + OCR)
    const imageData = await imageProcessingService.processImage(filePath, {
      extractText: extractText !== "false", // Extract text by default
      optimize: true,
    });

    optimizedPath = imageData.optimizedPath;

    // Step 2: Generate AI summary if text was extracted
    let aiSummary = null;

    if (imageData.extractedText && imageData.extractedText.length > 50) {
      const scrapedData = {
        title: userTitle || req.file.originalname,
        content: imageData.extractedText,
        description: `Image with extracted text (${imageData.ocrConfidence.toFixed(0)}% confidence)`,
        url: null,
      };

      try {
        if (process.env.GROQ_API_KEY) {
          aiSummary =
            await groqSummaryService.generateCompleteSummary(scrapedData);
        } else {
          aiSummary =
            await aiSummaryService.generateCompleteSummary(scrapedData);
        }
      } catch (error) {
        console.error("[Controller] AI summary failed for image");
      }
    }

    // Step 3: Prepare tags
    const allTags = [
      ...new Set([
        ...(aiSummary?.tags || []),
        ...(userTags ? userTags.split(",").map((t) => t.trim()) : []),
        "image",
      ]),
    ].slice(0, 10);

    // Step 4: Generate content hash
    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "image",
          title: userTitle || req.file.originalname,
          fileName: req.file.originalname,
        }),
      )
      .digest("hex");

    // Step 5: Save to database
    const content = await Content.create({
      userId,
      type: "image",
      title: userTitle || req.file.originalname,
      body: imageData.extractedText || "",
      summary:
        aiSummary?.summary ||
        imageData.extractedText?.substring(0, 200) ||
        "Image uploaded",
      keyPoints: aiSummary?.keyPoints || [],
      tags: allTags,
      contentHash,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        filePath: optimizedPath || filePath,
        originalPath: filePath,
        mimeType: req.file.mimetype,
        ...imageData.metadata,
        ocrConfidence: imageData.ocrConfidence,
        hasExtractedText: imageData.hasText,
        wordCount: imageData.wordCount,
        processedAt: imageData.processedAt,
        summarizedAt: aiSummary?.generatedAt,
        isFallbackSummary: !aiSummary || aiSummary.isFallback,
        aiModel: aiSummary?.model,
      },
    });

    console.log(`[Controller] Image content saved: ${content._id}`);

    res.status(201).json({
      success: true,
      message: "Image processed successfully",
      data: {
        id: content._id,
        title: content.title,
        summary: content.summary,
        keyPoints: content.keyPoints,
        tags: content.tags,
        dimensions: `${imageData.metadata.width}x${imageData.metadata.height}`,
        hasText: imageData.hasText,
        wordCount: imageData.wordCount,
        ocrConfidence: imageData.ocrConfidence,
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (filePath) {
      await imageProcessingService.deleteFile(filePath).catch(() => {});
    }
    if (optimizedPath) {
      await imageProcessingService.deleteFile(optimizedPath).catch(() => {});
    }
    next(error);
  }
};
