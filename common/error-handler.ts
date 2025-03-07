import { AppError, ErrorCode } from './types/error';
import { ApiResponse } from './types/api';

export async function errorHandler(error: Error): Promise<ApiResponse> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }

  return {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: error.message
    }
  };
}