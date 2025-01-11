// routes/productRoutes.js
const express = require("express");
const { createProduct } = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isAdmin, createProduct);

module.exports = router;
