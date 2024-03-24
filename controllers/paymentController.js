const Payment = require('../models/payment');

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
    
            Payment.saveSalesPayment(newPayment, (error, data) => {
                if (error) {
                    return res.status(500).send({
                        message: error.message || "Some error occurred while inserting payment."
                    });
                } else {
                    return res.status(201).send(data);
                }
            });
        });
    } catch (error) {
        return res.status(400).send({ message: error.message || "Invalid 'otherData' format!" });
    }

};
