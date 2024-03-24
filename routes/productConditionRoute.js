const express = require('express');
const router = express.Router();
const path = require('path');

const {create, getAll, getById, updateById, deleteById, deleteAll} = require('../controllers/productConditionController');

router.post('/product-condition', create);
router.get('/product-condition', getAll);
router.get('/product-condition/:productConditionId', getById);
router.put('/product-condition/:productConditionId', updateById);
router.delete('/product-condition/:productConditionId', deleteById);
router.delete('/product-condition', deleteAll);

module.exports = router;
