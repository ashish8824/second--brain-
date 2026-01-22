import { z } from "zod";

/**
 * Validation schema for asking questions
 */
export const askQuestionSchema = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question must be less than 500 characters")
    .trim(),

  tags: z.array(z.string()).optional().describe("Filter results by tags"),

  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Maximum number of sources to use (1-10)"),
});
