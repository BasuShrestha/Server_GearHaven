const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');

const authenticateUser = require('../middleware/authentication');
// const storage = multer.diskStorage({

//     destination:function(req,file,cb){
//         cb(null,path.join(__dirname, '../public/product_images'));
//     },
//     filename:function(req,file,cb){
//         const imageName = Date.now()+'-'+file.originalname;
//         cb(null,imageName);
//     }

// });

// const filefilter = (req,file,cb) => {
//    const fileTypes = /jpeg|jpg|png|octet-stream/;
//    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//    const mimetype = fileTypes.test(file.mimetype);
//    if(mimetype && extname) {
//        return cb(null, true);
//    } else {
//        cb('Error: Invalid Image Type! Only JPEG, JPG, and PNG supported');
//    }
// };

// const upload = multer({
//    storage: storage,
//    limits: {fileSize: 5000000},
//    fileFilter: filefilter
// }).single('image');

const storage = multer.diskStorage({

    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/product_images'));
    },
    filename:function(req,file,cb){
        const imageName = Date.now()+'-'+file.originalname;
        cb(null,imageName);

    }
});

const filefilter = (req,file,cb)=>{
   (file.mimetype == 'image/jpeg' || 'image/png' || 'image/jpg' || 'image/octet-stream')?
   cb(null,true):cb(null,false);
}
const upload = multer({
    storage:storage,
    fileFilter:filefilter
});

const productController = require('../controllers/productController');

router.use(express.static('public'));

// Create a new product for sale
// router.post('/products/sale', upload, productController.createForSale);

router.post('/products/sale', upload.single('image'), productController.createForSale);

// Create a new product for rent
router.post('/products/rent', upload.single('image'), productController.createForRent);

// Update a product
router.put('/products/sales/:productId', upload.single('image'), productController.updateSalesProduct);

router.put('/products/rent/:productId', upload.single('image'), productController.updateRentalProduct);

// Soft Delete a product
router.delete('/products/:productId', productController.deleteProductById)

// Get a product by its ID
router.get('/products/:productId', productController.getProductById);

// Get products by owner ID
router.get('/products/owner/:ownerId', productController.getProductsByOwnerId);

// Get sale products by owner ID
router.get('/products/sale/owner/:ownerId', productController.getSaleProductsByOwnerId);

// Get rent products by owner ID
router.get('/products/rent/owner/:ownerId', productController.getRentProductsByOwnerId);

// Get all sale products
router.get('/products-sale', productController.getAllSaleProducts);

// Add this line to route requests for filtered sale products
router.post('/products-sale/filtered', productController.getFilteredSaleProducts);

// Get all rent products
router.get('/products-rent', productController.getAllRentProducts);

router.get('/products-rent/:productId', productController.getRentalProductById);

module.exports = router;