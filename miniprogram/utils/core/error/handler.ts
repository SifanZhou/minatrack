// 定义错误码
export enum ErrorCode {
  NETWORK_ERROR = 1001,
  UNAUTHORIZED = 1002,
  INVALID_PARAMS = 1003,
  SERVER_ERROR = 1004,
  BUSINESS_ERROR = 1005,
  TIMEOUT_ERROR = 1006
}

interface ErrorData {
  [key: string]: any;
}

export class AppError extends Error {
  code: ErrorCode;
  data: ErrorData | null;

  constructor(code: ErrorCode, message: string, data: ErrorData | null = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.data = data;
  }

  static fromError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    // 处理网络错误
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      return new AppError(ErrorCode.NETWORK_ERROR, '网络连接失败');
    }
    
    // 处理超时错误
    if (error.message && error.message.includes('timeout')) {
      return new AppError(ErrorCode.TIMEOUT_ERROR, '请求超时');
    }
    
    // 处理其他错误
    return new AppError(ErrorCode.SERVER_ERROR, error.message || '系统错误');
  }
}

export const errorHandler = (error: any): AppError => {
  const appError = AppError.fromError(error);
  
  // 错误日志
  console.error({
    code: appError.code,
    message: appError.message,
    data: appError.data,
    stack: appError.stack
  });

  // 错误提示
  wx.showToast({
    title: appError.message,
    icon: 'error',
    duration: 2000
  });

  // 特殊错误处理
  switch (appError.code) {
    case ErrorCode.UNAUTHORIZED:
      wx.redirectTo({ url: '/pages/user/login/index' });
      break;
      
    case ErrorCode.NETWORK_ERROR:
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            wx.showToast({
              title: '请检查网络连接',
              icon: 'none'
            });
          }
        }
      });
      break;
  }

  return appError;
};