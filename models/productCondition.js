const conn = require('../connection/db');

const ProductCondition = function(productCondition) {
    this.conditionName = productCondition.conditionName;
};

ProductCondition.create = (newCondition, result) => {
    conn.query("SELECT * FROM productconditions WHERE productcondition_name = ?", [newCondition.conditionName], (err, res)=>{
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if(res && res.length > 0) {
            result({kind: 'already_exists'}, null);
            return;
            
        } else {
            conn.query("INSERT INTO productconditions (productcondition_name) VALUES (?)", [newCondition.conditionName], (err, res) => {
                if(err){
                    console.log(`Error: ${err}`);
                    result(err, null);
                    return;
                }
                console.log("Created Product Condition: ", {
                    id: res.insertId, ...newCondition
                });
                result(null, {
                    id: res.insertId, ...newCondition
                });
            });
        }
    });
};

ProductCondition.updateById = (id, productCondition, result) => {
    conn.query(
        "UPDATE productconditions SET productcondition_name = ? WHERE productcondition_id = ?",
        [productCondition.conditionName, id],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            
            if (res.affectedRows == 0) {
                // No rows affected means the ID didn't exist
                result({ kind: "not_found" }, null);
                return;
            }
            
            console.log("Updated Product Condition: ", { id: id, ...productCondition });
            result(null, { id: id, ...productCondition });
        }
    );
};

ProductCondition.deleteById = (id, result) => {
    conn.query("DELETE FROM productconditions WHERE productcondition_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.affectedRows == 0) {
            // No rows found with that ID
            result({ kind: "not_found" }, null);
            return;
        }
        
        console.log("Deleted Product Condition with id: ", id);
        result(null, res);
    });
};

ProductCondition.getById = (id, result) => {
    conn.query("SELECT * FROM productconditions WHERE productcondition_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Product Condition: ", res[0]);
            result(null, res[0]);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

ProductCondition.getAll = (result) => {
    conn.query("SELECT * FROM productconditions", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Product Conditions: ", res);
        result(null, res);
    });
};

ProductCondition.deleteAll = (result) => {
    conn.query("DELETE FROM productconditions", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log(`Deleted ${res.affectedRows} product conditions`);
        result(null, res);
    });
};

module.exports = ProductCondition;
