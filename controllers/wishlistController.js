const { body } = require('express-validator');
const Wishlist = require('../models/wishlist');
const sendNotification = require("../helpers/sendNotification");

exports.addToWishlist = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Wishlist data is missing!" });
    }
    
    const userId = req.user.id;  

    const newWishlistEntry = new Wishlist({
        userId: userId,
        productId: req.body.productId
    });

    Wishlist.addToWishlist(newWishlistEntry, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while adding to the wishlist."
            });
        } else {
            res.status(201).send({
                message: "Product successfully added to the wishlist"
            });
        }
    });
};

exports.removeFromWishlist = (req, res) => {
    const { wishlistId } = req.params;

    Wishlist.removeFromWishlist(wishlistId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `Wishlist item not found with id ${wishlistId}.`
                });
            } else {
                return res.status(500).send({
                    message: "Error removing item from wishlist"
                });
            }
        }

        res.status(200).send({
            message: "Wishlist item removed successfully"
        });
    });
};


exports.getUserWishlist = (req, res) => {
    const userId = req.params.userId;
    
    Wishlist.findByUserId(userId, (error, data) => {
        if (error) {
            return res.status(500).send({
                message: error.message || "Some error occurred while retrieving the wishlist."
            });
        }
        
        if (!data.length) {
            return res.status(404).send({
                message: `Wishlist not found for userId ${userId}.`
            });
        }

        res.status(200).send(data);
    });
};

exports.updateWishlistNotification = (req, res) => {
    const { userId, productId } = req.body;
    
    Wishlist.updateNotificationStatus(userId, productId, 1, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Wishlist item not found for userId ${userId} and productId ${productId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating wishlist notification status"
                });
            }
        } else {
            try {
                const userNotificationToken = ''; // Retrieve the user's notification token
                sendNotification(userNotificationToken,
                    'Product Available',
                    `The product with id ${productId} is now available.`,
                    { messageType: "wishlistNotification" }
                    );
                    res.status(200).send({
                        message: "Wishlist notification status updated successfully",
                        notificationSent: true
                    });
                } catch (notificationError) {
                    res.status(500).send({
                        message: "Wishlist notification status updated but failed to send notification",
                        notificationSent: false,
                        error: notificationError
                    });
                }
            }
        });
    };
    
    // exports.removeFromWishlist = (req, res) => {
    //     const { userId, productId } = req.params;
    
    //     Wishlist.deleteWishlist(userId, productId, (error, data) => {
    //         if (error) {
    //             if (error.kind === "not_found") {
    //                 return res.status(404).send({
    //                     message: `Wishlist item not found for userId ${userId} and productId ${productId}.`
    //                 });
    //             } else {
    //                 return res.status(500).send({
    //                     message: "Error removing item from wishlist"
    //                 });
    //             }
    //         }
    
    //         res.status(200).send({
    //             message: "Wishlist item removed successfully"
    //         });
    //     });
    // };