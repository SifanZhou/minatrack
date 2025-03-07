jest.mock('wx-server-sdk');

const mockDb = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn().mockResolvedValue({ _id: 'test_id' }),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  count: jest.fn(),
  command: {
    lte: jest.fn(),
    gte: jest.fn()
  }
};

const cloud = jest.requireMock('wx-server-sdk');
cloud.init = jest.fn();
cloud.getWXContext = jest.fn().mockReturnValue({
  OPENID: 'test_admin_id'
});
cloud.database = jest.fn().mockReturnValue(mockDb);

import { main } from '../index';
import { ApiResponse } from '../../../common/types/api';
import { isApiSuccessResponse, isApiErrorResponse } from '../../../common/types/api';
import { ErrorCode } from '../../../common/types/error';

describe('系统管理测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.get.mockImplementation(() => ({
      data: [{
        _id: 'test_admin_id',
        status: 'active',
        version: '1.0.0',
        minVersion: '0.9.0'
      }]
    }));
  });

  describe('系统配置测试', () => {
    test('获取系统配置 - 成功', async () => {
      const result = await main({
        action: 'config'
      });
      expect(result.success).toBe(true);
    });

    test('更新系统配置 - 无效版本号', async () => {
      const result = await main({
        action: 'config',
        config: {
          version: 'invalid',
          minVersion: '1.0.0'
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
      }
    });
  });

  describe('系统公告测试', () => {
    test('获取公告列表 - 成功', async () => {
      const result = await main({
        action: 'notice'
      });
      expect(result.success).toBe(true);
    });

    test('发布公告 - 缺少必要字段', async () => {
      const result = await main({
        action: 'notice',
        notice: {
          title: '',
          content: '',
          type: 'info'
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
      }
    });
  });

  describe('系统监控测试', () => {
    test('获取系统状态 - 成功', async () => {
      const result = await main({
        action: 'monitor'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('cpu');
        expect(result.data).toHaveProperty('memory');
        expect(result.data).toHaveProperty('disk');
        expect(result.data).toHaveProperty('timestamp');
      }
    });

    test('获取系统状态 - 无权限', async () => {
      mockDb.get.mockResolvedValueOnce({ data: [] });
      const result = await main({
        action: 'monitor'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED);
      }
    });
  });

  describe('反馈功能测试', () => {
    test('提交反馈 - 成功', async () => {
      mockDb.get.mockResolvedValueOnce({ data: [{ _id: 'test_user_id', status: 'active' }] });
      const result = await main({
        action: 'feedback',
        feedback: {
          content: '测试反馈内容',
          type: 'general'
        }
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('_id');
      }
    });

    test('提交反馈 - 内容为空', async () => {
      const result = await main({
        action: 'feedback',
        feedback: {
          content: '',
          type: 'general'
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
      }
    });

    test('提交反馈 - 用户不存在', async () => {
      mockDb.get.mockResolvedValueOnce({ data: [] });
      const result = await main({
        action: 'feedback',
        feedback: {
          content: '测试反馈内容',
          type: 'general'
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NOT_FOUND);
      }
    });
  });

  test('系统配置 › 应该成功获取系统配置', async () => {
    mockDb.get.mockResolvedValueOnce({
      data: [{
        _id: 'test_config_id',
        version: '1.0.0',
        minVersion: '0.9.0',
        createdAt: new Date()
      }]
    });

    const result = await main({
      action: 'config'
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (isApiSuccessResponse(result)) {
      expect(result.data).toHaveProperty('version');
      expect(result.data).toHaveProperty('minVersion');
    }
  });

  test('系统公告 › 应该成功获取系统公告', async () => {
    mockDb.get.mockResolvedValueOnce({
      data: [{
        _id: 'test_notice_id',
        title: '测试公告',
        content: '测试内容',
        type: 'info',
        createdAt: new Date()
      }]
    });

    const result = await main({
      action: 'notice'
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (isApiSuccessResponse(result)) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });

  test('系统统计 › 应该成功获取系统统计数据', async () => {
    mockDb.count.mockResolvedValueOnce({ total: 100 })
      .mockResolvedValueOnce({ total: 20 })
      .mockResolvedValueOnce({ total: 500 });

    const result = await main({
      action: 'stats'
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (isApiSuccessResponse(result)) {
      expect(result.data).toHaveProperty('users');
      expect(result.data).toHaveProperty('specialists');
      expect(result.data).toHaveProperty('measurements');
    }
  });

  test('系统监控 › 应该成功获取系统状态', async () => {
    mockDb.add.mockResolvedValueOnce({ _id: 'test_status_id' });
    
    const result = await main({
      action: 'monitor'
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (isApiSuccessResponse(result)) {
      expect(result.data).toMatchObject({
        cpu: expect.any(Number),
        memory: expect.any(Number),
        disk: expect.any(Number),
        timestamp: expect.any(String)
      });
      expect(result.data.cpu).toBeGreaterThanOrEqual(0);
      expect(result.data.cpu).toBeLessThanOrEqual(100);
      expect(result.data.memory).toBeGreaterThanOrEqual(0);
      expect(result.data.memory).toBeLessThanOrEqual(100);
      expect(result.data.disk).toBeGreaterThanOrEqual(0);
      expect(result.data.disk).toBeLessThanOrEqual(100);
    }
  });

  test('错误处理 › 应该处理无效的操作类型', async () => {
    const result = await main({
      action: 'invalid' as any
    }) as ApiResponse;

    expect(result.success).toBe(false);
    if (!result.success) {
      if (!result.success) {
        if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
      }
      expect(result.error.message).toBe('无效的操作类型');
    }
  });

  test('权限验证 › 非管理员不能访问系统配置', async () => {
    mockDb.get.mockResolvedValueOnce({ data: [] });

    const result = await main({
      action: 'config'
    }) as ApiResponse;

    expect(result.success).toBe(false);
    if (!result.success) {
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED);
      }
    }
  });
});