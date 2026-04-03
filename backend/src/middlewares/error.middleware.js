function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    errors: error.details || null,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
