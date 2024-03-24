const { body } = require('express-validator');
const {Order, OrderDetail} = require('../models/order');

exports.createNewOrder = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order data is missing!" });
    }
    console.log(req.body);
    console.log(req.body.userId);
    const newOrder = new Order({
        userId: req.body.userId,
        orderDate: new Date(),
        orderTotal: req.body.orderTotal,
        orderStatus: 'Pending'
    });

    Order.createOrder(newOrder, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the order"
            });
        } else {
            // const cartItems = JSON.parse(req.body.cart);
            const cartItems = req.body.cart;

            cartItems.forEach(item => {
                const newOrderDetail = new OrderDetail({
                    orderId: data.id, // data.id is the newly created order's ID
                    productId: item.product.product_id,
                    sellerId: item.product.productowner_id,
                    quantity: item.quantity,
                    lineTotal: item.quantity * item.product.product_price
                });

                OrderDetail.createOrderDetail(newOrderDetail, (error, detailData) => {
                    if (error) {
                        console.log('Error adding order detail:', error);
                        res.status(500).send({
                            message: error.message || "Some error occurred while adding order details"
                        });
                        return;                        
                    }
                });
            });

            res.status(201).send({
                orderId: data.id,
                message: "Order placed successfully"
            });
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
    const status = req.body.status;

    OrderDetail.updateOrderStatus(sellerId, orderId, productId, status, (error, data) => {
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
        } else res.status(201).send(data);
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