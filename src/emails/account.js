const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENGRID_API_KEY);


const sendWelcomeEmail = (email , name) => {
    sgMail.send({
        to: email,
        from: 'sivangrisario@gmail.com',
        subject: 'Welcome to tasks app',
        text: `Welcome ${name}`
    });
}

module.exports = {
    sendWelcomeEmail
}
