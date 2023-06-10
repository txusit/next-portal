import { SES, AWSError } from 'aws-sdk'
import {
  SendEmailRequest,
  SendEmailResponse,
  SendTemplatedEmailRequest,
} from 'aws-sdk/clients/ses'

// portal-mailer IAM user
const SES_CONFIG = {
  accessKeyId: process.env.AWS_MAILER_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_MAILER_SECRET_ACCESS_KEY,
  region: 'us-east-1',
}

const AWS_SES = new SES(SES_CONFIG)

export const sendEmail = (
  recipientEmail: string,
  name: string
): Promise<any> => {
  let params: SendEmailRequest = {
    Source: 'portal-mailer@usiteam.org',
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: 'This is the body of my email!',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello, ${name}!`,
      },
    },
  }
  return AWS_SES.sendEmail(params).promise()
}

export const sendTemplateConfirmationEmail = (
  recipientEmail: string,
  token: string
): Promise<any> => {
  let params: SendTemplatedEmailRequest = {
    Source: 'portal-mailer@usiteam.org',
    Template: 'ConfirmEmailTemplate',
    Destination: {
      ToAddresses: [recipientEmail],
    },
    TemplateData: JSON.stringify({
      'url': `http://localhost:3000/confirmEmail?token=${token}`,
    }),
  }
  // TODO: error handle
  return AWS_SES.sendTemplatedEmail(
    params,
    (err: AWSError, data: SendEmailResponse) => {
      if (err) console.log(err, err.stack)
      else console.log(data)
    }
  ).promise()
}
