const express = require('express');

const router = express.Router();

const path = require('path');
const multer = require ('multer');

const storage = multer.diskStorage({

    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/images'));
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

const {signUpValidation, loginValidation, forgetValidation, updateProfileValidation} = require('../helpers/validation.js');
const isAuth = require('../middleware/auth.js');

const userController = require('../controllers/userController.js');


router.use(express.static('public'));

router.post('/register', signUpValidation, userController.register);
router.post('/login',loginValidation, userController.login);
router.post('/refresh-token', userController.verifyRefreshToken);
router.get('/get-user', userController.verifyAccessToken, userController.getUser);
router.post('/forget-password', forgetValidation, userController.forgetPassword);
//router.post('/update-profile/:userId', upload.single('image'), updateProfileValidation, isAuth.isAuthorize, userController.updateProfile);
router.post('/update-profile/:userId', upload.single('image'), updateProfileValidation, userController.updateProfile);

module.exports = router;