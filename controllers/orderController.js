const { body } = require('express-validator');
const {Order, OrderDetail} = require('../models/order');
const conn = require('../connection/db');
const sendNotification = require("../helpers/sendNotification");

exports.createNewOrder = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }
    console.log(req.body);
    console.log(req.body.userId);

    console.log(req.user.id);
    const newOrder = new Order({
        userId: req.user.id,
        orderDate: new Date(),
        orderTotal: req.body.orderTotal,
        orderStatus: 'Pending'
    });

    Order.createOrder(newOrder, async (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the order"
            });
        } else {
            
            const cartItems = req.body.cart;

            try {
                for (const item of cartItems) {
                    const [stockResult] = await new Promise((resolve, reject) => {
                        conn.query('SELECT productstock_quantity FROM products WHERE product_id = ?', [item.product.product_id], (err, results) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        });
                    });
        
                    if (!stockResult || stockResult.stock < item.quantity) {
                        return res.status(400).send({ message: `Insufficient stock for ${item.product.product_name}` });
                    }
                }
        
                const newOrder = new Order({
                    userId: req.user.id,
                    orderDate: new Date(),
                    orderTotal: req.body.orderTotal,
                    orderStatus: 'Pending'
                });
        
                const data = await new Promise((resolve, reject) => {
                    Order.createOrder(newOrder, (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                });
        
                for (const item of cartItems) {
                    const newOrderDetail = new OrderDetail({
                        orderId: data.id,
                        productId: item.product.product_id,
                        sellerId: item.product.productowner_id,
                        quantity: item.quantity,
                        lineTotal: item.quantity * item.product.product_price
                    });
        
                    await new Promise((resolve, reject) => {
                        OrderDetail.createOrderDetail(newOrderDetail, (error, detailData) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(detailData);
                            }
                        });
                    });
                }
        
                return res.status(201).send({
                    orderId: data.id,
                    message: "Order placed successfully"
                });
            } catch (error) {
                console.log('Error processing order:', error);
                return res.status(500).send({
                    message: error.message || "An error occurred while processing the order."
                });
            }
        }
    });
}

exports.getSoldProductsBySellerId = (req, res) => {
    const sellerId = req.params.sellerId;

    OrderDetail.getSoldProductsBySellerId(sellerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found with seller id ${sellerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details for seller id ${sellerId}`
                });
            }
        }
        res.status(200).send(data);
    });
}

exports.getOrderedProductsByBuyerId = (req, res) => {
    const buyerId = req.params.buyerId;

    OrderDetail.getOrderedProductsByBuyerId(buyerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found for buyer id ${buyerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details for buyer id ${buyerId}`
                });
            }
        }
        res.status(200).send(data);
    });
}

exports.updateOrderStatus = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Orders data is missing!" });
    }

    const sellerId = req.body.sellerId;
    const orderId = req.body.orderId;
    const productId = req.body.productId;
    const productName = req.body.productName;
    const status = req.body.status;
    const buyerFcm = req.body.buyerFcm;

    OrderDetail.updateOrderStatus(sellerId, orderId, productId, status, async (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Order id ${orderId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Order with id " + orderId
                });
            }
        } else {
            try {
                await sendNotification.sendNotification(`${buyerFcm}`,
                 'Delivery Status Changed', `The delivery status for ${productName} has been changed to ${status}`,
                 {
                    type: "deliveryStatus",
                    title: "Delivery Status Changed",
                    body: `The delivery status for your order of ${productName} has been changed to ${status}`,
                    notificationDate: new Date().toISOString(),
                    eventDate: new Date().toISOString()
                });
                console.log('Notification sent successfully');
            } catch (notificationError) {
                console.error('Error sending notification:', notificationError);
            }
            return res.status(201).send(data);
        } 
    });
}

exports.cancelOrder = (req, res) => {
    const orderId = req.params.orderId;

    Order.cancelOrder(orderId, (error, result) => {
        if (error) {
            return res.status(500).send({
                message: error.message || "An error occurred while canceling the order."
            });
        }

        if (result.kind === "not_found") {
            return res.status(404).send({
                message: `Order not found with id ${orderId}.`
            });
        }

        return res.status(200).send({ message: "The order was canceled!" });
    });
};

exports.payForOrder = (req, res) => {
    const orderId = req.params.orderId;

    Order.payForOrder(orderId, (error, result) => {
        if (error) {
            return res.status(500).send({
                message: error.message || "An error occurred while updating the order status to paid."
            });
        }

        if (result.kind === "not_found") {
            return res.status(404).send({
                message: `Order not found with id ${orderId}.`
            });
        }

        return res.status(200).send({ message: "Order status updated to paid successfully!" });
    });
};