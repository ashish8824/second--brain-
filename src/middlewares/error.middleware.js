/**
 * Global error handler (PRODUCTION READY)
 */
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  const statusCode = err.statusCode || 400;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

export default errorHandler;
