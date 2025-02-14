const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Transporter is a service that will actually send the email
  // 1) Create a transporter // configuration for the transport in Nodemailer
  // In gmail account we have to activate "less secure app option"
  // Gmail is not good idea for production app ( limit: 500 emails a day )
  // SendGrid, Mailgun <-- Other mail services     //add service: 'Gmail' as option if using GMAIL

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // We gonna use a special development service, which fakes to send emails to real addresses
  // In reality, these email end up trapped in development inbox, so that we can then take a look how
  // they will look later in production ( Mailtrap )

  // 2) Define the email options
  const mailOptions = {
    from: 'Artur SD <arko8919@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  // 3) Actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
