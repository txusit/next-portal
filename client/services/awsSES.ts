import * as AWS from 'aws-sdk'
import { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import * as nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'

AWS.config.update({
  accessKeyId: process.env.AWS_MAILER_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_MAILER_SECRET_ACCESS_KEY,
  region: 'us-east-1',
})

AWS.config.getCredentials((error) => {
  if (error) {
    console.log(error.stack)
  }
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })
const adminMail = 'portal-mailer@usiteam.org'
const transporter = nodemailer.createTransport({
  SES: ses,
})

// point to the template folder
const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    partialsDir: path.resolve(process.cwd(), 'services/emailTemplates'),
    defaultLayout: false,
  },
  viewPath: path.resolve(process.cwd(), 'services/emailTemplates'),
}

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

export const sendConfirmationEmailSES = async (
  userEmail: string,
  token: string
) => {
  const url = `${process.env.BASE_URL}/confirmEmail?token=${token}`

  var mailOptions = {
    from: adminMail,
    to: userEmail,
    subject: 'USIT Portal Sign Up Verification',
    template: 'confirmEmailTemplate', // the name of the template file i.e confirmEmailTemplate.handlebars
    context: {
      url: url, // replacing {{url}} with url
    },
  }

  const response = await transporter.sendMail(mailOptions)

  if (!response?.messageId) {
    throw new ApiError(
      HttpStatusCode.ServiceUnavailable,
      'Unable to send email'
    )
  } else {
    return { ok: true }
  }
}