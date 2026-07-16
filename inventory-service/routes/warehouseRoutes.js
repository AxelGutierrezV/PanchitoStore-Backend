const express = require('express');
const router = express.Router();

const controller = require('../controller/warehouseController');

router.post('/', controller.createWarehouse);
router.get('/', controller.getWarehouses);
router.get('/:id', controller.getWarehouseById);

module.exports = router;