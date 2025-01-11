const express = require("express");
const {
  createLog,
  getLogs,
  getLogsByDate,
} = require("../controllers/logController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", createLog);
router.get("/", verifyToken, isAdmin, getLogs);
router.get("/by-date", verifyToken, isAdmin, getLogsByDate);

module.exports = router;
