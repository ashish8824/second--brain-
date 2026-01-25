import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedDocTypes = ["application/pdf"];

  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`),
      false,
    );
  }
};

// Configure Multer S3 Storage
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private",
    metadata: (req, file, cb) => {
      console.log("📋 [S3] Setting metadata for:", file.originalname);
      cb(null, {
        fieldName: file.fieldname,
        userId: req.user?.userId || "anonymous",
        uploadDate: new Date().toISOString(),
      });
    },
    key: (req, file, cb) => {
      const folder = file.mimetype.startsWith("image/") ? "images" : "pdfs";
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const fileName = `${folder}/${uniqueSuffix}-${nameWithoutExt}${ext}`;

      console.log(`📤 [S3] Preparing upload:`);
      console.log(`   Original: ${file.originalname}`);
      console.log(`   S3 Key: ${fileName}`);
      console.log(`   Bucket: ${process.env.S3_BUCKET_NAME}`);
      console.log(`   Region: ${process.env.AWS_REGION}`);

      cb(null, fileName);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * Generate a signed URL for private S3 objects
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export async function generateSignedUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`🔗 [S3] Generated signed URL for: ${key}`);
    return url;
  } catch (error) {
    console.error("❌ [S3] Error generating signed URL:", error);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
export async function deleteFromS3(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`🗑️ [S3] Deleted: ${key}`);
  } catch (error) {
    console.error("❌ [S3] Error deleting file:", error);
    throw error;
  }
}

/**
 * Get file URL (for public access - if you change ACL to public)
 * @param {string} key - S3 object key
 * @returns {string} Public URL
 */
export function getPublicUrl(key) {
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export default s3Client;
