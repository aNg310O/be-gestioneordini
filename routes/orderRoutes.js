const express = require("express");
const {
  createOrder,
  getOrdersByDate,
  deleteOrder,
} = require("../controllers/orderController");
const {
  verifyToken,
  checkOrderTime,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, checkOrderTime, createOrder);
router.get("/by-date", verifyToken, getOrdersByDate);
router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
