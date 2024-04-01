const express = require('express');

const router = express.Router();

const path = require('path');

const {saveSalesPayment, saveRentalPayment} = require('../controllers/paymentController');

router.post('/make-sales-payment', saveSalesPayment);
router.post('/make-rental-payment', saveRentalPayment);

module.exports = router;