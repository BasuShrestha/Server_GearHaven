const conn = require('../connection/db');

// const Product = function(product) {
//     this.product_name = product.name;
//     this.product_price = product.price;
//     this.productstock_quantity = product.stockQuantity;
//     this.product_desc = product.description;
//     this.product_image = product.image;
//     this.productcategory_id = product.categoryId;
//     this.productsize_id = product.sizeId;
//     this.productcondition_id = product.conditionId;
//     this.productowner_id = product.ownerId;
//     this.for_rent = product.forRent;
// };

const Product = function(product) {
    this.name = product.name;
    this.price = product.price;
    this.stockQuantity = product.stockQuantity;
    this.description = product.description;
    this.image = product.image;
    this.categoryId = product.categoryId;
    this.sizeId = product.sizeId;
    this.conditionId = product.conditionId;
    this.ownerId = product.ownerId;
    this.forRent = product.forRent;
};

// Product.createProduct = (newProduct, result) => {
//     conn.query("INSERT INTO products SET ?", newProduct, (err, res) => {
//         if(err){
//             console.log(`Error: ${err}`);
//             result(err, null);
//             return;
//         }
//         console.log("Created Product: ", {id: res.insertId, ...newProduct});
//         result(null, {id: res.insertId, ...newProduct});
//     });
// };

Product.createForSale = (newProduct, result) => {
    conn.query("INSERT INTO products (product_name, product_price, productstock_quantity, product_desc, product_image, productcategory_id, productsize_id, productcondition_id, productowner_id, for_rent)" 
                        +"VALUES (?,?,?,?,?,?,?,?,?,0)",
            [newProduct.name,newProduct.price,
            newProduct.stockQuantity,newProduct.description,
            newProduct.image,newProduct.categoryId,newProduct.sizeId,
            newProduct.conditionId,newProduct.ownerId],
            (err, res) => {
            if(err){
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            console.log("Inserted Product For Sale: ", {
                id: res.insertId, ...newProduct, message: 'Product added successfully'
            });
            result(null,{
                message: 'Product added successfully'
            });
            // result(null, {
            //     id: res.insertId, ...newProduct
            // });
    });
};

Product.createForRent = (newProduct, ratePerDay, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.log(`Transaction Error: ${err}`);
            result(err, null);
            return;
        }

        conn.query("INSERT INTO products (product_name, product_price, productstock_quantity, product_desc, product_image, productcategory_id, productsize_id, productcondition_id, productowner_id, for_rent)" 
                        + "VALUES (?,?,?,?,?,?,?,?,?,1)",
                [newProduct.name, newProduct.price, newProduct.stockQuantity, newProduct.description, newProduct.image, newProduct.categoryId, newProduct.sizeId, newProduct.conditionId, newProduct.ownerId],
                (err, res) => {
                if(err){
                    conn.rollback(() => {
                        console.log(`Error during product insert: ${err}`);
                        result(err, null);
                    });
                    return;
                }

                const productId = res.insertId;

                conn.query("INSERT INTO rentingrates (product_id, rate_per_day) VALUES (?, ?)", 
                    [productId, ratePerDay], (err, rateRes) => {
                    if(err){
                        conn.rollback(() => {
                            console.log(`Error during rate insert: ${err}`);
                            result(err, null);
                        });
                        return;
                    }

                    conn.commit(err => {
                        if (err) {
                            conn.rollback(() => {
                                console.log(`Error during transaction commit: ${err}`);
                                result(err, null);
                            });
                            return;
                        }

                        result(null,{
                            message: 'Product added successfully'
                        });

                        // result(null, {
                        //     id: productId,
                        //     ...newProduct,
                        //     rate_per_day: ratePerDay,
                        //     message: "Product and Rent Rate added successfully"
                        // });
                    });
                });
        });
    });
};

Product.updateSalesProduct = (id, product, result) => {
    conn.query(`UPDATE products SET product_name = ?, 
                product_price = ?, 
                productstock_quantity = ?, 
                product_desc = ?, 
                productcategory_id = ?, 
                productsize_id = ?, 
                productcondition_id = ? 
                WHERE product_id = ?`,
            [product.name,product.price,product.stockQuantity,product.description,product.categoryId,product.sizeId,product.conditionId,id],
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

            console.log("Updated Product: ", {
                id: id, ...product
            });

            result(null, {message: "Product Updated Successfully"});
            // result(null, {
            //     id: id, ...product
            // });
    });
};

Product.updateSalesProductWithImage = (id, product, result) => {
    conn.query(`UPDATE products SET product_name = ?, 
                product_price = ?, 
                productstock_quantity = ?, 
                product_desc = ?, 
                product_image = ?, 
                productcategory_id = ?, 
                productsize_id = ?, 
                productcondition_id = ? 
                WHERE product_id = ?`,
            [product.name, product.price, product.stockQuantity, product.description, product.image, product.categoryId, product.sizeId, product.conditionId, id],
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

            console.log("Updated Product with new image: ", { id: id, ...product });
            result(null, {message: "Product Updated Successfully"});
            // result(null, {
            //     id: id, ...product
            // });
    });
};

