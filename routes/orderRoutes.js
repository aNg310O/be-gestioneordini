const express = require("express");
const {
  createOrder,
  getOrdersByDate,
  deleteOrder,
  getOrderCutoffHour,
  updateOrderCutoffHour,
  getOrderTotalsByDate,
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

module.exports = router;
