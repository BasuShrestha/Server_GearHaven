const ProductCategory = require('../models/productCategory');

exports.create = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const productCategory = new ProductCategory({
        categoryName: req.body.categoryName
    });

    ProductCategory.create(productCategory, (err, data) => {
        if(err) {
            if(err.kind === "already_exists") {
                res.status(409).send({
                    message: "Product Category already exists!"
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error during Product Category creation"
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.updateById = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    ProductCategory.updateById(req.params.categoryId, new ProductCategory(req.body), (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product category with Id ${req.params.categoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error updating Product Category with Id ${req.params.categoryId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getById = (req, res) => {

    ProductCategory.getById(req.params.categoryId,(err, data) => {
        if(err){
            if(err.kind === "not_found") {
                res.status(404).send({
                    message: `Product category with Id ${req.params.categoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error getting Product Category with Id ${req.params.categoryId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
}

exports.getAll = (req, res) => {
    ProductCategory.getAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error while getting all Product Categories"
            });
        } else {
            res.status(200).send(data);
        }
    });
}

exports.deleteById = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    ProductCategory.deleteById(req.params.categoryId, (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product Category with Id ${req.params.categoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error deleting Product Category with Id ${req.params.categoryId}`
                });
            }
        } else {
            res.status(200).send({
                message: `Deleted Product Category with Id ${req.params.categoryId}`
            });
        }
    });
};

exports.deleteAll = (req, res) => {
    ProductCategory.deleteAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error during deletion of all Product Categories"
            });
        } else {
            res.status(200).send({
                message: `All Product Categories deleted successfully!`
            });
        } 
    });
}