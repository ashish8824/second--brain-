import { z } from "zod";

/**
 * Schema for creating a share
 */
export const createShareSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),

  isPublic: z.boolean().optional().default(true),

  expiresInDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .describe("Number of days until expiration (1-365)"),

  password: z
    .string()
    .min(4)
    .max(50)
    .optional()
    .describe("Password protect the share link"),

  allowedEmails: z
    .array(z.string().email())
    .max(50)
    .optional()
    .describe("Whitelist of emails that can access"),
});

/**
 * Schema for updating a share
 */
export const updateShareSchema = z
  .object({
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
    password: z.string().min(4).max(50).optional().nullable(),
    allowedEmails: z.array(z.string().email()).max(50).optional(),
  })
  .partial();

/**
 * Schema for accessing a share
 */
export const accessShareSchema = z
  .object({
    password: z.string().optional(),
    email: z.string().email().optional(),
  })
  .partial();
