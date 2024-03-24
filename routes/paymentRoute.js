const express = require('express');

const router = express.Router();

const path = require('path');

const {saveSalesPayment} = require('../controllers/paymentController');

router.post('/make-payment', saveSalesPayment);

module.exports = router;