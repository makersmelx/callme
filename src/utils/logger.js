import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const loggingWinston = new LoggingWinston();

const { format } = winston;
const logger = winston.createLogger({
  transports: [
    process.env.NODE_ENV === 'production'
      ? loggingWinston
      : new winston.transports.Console({
        format: format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.colorize({ all: true }),
          format.printf(
            (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
          ),
        ),
      }),
  ],
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
    ),
  ),
});

export default logger;
