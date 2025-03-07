import winston from 'winston';
import { ConfigManager } from './config-manager';

const config = {
  env: process.env.NODE_ENV || 'development'
};

const winstonLogger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (config.env !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const cloud = require('wx-server-sdk');

export const logger = {
  info: async (action: string, details: Record<string, any>) => {
    const db = cloud.database();
    const logData = {
      level: 'info',
      action,
      details,
      timestamp: new Date()
    };

    // 使用Winston记录日志
    winstonLogger.info(logData);

    // 保存到数据库
    const result = await db.collection('system_logs').add({
      data: logData
    });
    return result;
  },
  
  error: async (action: string, error: Error, details?: Record<string, any>) => {
    const db = cloud.database();
    const logData = {
      level: 'error',
      action,
      error: {
        message: error.message,
        stack: error.stack
      },
      details,
      timestamp: new Date()
    };

    // 使用Winston记录错误
    winstonLogger.error(logData);

    // 保存到数据库
    const result = await db.collection('system_logs').add({
      data: logData
    });
    return result;
  }
};

export default logger;