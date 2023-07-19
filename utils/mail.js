const nodemailer = require('nodemailer')

module.exports = async (options) => {
  // 1. Create nodemailer transportation
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // 2. set message options
  const mailOptions = {
    from: 'bhargav <bhargav@mail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // 3. sendmail
  await transport.sendMail(mailOptions)
}
