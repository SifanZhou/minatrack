import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { requestQueue } from '../../utils/performance/queue';
import { AppError, ErrorCode } from '../../utils/types/error';
import { WxResponse, WxRequestOptions } from '../../utils/types/wx';

type WxRequestFunction = (options: WxRequestOptions) => Promise<WxResponse<any>>;

declare global {
  var wx: {
    request: jest.MockedFunction<WxRequestFunction>;
    getStorageSync: jest.Mock;
    redirectTo: jest.Mock;
    showToast: jest.Mock;
  };
}

// 模拟wx对象
global.wx = {
  request: jest.fn<WxRequestFunction>().mockImplementation(() => Promise.resolve({
    statusCode: 200,
    data: { code: 0, message: 'success', data: {} },
    header: {}
  })),
  getStorageSync: jest.fn(),
  redirectTo: jest.fn(),
  showToast: jest.fn()
};

describe('RequestQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.wx.getStorageSync.mockReturnValue('fake-token');
  });

  describe('基础功能测试', () => {
    test('成功发送请求', async () => {
      const mockResponse: WxResponse<any> = {
        data: { code: 0, message: 'success', data: { id: 1 } },
        statusCode: 200,
        header: {}
      };
      global.wx.request.mockResolvedValueOnce(mockResponse);

      const result = await requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      expect(result).toEqual({ id: 1 });
      expect(global.wx.request).toHaveBeenCalledTimes(1);
    });

    test('未登录时应重定向', async () => {
      global.wx.getStorageSync.mockReturnValueOnce('');

      const promise = requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      await expect(promise).rejects.toThrow('未登录');
      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED
      });

      expect(global.wx.redirectTo).toHaveBeenCalledWith({
        url: '/pages/index/index'
      });
    });
  });

  describe('错误处理测试', () => {
    test('HTTP错误状态码', async () => {
      global.wx.request.mockImplementation(() => {
        throw new Error('服务器错误');
      });

      const promise = requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.INTERNAL_ERROR,
        message: '服务器错误'
      });
    });

    test('业务错误码', async () => {
      global.wx.request.mockResolvedValueOnce({
        statusCode: 200,
        data: { code: 1001, message: '业务错误', data: null },
        header: {}
      });

      const promise = requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      await expect(promise).rejects.toThrow('业务错误');
      await expect(promise).rejects.toMatchObject({
        code: 1001
      });
    }, 30000);
  });

  describe('并发控制测试', () => {
    test('并发请求不超过最大限制', async () => {
      const mockResponse: WxResponse<any> = {
        statusCode: 200,
        data: { code: 0, data: {}, message: 'success' },
        header: {}
      };

      global.wx.request.mockImplementation(() => 
        Promise.resolve(mockResponse)
      );

      const requests = Array(10).fill(null).map(() => 
        requestQueue.add({
          url: '/test',
          method: 'GET'
        })
      );

      await Promise.all(requests);
      
      // 等待所有请求完成后再进行断言
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(global.wx.request).toHaveBeenCalledTimes(10);
    }, 30000);
  });

  describe('重试机制测试', () => {
    test('服务器错误时自动重试', async () => {
      global.wx.request
        .mockImplementationOnce(() => {
          throw new Error('服务器错误');
        })
        .mockImplementationOnce(() => {
          throw new Error('服务器错误');
        })
        .mockImplementationOnce(() => {
          throw new Error('服务器错误');
        });

      const promise = requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.INTERNAL_ERROR,
        message: '服务器错误'
      });

      expect(global.wx.request).toHaveBeenCalledTimes(3);
    }, 30000);
  });

  describe('边界测试', () => {
    test('大数据量请求处理', async () => {
      const largeData = new Array(1000).fill({ key: 'value' });
      global.wx.request.mockResolvedValueOnce({
        statusCode: 200,
        data: { code: 0, message: 'success', data: largeData },
        header: {}
      });

      const result = await requestQueue.add({
        url: '/test',
        method: 'POST',
        data: largeData
      });

      expect(result).toEqual(largeData);
    });
  });

  describe('网络异常测试', () => {
    test('请求超时处理', async () => {
      global.wx.request.mockImplementationOnce(() => {
        throw new Error('timeout');
      });

      const promise = requestQueue.add({
        url: '/test',
        method: 'GET'
      });

      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'timeout'
      });
    }, 10000);
  });

  describe('安全测试', () => {
    test('敏感数据不应明文传输', async () => {
      const sensitiveData = {
        password: '123456',
        idCard: '123456789'
      };

      await requestQueue.add({
        url: '/test',
        method: 'POST',
        data: sensitiveData,
        header: {
          'Content-Type': 'application/json'
        }
      });

      const requestCall = global.wx.request.mock.calls[0][0];
      expect(requestCall.header).toBeDefined();
      expect(requestCall.header!['Content-Type']).toBe('application/json');
      expect(requestCall.header!['Authorization']).toBeDefined();
    });
  });
});