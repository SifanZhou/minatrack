export enum ErrorCode {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
  INVALID_PARAMS = 422,
  DEVICE_ERROR = 600,
  PAYMENT_ERROR = 700,
  CONFLICT = 409,
  SYSTEM_ERROR = 800
}

export declare class AppError extends Error {
  code: ErrorCode;
  details?: any;

  constructor(code: ErrorCode, message: string, details?: any);
  static fromError(error: unknown): AppError;
}