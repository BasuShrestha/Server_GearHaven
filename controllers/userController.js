const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const {JWT_SECRET, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} =process.env;
const conn = require('../connection/db');
const sendMail= require('../helpers/sendMail');
const {sendOTP, verifyOTP} = require('../helpers/sendOtp');

const register = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userEmail = conn.escape(req.body.email);

    conn.query(
        `SELECT * FROM users WHERE LOWER(user_email) = LOWER(${userEmail});`,
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: err.sqlMessage || 'Database error'
                });
            }

            if (result && result.length) {
                return res.status(409).send({
                    message: 'The user already exists'
                });
                
            } else {
                
                sendOTP(req.body.email, req.body.username, (error, result) => {
                    if (error) {
                        return res.status(500).send({
                            message: "Error sending OTP",
                            data: error,
                        });
                    }


                bcrypt.hash(req.body.password, 10, (hashErr, hash) => {
                    if (hashErr) {
                        return res.status(500).send({
                            message: hashErr
                        });
                    } else {
                    const userName = conn.escape(req.body.username);
                    const userLocation = conn.escape(req.body.location);
                    const userContact = conn.escape(req.body.contact);
                    const fcmToken = conn.escape(req.body.fcmToken);

                    const sql = `INSERT INTO users (user_name, user_email, user_password, user_location, user_contact, fcm_token) VALUES (${userName}, ${userEmail}, ${conn.escape(hash)}, ${userLocation}, ${userContact}, ${fcmToken})`;

                    conn.query(sql, (insertErr) => {
                        if (insertErr) {
                            return res.status(500).send({
                                message: insertErr.sqlMessage || 'Database error'
                            });
                        }
                        return res.status(200).send({
                            message: 'Your account has been registered. Please verify your email using the OTP sent in your email.',
                            fullHash: result,
                        });
                    });   
                    } 
                });
            });   
        }
    }); 
}

const resendOTP = (req, res) => {
    sendOTP(req.body.email, req.body.userName, (error, result) => {
        if(error){
            return res.status(400).send({
                message:"error",
                data: error,
            });
        }

        return res.status(200).send({
            message: 'Resent verification mail',
            data: result,
        });
    });
};

const verifyUserOTP = (req, res) => {
    verifyOTP(req.body, (error, result)=>{
        if(error){
            return res.status(400).send({
                message:"error",
                data: error,
            });
        }

        if(result.verified == "true") {
            console.log(`Email in the controller : ${req.body.email}`);
            const plainEmail = req.body.email;
            let atIndex = plainEmail.indexOf('@');
            let localPart = plainEmail.substring(0, atIndex);
            let domainPart = plainEmail.substring(atIndex);
        
            localPart = localPart.replace('.', '');
        
            const escapedEmail = localPart + domainPart;
            console.log(escapedEmail);
            conn.query(`UPDATE users SET is_verified = 1 WHERE user_email = '${escapedEmail}';`);
            return res.status(200).send({message: "Email verification successful"});
        } else if (result.verified == "false") {
            return res.status(400).send({message: "The entered OTP is not valid"});
        }
    });
};

const verifyEmail = (req, res) => {
    var token = req.query.token;
    conn.query('SELECT * FROM users WHERE token = ? LIMIT 1', token, (error, result) => {
        if(error){
            console.log(error);
            return res.render('email-verification.ejs', {
                message: 'Email-verification failed!'
            });
        }
        if(result.length > 0){
            conn.query(`UPDATE users SET token = null, is_verified = 1 WHERE user_id = '${result[0].user_id}'`);

            return res.render('email-verification.ejs', {
                message: 'Email Verified Successfully!'
            });
        } else {
            return res.render('404.ejs');
        }
    });
};

