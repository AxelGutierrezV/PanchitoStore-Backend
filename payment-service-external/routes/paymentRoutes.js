const express = require('express');
const router = express.Router();

const paymentController = require('../controller/paymentController');

router.post('/', paymentController.processPayment);

module.exports = router;