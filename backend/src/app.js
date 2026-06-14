// Express Application Setup
// Configures middleware stack, routes, CORS, error handling
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Initialize Express application
const app = express();

// Middleware Stack Configuration

// Parse incoming JSON request bodies with size limit
app.use(express.json());

// Enable CORS - Allow requests from frontend with credentials
// Frontend URL from environment or default to Vite dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true  // Allow cookies in cross-origin requests
  })
);

// HTTP request logger - Shows method, URL, status, response time
app.use(morgan("dev"));

// Parse cookies from request headers
// Extracts auth tokens and session cookies
app.use(cookieParser());

// API Routes Configuration

// Authentication endpoints - login, register, password reset
app.use("/api/auth", authRoutes);

// Health check endpoint - verifies API is running
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PrepQuest Nepal API is running"
  });
});

// Error Handling Middleware

// Catch 404 - Route not found middleware
app.use(notFound);

// Global error handler - Catches and formats all errors
app.use(errorHandler);

// Export configured Express application
export default app;
