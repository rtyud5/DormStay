const express = require("express");
const cors = require("cors");

const env = require("./src/config/env");
const { checkConnection } = require("./src/config/supabase");
const routes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Check if we are in development mode
    const isDevelopment = env.NODE_ENV === "development";

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow any localhost port
    if (isDevelopment && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // In production, follow the FRONTEND_URL from .env
    if (origin === env.FRONTEND_URL) {
      return callback(null, true);
    }

    // Otherwise, deny the request
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
