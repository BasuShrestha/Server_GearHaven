const express = require('express');
const router = express.Router();
const path = require('path');

const {create, getAll, getById, updateById, deleteById, deleteAll} = require('../controllers/productSizeController');

router.post('/product-size', create);
router.get('/product-size', getAll);
router.get('/product-size/:productSizeId', getById);
router.put('/product-size/:productSizeId', updateById);
router.delete('/product-size/:productSizeId', deleteById);
router.delete('/product-size', deleteAll);

module.exports = router;
