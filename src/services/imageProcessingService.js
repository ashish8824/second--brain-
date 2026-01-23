import sharp from "sharp";
import Tesseract from "tesseract.js";
import fs from "fs/promises";
import path from "path";
import ApiError from "../utils/apiError.js";

/**
 * Image Processing Service
 * Handles image optimization and OCR text extraction
 */
class ImageProcessingService {
  /**
   * Process image: optimize and extract text (OCR)
   * @param {string} filePath - Path to image file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processed image data
   */
  async processImage(filePath, options = {}) {
    try {
      console.log("[Image] Processing file:", filePath);

      const { extractText = true, optimize = true } = options;

      // Get image metadata
      const metadata = await this.getImageMetadata(filePath);

      // Optimize image if requested
      let optimizedPath = filePath;
      if (optimize) {
        optimizedPath = await this.optimizeImage(filePath);
      }

      // Extract text using OCR if requested
      let extractedText = "";
      let ocrConfidence = 0;

      if (extractText) {
        const ocrResult = await this.extractTextFromImage(filePath);
        extractedText = ocrResult.text;
        ocrConfidence = ocrResult.confidence;
      }

      const result = {
        originalPath: filePath,
        optimizedPath: optimizedPath !== filePath ? optimizedPath : null,
        metadata: metadata,
        extractedText: extractedText,
        ocrConfidence: ocrConfidence,
        hasText: extractedText.length > 0,
        wordCount: extractedText.split(/\s+/).filter((w) => w.length > 0)
          .length,
        processedAt: new Date(),
      };

      console.log(
        `[Image] Processed: ${metadata.width}x${metadata.height}, extracted ${result.wordCount} words`,
      );

      return result;
    } catch (error) {
      console.error("[Image] Processing error:", error.message);
      throw new ApiError(500, `Failed to process image: ${error.message}`);
    }
  }

  /**
   * Get image metadata
   * @param {string} filePath - Path to image
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageMetadata(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: (await fs.stat(filePath)).size,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        colorSpace: metadata.space,
      };
    } catch (error) {
      throw new Error(`Failed to read image metadata: ${error.message}`);
    }
  }

  /**
   * Optimize image (compress and resize if needed)
   * @param {string} filePath - Path to original image
   * @returns {Promise<string>} - Path to optimized image
   */
  async optimizeImage(filePath) {
    try {
      const ext = path.extname(filePath);
      const optimizedPath = filePath.replace(ext, `-optimized${ext}`);

      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Resize if image is too large
      if (metadata.width > 2000 || metadata.height > 2000) {
        image.resize(2000, 2000, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Compress based on format
      if (metadata.format === "jpeg" || metadata.format === "jpg") {
        image.jpeg({ quality: 85, progressive: true });
      } else if (metadata.format === "png") {
        image.png({ compressionLevel: 9 });
      } else if (metadata.format === "webp") {
        image.webp({ quality: 85 });
      }

      await image.toFile(optimizedPath);

      console.log("[Image] Optimized image saved:", optimizedPath);

      return optimizedPath;
    } catch (error) {
      console.error("[Image] Optimization error:", error.message);
      return filePath; // Return original if optimization fails
    }
  }

  /**
   * Extract text from image using OCR
   * @param {string} filePath - Path to image
   * @returns {Promise<Object>} - Extracted text and confidence
   */
  async extractTextFromImage(filePath) {
    try {
      console.log("[OCR] Extracting text from image...");

      const result = await Tesseract.recognize(filePath, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      console.log(
        `[OCR] Extracted ${text.length} characters with ${confidence.toFixed(2)}% confidence`,
      );

      return {
        text: text,
        confidence: confidence,
        lines: result.data.lines.length,
      };
    } catch (error) {
      console.error("[OCR] Extraction error:", error.message);
      return {
        text: "",
        confidence: 0,
        lines: 0,
      };
    }
  }

  /**
   * Create thumbnail
   * @param {string} filePath - Path to original image
   * @param {number} size - Thumbnail size
   * @returns {Promise<string>} - Path to thumbnail
   */
  async createThumbnail(filePath, size = 300) {
    try {
      const ext = path.extname(filePath);
      const thumbnailPath = filePath.replace(ext, `-thumb${ext}`);

      await sharp(filePath)
        .resize(size, size, {
          fit: "cover",
          position: "center",
        })
        .toFile(thumbnailPath);

      console.log("[Image] Thumbnail created:", thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error("[Image] Thumbnail creation error:", error.message);
      throw error;
    }
  }

  /**
   * Delete file after processing
   * @param {string} filePath - Path to file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log("[Image] Deleted file:", filePath);
    } catch (error) {
      console.error("[Image] Error deleting file:", error.message);
    }
  }

  /**
   * Delete multiple files
   * @param {string[]} filePaths - Array of file paths
   */
  async deleteFiles(filePaths) {
    for (const filePath of filePaths) {
      if (filePath) {
        await this.deleteFile(filePath);
      }
    }
  }
}

export default new ImageProcessingService();
