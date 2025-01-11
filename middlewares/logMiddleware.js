const { log } = require("../models");
const moment = require("moment-timezone");

const logMiddleware = async (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", async () => {
    const duration = process.hrtime(start);
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6;

    try {
      const { method, originalUrl, user } = req;
      const username = user ? user.username : "anonymous";
      const statusCode = res.statusCode;
      const currentTime = moment()
        .tz("Europe/Rome")
        .format("YYYY-MM-DD HH:mm:ss");

      await log.create({
        severity: "info",
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
    const duration = process.hrtime(start);
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6;
    const currentTime = moment()
      .tz("Europe/Rome")
      .format("YYYY-MM-DD HH:mm:ss");

    try {
      const { method, originalUrl, user } = req;
      const username = user ? user.username : "anonymous";
      const statusCode = res.statusCode;

      await log.create({
        severity: "error",
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
