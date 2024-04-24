const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');

const authorizeUser = require('../middleware/auth');


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

// router.post('/products/sale', upload, productController.createForSale);
// router.post('/products/sale', authorizeUser, upload.single('image'), productController.createForSale);
router.post('/products/sale', upload.single('image'), productController.createForSale);

// router.post('/products/rent', authorizeUser, upload.single('image'), productController.createForRent);
// router.put('/products/sales/:productId', authorizeUser, upload.single('image'), productController.updateSalesProduct);
// router.put('/products/rent/:productId', authorizeUser, upload.single('image'), productController.updateRentalProduct);
// router.delete('/products/:productId', authorizeUser, productController.deleteProductById);

router.post('/products/rent', upload.single('image'), productController.createForRent);
router.put('/products/sales/:productId', upload.single('image'), productController.updateSalesProduct);
router.put('/products/rent/:productId', upload.single('image'), productController.updateRentalProduct);
router.delete('/products/:productId', productController.deleteProductById);


router.get('/products/:productId', productController.getProductById);

// router.get('/products/owner/:ownerId', authorizeUser, productController.getProductsByOwnerId);

// router.get('/products/sale/owner/:ownerId', authorizeUser, productController.getSaleProductsByOwnerId);

// router.get('/products/rent/owner/:ownerId', authorizeUser, productController.getRentProductsByOwnerId);

router.get('/products/owner/:ownerId', productController.getProductsByOwnerId);

router.get('/products/sale/owner/:ownerId', productController.getSaleProductsByOwnerId);

router.get('/products/rent/owner/:ownerId', productController.getRentProductsByOwnerId);

router.get('/products-sale', productController.getAllSaleProducts);

router.post('/products-sale/filtered', productController.getFilteredSaleProducts);

router.get('/products-rent', productController.getAllRentProducts);

router.get('/products-rent/:productId', productController.getRentalProductById);

module.exports = router;