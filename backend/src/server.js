// Server Initialization - Entry point for the backend application
// Handles database connection, server startup, and error handling
import "dotenv/config";
import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";
import { sequelize } from "./models/index.js";

// Server port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Async function to initialize and start the server
// Connects to database, syncs Sequelize models, and starts HTTP listener
const startServer = async () => {
  try {
    // Test database connectivity before starting server
    await testDatabaseConnection();
    
    // Synchronize Sequelize models with database schema
    // Creates tables if they don't exist (in development)
    await sequelize.sync();

    // Start HTTP server on specified PORT
    app.listen(PORT, () => {
      console.log(`[BACKEND] Server running on port ${PORT}`);
      console.log(`[BACKEND] Database connected: ${process.env.DB_NAME}`);
      console.log(`[BACKEND] API link: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    // Log database connection errors and exit process
    console.error("[BACKEND] Database connection failed:", error.message);
    process.exit(1);
  }
};

// Execute server startup
startServer();
