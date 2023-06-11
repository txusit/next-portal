import pino, { Logger } from 'pino'
import pretty from 'pino-pretty'
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

  const streams = [
    { stream: writeStream },
    {
      stream: pretty({
        colorize: true,
        sync: true,
      }),
    },
  ]

  const logger = pino(
    {
      level: 'info',
    },
    pino.multistream(streams)
  )

  return logger
}
