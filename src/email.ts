import { IEmailData } from './models';
const nodemailer = require('nodemailer');
let transporter = null;

exports.init = async () => {
    const acc= await nodemailer.createTestAccount(); //.then(acc => {
    const user = process.env.MAIL_LOGIN || acc.user;
    const pass = process.env.MAIL_PASS || acc.pass;

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user, pass }
    });

    /*transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
    });*/
};

exports.sendEmail = async (data: IEmailData) => {
    return transporter.sendMail({
        from: data.email,
        to: data.toEmail || process.env.MAIL_TO,
        subject: `${data.firstName} ${data.lastName}`,
        text: data.message + ' phone: ' + data.phone
    });
};
