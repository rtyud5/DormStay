class AppError extends Error {
  constructor(message = "Application error", statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  AppError,
};
