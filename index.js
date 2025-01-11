const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize } = require("./models");
const errorHandler = require("./middlewares/errorHandler");
const {
  logMiddleware,
  errorLogMiddleware,
} = require("./middlewares/logMiddleware");
const { verifyToken } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

// Log middleware
app.use(logMiddleware);

// Error logging middleware
app.use(errorLogMiddleware);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/logs", verifyToken, require("./routes/logRoutes"));

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  app.close(() => {
    console.log("Process terminated!");
    sequelize.close();
  });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  });
