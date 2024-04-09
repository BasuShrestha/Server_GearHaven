const Product = require('../models/product');

exports.createForSale = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }

    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        image: req.file.filename,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId,
        // ownerId: req.body.ownerId
        ownerId: req.user.id
        // forRent: req.body.forRent
    });

    Product.createForSale(newProduct, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while inserting the product"
            });
        } else {
            res.status(201).send(data);
        }
    });
};

exports.createForRent = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }

    let ratePerDay = req.body.ratePerDay;

    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price ?? 0,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        image: req.file.filename,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: 8,
        // conditionId: req.body.conditionId ?? 8,
        ownerId: req.body.ownerId
        // forRent is implicitly 1 (true) for renting
    });

    Product.createForRent(newProduct, ratePerDay, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while inserting the product and rate"
            });
        } else {
            res.status(201).send(data);
        }
    });
};


exports.updateSalesProduct = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }
    
    const productId = req.params.productId;
    
    let updatedProduct = {
        name: req.body.name,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId,
        ownerId: req.body.ownerId,
        // forRent: req.body.forRent
    };
    
    if (req.file) {
        updatedProduct.image = req.file.filename;
        Product.updateSalesProductWithImage(productId, updatedProduct, (error, data) => {
            if (error) {
                if (error.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Product with id ${productId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Product with id " + productId
                    });
                }
            } else res.status(201).send(data);
        });
    } else {
        Product.updateSalesProduct(productId, updatedProduct, (error, data) => {
            if (error) {
                if (error.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Product with id ${productId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Product with id " + productId
                    });
                }
            } else res.status(201).send(data);
        });
    }
};

exports.updateRentalProduct = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }
    
    const productId = req.params.productId;
    const newRatePerDay = req.body.ratePerDay;
    
    let updatedProduct = {
        name: req.body.name,
        price: req.body.price ?? 0.00,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId ?? 8,
        ownerId: req.body.ownerId
    };
    
    if (req.file) {
        updatedProduct.image = req.file.filename;
        Product.updateProductForRentWithImage(productId, updatedProduct, newRatePerDay, (error, data) => {
            if (error) {
                if (error.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Product with id ${productId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Product with id " + productId
                    });
                }
            } else {
                res.status(201).send(data);
            }
        });
    } else {
        Product.updateProductForRent(productId, updatedProduct, newRatePerDay, (error, data) => {
            if (error) {
                if (error.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Product with id ${productId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Product with id " + productId
                    });
                }
            } else {
                res.status(201).send(data);
            }
        });
    }
};


exports.deleteProductById = (req, res) => {
    const productId = req.params.productId;
    
    Product.deleteProductById(productId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Product with id ${productId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Product with id " + productId
                });
            }
        } else res.status(201).send(data);
    });
}

exports.getProductById = (req, res) => {
    const productId = req.params.productId;
    
    Product.getByProductId(productId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found Product with id ${productId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving Product with id ${productId}`
                });
            }
        }
        
        
        res.status(200).send(data);
    });
};

exports.getRentalProductById = (req, res) => {
    const productId = req.params.productId;
    
    Product.getRentalProductById(productId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found Product with id ${productId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving Product with id ${productId}`
                });
            }
        }
        
        
        res.status(200).send(data);
    });
};

exports.getProductsByOwnerId = (req, res) => {
    const ownerId = req.params.ownerId;
    
    Product.getByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No products found with owner id ${ownerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving products with owner id ${ownerId}`
                });
            }
        }
        res.status(200).send(data);
    });
};

exports.getSaleProductsByOwnerId = (req, res) => {
    const ownerId = req.params.ownerId; 
    
    Product.getSalesProdsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No sale products found with owner id ${ownerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving sale products with owner id ${ownerId}`
                });
            }
        }
        res.status(200).send(data);
    });
};

exports.getRentProductsByOwnerId = (req, res) => {
    const ownerId = req.params.ownerId;
    console.log(`Owner Id: ${ownerId}`);
    Product.getRentProdsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No renting products found with owner id ${ownerId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving renting products with owner id ${ownerId}`
                });
            }
        }
        
        res.status(200).send(data);
    });
};

exports.getAllSaleProducts = (req, res) => {
    Product.getAllSaleProducts((error, data) => {
        if (error) {
            return res.status(500).send({
                message: "Error retrieving all sale products"
            });
        }
        res.status(200).send(data);
    });
};

exports.getFilteredSaleProducts = (req, res) => {
    // Extract filter parameters from the request body
    let filters = {
        categoryId: req.body.categoryId,
        conditionId: req.body.conditionId,
        sizeId: req.body.sizeId,
        priceMin: req.body.priceMin,
        priceMax: req.body.priceMax
    };

    // Convert numeric strings to numbers if necessary
    if (filters.priceMin) filters.priceMin = parseFloat(filters.priceMin);
    if (filters.priceMax) filters.priceMax = parseFloat(filters.priceMax);

    // Call the getFilteredSaleProducts method with the filters
    Product.getFilteredSaleProducts(filters, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while retrieving products."
            });
        } else {
            res.status(200).send(data);
        }
    });
};



exports.getAllRentProducts = (req, res) => {
    Product.getAllRentProducts((error, data) => {
        if (error) {
            return res.status(500).send({
                message: "Error retrieving all renting products"
            });
        }
        res.status(200).send(data);
    });
    // exports.updateProduct = (req, res) => {
    //     if (!req.body) {
    //         return res.status(400).send({ message: "Product data is missing!" });
    //     }
    
    //     const productId = req.params.productId;
    
    //     const updatedProduct = {
    //         name: req.body.name,
    //         price: req.body.price,
    //         stockQuantity: req.body.stockQuantity,
    //         description: req.body.description,
    //         categoryId: req.body.categoryId,
    //         sizeId: req.body.sizeId,
    //         conditionId: req.body.conditionId,
    //         ownerId: req.body.ownerId,
    //         forRent: req.body.forRent,
    //         image: req.file ? req.file.filename : undefined
    //     };
    
    //     Product.updateProduct(productId, updatedProduct, (error, data) => {
    //         if (error) {
    //             if (error.kind === "not_found") {
    //                 res.status(404).send({
    //                     message: `Not found Product with id ${productId}.`
    //                 });
    //             } else {
    //                 res.status(500).send({
    //                     message: "Error updating Product with id " + productId
    //                 });
    //             }
    //         } else res.status(201).send(data);
    //     });
    // };
};