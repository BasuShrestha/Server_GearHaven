const ProductSize = require('../models/productSize');

exports.create = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const productSize = new ProductSize({
        sizeName: req.body.sizeName
    });

    ProductSize.create(productSize, (err, data) => {
        if(err) {
            if(err.kind === "already_exists") {
                res.status(409).send({
                    message: "Product Size already exists!"
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error during Product Size creation"
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

    ProductSize.updateById(req.params.sizeId, new ProductSize(req.body), (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product size with Id ${req.params.sizeId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error updating Product Size with Id ${req.params.sizeId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getById = (req, res) => {

    ProductSize.getById(req.params.sizeId, (err, data) => {
        if(err){
            if(err.kind === "not_found") {
                res.status(404).send({
                    message: `Product size with Id ${req.params.sizeId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error getting Product Size with Id ${req.params.sizeId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
}

exports.getAll = (req, res) => {
    ProductSize.getAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error while getting all Product Sizes"
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

    ProductSize.deleteById(req.params.sizeId, (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product Size with Id ${req.params.sizeId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error deleting Product Size with Id ${req.params.sizeId}`
                });
            }
        } else {
            res.status(200).send({
                message: `Deleted Product Size with Id ${req.params.sizeId}`
            });
        }
    });
};

exports.deleteAll = (req, res) => {
    ProductSize.deleteAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error during deletion of all Product Sizes"
            });
        } else {
            res.status(200).send({
                message: `All Product Sizes deleted successfully!`
            });
        } 
    });
}
