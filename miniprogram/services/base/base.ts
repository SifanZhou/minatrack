import { logger } from '../../utils/core/logger';
import { AppError, ErrorCode } from '../../utils/core/error/handler';
import { appConfig } from '../../config/index';
import { requestQueue } from '../../utils/performance/queue';
import { mockData } from '../../mock/index';

interface RequestOptions {
  cache?: boolean;
  cacheExpire?: number;
}

export class BaseService {
  async callFunction(name: string, data: any = {}): Promise<any> {
    const startTime = Date.now();
    
    // 本地模拟模式
    if (appConfig.useLocalMock) {
      logger.info(`[模拟] 调用云函数 ${name}，参数:`, data);
      
      try {
        // 从模拟数据中获取响应
        const mockResponse = await this.getMockResponse(name, data);
        logger.info(`[模拟] 云函数 ${name} 执行完成，耗时 ${Date.now() - startTime}ms`);
        return mockResponse;
      } catch (error) {
        logger.error(`[模拟] 云函数 ${name} 执行失败:`, error);
        throw new AppError(
          ErrorCode.SERVER_ERROR,
          `模拟云函数 ${name} 执行失败: ${error.message || '未知错误'}`,
          { functionName: name, params: data }
        );
      }
    }
    
    // 真实云函数调用
    try {
      const result = await wx.cloud.callFunction({
        name,
        data
      });
      
      logger.info(`云函数 ${name} 执行完成，耗时 ${Date.now() - startTime}ms`);
      
      if (result.result && result.result.error) {
        throw new AppError(
          result.result.error.code || ErrorCode.SERVER_ERROR,
          result.result.error.message || '云函数执行失败',
          result.result.error.data
        );
      }
      
      return result.result;
    } catch (error) {
      logger.error(`Error calling cloud function ${name}:`, error);
      
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          ErrorCode.SERVER_ERROR,
          `云函数 ${name} 执行失败: ${error.message || '未知错误'}`,
          { functionName: name, params: data }
        );
      }
    }
  }
  
  // 获取模拟响应数据
  private async getMockResponse(name: string, data: any): Promise<any> {
    // 根据云函数名称和操作类型返回模拟数据
    if (!mockData[name]) {
      throw new Error(`未找到模拟数据: ${name}`);
    }
    
    const action = data.action || 'default';
    
    if (typeof mockData[name][action] === 'function') {
      return mockData[name][action](data);
    } else if (mockData[name][action]) {
      return mockData[name][action];
    } else {
      throw new Error(`未找到模拟操作: ${action}`);
    }
  }
  
  async request<T = any>(
    path: string, 
    method: string = 'GET', 
    data: any = {}, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { cache = false, cacheExpire = appConfig.cacheTime.medium } = options;
    
    const url = `${appConfig.apiBaseUrl}${path}`;
    
    return requestQueue.add({
      url,
      method,
      data,
      header: {},
      needToken: true
    });
  }
}