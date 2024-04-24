const Payment = require('../models/payment');
const Renting = require('../models/renting');
const sendNotification = require("../helpers/sendNotification");

exports.saveSalesPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }

    const userId = req.user.id;
    const orderId = req.body.orderId;

    try {
        const otherData = JSON.parse(req.body.otherData);
        const token = otherData.token;
        const amount = otherData.amount;
    
        Payment.verifyPayment(token, amount, (verifyError, verifyData) => {
            if (verifyError) {
                return res.status(400).send({ message: "Payment verification failed." });
            }
            if (verifyData.state.name !== "Completed") {
                return res.status(400).send({ message: "Transaction is not completed." });
            }

            const newPayment = new Payment({
                userId: userId,
                transactionId: req.body.transactionId,
                transactionType: req.body.transactionType,
                amountPaid: req.body.amountPaid,
                otherData: otherData.idx
            });

            const sellerFcmTokens = req.body.sellerFcmTokens;
            let tokensArray = typeof sellerFcmTokens === 'string' ? sellerFcmTokens.split(',') : sellerFcmTokens;
                
            Payment.saveSalesPayment(newPayment, orderId, async (error, data) => {
                if (error) {
                    return res.status(500).send({
                        message: error.message || "Some error occurred while inserting payment."
                    });
                }
                await sendNotification.sendNotificationMulticast(tokensArray,
                'Order made', `An order has been placed for Fitlife Nordic Gloves.`, 
                {
                    type: "orderPlaced",
                    title: "Order Placed",
                    body: `An order has been placed for product you listed`,
                    notificationDate: new Date().toISOString(),
                    eventDate: new Date().toISOString()
                });
                return res.status(201).send(data);
            });
        });
    } catch (error) {
        return res.status(400).send({ message: "Invalid 'otherData' format!" });
    }
};

exports.saveRentalPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }

    try {
        const otherData = JSON.parse(req.body.otherData);
        const token = otherData.token;
        const amount = otherData.amount;
    
        Payment.verifyPayment(token, amount, (verifyError, verifyData) => {
            if (verifyError) {
                return res.status(400).send({ message: "Payment verification failed." });
            }
            if (verifyData.state.name !== "Completed") {
                return res.status(400).send({ message: "Transaction is not completed." });
            }

            const newRenting = new Renting({
                product_id: req.body.productId,
                owner_id: req.body.ownerId,
                renter_id: req.user.id,
                from_date: req.body.fromDate,
                to_date: req.body.toDate,
                payment_status: req.body.paymentStatus,
                renting_status: req.body.rentingStatus
            });
    
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
                }
                await sendNotification.sendNotification(ownerFcmToken,
                'Renting Made', `A renting has been made for ${productName}.`, 
                {
                    type: "rentingMade",
                    title: "Renting Made",
                    body: `A renting has been made for ${productName}`,
                    notificationDate: new Date().toISOString(),
                    eventDate: new Date().toISOString()
                });
                return res.status(201).send(data);
            });
        });
    } catch (error) {
        return res.status(400).send({ message: "Invalid 'otherData' format!" });
    }
};