Product.updateProductForRent = (productId, updatedProduct, newRatePerDay, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.log(`Transaction Error: ${err}`);
            result(err, null);
            return;
        }

        conn.query(`UPDATE products SET product_name = ?, 
                    product_price = ?, 
                    productstock_quantity = ?, 
                    product_desc = ?, 
                    productcategory_id = ?, 
                    productsize_id = ?, 
                    productcondition_id = ? 
                    WHERE product_id = ?`,
                [updatedProduct.name, updatedProduct.price, updatedProduct.stockQuantity, 
                    updatedProduct.description, updatedProduct.categoryId, updatedProduct.sizeId, 
                    updatedProduct.conditionId, productId],
                (err, res) => {
                    if (err) {
                        conn.rollback(() => {
                            console.log(`Error during product update: ${err}`);
                            result(err, null);
                        });
                        return;
                    }

                    conn.query("UPDATE rentingrates SET rate_per_day = ? WHERE product_id = ?",
                        [newRatePerDay, productId], (err, rateRes) => {
                            if (err) {
                                conn.rollback(() => {
                                    console.log(`Error during rate update: ${err}`);
                                    result(err, null);
                                });
                                return;
                            }

                            conn.commit(err => {
                                if (err) {
                                    conn.rollback(() => {
                                        console.log(`Error during transaction commit: ${err}`);
                                        result(err, null);
                                    });
                                    return;
                                }

                                result(null, {
                                    message: 'Product and Rent Rate updated successfully'
                                });
                            });
                        });
                });
    });
};

Product.updateProductForRentWithImage = (productId, updatedProduct, newRatePerDay, result) => {
    conn.beginTransaction(err => {
        if (err) {
            console.log(`Transaction Error: ${err}`);
            result(err, null);
            return;
        }

        conn.query(`UPDATE products SET product_name = ?, 
                    product_price = ?, 
                    productstock_quantity = ?, 
                    product_desc = ?, 
                    product_image = ?, 
                    productcategory_id = ?, 
                    productsize_id = ?, 
                    productcondition_id = ? 
                    WHERE product_id = ?`,
                [updatedProduct.name, updatedProduct.price, 
                    updatedProduct.stockQuantity, updatedProduct.description, 
                    updatedProduct.image, updatedProduct.categoryId, 
                    updatedProduct.sizeId, updatedProduct.conditionId, productId],
                (err, res) => {
                    if (err) {
                        conn.rollback(() => {
                            console.log(`Error during product update: ${err}`);
                            result(err, null);
                        });
                        return;
                    }

                    conn.query("UPDATE rentingrates SET rate_per_day = ? WHERE product_id = ?",
                        [newRatePerDay, productId], (err, rateRes) => {
                            if (err) {
                                conn.rollback(() => {
                                    console.log(`Error during rate update: ${err}`);
                                    result(err, null);
                                });
                                return;
                            }

                            conn.commit(err => {
                                if (err) {
                                    conn.rollback(() => {
                                        console.log(`Error during transaction commit: ${err}`);
                                        result(err, null);
                                    });
                                    return;
                                }

                                result(null, {
                                    message: 'Product and Rent Rate updated successfully'
                                });
                            });
                        });
                });
    });
};


Product.getByProductId = (id, result) => {
    conn.query("SELECT * FROM products WHERE product_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Product: ", res[0]);
            result(null, res[0]);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
};

Product.getByOwnerId = (id, result) => {
    conn.query("SELECT * FROM products WHERE productowner_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Product: ", res);
            result(null, res);
            return;
        }
        
        result({ kind: "not_found" }, null);
    });
};

