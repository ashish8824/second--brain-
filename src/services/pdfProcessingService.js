import fs from "fs/promises";
import path from "path";
import ApiError from "../utils/apiError.js";

/**
 * PDF Processing Service
 * Using pdf-parse v1.1.1 (stable, tested version)
 */
class PDFProcessingService {
  constructor() {
    this.pdfParse = null;
  }

  /**
   * Initialize pdf-parse v1.x
   */
  async initPdfParse() {
    if (this.pdfParse) {
      return this.pdfParse;
    }

    // Dynamic import for CommonJS module in ES modules
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);

    // pdf-parse v1.x exports a function directly
    this.pdfParse = require("pdf-parse");

    console.log("[PDF] pdf-parse v1.x loaded successfully");

    return this.pdfParse;
  }

  /**
   * Extract text and metadata from PDF
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<Object>} - Extracted data
   */
  async extractFromPDF(filePath) {
    try {
      console.log("[PDF] Processing file:", filePath);

      // Get pdf-parse function
      const pdfParse = await this.initPdfParse();

      // Read PDF file as buffer
      const dataBuffer = await fs.readFile(filePath);

      // Parse PDF - v1.x accepts buffer directly
      const data = await pdfParse(dataBuffer);

      // Extract and clean text
      const cleanedText = this.cleanText(data.text || "");

      // Build result object
      const result = {
        text: cleanedText,
        numPages: data.numpages || 0,
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
        metadata: {
          title: data.info?.Title || path.basename(filePath, ".pdf"),
          author: data.info?.Author || "",
          subject: data.info?.Subject || "",
          creator: data.info?.Creator || "",
          producer: data.info?.Producer || "",
          creationDate: data.info?.CreationDate || null,
          modificationDate: data.info?.ModDate || null,
        },
        extractedAt: new Date(),
      };

      console.log(
        `[PDF] ✅ Successfully extracted ${result.wordCount} words from ${result.numPages} pages`,
      );

      return result;
    } catch (error) {
      console.error("[PDF] ❌ Processing error:", error.message);
      throw new ApiError(500, `Failed to process PDF: ${error.message}`);
    }
  }

  /**
   * Clean extracted text
   * Removes extra whitespace and formatting artifacts
   */
  cleanText(text) {
    if (!text) return "";

    return (
      text
        // Replace multiple spaces with single space
        .replace(/\s+/g, " ")
        // Replace more than 2 newlines with exactly 2
        .replace(/\n{3,}/g, "\n\n")
        // Remove standalone page numbers
        .replace(/\n\s*\d+\s*\n/g, "\n")
        // Remove repeated lines (headers/footers)
        .replace(/(.{20,})\n(?:\1\n)+/g, "$1\n")
        // Trim whitespace
        .trim()
    );
  }

  /**
   * Extract preview text (first N pages worth)
   */
  extractPreview(text, pages = 3) {
    const wordsPerPage = 500;
    const words = text.split(/\s+/).slice(0, wordsPerPage * pages);
    return words.length > 0 ? words.join(" ") + "..." : "";
  }

  /**
   * Simple language detection
   */
  detectLanguage(text) {
    const englishWords = ["the", "is", "at", "which", "on", "and", "a", "an"];
    const sample = text.toLowerCase().split(/\s+/).slice(0, 100);
    const matches = sample.filter((w) => englishWords.includes(w)).length;
    return matches > 5 ? "en" : "unknown";
  }

  /**
   * Delete file safely
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log("[PDF] Deleted file:", filePath);
    } catch (error) {
      console.error("[PDF] Error deleting file:", error.message);
    }
  }
}

export default new PDFProcessingService();
