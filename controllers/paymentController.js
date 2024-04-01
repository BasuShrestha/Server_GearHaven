const Payment = require('../models/payment');
const Renting = require('../models/renting');
const { getMessaging } = require("firebase-admin/messaging");
const sendNotification = require("../helpers/sendNotification");

exports.saveSalesPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }
    
    console.log(req.body);
    console.log(req.body.userId);
    console.log(req.body.transactionId);
    console.log(req.body.transactionType);
    console.log(req.body.amountPaid);
    console.log(req.body.otherData);

    try {
        const otherData = JSON.parse(req.body.otherData);
        console.log(otherData.idx);
        console.log(otherData.token);
        console.log(otherData.amount);
        const token = otherData.token;
        const amount = otherData.amount;
    
        // First, verify the payment
        Payment.verifyPayment(token, amount, (verifyError, verifyData) => {
            if (verifyError) {
                // return res.status(400).send({ message: verifyError.message || "Payment verification failed." });
                return res.status(400).send({ message: "Payment verification failed." });
            }
            if (verifyData.state.name !== "Completed") {
                return res.status(400).send({ message: "Transaction is not completed." });
            }
            console.log("Payment verified");
    
            // Saving the payment only if verification is successful
            console.log(`Trnasaction type after verification: ${req.body.transactionType}`);
            const newPayment = new Payment({
                userId: req.body.userId,
                transactionId: req.body.transactionId,
                transactionType: req.body.transactionType,
                amountPaid: req.body.amountPaid,
                otherData: otherData.idx
            });

            const sellerFcmTokens = req.body.sellerFcmTokens
            console.log(`Seller FCMs: ${sellerFcmTokens}`);
            let tokensArray;
            if (typeof sellerFcmTokens === 'string') {
                tokensArray = sellerFcmTokens.split(',');
            } else if (Array.isArray(sellerFcmTokens)) {
                tokensArray = sellerFcmTokens;
            } else {
                throw new Error("sellerFcmTokens must be an array or a comma-separated string");
            }
            console.log(tokensArray);
                
            Payment.saveSalesPayment(newPayment, async (error, data) => {
                if (error) {
                    return res.status(500).send({
                        message: error.message || "Some error occurred while inserting payment."
                    });
                } else {
                    try {
                        await sendNotification.sendNotificationMulticast(tokensArray,
                        'Order Made', `An order has been placed for ${req.body.amountPaid}.`, {
                            message: 'Hello'
                        });
                      
                        console.log('Notification sent successfully');
                    } catch (notificationError) {
                        console.error('Error sending notification:', notificationError);
                    }
                    return res.status(201).send(data);
                }
            });

            
        });
    } catch (error) {
        return res.status(400).send({ message: error.message || "Invalid 'otherData' format!" });
    }

};

exports.saveRentalPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }
    console.log(req.body);
    try {
        const otherData = JSON.parse(req.body.otherData);
        console.log(otherData.idx);
        console.log(otherData.token);
        console.log(otherData.amount);
        console.log(`Total in api: ${req.body.amountPaid}`);
        const token = otherData.token;
        const amount = otherData.amount;
    
        // First, verify the payment
        Payment.verifyPayment(token, amount, (verifyError, verifyData) => {
            if (verifyError) {
                // return res.status(400).send({ message: verifyError.message || "Payment verification failed." });
                return res.status(400).send({ message: "Payment verification failed." });
            }
            if (verifyData.state.name !== "Completed") {
                return res.status(400).send({ message: "Transaction is not completed." });
            }
            console.log("Payment verified");

            const newRenting = new Renting({
                product_id : req.body.productId,
                owner_id : req.body.ownerId,
                renter_id : req.body.renterId,
                from_date : req.body.fromDate,
                to_date : req.body.toDate,
                payment_status : req.body.paymentStatus,
                renting_status : req.body.rentingStatus
            });
    
            console.log(`Total to be saved: ${req.body.amountPaid}`);
            const newPayment = new Payment({
                transactionType: req.body.transactionType,
                amountPaid: req.body.amountPaid,
                otherData: otherData.idx
            });
            
            const productName = req.body.productName;
            const ownerFcmToken = req.body.ownerFcmToken;
                
            Payment.saveRentalPayment(newRenting, newPayment, async (error, data) => {
                if (error) {
                    return res.status(500).send({
                        message: error.message || "Some error occurred while inserting payment."
                    });
                } else {
                    try {
                        await sendNotification.sendNotification(ownerFcmToken,
                        'Renting Made', `A renting has been made for ${productName}.`, {
                            message: 'Hello'
                        });
                      
                        console.log('Notification sent successfully');
                    } catch (notificationError) {
                        console.error('Error sending notification:', notificationError);
                    }
                    return res.status(201).send(data);
                }
            });

            
        });
    } catch (error) {
        return res.status(400).send({ message: error.message || "Invalid 'otherData' format!" });
    }

};
