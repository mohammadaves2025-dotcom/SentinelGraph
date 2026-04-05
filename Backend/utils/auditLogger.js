// backend/utils/auditLogger.js
import winston from 'winston';

const auditLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
    ),
    transports: [
        // This writes the logs permanently to a file on the server
        new winston.transports.File({ filename: 'sentinel-audit.log' }),
        // This also prints them beautifully to your terminal
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

export default auditLogger;