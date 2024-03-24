const express = require('express');
const webRoute = express();

webRoute.set('view engine', 'ejs');
webRoute.set('views', './views');
webRoute.use(express.static('public'));

const userController = require('../controllers/userController');

webRoute.get('/email-verification', userController.verifyEmail);
webRoute.get('/forget-password', userController.forgetPasswordLoad);
webRoute.post('/reset-password', userController.resetPassword);

module.exports = webRoute;