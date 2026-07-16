const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/ActiveProducts', productController.getAllActiveProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.patch('/:id/updateProductStatus',productController.updateProductStatus);

module.exports = router;
