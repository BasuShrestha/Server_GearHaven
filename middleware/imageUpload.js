const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Base URL:', req.baseUrl);
        let uploadPath;
        if (req.baseUrl.includes('/user')) {
            uploadPath = path.join(__dirname, '../public/images');
        } else if (req.baseUrl.includes('/products')) {
            uploadPath = path.join(__dirname, '../public/product_images');
        } else {
            uploadPath = path.join(__dirname, '../public/uploads');
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        const imageName = Date.now() + '-' + file.originalname;
        cb(null, imageName);
    }
});

const filefilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|octet-stream/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid Image Type! Only JPEG, JPG, and PNG are supported');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: filefilter
});

module.exports = upload;
