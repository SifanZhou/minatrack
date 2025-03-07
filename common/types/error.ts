export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_PARAMS = 'INVALID_PARAMS',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class AppError extends Error {
  code: ErrorCode;
  
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
  
  static fromError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError(ErrorCode.INTERNAL_ERROR, error.message || '未知错误');
  }
}