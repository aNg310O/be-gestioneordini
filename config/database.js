require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectModule: pg,
    timezone: "+00:00",
    logging: false, // Disabilita i log delle query se non necessari
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      useUTC: true,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    },
  }
);

module.exports = sequelize;
