const { log } = require("../models");
const moment = require("moment-timezone");

const excludedRoutes = ["/api/users/login", "/api/logs", "/metrics", "/health"];

const logMiddleware = async (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", async () => {
    function getSeverityFromStatusCode(statusCode) {
      if (statusCode >= 500) {
        return "error"; // Server errors (5xx)
      } else if (statusCode >= 400) {
        return "warning"; // Client errors (4xx)
      } else if (statusCode >= 300) {
        return "info"; // Redirects (3xx)
      } else if (statusCode >= 200) {
        return "success"; // Success (2xx)
      } else {
        return "info"; // Other cases (1xx)
      }
    }

    const duration = process.hrtime(start);
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6;

    // Escludi le rotte specificate
    if (excludedRoutes.includes(req.originalUrl)) {
      return;
    }

    try {
      const { method, originalUrl, user } = req;
      const username = user ? user.username : "anonymous";
      const statusCode = res.statusCode;
      const currentTime = new Date();
      //moment()
      //  .tz("Europe/Rome")
      //  .format("YYYY-MM-DD HH:mm:ss");

      await log.create({
        severity: getSeverityFromStatusCode(statusCode),
        username,
        page: `${method} ${originalUrl}`,
        text: `RESPONSE: ${statusCode} - DURATION: ${durationInMs.toFixed(
          2
        )} ms`,
        created_at: currentTime,
      });
    } catch (error) {
      console.error("Errore durante la registrazione del log:", error);
    }
  });

  next();
};

const errorLogMiddleware = async (err, req, res, next) => {
  const start = process.hrtime();

  res.on("finish", async () => {
    function getSeverityFromStatusCode(statusCode) {
      if (statusCode >= 500) {
        return "error"; // Server errors (5xx)
      } else if (statusCode >= 400) {
        return "warning"; // Client errors (4xx)
      } else if (statusCode >= 300) {
        return "info"; // Redirects (3xx)
      } else if (statusCode >= 200) {
        return "success"; // Success (2xx)
      } else {
        return "info"; // Other cases (1xx)
      }
    }

    const duration = process.hrtime(start);
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6;
    const currentTime = new Date();
    //moment()
    //  .tz("Europe/Rome")
    //  .format("YYYY-MM-DD HH:mm:ss");

    try {
      const { method, originalUrl, user } = req;
      const username = user ? user.username : "anonymous";
      const statusCode = res.statusCode;

      await log.create({
        severity: getSeverityFromStatusCode(statusCode),
        username,
        page: `${method} ${originalUrl}`,
        text: `RESPONSE: ${statusCode} - ${
          err.message
        } - ${durationInMs.toFixed(2)} ms`,
        created_at: currentTime,
      });
    } catch (error) {
      console.error(
        "Errore durante la registrazione del log di errore:",
        error
      );
    }
  });

  next(err);
};

module.exports = { logMiddleware, errorLogMiddleware };
