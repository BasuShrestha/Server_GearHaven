const express = require('express');

const router = express.Router();

const path = require('path');

const {createNewOrder, cancelOrder, payForOrder, getSoldProductsBySellerId, updateOrderStatus, getOrderedProductsByBuyerId} = require('../controllers/orderController');

router.post('/create-order', createNewOrder);
router.put('/order/cancel/:orderId', cancelOrder);
router.put('/order/pay/:orderId', payForOrder);
router.get('/order-details/seller/:sellerId', getSoldProductsBySellerId);
router.put('/order-details', updateOrderStatus);
router.get('/order-details/buyer/:buyerId', getOrderedProductsByBuyerId);


module.exports = router;