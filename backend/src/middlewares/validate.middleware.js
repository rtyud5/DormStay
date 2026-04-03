function validate(requiredFields = []) {
  return function validateRequest(req, res, next) {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: missingFields.map((field) => ({ field, message: `${field} is required` })),
      });
    }

    return next();
  };
}

module.exports = validate;
