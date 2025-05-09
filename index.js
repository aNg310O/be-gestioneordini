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
const path = require("path");
const cluster = require("cluster");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const numCPUs = isProduction ? os.cpus().length : 1;

// Configurazioni
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 100;
const BODY_PARSER_LIMIT = "10kb";
process.env.TZ = "UTC"; // Forza UTC in Node.js

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
    hsts: isProduction,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
  })
);

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = [
  "http://localhost:5173",
  process.env.ALLOWED_ORIGINS || "https://fe-gestioneordini.onrender.com",
];

if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes(",")) {
  const origins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim()
  );
  allowedOrigins.push(...origins);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Abilita pre-flight per tutte le route
// Middleware di compressione con filtro
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 0,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: BODY_PARSER_LIMIT }));
app.use(bodyParser.urlencoded({ extended: true, limit: BODY_PARSER_LIMIT }));
app.use(limiter);

// Log middleware
app.use(logMiddleware);

// Trust proxy per quando dietro a un load balancer/reverse proxy
if (isProduction) {
  app.set("trust proxy", 1);
}

// Cache-Control middleware per risposte statiche
app.use((req, res, next) => {
  if (isProduction && req.method === "GET") {
    res.set("Cache-Control", "public, max-age=3600");
  }
  next();
});

// Error logging middleware
//app.use(errorLogMiddleware);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Error handling
//app.use(errorHandler);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Serve static files in produzione
if (isProduction) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

// Middleware di gestione errori
app.use(errorLogMiddleware);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    if (cluster.isMaster && isProduction) {
      console.log(`Master ${process.pid} is running`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
      });
    } else {
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT} - Worker ${process.pid}`);
      });
      // Salva il riferimento al server nell'app Express
      app.set("server", server);
    }
  } catch (err) {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  }
};

const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");

  const shutdownTimeout = setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);

  // Ottieni il server HTTP dall'app Express
  const server = app.get("server");

  if (server) {
    server.close(() => {
      clearTimeout(shutdownTimeout);
      sequelize.close().then(() => {
        console.log("Process terminated!");
        process.exit(0);
      });
    });
  } else {
    sequelize.close().then(() => {
      console.log("Process terminated!");
      process.exit(0);
    });
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Avvia il server
startServer();
