const conn = require('../connection/db');

const ProductSize = function(productSize) {
    this.sizeName = productSize.sizeName;
};

ProductSize.create = (newSize, result) => {

    conn.query("SELECT * FROM productsizes WHERE productsize_name = ?", [newSize.sizeName], (err, res)=>{
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if(res && res.length > 0) {
            result({kind: 'already_exists'}, null);
            return;
            
        } else {
            conn.query("INSERT INTO productsizes (productsize_name) VALUES (?)", [newSize.sizeName], (err, res) => {
                if(err){
                    console.log(`Error: ${err}`);
                    result(err, null);
                    return;
                }
                console.log("Created Product Size: ", {
                    id: res.insertId, ...newSize
                });
                result(null, {
                    id: res.insertId, ...newSize
                });
            });
        }
    });
};

ProductSize.updateById = (id, productSize, result) => {
    conn.query(
        "UPDATE productsizes SET productsize_name = ? WHERE productsize_id = ?",
        [productSize.sizeName, id],
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
            
            console.log("Updated Product Size: ", { id: id, ...productSize });
            result(null, { id: id, ...productSize });
        }
    );
};

ProductSize.deleteById = (id, result) => {
    conn.query("DELETE FROM productsizes WHERE productsize_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.affectedRows == 0) {
            
            result({ kind: "not_found" }, null);
            return;
        }
        
        console.log("Deleted Product Size with id: ", id);
        result(null, res);
    });
};

ProductSize.getById = (id, result) => {
    conn.query("SELECT * FROM productsizes WHERE productsize_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Product Size: ", res[0]);
            result(null, res[0]);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
};

ProductSize.getAll = (result) => {
    conn.query("SELECT * FROM productsizes", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Product Sizes: ", res);
        result(null, res);
    });
};

ProductSize.deleteAll = (result) => {
    conn.query("DELETE FROM productsizes", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log(`Deleted ${res.affectedRows} product sizes`);
        result(null, res);
    });
};

module.exports = ProductSize;
