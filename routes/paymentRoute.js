const express = require('express');

const router = express.Router();

const path = require('path');

const authorizeUser = require('../middleware/auth');

const {saveSalesPayment, saveRentalPayment} = require('../controllers/paymentController');

router.post('/make-sales-payment', authorizeUser, saveSalesPayment);
router.post('/make-rental-payment',  authorizeUser, saveRentalPayment);

module.exports = router;