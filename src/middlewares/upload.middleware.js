import multer from "multer";
import path from "path";
import crypto from "crypto";
import ApiError from "../utils/apiError.js";

/**
 * File Upload Middleware
 * Handles PDF and image uploads with validation
 */

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store in uploads directory
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter - Accept only PDFs and images
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file type. Only PDF and images (JPEG, PNG, GIF, WebP) are allowed.",
      ),
      false,
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single("file");

// Middleware for multiple files upload
export const uploadMultiple = upload.array("files", 5); // Max 5 files

// Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  next(err);
};

export default upload;
