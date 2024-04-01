const express = require('express');

const router = express.Router();

const path = require('path');

const {getRentingsByOwnerId, updateRentalStatus} = require('../controllers/rentingController');

router.get('/renting/owner/:ownerId', getRentingsByOwnerId);
router.put('/renting', updateRentalStatus);

module.exports = router;