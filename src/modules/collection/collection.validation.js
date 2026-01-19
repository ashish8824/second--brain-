import { z } from "zod";

/**
 * Create collection validation
 */
export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name too long"),
  description: z.string().max(300).optional(),
});

/**
 * Update collection validation
 */
export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
});
