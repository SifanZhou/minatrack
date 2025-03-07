import { AppError, ErrorCode } from '../types/error';
import { createLog } from '../../functions/system/audit';

export const errorHandler = async (error: unknown) => {
  // 标准化错误
  const appError = error instanceof AppError ? error : new AppError(
    ErrorCode.INTERNAL_ERROR,
    error instanceof Error ? error.message : '系统错误'
  );

  // 记录错误日志
  await createLog({
    action: 'device_bind',
    userId: '', // 添加必需的userId字段
    details: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      stack: appError.stack
    }
  });

  return {
    success: false,
    error: {
      code: parseInt(appError.code.toString()),
      message: appError.message
    }
  };
};