import "dotenv/config";
import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`[BACKEND] Server running on port ${PORT}`);
      console.log(`[BACKEND] Database connected: ${process.env.DB_NAME}`);
      console.log(`[BACKEND] API link: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("[BACKEND] Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
