const express = require('express');

const router = express.Router();

const path = require('path');

const {getRentingsByOwnerId, updateRentalStatus, getRentingsByRenterId} = require('../controllers/rentingController');

router.get('/renting/owner/:ownerId', getRentingsByOwnerId);
router.put('/renting', updateRentalStatus);
router.get('/renting/renter/:renterId', getRentingsByRenterId);

module.exports = router;