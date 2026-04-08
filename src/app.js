import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import { AppError } from "./utils/errors.js";

const app = express();

const allowedOrigins = env.allowedOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blockiert Origin: ${origin}`));
    },
    credentials: false
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    name: "Faith Driven Backend API"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route nicht gefunden"
  });
});

app.use((error, req, res, next) => {
  console.error("API Fehler:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  return res.status(500).json({
    message: "Interner Serverfehler"
  });
});

export default app;