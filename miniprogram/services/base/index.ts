import { logger } from '../../utils/core/logger';
import { AppError, ErrorCode } from '../../utils/core/error';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class BaseService {
  protected async callFunction(name: string, data: any): Promise<ApiResponse> {
    try {
      const result = await wx.cloud.callFunction({
        name,
        data
      });
      return result.result as ApiResponse;
    } catch (error) {
      logger.error(`调用云函数失败: ${name}`, error);
      throw new AppError(ErrorCode.NETWORK_ERROR, '网络请求失败');
    }
  }
}