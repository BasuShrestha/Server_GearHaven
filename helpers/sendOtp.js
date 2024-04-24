const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "test123";
const conn = require('../connection/db.js');
const emailHelper = require("../helpers/sendMail");



async function sendOTP(emailAddress, userName, callback) {
    const OTP = otpGenerator.generate(6, {
        digits: true,
    upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const tte = 6 * 60 * 1000;

    const expiresIn = Date.now() + tte;
    const data = `${emailAddress}.${OTP}.${expiresIn}`;

    const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
    const fullHashValue = `${hash}.${expiresIn}`;

    var message = `Dear ${userName}, ${OTP} is the one-time password for verifying your email.`;

    var model = {
        email: emailAddress,
        subject: "Registration OTP",
        body: message,
    };
    
    console.log(emailAddress, OTP, expiresIn, data, hash, fullHashValue);

    emailHelper.sendEmail(model, (error, result) => {
        if (error) {
            return callback(error);
        }
        return callback(null, fullHashValue);
    });
}


async function verifyOTP(params, callback) {
    let [hash, expiresIn] = params.fullHashValue.split('.');

    let now = Date.now();

    if (now > parseInt(expiresIn)) return callback("OTP EXPIRED");

    const plainEmail = params.email;
    let atIndex = plainEmail.indexOf('@');
    let localPart = plainEmail.substring(0, atIndex);
    let domainPart = plainEmail.substring(atIndex);

    localPart = localPart.replace('.', '');

    const escapedEmail = localPart + domainPart;
    let data = `${escapedEmail}.${params.OTP}.${expiresIn}`;

    console.log(escapedEmail, params.OTP, expiresIn, data);

    let calculatedHash = crypto.createHmac("sha256", key).update(data).digest("hex");
    console.log(calculatedHash, `${calculatedHash}.${expiresIn}`);

    if (calculatedHash === hash) {
        return callback(null, {verified : "true"});
    }
    return callback(null, {verified : "false"});
}


module.exports = {
    sendOTP,
    verifyOTP
}