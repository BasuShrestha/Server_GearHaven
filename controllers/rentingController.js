const Renting = require('../models/renting');
const Wishlist = require('../models/wishlist');
const sendNotification = require('../helpers/sendNotification');

exports.updateRentalStatus = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Orders data is missing!" });
    }

    const rentingId = req.body.rentingId;
    const productId = req.body.productId;
    const productName = req.body.productName;
    console.log(productName);
    const status = req.body.status;
    console.log(status);

    Renting.updateRentingStatus(rentingId, status, async (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Renting id ${rentingId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Order with id " + rentingId
                });
            }
        } else {
            if (status === 'Completed') {
                Wishlist.findUsersWithProductInWishlist(productId, async (error, userList) => {
                    if (error) {
                        res.status(404).send({
                            message: `Not found users who had product id ${productId} in wishlist.`
                        });
                    } else {
                        let fcmTokens = userList.map(user => user.fcm_token).filter(token => token != null);
        
                        if (fcmTokens.length > 0) {
                            try {
                                await sendNotification.sendNotificationMulticast(fcmTokens,
                                    `${productName} available for renting`, 'A product you had in your wishlist is now available!',
                                    {
                                        messageType: "productAvailability"
                                    });
                                console.log('Notification sent successfully');
        
                                // Step 5: Update the `wishlists` table
                                userList.forEach(user => {
                                    Wishlist.updateNotificationStatus(user.user_id, productId, 1, (err, data) => {
                                        if (err) {
                                            console.error('Error updating wishlist:', err);
                                        }
                                    });
                                });
                            } catch (notificationError) {
                                console.error('Error sending notification:', notificationError);
                            }
                        }
                    }
                });
            }
            return res.status(201).send(data);
        } 
    });
}

exports.getRentingsByOwnerId = (req, res) => {
    const ownerId = req.params.ownerId;

    Renting.getRentingsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No rentings found with owner id ${ownerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving rentings for owner id ${ownerId}`
                });
            }
        }
        res.status(200).send(data);
    });
}