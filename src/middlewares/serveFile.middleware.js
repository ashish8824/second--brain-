import path from "path";
import fs from "fs/promises";
import ApiError from "../utils/apiError.js";

/**
 * Serve uploaded files securely
 * Only allows authenticated users to access their own files
 */
export const serveFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const userId = req.user.userId;

    // Construct file path
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new ApiError(404, "File not found");
    }

    // Verify user owns this file by checking database
    const Content = (await import("../models/content.model.js")).default;

    const content = await Content.findOne({
      userId,
      $or: [
        { "metadata.filePath": { $regex: filename } },
        { "metadata.originalPath": { $regex: filename } },
      ],
      isDeleted: false,
    });

    if (!content) {
      throw new ApiError(403, "Access denied to this file");
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Set headers
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${content.title}${ext}"`,
    );

    // Stream the file
    const fileStream = await fs.readFile(filePath);
    res.send(fileStream);
  } catch (error) {
    next(error);
  }
};
