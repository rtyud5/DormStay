const express = require("express");
const cors = require("cors");

const env = require("./src/config/env");
const { checkConnection } = require("./src/config/supabase");
const routes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

// Allow all localhost origins in development (Vite may use 5173 or 5174)
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
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

app.listen(env.PORT, async () => {
  console.log(`Backend is running at http://localhost:${env.PORT}`);
  await checkConnection();
});
