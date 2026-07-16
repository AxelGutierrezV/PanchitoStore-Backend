const express = require('express');
const router = express.Router();

const controller = require('../controller/inventoryController');

router.post('/', controller.createInventory);
router.get("/get_full_stock", controller.get_full_stock);
router.get("/product/:producto_id", controller.getStockbyID);
router.post('/reduce', controller.reduceStock);
router.post('/register-product', controller.registerProduct);
router.post('/check', controller.checkStock);
router.post("/reduce-order",controller.reduceOrderStock);
router.get("/stock/:productId",controller.getProductStockDetail);
router.get("/movements",controller.getMovements);

module.exports = router;