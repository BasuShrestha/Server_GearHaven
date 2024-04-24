const conn = require('../connection/db');

const Renting = function(renting) {
    this.product_id = renting.product_id;
    this.owner_id = renting.owner_id;
    this.renter_id = renting.renter_id;
    this.from_date = renting.from_date;
    this.to_date = renting.to_date;
    this.payment_status = renting.payment_status || 'Pending';
    this.renting_status = renting.renting_status || 'Initiated';
}

Renting.createRenting = (newRenting, result) => {
    conn.query(`INSERT INTO rentings (product_id, owner_id, renter_id, from_date, to_date, payment_status, renting_status) 
                VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [newRenting.product_id, newRenting.owner_id, newRenting.renter_id, newRenting.from_date, newRenting.to_date, newRenting.payment_status, newRenting.renting_status],
                (err, res) => {
                    if(err){
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;
                    }

                    console.log("Inserted Renting: ", { id: res.insertId, ...newRenting });
                    result(null, { id: res.insertId});
                });
};

Renting.updateRentingStatus = (rentingId, status, result) => {
    conn.query(`UPDATE rentings SET renting_status = ? WHERE renting_id = ?`, [status, rentingId],
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

                    result(null, {message: "Renting updated successfully"});
                });
};

Renting.getRentingsByOwnerId = (id, result) => {
    conn.query(`SELECT r.*, p.amount_paid, u.user_name, u.user_contact, u.user_location, u.fcm_token, pd.product_name, pd.product_image 
                FROM rentings r JOIN payments p ON r.renting_id = p.transaction_id 
                JOIN users u ON r.renter_id = u.user_id 
                JOIN products pd ON r.product_id = pd.product_id 
                WHERE r.owner_id = ?;`, 
                id, 
                (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Renting details: ", res);
            result(null, res);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
}

Renting.getRentingsByRenterId = (id, result) => {
    conn.query(`SELECT r.*, p.amount_paid, u.user_name, u.user_contact, u.user_location, u.fcm_token, pd.product_name, pd.product_image 
                FROM rentings r JOIN payments p ON r.renting_id = p.transaction_id 
                JOIN users u ON r.renter_id = u.user_id 
                JOIN products pd ON r.product_id = pd.product_id 
                WHERE r.renter_id = ?;`, 
                id, 
                (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Renting details: ", res);
            result(null, res);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
}

module.exports = Renting;
