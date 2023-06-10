const nodemailer = require('nodemailer')

class MailService {
  constructor () {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      secureConnection: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    })
  }
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      form: process.env.SMTP_USER,
      to,
      subject: `Account activation ${process.env.API_URL}`,
      text: '',
      html:
        `
          <div>
            <h1>Please activate your account</h1>
            <a href=${link}>${link}</a>
          </div>
        `
    })
  }
}

module.exports = new MailService()
