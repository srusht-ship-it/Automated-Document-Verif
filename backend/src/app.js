import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";
import { syncModels } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import verificationRoutes from "./routes/verification.js";
import blockchainRoutes from "./routes/blockchain.js";
import analyticsRoutes from "./routes/analytics.js";
import twoFactorRoutes from "./routes/twoFactor.js";
import { ipWhitelist, apiRateLimit, xssProtection } from "./middleware/security.js";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(xssProtection);
app.use(ipWhitelist);

// Rate limiting
app.use("/api/", apiRateLimit);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document Verification System API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/2fa", twoFactorRoutes);

// Init DB
const initializeDatabase = async () => {
  try {
    await syncModels();
    console.log("✅ Database models synchronized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
};
initializeDatabase();

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app; // ✅ important
