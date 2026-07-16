const express = require('express');
const router = express.Router();

const controller = require('../controller/shippingController');

router.post('/', controller.createShipment);
router.patch("/:id/status",controller.updateShipmentStatus);
router.get("/:id/history",controller.getShipmentHistory);
router.get("/:id/items",controller.getShipmentItems);
router.post("/:shipmentId/items",controller.addShipmentItem);
router.get("/stats",controller.getShippingStats);
router.get("/order/:orderId",controller.getShipmentByOrderId);
router.get("/tracking/:trackingCode",controller.getShipmentByTracking);
router.get("/:id",controller.getShipmentById);
router.get("/",controller.getShipments);

module.exports = router;