const nodeMailer = require('nodemailer');

const sendMail = async (email, emailSubject, emailContent) => {
    try{
        const transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'basu.stha4@gmail.com',
                pass: 'grcrvcylhuufwgkq'
            }
        });

        const mailOptions = {
            from: 'basu.stha4@gmail.com',
            to: email,
            subject: emailSubject,
            html: emailContent
        }
        
        await transporter.sendMail(mailOptions, (err, result) => {
            if(err){
                console.log(err);
            } else {
                console.log(`Mail sent successfully: ${result.response}`);
            }
        })
    } catch(error) {
        console.log(error);
    }
}

module.exports = sendMail;