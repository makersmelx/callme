import winston from 'winston';
import fs from 'fs';
import config from './config';

fs.access(config.logger.logDir, fs.constants.F_OK, (notExist) => {
  if (notExist) {
    fs.mkdir(config.logger.logDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Fail to create log directory.');
        process.exit(1);
      }
    });
  }
});

const { format } = winston;
const logger = winston.createLogger({
  transports: [
    new winston.transports.File(
      { filename: config.logger.errorLog, level: 'error' },
    ),
    new winston.transports.File(
      { filename: config.logger.infoLog, level: 'info' },
    ),
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

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.colorize({ all: true }),
      format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
      ),
    ),
  }));
}

export default logger;
