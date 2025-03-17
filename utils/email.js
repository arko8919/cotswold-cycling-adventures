/* eslint-disable lines-between-class-members */
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Artur Sas Dunajewski <${process.env.EMAIL_FROM}>`;
  }
  // Create an email transport configuration:
  // - Uses SendGrid for email delivery in production
  // - Authenticates with SendGrid credentials from environment variables
  newTransport() {
    if (process.env.NODE_ENV.trim() === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    // Create an email transport configuration for development or non-production environments:
    // - Uses custom SMTP (Simple Mail Transfer Protocol) settings
    // from environment variables (host, port, authentication)
    // - Ensures secure email delivery based on configured credentials
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send an email using a specified template and subject:
  // - Renders an HTML email from a Pug template, passing user-specific data
  // - Defines email options including sender, recipient, subject, and content
  // - Converts HTML to plain text for better email compatibility
  // Send the actual email
  async send(template, subject) {
    // Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      // Pass data for email personalization
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // Send the email using the configured transport and the defined email options
    await this.newTransport().sendMail(mailOptions);
  }
  // Send a welcome email using the 'welcome' template with a predefined subject
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Cotswold Cycling family!');
  }
  // Send a password reset email using the 'passwordReset' template
  // with a subject informing the user that the token is valid for 10 minutes
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token ( valid for only 10 minutes',
    );
  }
};
