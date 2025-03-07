import { main } from '../index';
import { ErrorCode } from '../../../common/types/error';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse, isApiSuccessResponse, isApiErrorResponse } from '../../../common/types/api';

const mockSpecialist = {
  _id: 'specialist_1',
  _openid: 'test_open_id',
  nickName: '张医生',
  avatarUrl: 'https://example.com/avatar.jpg',
  status: 'active',
  createdAt: new Date('2024-01-01')
};

const mockFn = jest.fn().mockImplementation(({ name, data }) => {
  return Promise.resolve({
    result: {
      success: true,
      data: {}
    }
  });
});

jest.mock('wx-server-sdk', () => {
  return {
    init: jest.fn(),
    getWXContext: () => ({
      OPENID: 'test_open_id'
    }),
    database: () => ({
      collection: () => ({
        where: () => ({
          get: jest.fn().mockResolvedValue({ data: [mockSpecialist] }),
        }),
        doc: () => ({
          update: jest.fn().mockResolvedValue({ updated: 1 })
        })
      })
    }),
    callFunction: jest.fn().mockImplementation(({ name, data }) => {
      return Promise.resolve({
        result: {
          success: true,
          data: {}
        }
      });
    })
  };
});

describe('专家管理测试', () => {
  let mockCloudFunction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCloudFunction = require('wx-server-sdk').callFunction;
  });

  describe('登录功能', () => {
    test('微信授权登录', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: {}
        }
      });

      await main({
        action: 'login'
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-login',
        data: expect.any(Object)
      });
    });
  });

  describe('资料管理', () => {
    test('获取资料', async () => {
      const result = await main({
        action: 'profile'
      });

      expect(result.success).toBe(true);
      if (isApiSuccessResponse(result)) {
        expect(result.data).toEqual(mockSpecialist);
      }
    });

    test('更新资料', async () => {
      const profile = {
        nickName: '李医生',
        avatarUrl: 'https://example.com/new-avatar.jpg'
      };

      const result = await main({
        action: 'profile',
        profile
      });

      expect(result.success).toBe(true);
      if (isApiSuccessResponse(result)) {
        expect(result.data).toMatchObject(profile);
      }
    });
  });

  describe('路由分发', () => {
    test('客户列表', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: []
        }
      });

      await main({
        action: 'userlist',
        params: { status: 'active' }
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-userlist',
        data: expect.objectContaining({
          action: 'list'
        })
      });
    });

    test('客户详情', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: {}
        }
      });

      await main({
        action: 'userdetail',
        userId: 'user_1'
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-userlist',
        data: expect.objectContaining({
          action: 'detail'
        })
      });
    });

    test('周报生成', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: {}
        }
      });

      await main({
        action: 'weekly'
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-weekly',
        data: expect.objectContaining({
          specialistId: 'test_open_id'
        })
      });
    });

    test('解绑客户', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: {}
        }
      });

      await main({
        action: 'unbind',
        userId: 'user_1'
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-userlist',
        data: expect.objectContaining({
          action: 'unbind',
          userId: 'user_1'
        })
      });
    });

    test('订阅服务', async () => {
      mockCloudFunction.mockResolvedValueOnce({
        result: {
          success: true,
          data: {}
        }
      });

      await main({
        action: 'subscribe',
        params: {
          months: 1,
          autoRenew: false
        }
      });

      expect(mockCloudFunction).toHaveBeenCalledWith({
        name: 'specialist-subscription',
        data: expect.any(Object)
      });
    });
  });

  describe('错误处理', () => {
    test('无效的操作类型', async () => {
      const result = await main({
        action: 'invalid' as any
      });

      expect(result.success).toBe(false);
      if (isApiErrorResponse(result)) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
    });

    test('云函数调用失败', async () => {
      mockCloudFunction.mockRejectedValueOnce(new Error('云函数调用失败'));

      const result = await main({
        action: 'login'
      });

      expect(result.success).toBe(false);
      if (isApiErrorResponse(result)) {
        expect(result.error.message).toBe('云函数调用失败');
      }
    });
  });
});