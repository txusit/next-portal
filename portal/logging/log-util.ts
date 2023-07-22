import pino, { Logger } from 'pino'
import papertrail from 'pino-papertrail'

export function getLogger(): Logger {
  const appname =
    process.env.NEXT_PUBLIC_ENVIRONMENT == 'dev'
      ? 'next-portal-dev'
      : 'next-portal-prod'

  const writeStream = papertrail.createWriteStream({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
    appname,
  })

  const streams = [{ stream: writeStream }]

  const logger = pino(
    {
      enabled: !(process.env.LOG_ENABLED === 'false'),
      level: 'info',
    },
    pino.multistream(streams)
  )

  return logger
}
