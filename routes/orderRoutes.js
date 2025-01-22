const express = require("express");
const {
  createOrder,
  getOrdersByDate,
  deleteOrder,
  getOrderCutoffHour,
  updateOrderCutoffHour,
  getOrderTotalsByDate,
  getOrderTotalsByMonth,
  getAvailableMonths,
} = require("../controllers/orderController");
const {
  verifyToken,
  checkOrderTime,
  isAdmin,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, checkOrderTime, createOrder);
router.get("/by-date", verifyToken, getOrdersByDate);
router.delete("/:id", verifyToken, deleteOrder);
router.get("/order-cutoff-hour", verifyToken, getOrderCutoffHour);
router.put("/order-cutoff-hour", verifyToken, isAdmin, updateOrderCutoffHour);
router.get("/totals-by-date", verifyToken, isAdmin, getOrderTotalsByDate);
router.get("/totals-by-month", verifyToken, isAdmin, getOrderTotalsByMonth);
router.get("/available-months", verifyToken, isAdmin, getAvailableMonths);

module.exports = router;