Product.getSalesProdsByOwnerId = (id, result) => {
    conn.query(`SELECT p.*, o.user_name, ca.category_name, co.productcondition_name, s.productsize_name FROM products p 
    JOIN users o ON p.productowner_id = o.user_id JOIN productcategories ca ON p.productcategory_id = ca.category_id 
    JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
    JOIN productsizes s ON p.productsize_id = s.productsize_id 
    WHERE productowner_id = ? AND for_rent = 0 AND p.is_deleted = 0;`, id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Product: ", res);
            result(null, res);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

Product.getRentProdsByOwnerId = (id, result) => {
    conn.query(`SELECT 
    p.*, 
    o.user_name, 
    o.user_location, 
    o.user_contact, 
    o.user_email, 
    o.fcm_token AS owner_fcm, 
    ca.category_name, 
    co.productcondition_name, 
    s.productsize_name, 
    r.rate_per_day, 
    rs.renting_status 
  FROM products p 
  JOIN users o ON p.productowner_id = o.user_id 
  JOIN productcategories ca ON p.productcategory_id = ca.category_id 
  JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
  JOIN productsizes s ON p.productsize_id = s.productsize_id 
  JOIN rentingrates r ON p.product_id = r.product_id 
  LEFT JOIN (SELECT product_id, MAX(renting_id) AS latest_renting_id FROM rentings GROUP BY product_id) 
  AS latest_rentings ON p.product_id = latest_rentings.product_id
  LEFT JOIN rentings rs ON latest_rentings.latest_renting_id = rs.renting_id
  WHERE p.productowner_id = ? AND p.for_rent = 1 AND p.is_deleted = 0;`, 
    id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Product: ", res);
            result(null, res);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

Product.deleteProductById = (id, result) => {
    conn.query(`UPDATE products SET is_deleted = 1 WHERE product_id = ?`,id, (err, res) => {
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        if(res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        console.log(`Deleted Product with id: ${id}`);
        result(null, {message: "Product Deleted Successfully"});
        // result(null, {
        //     id: id, ...product
        // });

    });
};

Product.getAllSaleProducts = (result) => {
    conn.query(`SELECT p.*, o.user_name, ca.category_name, co.productcondition_name, s.productsize_name, o.fcm_token as seller_fcm FROM products p 
    JOIN users o ON p.productowner_id = o.user_id 
    JOIN productcategories ca ON p.productcategory_id = ca.category_id 
    JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
    JOIN productsizes s ON p.productsize_id = s.productsize_id 
    WHERE p.for_rent = 0 AND p.is_deleted = 0;`, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Products: ", res);
        result(null, res);
    });
};

Product.getFilteredSaleProducts = (filters, result) => {
    let baseQuery = `SELECT p.*, o.user_name, ca.category_name, co.productcondition_name, s.productsize_name, o.fcm_token as seller_fcm
                     FROM products p
                     JOIN users o ON p.productowner_id = o.user_id
                     JOIN productcategories ca ON p.productcategory_id = ca.category_id
                     JOIN productconditions co ON p.productcondition_id = co.productcondition_id
                     JOIN productsizes s ON p.productsize_id = s.productsize_id
                     WHERE p.for_rent = 0 AND p.is_deleted = 0`;

    let filterClauses = [];
    let queryParams = [];

    if (filters.categoryId) {
        filterClauses.push("p.productcategory_id = ?");
        queryParams.push(filters.categoryId);
    }
    if (filters.conditionId) {
        filterClauses.push("p.productcondition_id = ?");
        queryParams.push(filters.conditionId);
    }
    if (filters.sizeId) {
        filterClauses.push("p.productsize_id = ?");
        queryParams.push(filters.sizeId);
    }
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
        filterClauses.push("p.product_price BETWEEN ? AND ?");
        queryParams.push(filters.priceMin, filters.priceMax);
    }

    if (filterClauses.length) {
        baseQuery += " AND " + filterClauses.join(" AND ");
    }

    conn.query(baseQuery, queryParams, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        console.log("Filtered Products: ", res);
        result(null, res);
    });
};


Product.getAllRentProducts = (result) => {
    conn.query(`SELECT 
    p.*, 
    o.user_name, 
    o.user_location, 
    o.user_contact, 
    o.user_email, 
    o.fcm_token AS owner_fcm, 
    ca.category_name, 
    co.productcondition_name, 
    s.productsize_name, 
    r.rate_per_day, 
    rs.renting_status 
  FROM products p 
  JOIN users o ON p.productowner_id = o.user_id 
  JOIN productcategories ca ON p.productcategory_id = ca.category_id 
  JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
  JOIN productsizes s ON p.productsize_id = s.productsize_id 
  JOIN rentingrates r ON p.product_id = r.product_id 
  LEFT JOIN (SELECT product_id, MAX(renting_id) AS latest_renting_id FROM rentings GROUP BY product_id) 
  AS latest_rentings ON p.product_id = latest_rentings.product_id
  LEFT JOIN rentings rs ON latest_rentings.latest_renting_id = rs.renting_id
  WHERE p.for_rent = 1 AND p.is_deleted = 0;`, 
  (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Products: ", res);
        result(null, res);
    });
};

Product.getRentalProductById = (productId, result) => {
    conn.query(`SELECT 
    p.*, 
    o.user_name, 
    o.user_location, 
    o.user_contact, 
    o.user_email, 
    o.fcm_token AS owner_fcm, 
    ca.category_name, 
    co.productcondition_name, 
    s.productsize_name, 
    r.rate_per_day, 
    rs.renting_status 
  FROM products p 
  JOIN users o ON p.productowner_id = o.user_id 
  JOIN productcategories ca ON p.productcategory_id = ca.category_id 
  JOIN productconditions co ON p.productcondition_id = co.productcondition_id 
  JOIN productsizes s ON p.productsize_id = s.productsize_id 
  JOIN rentingrates r ON p.product_id = r.product_id 
  LEFT JOIN (SELECT product_id, MAX(renting_id) AS latest_renting_id FROM rentings GROUP BY product_id) 
  AS latest_rentings ON p.product_id = latest_rentings.product_id
  LEFT JOIN rentings rs ON latest_rentings.latest_renting_id = rs.renting_id
  WHERE p.for_rent = 1 AND p.is_deleted = 0 AND p.product_id = ?;`, productId, 
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

    console.log(`Rental Product with id: ${productId}`);
    result(null, res);
    });
};

module.exports = Product;
