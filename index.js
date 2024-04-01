require('./connection/db.js');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const  {initializeApp, applicationDefault} = require('firebase-admin/app');
const {getMessaging} = require('firebase-admin/messaging');

require("dotenv").config();


const userRoute = require('./routes/userRoute.js');
const webRoute = require('./routes/webRoute.js');
const productCategoryRoute = require('./routes/productCategoryRoute.js');
const productSizeRoute = require('./routes/productSizeRoute.js');
const productConditionRoute = require('./routes/productConditionRoute.js');
const productRoute = require('./routes/productRoute.js');
const orderRoute = require('./routes/orderRoute.js');
const paymentRoute = require('./routes/paymentRoute.js');
const rentingRoute = require('./routes/rentingRoute.js');
const wishlistRoute = require('./routes/wishlistRoute.js');


process.env.GOOGLE_APPLICATION_CREDENTIALS;

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.static('public'));

initializeApp({
    credential: applicationDefault(),
    projectId: 'gearhaven-project'
});

app.use(cors());
app.use('/', userRoute);
app.use('/', webRoute);
app.use('/', productCategoryRoute);
app.use('/', productSizeRoute);
app.use('/', productConditionRoute);
app.use('/', productRoute);
app.use('/', orderRoute);
app.use('/', paymentRoute);
app.use('/', rentingRoute);
app.use('/', wishlistRoute);

const Port = process.env.Port || 5000;

app.use((err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server";
    res.status(err.statusCode).json({
            message:err.message,
    });
});


app.listen(Port, () => console.log(`Server running on port: ${Port}`));