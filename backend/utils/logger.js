const winston = require('winston');
const path = require('path');

const setupLogger = () => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error'
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log')
      })
    ]
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  }

  logger.stream = {
    write: (message) => {
      logger.info(message.trim());
    }
  };

  return logger;
};

module.exports = {
  setupLogger,
  logger: setupLogger()
};
