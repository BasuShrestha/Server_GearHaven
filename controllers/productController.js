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
        image: req.file ? req.file.filename : null,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId,
        //ownerId: req.user.id,
        ownerId: req.body.ownerId

    });

    Product.createForSale(newProduct, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the product."
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

    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price ?? 0,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        image: req.file ? req.file.filename : null,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId ?? 8,
        // ownerId: req.user.id
        ownerId: req.body.ownerId
    });

    const ratePerDay = req.body.ratePerDay;

    Product.createForRent(newProduct, ratePerDay, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the rental product."
            });
        } else {
            res.status(201).send(data);
        }
    });
};

exports.updateSalesProduct = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data to update is missing!" });
    }

    const productId = req.params.productId;
    const updatedProduct = {
        name: req.body.name,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId,
        // ownerId: req.user.id,
        ownerId: req.body.ownerId,
        image: req.file ? req.file.filename : undefined
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
        return res.status(400).send({ message: "Product data to update is missing!" });
    }

    const productId = req.params.productId;
    const newRatePerDay = req.body.ratePerDay;
    console.log(req.body.name);
        console.log(req.body.price);
        console.log(req.body.description);
        console.log(req.body.categoryId);
        console.log(req.body.sizeId);
        console.log(req.body.conditionId);
    const updatedProduct = {
        name: req.body.name,
        price: req.body.price ?? 0,
        //stockQuantity: req.body.stockQuantity,
        stockQuantity: 1,
        description: req.body.description,
        categoryId: req.body.categoryId,
        sizeId: req.body.sizeId,
        conditionId: req.body.conditionId ?? 8,
        // ownerId: req.user.id,
        ownerId: req.body.ownerId,
        image: req.file ? req.file.filename : undefined
    };

    console.log(updatedProduct.name);
    console.log(updatedProduct.price);
    console.log(updatedProduct.description);
    console.log(updatedProduct.categoryId);
    console.log(updatedProduct.sizeId);
    console.log(updatedProduct.conditionId);

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
                res.status(404).send({ message: `Not found Product with id ${productId}.` });
            } else {
                res.status(500).send({ message: `Error deleting Product with id ${productId}` });
            }
        } else {
            res.status(200).send({ message: "Product was deleted successfully!" });
        }
    });
};

exports.getProductById = (req, res) => {
    const productId = req.params.productId;

    Product.getProductById(productId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({ message: `Not found Product with id ${productId}.` });
            } else {
                res.status(500).send({ message: `Error retrieving Product with id ${productId}` });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getRentalProductById = (req, res) => {
    const productId = req.params.productId;

    Product.getRentalProductById(productId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({ message: `Not found Rental Product with id ${productId}.` });
            } else {
                res.status(500).send({ message: `Error retrieving Rental Product with id ${productId}` });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getProductsByOwnerId = (req, res) => {
    //const ownerId = req.user.id;
    const ownerId = req.params.ownerId;

    Product.getProductsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({ message: `No products found with owner id ${ownerId}.` });
            } else {
                res.status(500).send({ message: `Error retrieving products with owner id ${ownerId}` });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getSaleProductsByOwnerId = (req, res) => {
       //const ownerId = req.user.id;
       const ownerId = req.params.ownerId;

    Product.getSalesProdsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({ message: `No sale products found with owner id ${ownerId}.` });
            } else {
                res.status(500).send({ message: `Error retrieving sale products with owner id ${ownerId}` });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getRentProductsByOwnerId = (req, res) => {
   //const ownerId = req.user.id;
   const ownerId = req.params.ownerId;

    Product.getRentProdsByOwnerId(ownerId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({ message: `No renting products found with owner id ${ownerId}.` });
            } else {
                res.status(500).send({ message: `Error retrieving renting products with owner id ${ownerId}` });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getAllSaleProducts = (req, res) => {
    Product.getAllSaleProducts((error, data) => {
        if (error) {
            res.status(500).send({ message: "Error retrieving all sale products" });
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getFilteredSaleProducts = (req, res) => {
    let filters = {
        categoryId: req.body.categoryId,
        conditionId: req.body.conditionId,
        sizeId: req.body.sizeId,
        priceMin: req.body.priceMin,
        priceMax: req.body.priceMax
    };

    if (filters.priceMin) filters.priceMin = parseFloat(filters.priceMin);
    if (filters.priceMax) filters.priceMax = parseFloat(filters.priceMax);

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
            res.status(500).send({ message: "Error retrieving all renting products" });
        } else {
            res.status(200).send(data);
        }
    });
};
