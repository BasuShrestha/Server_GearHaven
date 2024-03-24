const conn = require('../connection/db');

const Order = function(order) {
    this.userId = order.userId,
    this.orderDate = order.orderDate,
    this.orderTotal = order.orderTotal,
    this.orderStatus = order.orderStatus
}

const OrderDetail = function(orderDetails) {
    this.orderId = orderDetails.orderId,
    this.productId = orderDetails.productId,
    this.sellerId = orderDetails.sellerId,
    this.quantity = orderDetails.quantity,
    this.lineTotal = orderDetails.lineTotal
}

Order.createOrder = (newOrder, result) => {
    conn.query(`INSERT INTO orders (user_id, order_date, order_total, order_status)
                VALUES(?,?,?,?)`,
                [newOrder.userId, newOrder.orderDate, newOrder.orderTotal, newOrder.orderStatus],
                (err, res) => {
                    if(err){
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;
                    }

                    console.log("Inserted Order: ", {
                        id: res.insertId, ...newOrder, message: 'Order added successfully'
                    });
                    result(null,{
                        id: res.insertId
                    });
                });
}

Order.cancelOrder = (id, result) => {
    conn.query(`UPDATE orders SET order_status = 'Failed' 
                WHERE order_id = ?`, id,
                (err, res) => {
                    if(err) {
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;        
                    }

                    if(res.affectedRows == 0) {
                        result({ kind: "not_found" }, null);
                        return;
                    }

                    result(null, {message: "Order updated successfully"});
                });
}

Order.payForOrder = (id, result) => {
    conn.query(`UPDATE orders SET order_status = 'Paid' 
                WHERE order_id = ?`, id,
                (err, res) => {
                    if(err) {
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;        
                    }

                    if(res.affectedRows == 0) {
                        result({ kind: "not_found" }, null);
                        return;
                    }

                    result(null, {message: "Order updated successfully"});
                });
}

OrderDetail.createOrderDetail = (newOrderDetails, result) => {
    conn.query(`INSERT INTO orderdetails (order_id, product_id, seller_id, quantity, line_total) 
                VALUES (?,?,?,?,?)`,
                [newOrderDetails.orderId, newOrderDetails.productId, 
                newOrderDetails.sellerId, newOrderDetails.quantity, 
                newOrderDetails.lineTotal],
                (err, res) => {
                    if(err){
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;
                    }

                    result(null,{
                        message: 'Order details created successfully'
                    });
                });
}

OrderDetail.getSoldProductsBySellerId = (id, result) => {
    conn.query(`SELECT od.*, o.user_id, o.order_date, o.order_total, u.user_name, u.user_contact, u.user_location, 
                p.product_name, p.product_image 
                FROM orderdetails od JOIN orders o ON od.order_id = o.order_id
                JOIN users u ON o.user_id = u.user_id 
                JOIN products p ON od.product_id = p.product_id 
                WHERE seller_id = ? AND o.order_status = 'Paid'`, 
                id, 
                (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Order details: ", res);
            result(null, res);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
}

OrderDetail.getOrderedProductsByBuyerId = (id, result) => {
    conn.query(`SELECT od.*, o.user_id, o.order_date, o.order_total, u.user_name, u.user_contact, u.user_location, p.product_name, p.product_image 
                FROM orderdetails od JOIN orders o ON od.order_id = o.order_id
                JOIN users u ON od.seller_id = u.user_id 
                JOIN products p ON od.product_id = p.product_id 
                WHERE o.user_id = ? AND o.order_status = 'Paid'`, 
                id, 
                (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Order details: ", res);
            result(null, res);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
}

OrderDetail.updateOrderStatus = (sellerId, orderId, productId, status, result) => {
    conn.query("UPDATE orderdetails SET delivery_status = ? WHERE seller_id = ? AND order_id = ? AND product_id = ?", 
        [status, sellerId, orderId, productId], 
        (err, res) => {
            if(err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }

            if(res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, {message: "Order Details updated Successfully"});
    });
}

module.exports = {
    Order,
    OrderDetail
}