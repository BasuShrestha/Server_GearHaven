const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "test123";
const conn = require('../connection/db.js');
const emailHelper = require("../helpers/sendMail");



async function sendOTP(emailAddress, userName, callback) {
    const otp = otpGenerator.generate(6, {
        digits: true,
    upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const tte = 6 * 60 * 1000;

    const expiresIn = Date.now() + tte;
    const data = `${emailAddress}.${otp}.${expiresIn}`;

    const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
    const fullHashValue = `${hash}.${expiresIn}`;

    var message = `Dear ${userName}, ${otp} is the one-time password for verifying your email.`;

    var model = {
        email: emailAddress, // Sending the original email
        subject: "Registration OTP",
        body: message,
    };
    
    console.log(emailAddress, otp, expiresIn, data, hash, fullHashValue);

    emailHelper.sendEmail(model, (error, result) => {
        if (error) {
            return callback(error);
        }
        return callback(null, fullHashValue); // Send the fullHash for verification
    });
}


async function verifyOTP(params, callback) {
    let [hashValue, expires] = params.hash.split('.');

    let now = Date.now();

    if (now > parseInt(expires)) return callback("OTP EXPIRED");

    const emailWithDot = params.email;
    let atIndex = emailWithDot.indexOf('@');
    let localPart = emailWithDot.substring(0, atIndex);
    let domainPart = emailWithDot.substring(atIndex);

    // Replace only the first dot in the local part of the email
    localPart = localPart.replace('.', '');

    // Concatenate the modified local part with the domain part
    const emailWithoutFirstDot = localPart + domainPart;
    let data = `${emailWithoutFirstDot}.${params.otp}.${expires}`;

    console.log(emailWithoutFirstDot, params.otp, expires, data);

    let newCalculateHash = crypto.createHmac("sha256", key).update(data).digest("hex");
    console.log(newCalculateHash, `${newCalculateHash}.${expires}`);

    if (newCalculateHash === hashValue) {
        return callback(null, "Success");
    }
    return callback("Invalid OTP");
}


module.exports = {
    sendOTP,
    verifyOTP
}