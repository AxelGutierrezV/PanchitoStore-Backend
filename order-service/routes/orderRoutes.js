const express = require("express");
const router = express.Router();

const controller = require("../controllers/orderController");

router.post("/", controller.createOrder);
router.get("/", controller.getOrders);
router.post("/from-cart", controller.createOrderFromCart);
router.get("/stats",controller.getOrderStats);
router.patch("/:id/status",controller.updateOrderStatus);
router.get("/:id", controller.getOrderById);
module.exports = router;