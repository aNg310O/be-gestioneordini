// routes/productRoutes.js
const express = require("express");
const {
  createProduct,
  getAllProducts,
  disableProduct,
  enableProduct,
} = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isAdmin, createProduct);
router.get("/", verifyToken, isAdmin, getAllProducts);
router.put("/:id/disable", verifyToken, isAdmin, disableProduct);
router.put("/:id/enable", verifyToken, isAdmin, enableProduct);

module.exports = router;
