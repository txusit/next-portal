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
    partialsDir: path.resolve(process.cwd(), 'lib/services/email/templates'),
    defaultLayout: false,
  },
  viewPath: path.resolve(process.cwd(), 'lib/services/email/templates'),
}

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

export const sendEmailSES = async (
  userEmail: string,
  token: string,
  actionPage: string
) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/${actionPage}?token=${token}`
  const subject =
    actionPage == 'confirm-email'
      ? 'USIT Portal Sign Up Verification'
      : 'USIT Portal Password Reset'
  const template =
    actionPage == 'confirm-email'
      ? 'confirm-email-template'
      : 'reset-password-email-template'
  var mailOptions = {
    from: adminMail,
    to: userEmail,
    subject,
    template, // the name of the template file i.e confirmEmailTemplate.handlebars
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
  }

  return { ok: true }
}
