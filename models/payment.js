const axios = require('axios');

const conn = require('../connection/db');
const {KHALTI_SECRET_KEY} = process.env;

const Payment = function(payment) {
    this.userId = payment.userId,
    this.orderId = payment.orderId,
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
        // callback(error, null);
        callback(error.response ? error.response.data : { message: error.message }, null);
    });
}

Payment.saveSalesPayment = (newPayment, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.error(`Transaction Begin Error: ${err.message}`);
            return result(err, null);
        }

        conn.query(`INSERT INTO payments (user_id, order_id, amount_paid, other_data) VALUES (?, ?, ?, ?)`, 
                   [newPayment.userId, newPayment.orderId, newPayment.amountPaid, newPayment.otherData], 
                   (err, res) => {
            if (err) {
                return conn.rollback(() => {
                    console.error(`Insert Error: ${err}`);
                    result(err, null);
                });
            }

            const paymentId = res.insertId;
            
            conn.query(`UPDATE orders SET order_status = 'Paid' WHERE order_id = ?`, [newPayment.orderId], (err, res) => {
                if (err) {
                    return conn.rollback(() => {
                        console.error(`Order Update Error: ${err}`);
                        result(err, null);
                    });
                }

                conn.query(`UPDATE orderdetails SET delivery_status = 'Pending' WHERE order_id = ?`, [newPayment.orderId], (err, res) => {
                    if (err) {
                        return conn.rollback(() => {
                            console.error(`Order Update Error: ${err}`);
                            result(err, null);
                        });
                    }
                    
                    conn.query(`UPDATE users u JOIN (SELECT seller_id, line_total FROM orderdetails 
                                WHERE order_id = ? GROUP BY seller_id) od ON u.user_id = od.seller_id 
                                SET u.total_income = u.total_income + od.line_total`, 
                            [newPayment.orderId], (err, res) => {
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
                                [newPayment.orderId, newPayment.orderId], (err, res) => {
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

module.exports = Payment;