const express = require('express');

const router = express.Router();

const path = require('path');

const {create, getAll, getById, updateById, deleteById, deleteAll} = require('../controllers/productCategoryController');

// Pet Category Routes
router.post('/product-category', create);
router.get('/product-category', getAll);
router.get('/product-category/:productCategoryId', getById);
router.put('/product-category/:productCategoryId', updateById);
router.delete('/product-category/:productCategoryId', deleteById);
router.delete('/product-category', deleteAll);

module.exports = router;