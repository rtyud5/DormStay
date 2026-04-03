function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = {
    id: "demo-user-001",
    email: "customer@example.com",
    role: "customer",
    token,
  };

  return next();
}

module.exports = authMiddleware;
