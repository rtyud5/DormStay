const express = require("express");
const cors = require("cors");

const env = require("./src/config/env");
const routes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Backend is running at http://localhost:${env.PORT}`);
});
