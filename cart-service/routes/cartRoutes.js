const express = require("express");
const router = express.Router();

const controller = require("../controllers/cartController");

router.get("/:cliente_id", controller.getCart);
router.post("/add", controller.addToCart);
router.post("/remove", controller.removeItem);
router.delete("/:cliente_id", controller.clearCart);
router.put("/:cliente_id/items/:producto_id",controller.updateItemQuantity);
router.delete("/:cliente_id/items/:producto_id",controller.removeItem);

module.exports = router;