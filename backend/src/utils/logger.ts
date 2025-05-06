import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      const fileInfo = metadata.file
        ? `[${metadata.file}:${metadata.line}]`
        : "";
      return `${timestamp} ${level} ${fileInfo} ${message} ${
        Object.keys(metadata).length ? JSON.stringify(metadata) : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export const createLogger = (file: string) => ({
  info: (message: string, line: number, meta?: any) =>
    logger.info(message, { file, line, ...meta }),
  error: (message: string, line: number, meta?: any) =>
    logger.error(message, { file, line, ...meta }),
  warn: (message: string, line: number, meta?: any) =>
    logger.warn(message, { file, line, ...meta }),
  debug: (message: string, line: number, meta?: any) =>
    logger.debug(message, { file, line, ...meta }),
});
