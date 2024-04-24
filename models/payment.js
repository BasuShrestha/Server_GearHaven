const axios = require('axios');

const conn = require('../connection/db');
const Wishlist = require('./wishlist');
const {KHALTI_SECRET_KEY} = process.env;

const Payment = function(payment) {
    this.userId = payment.userId,
    this.transactionId = payment.transactionId,
    this.transactionType = payment.transactionType,
    this.amountPaid = payment.amountPaid,
    this.otherData = payment.otherData
}


Payment.verifyPayment = (token, amount, callback) => {
    axios.post('https://khalti.com/api/v2/payment/verify/', {
        token: token,
        amount: amount
    }, {
        headers: {
            'Authorization': `Key test_secret_key_2c1d69e9742d46ab823d46866c0f14e0`
        }
    }).then(response => {
        console.log(response.data);
        callback(null, response.data);
    }).catch(error => {
        console.error(error.response ? error.response.data : error);
        callback(error.response ? error.response.data : { message: error.message }, null);
    });
}

Payment.saveSalesPayment = (newPayment, orderId, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.error(`Transaction Begin Error: ${err.message}`);
            return result(err, null);
        }

        conn.query(`INSERT INTO payments (user_id, transaction_id, transaction_type, amount_paid, other_data) VALUES (?, ?, ?, ?, ?)`, 
                   [newPayment.userId, newPayment.transactionId, newPayment.transactionType, newPayment.amountPaid, newPayment.otherData], 
                   (err, res) => {
            if (err) {
                return conn.rollback(() => {
                    console.error(`Insert Error: ${err}`);
                    result(err, null);
                });
            }

            const paymentId = res.insertId;
            
            conn.query(`UPDATE orders SET order_status = 'Paid' WHERE order_id = ?`, [orderId], (err, res) => {
                if (err) {
                    return conn.rollback(() => {
                        console.error(`Order Update Error: ${err}`);
                        result(err, null);
                    });
                }

                conn.query(`UPDATE orderdetails SET delivery_status = 'Pending' WHERE order_id = ?`, [orderId], (err, res) => {
                    if (err) {
                        return conn.rollback(() => {
                            console.error(`Order Update Error: ${err}`);
                            result(err, null);
                        });
                    }
                    
                    conn.query(`UPDATE users u JOIN (SELECT seller_id, line_total FROM orderdetails 
                                WHERE order_id = ? GROUP BY seller_id) od ON u.user_id = od.seller_id 
                                SET u.total_income = u.total_income + od.line_total`, 
                            [orderId], (err, res) => {
                        if (err) {
                            return conn.rollback(() => {
                                console.error(`User Update Error: ${err}`);
                                result(err, null);
                            });
                        }

                        conn.query(`UPDATE products p JOIN (SELECT product_id, quantity FROM orderdetails 
                                    WHERE order_id = ? GROUP BY product_id) od ON p.product_id = od.product_id 
                                    SET p.productstock_quantity = p.productstock_quantity - od.quantity 
                                    WHERE p.productowner_id IN (SELECT seller_id FROM orderdetails WHERE order_id = ?)`, 
                                [orderId, orderId], (err, res) => {
                            if (err) {
                                return conn.rollback(() => {
                                    console.error(`Product Update Error: ${err}`);
                                    result(err, null);
                                });
                            }
                            
                            conn.commit(err => {
                                if (err) {
                                    return conn.rollback(() => {
                                        console.error(`Error: ${err}`);
                                        result(err, null);
                                    });
                                }
                                console.log("Payment inserted and order updated: ", { id: paymentId, ...newPayment });
                                result(null, { message: "Payment successful" });
                            });
                        });
                    });
                });
            });
        });
    });
};

Payment.saveRentalPayment = (newRenting, newPayment, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.error(`Transaction Begin Error: ${err.message}`);
            return result(err, null);
        }

        conn.query(`INSERT INTO rentings (product_id, owner_id, renter_id, from_date, to_date, payment_status, renting_status) 
                    VALUES(?, ?, ?, ?, ?, ?, ?)`,
                    [newRenting.product_id, newRenting.owner_id, newRenting.renter_id, newRenting.from_date, newRenting.to_date, newRenting.payment_status, newRenting.renting_status],
                    (err, rentingRes) => {
            if (err) {
                return conn.rollback(() => {
                    console.error(`Renting Insert Error: ${err}`);
                    result(err, null);
                });
            }
            
            const rentingId = rentingRes.insertId;

            conn.query(`INSERT INTO payments (user_id, transaction_id, transaction_type, amount_paid, other_data) VALUES (?, ?, ?, ?, ?)`, 
                        [newRenting.renter_id, rentingId, newPayment.transactionType, newPayment.amountPaid, newPayment.otherData], 
                        (err, paymentRes) => {
                if (err) {
                    return conn.rollback(() => {
                        console.error(`Payment Insert Error: ${err}`);
                        result(err, null);
                    });
                }

                Wishlist.findWishlistItemByUserIdAndProductId(newRenting.renter_id, newRenting.product_id, (findError, findResult) => {
                    if (findError) {
                        return conn.rollback(() => {
                            console.error(`Error checking wishlist: ${findError}`);
                            result(findError, null);
                        });
                    }

                    if (findResult) {
                        Wishlist.removeFromWishlistByUserId(newRenting.renter_id, newRenting.product_id, (wishlistError, wishlistData) => {
                            if (wishlistError) {
                                return conn.rollback(() => {
                                    console.error(`Error removing from wishlist: ${wishlistError}`);
                                    result(wishlistError, null);
                                });
                            }
                            console.log(wishlistData.message);
                            proceedToCommit();
                        });
                    } else {
                        proceedToCommit();
                    }
                });
            });
        });

        function proceedToCommit() {
            conn.commit(err => {
                if (err) {
                    return conn.rollback(() => {
                        console.error(`Transaction Commit Error: ${err}`);
                        result(err, null);
                    });
                }
                //console.log("Payment inserted and wishlist updated if necessary: ", { id: rentingId, ...newRenting });
                result(null, { message: "Payment successful for the rental, wishlist item removed if it was present." });
            });
        }
    });
};

module.exports = Payment;