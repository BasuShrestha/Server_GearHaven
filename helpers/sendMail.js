var nodemailer = require('nodemailer');

async function sendEmail(params, callback){

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure:false,
        requireTLS:true,
        auth: {
            user: 'basu.stha4@gmail.com',
            pass: 'tpbvcddrvfcwdvxe'
        }
    });
    
    const mailOptions = {
        from: 'basu.stha4@gmail.com',
        to: params.email,
        subject: params.subject,
        text: params.body,
    };

    transport.sendMail(mailOptions, function(error,info){
        if(error){
            return callback(error);
        }
        else {
            return callback(null, info.response);
        }
    });
}


module.exports = {
    sendEmail
}