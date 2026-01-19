/**
 * Zod validation middleware (PRODUCTION SAFE)
 */
const validate = (schema) => (req, res, next) => {
  // guard against wrong usage
  if (!schema || typeof schema.safeParse !== "function") {
    console.error("❌ Validation schema missing or invalid:", schema);
    return res.status(500).json({
      success: false,
      message: "Validation schema missing or invalid",
    });
  }

  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
        errors: result.error.issues, // Include all validation errors
      });
    }

    // overwrite body with validated data
    req.body = result.data;
    next();
  } catch (error) {
    console.error("❌ Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation failed",
      error: error.message,
    });
  }
};

export default validate;