const login = (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const sql = `SELECT * FROM users WHERE user_email = ${conn.escape(req.body.email)};`;

    conn.query(sql, (err, result) => {
        if (err) {
            return res.status(400).send({
                message: err
            });
        }
        if (!result.length) {
            return res.status(404).send({
                message: 'Email not found!'
            });
        }
            bcrypt.compare(
                req.body.password,
                result[0]['user_password'],
                (comparisonError, passwordMatch) => {
                    if(comparisonError)
                    {
                        return res.status(400).send({
                            message:comparisonError
                        });
                    }
                    if(passwordMatch){
                        const accessToken = jwt.sign({id:result[0]['user_id']},ACCESS_TOKEN_SECRET,{expiresIn :'3m'});
                         const refreshToken = jwt.sign({id:result[0]['user_id']},REFRESH_TOKEN_SECRET,{expiresIn :'7d'});
                         const refreshTokenExpiration = new Date();
                         refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 7);
                         conn.query('UPDATE users SET refresh_token_expiration = ?, refresh_token = ? WHERE user_id = ?', 
                         [refreshTokenExpiration, refreshToken, result[0]['user_id']],
                         (err, rest) => {
                            if(err) {
                                return res.status(500).send({
                                    message: 'Internal Server Error'
                                });
                            }
                            
                            return res.status(200).send({
                               message : 'Login successful!',
                               accessToken: accessToken, 
                               refreshToken: refreshToken,
                               user: result[0]
                           });
                         });
                    } else {
                        return res.status(401).send({
                            message:'Incorrect Password!'
                        });                           
                    }
                }
            )
        }
    )
}

const verifyRefreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;

    conn.query('SELECT * FROM users WHERE refresh_token = ?', [refreshToken], (err, result) => {
        if(err) {
            return res.status(500).send({
                message: 'Internal Server Error'
            });
        }

        if(result.length === 0) {
            return res.status(403).send({
                message: 'Invalid Refresh Token'
            });
        }

        const user = result[0];
        const refreshTokenExpirationDate = new Date(user.refresh_token_expiration);
        
        if(refreshTokenExpirationDate <= new Date()) {
            conn.query('UPDATE users SET refresh_token = NULL, refresh_token_expiration = NULL WHERE user_id = ?',
            [user.user_id],
            (err, result) => {
                if(err) {
                    return res.status(500).send({
                        message: 'Internal Server Error'
                    });
                }

                return res.status(403).send({
                    message: 'Refresh token expired'
                });
            });
        } else {
            const accessToken = jwt.sign({id:user.user_id},ACCESS_TOKEN_SECRET,{expiresIn :'3m'});
            return res.send({accessToken});
        }
    });

}

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(" ")[1];

    if(!accessToken) {
        return res.status(401).send({
            message: 'Access Token is missing'
        });
    }

    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.status(401).send({
                message: 'Invalid Access Token'
            });
        }
        req.user_id = user.user_id;
        next();
    });
}

// const getUser = (req, res) => {
//     const authToken = req.headers.authorization.split(' ')[1];
//     const decodeToken = jwt.verify(authToken, JWT_SECRET);

//     const user_id = req.user_id;
//     conn.query(`SELECT * FROM users WHERE user_id = ?`,
//     [decodeToken.id],
//     (err, result, fields) => {
//         if(err) {
//             return res.status(500).send({
//                 message: 'Server Error While getting user details'
//             });
//         } else {
//             return res.status(200).send({
//                 data: result[0]
//             });
//         }
//     });
// }

// const getUser = (req, res) => {

//     const authToken = req.headers.authorization.split(' ')[1];
//     const decodeToken = jwt.verify(authToken, JWT_SECRET);

//     conn.query('SELECT * FROM userprofiles where user_id=?', decodeToken.id, function(error, result, fields){
//         if(error) throw error;

//         return res.status(200).send({
//             verified:true, data: result[0], message:"Fetched successfully!"
//         });
//     });
// }

const forgetPassword = (req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    var email = req.body.email;
    conn.query('SELECT * FROM users where user_email=? limit 1', email,function(error, result,fields){
        if(error){ 
            return res.status(400).json({message:error});
        }

        if(result.length > 0){

            let mailSubject = 'Forget Password';

            const randomString = randomstring.generate();
            let content = '<p> Hi, '+result[0].user_name+' \
             Please <a href="http://localhost:5000/forget-password?token='+randomString+'"> Click here</a> to reset your password</p>\
            ';
            sendMail(email,mailSubject,content);

            // userEmail = conn.escape(result[0].email);
            // userToken = conn.escape(randomString);
            conn.query(`DELETE FROM password_reset WHERE user_email = ${conn.escape(result[0].user_email)}`);
            conn.query(`INSERT INTO password_reset (user_email, token) VALUES (${conn.escape(result[0].user_email)}, '${randomString}')`
          );
          return res.status(200).send({
            message: "Mail sent successfully!"
          });
         
        }

        return res.status(401).send({
            message:"Email doesn't exist!"
        });
    });

}

