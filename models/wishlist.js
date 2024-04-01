const conn = require('../connection/db');

const Wishlist = function(wishlist) {
    this.userId = wishlist.userId;
    this.productId = wishlist.productId;
    this.notificationSent = wishlist.notificationSent
}

Wishlist.addToWishlist = (newWishlist, result) => {
    conn.query(`INSERT INTO wishlists (user_id, product_id, notification_sent) 
                VALUES (?,?,0)`,
                [newWishlist.userId, newWishlist.productId],
                (err, res) => {
                    if(err){
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;
                    }

                    result(null,{
                        message: 'Product successfully added to the wishlist'
                    });
                });
}

Wishlist.removeFromWishlist = (wishlistId, result) => {
    conn.query(
        `DELETE FROM wishlists WHERE wishlist_id = ?`,
        wishlistId,
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { message: 'Wishlist item deleted successfully' });
        }
    );
};

Wishlist.removeFromWishlistByUserId = (userId, productId, result) => {
    conn.query(
        `DELETE FROM wishlists WHERE user_id = ? AND product_id = ?`,
        [userId, productId],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                // This means the wishlist item was not found for this user; it may be handled as needed.
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { message: 'Wishlist item deleted successfully for user' });
        }
    );
};

Wishlist.findWishlistItemByUserIdAndProductId = (userId, productId, result) => {
    conn.query(
        `SELECT * FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1`,
        [userId, productId],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }

            if (res.length) {
                result(null, res[0]); // Item exists
            } else {
                result(null, null); // Item does not exist
            }
        }
    );
};



Wishlist.updateNotificationStatus = (userId, productId, status, result) => {
    conn.query(
        `UPDATE wishlists SET notification_sent = ? WHERE user_id = ? AND product_id = ?`,
        [status, userId, productId],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { message: 'Notification status updated successfully' });
        }
    );
};

Wishlist.findUsersWithProductInWishlist = (productId, result) => {
    conn.query(
        `SELECT u.fcm_token 
        FROM wishlists w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.product_id = ? AND u.fcm_token IS NOT NULL`,
        [productId],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            result(null, res);
        }
    );
};


Wishlist.findByUserId = (userId, result) => {
    conn.query(
        `SELECT w.*, p.product_name, p.product_image, p.productcategory_id, p.productsize_id, p.productcondition_id, p.productowner_id, 
        ca.category_name, co.productcondition_name, si.productsize_name, latest_renting.to_date, latest_renting.renter_id, latest_renting.renting_status
        FROM wishlists w 
        LEFT JOIN products p ON w.product_id = p.product_id 
        LEFT JOIN productcategories ca ON p.productcategory_id = ca.category_id 
        LEFT JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
        LEFT JOIN productsizes si ON p.productsize_id = si.productsize_id 
        LEFT JOIN (
            SELECT product_id, renter_id, MAX(created_at) as latest_created_at, renting_status, to_date
            FROM rentings
            GROUP BY product_id, renter_id
        ) as latest_renting ON w.product_id = latest_renting.product_id AND w.user_id = latest_renting.renter_id
        WHERE w.user_id = ? 
        AND (latest_renting.latest_created_at IS NULL OR w.created_at > latest_renting.latest_created_at);`,
        [userId],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            result(null, res);
        }
        );
};

module.exports = Wishlist;