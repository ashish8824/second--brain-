import { z } from "zod";

/**
 * Create content schema
 */
export const createContentSchema = z.object({
  type: z.enum(["text", "link", "image", "document"]),
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(), // ✅ Fixed: use z.unknown() instead of z.any()
});

/**
 * Update Content Validation Schema
 * All fields OPTIONAL (PATCH-like behavior)
 */
export const updateContentSchema = z
  .object({
    title: z.string().max(200).optional(),
    body: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(), // ✅ Fixed
  })
  .partial();