const forgetPasswordLoad = (req, res) => {
    try {
       var token = req.query.token;
       if(token == undefined){
            res.render('404');
       } 
       conn.query(`SELECT * FROM password_reset where token = ? limit 1`, token, function(error, result, fields){
            if(error) {
                console.log(error.message);
            }

            if(result !== undefined && result.length > 0){

                conn.query(`SELECT * FROM users WHERE user_email = ? limit 1`, result[0].user_email, function(error, result, fields){
                    if(error) {
                        console.log(error.message);
                    }
                    res.render('forget-password', {user: result[0]});
                });

            } else {
                res.render('404');
            }
       });
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = (req, res) => {
    if (req.body.password != req.body.confirm_password) {
        res.render('forget-password', {error_message: 'Password do not match', user: {user_id: req.body.id, user_email: req.body.email}});
    }
    bcrypt.hash(req.body.confirm_password, 10, (err, hash) => {
        if(err) {
            console.log(err);
        }
        conn.query(`DELETE FROM password_reset WHERE user_email = '${req.body.email}'`);
        conn.query(`UPDATE users SET user_password = '${hash}' WHERE user_id = '${req.body.id}'`);
        res.render('message', {reset_message: 'Password Reset Successfully!'});       
    })
};

const getUser = (req,res) => {

    const authToken = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(authToken, ACCESS_TOKEN_SECRET);

    const user_id = req.user_id;
    conn.query('SELECT * FROM users where user_id = ?', decodeToken.id, function(error, result, fields){
        if(error) throw error;

        return res.status(200).json(result[0]);
    });
}


// const updateProfile = (req,res)=>{
//     try{
//         const errors = validationResult(req);

//         if(!errors.isEmpty()){
//             return res.status(400).json({
//                 errors:errors.array()
//             });
//          }
        
//          const token = req.headers.authorization.split(' ')[1];
//          const decodeToken = jwt.verify(token, JWT_SECRET);

//          var sql = '', data;

//          if(req.file != null){
//             sql = 'UPDATE users SET user_name = ?, user_email = ?, user_contact = ?, user_location = ?, profile_image = ? WHERE user_id = ?';
//             data = [req.body.username, req.body.email, req.body.contact, req.body.location, 'images/'+req.file.filename, decodeToken.id];
//          } else {
//             sql = 'UPDATE users SET user_name = ?, user_email = ?, user_contact = ?, user_location, = ? WHERE user_id = ?';
//             data = [req.body.username, req.body.email, req.body.contact, req.body.location, decodeToken.id];
//          }

//          conn.query(sql, data, function(error, result, fields){
//             if(error){
//                 res.status(400).send({message: error.message});
//             }
//             res.status(200).send({message: "Profile Updated Successfully!"});
//          });

//     }catch(error){
//         return res.status(400).json({message: error.message});
//         // console.log(error.message);
//     }
    

// }

const updateProfile = (req,res)=>{
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
         }

         const userId = req.params.userId;
        
        //  const token = req.headers.authorization.split(' ')[1];
        //  const decodeToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

         var sql = '', data;

         if(req.file != null){
            sql = 'UPDATE users SET user_name = ?, user_email = ?, user_contact = ?, user_location = ?, profile_image = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, req.body.contact, req.body.location, req.file.filename, userId];
         } else {
            sql = 'UPDATE users SET user_name = ?, user_email = ?, user_contact = ?, user_location = ? WHERE user_id = ?';
            data = [req.body.username, req.body.email, req.body.contact, req.body.location, userId];
         }

         conn.query(sql, data, function(error, result, fields){
            if(error){
                res.status(400).send({message: `Update 400: ${error.message}`});
            }
            res.status(200).send({message: "Profile Updated Successfully!"});
         });

    }catch(error){
        return res.status(400).json({message: `Update Catch 400: ${error.message}`});
        // console.log(error.message);
    }
    

}


module.exports = {
    register,
    verifyUserOTP,
    resendOTP,
    verifyEmail,
    login,
    verifyRefreshToken,
    verifyAccessToken,
    forgetPassword,
    forgetPasswordLoad,
    resetPassword,
    getUser,
    updateProfile
};