import { errorHandler, AppError, ErrorCode } from '../core/error/handler';
import { retry } from './retry';
import { logger } from '../core/logger';

interface QueueItem {
  options: RequestOptions;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface RequestOptions {
  url: string;
  method: string;
  data?: any;
  header?: Record<string, string>;
  needToken?: boolean;
}

class RequestQueue {
  private queue: QueueItem[];
  private processing: boolean;
  private maxConcurrent: number;
  private currentCount: number;

  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 5;
    this.currentCount = 0;
  }

  async add(options: RequestOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ options, resolve, reject });
      this.process().catch(reject);
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.currentCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const item = this.queue.shift();

    if (!item) {
      this.processing = false;
      return;
    }

    this.currentCount++;
    
    try {
      // 处理请求
      const result = await this.handleRequest(item.options);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
      errorHandler(error);
    } finally {
      this.currentCount--;
      this.processing = false;
      
      // 继续处理队列中的下一个请求
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }

  private async handleRequest(options: RequestOptions): Promise<any> {
    const { url, method, data, header, needToken = true } = options;
    
    // 获取 token
    let token = '';
    if (needToken) {
      token = wx.getStorageSync('token');
      if (!token) {
        wx.redirectTo({ url: '/pages/user/login/index' });
        throw new AppError(ErrorCode.UNAUTHORIZED, '未登录');
      }
    }
    
    // 构建请求头
    const requestHeader: Record<string, string> = {
      'Content-Type': 'application/json',
      ...header
    };
    
    if (token) {
      requestHeader.Authorization = `Bearer ${token}`;
    }
    
    // 使用 retry 函数进行请求重试
    return retry(async () => {
      return new Promise<any>((resolve, reject) => {
        wx.request({
          url,
          method: method as any,
          data,
          header: requestHeader,
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              // 使用统一的错误处理
              if (res.statusCode === 401) {
                reject(new AppError(ErrorCode.UNAUTHORIZED, '未授权访问'));
              } else if (res.statusCode === 400) {
                reject(new AppError(ErrorCode.INVALID_PARAMS, '请求参数错误'));
              } else if (res.statusCode >= 500) {
                reject(new AppError(ErrorCode.SERVER_ERROR, '服务器错误'));
              } else {
                reject(new AppError(ErrorCode.BUSINESS_ERROR, `请求失败: ${res.statusCode}`));
              }
            }
          },
          fail: (err) => {
            // 使用 AppError.fromError 处理错误
            reject(AppError.fromError(err));
          }
        });
      });
    }, {
      maxRetries: 3,
      delay: 1000,
      shouldRetry: (error) => {
        // 根据错误类型决定是否重试
        if (error instanceof AppError) {
          return error.code === ErrorCode.SERVER_ERROR || error.code === ErrorCode.NETWORK_ERROR;
        }
        return false;
      }
    });
  }

  clear(): number {
    const count = this.queue.length;
    this.queue.forEach(item => {
      item.reject(new AppError(ErrorCode.BUSINESS_ERROR, '请求已取消'));
    });
    this.queue = [];
    return count;
  }

  get length(): number {
    return this.queue.length;
  }
}

export const requestQueue = new RequestQueue();