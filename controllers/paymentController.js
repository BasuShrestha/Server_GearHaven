const Payment = require('../models/payment');
const { getMessaging } = require("firebase-admin/messaging");
const sendNotification = require("../helpers/sendNotification");

exports.saveSalesPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }
    
    console.log(req.body);
    console.log(req.body.userId);
    console.log(req.body.orderId);
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
    
            // Proceed to save the payment only if verification is successful
            const newPayment = new Payment({
                userId: req.body.userId,
                orderId: req.body.orderId,
                amountPaid: req.body.amountPaid,
                otherData: otherData.idx
            });
    
            Payment.saveSalesPayment(newPayment, async (error, data) => {
                if (error) {
                    return res.status(500).send({
                        message: error.message || "Some error occurred while inserting payment."
                    });
                } else {
                    try {
                        await sendNotification('f0q1fwW0TYWV4w0Clopa52:APA91bFiATnHR3i5bDEcEfTImGqM2EbRSCNsDmkWmOweO5-UYZ2FpUXmWeTg21R7v_-Yx15_fj2q-KjULKc0M83HBusHB6E-O5Z70C4q_2BdQq6gvlpM_klw5sF9wS2BCqSc7r0IU8PO',
                         'Order Made', `Hello`,`Your payment of ${req.body.amountPaid} has been successfully processed.`);
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
