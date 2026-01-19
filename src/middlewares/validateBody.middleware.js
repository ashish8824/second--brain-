/**
 * Zod body validation middleware (HARD SAFE)
 */
const validateBody = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== "function") {
    return res.status(500).json({
      success: false,
      message: "Validation schema missing or invalid",
    });
  }

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues[0].message,
    });
  }

  req.body = result.data;
  next();
};

export default validateBody;
