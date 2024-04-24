const express = require('express');

const router = express.Router();

const path = require('path');

const authorizeUser = require('../middleware/auth');

const {addToWishlist, removeFromWishlist, getUserWishlist} = require('../controllers/wishlistController');

router.post('/add-to-wishlist', authorizeUser, addToWishlist);
router.delete('/remove-from-wishlist/:wishlistId', removeFromWishlist);
router.get('/get-wishlist/:userId', getUserWishlist);

module.exports = router;