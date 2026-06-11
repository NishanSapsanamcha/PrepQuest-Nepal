import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false
    });

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    throw error;
  }
};

export { sequelize, testDatabaseConnection };
