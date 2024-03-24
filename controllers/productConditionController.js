const ProductCondition = require('../models/productCondition');

exports.create = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const productCondition = new ProductCondition({
        conditionName: req.body.conditionName
    });

    ProductCondition.create(productCondition, (err, data) => {
        if(err) {
            if(err.kind === "already_exists") {
                res.status(409).send({
                    message: "Product Condition already exists!"
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error during Product Condition creation"
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

    ProductCondition.updateById(req.params.conditionId, new ProductCondition(req.body), (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product condition with Id ${req.params.conditionId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error updating Product Condition with Id ${req.params.conditionId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getById = (req, res) => {
    ProductCondition.getById(req.params.conditionId, (err, data) => {
        if(err){
            if(err.kind === "not_found") {
                res.status(404).send({
                    message: `Product condition with Id ${req.params.conditionId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error getting Product Condition with Id ${req.params.conditionId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
}

exports.getAll = (req, res) => {
    ProductCondition.getAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error while getting all Product Conditions"
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

    ProductCondition.deleteById(req.params.conditionId, (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Product Condition with Id ${req.params.conditionId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error deleting Product Condition with Id ${req.params.conditionId}`
                });
            }
        } else {
            res.status(200).send({
                message: `Deleted Product Condition with Id ${req.params.conditionId}`
            });
        }
    });
};

exports.deleteAll = (req, res) => {
    ProductCondition.deleteAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error during deletion of all Product Conditions"
            });
        } else {
            res.status(200).send({
                message: `All Product Conditions deleted successfully!`
            });
        } 
    });
}
