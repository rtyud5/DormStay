const express = require("express");
const cors = require("cors");

const env = require("./src/config/env");
const { checkConnection } = require("./src/config/supabase");
const routes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const isDevelopment = env.NODE_ENV === "development";

    if (!origin) {
      return callback(null, true);
    }

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, "");
    const normalizedFrontendUrl = env.FRONTEND_URL ? env.FRONTEND_URL.replace(/\/$/, "") : "";

    // List of allowed origins - including working versions from old files
    const allowedOrigins = [
      normalizedFrontendUrl,
      "https://dorm-stay.vercel.app",
      "https://dormstay.vercel.app"
    ];

    // Check development localhost
    if (isDevelopment && /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Check against allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked for origin: ${origin}`);
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

// Dual-route support: handle both /api/* and /* for maximum compatibility
app.use("/api", routes);
app.use("/", routes); 

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, async () => {
  console.log(`Backend is running at http://localhost:${env.PORT}`);
  await checkConnection();
});
