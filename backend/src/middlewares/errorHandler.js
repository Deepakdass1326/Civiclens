/**
 * Centralized error handler. Every controller uses express-async-handler,
 * so thrown errors (including validation errors) land here consistently
 * instead of each route needing its own try/catch.
 */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
