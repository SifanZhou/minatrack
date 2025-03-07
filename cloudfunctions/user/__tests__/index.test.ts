import { jest } from '@jest/globals';
import { ErrorCode } from '../../../common/types/error';

// Mock wx-server-sdk before any imports
type MockFn = jest.Mock;

const mockAdd = jest.fn<(params: { data: any }) => Promise<{ _id: string }>>().mockResolvedValue({ _id: 'new_id' });
const mockUpdate = jest.fn<() => Promise<{ updated: number }>>().mockResolvedValue({ updated: 1 });
const mockRemove = jest.fn<() => Promise<{ removed: number }>>().mockResolvedValue({ removed: 1 });
const mockGet = jest.fn<() => Promise<{ data: any[] }>>().mockResolvedValue({ data: [] });
const mockDocGet = jest.fn<() => Promise<{ data: any }>>().mockResolvedValue({ data: {} });
const mockTransaction = {
  collection: jest.fn<() => any>().mockReturnThis(),
  where: jest.fn<() => any>().mockReturnThis(),
  get: jest.fn<() => Promise<{ data: any[] }>>(),
  add: jest.fn<(params: { data: any }) => Promise<{ _id: string }>>().mockResolvedValue({ _id: 'new_binding_id' }),
  commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  rollback: jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
};

const mockDb = {
  collection: () => ({
    where: () => ({
      get: mockGet,
      orderBy: () => ({
        get: mockGet
      })
    }),
    doc: () => ({
      get: mockDocGet,
      update: mockUpdate,
      remove: mockRemove
    }),
    add: mockAdd
  }),
  startTransaction: jest.fn<() => Promise<typeof mockTransaction>>().mockResolvedValue(mockTransaction)
};

const mockSpecialist = {
  _id: 'specialist_1',
  name: 'Test Specialist',
  status: 'active'
};

jest.mock('wx-server-sdk', () => ({
  init: jest.fn(),
  getWXContext: () => ({
    OPENID: 'test_open_id'
  }),
  database: () => mockDb,
  callFunction: async ({ name, data }: { name: string; data: any }) => {
    if (name === 'user-bind') {
      if (data.inviteCode === 'TEST123') {
        const bindingData = {
          userId: 'test_open_id',
          specialistId: 'specialist_1',
          status: 'pending',
          createdAt: expect.any(Date)
        };
        await mockTransaction.get
          .mockResolvedValueOnce({ data: [mockSpecialist] })
          .mockResolvedValueOnce({ data: [] });
        await mockTransaction.add({ data: bindingData });
        await mockTransaction.commit();
        return {
          result: {
            success: true,
            data: {
              _id: 'new_binding_id',
              ...bindingData
            }
          }
        };
      } else {
        await mockTransaction.get.mockResolvedValueOnce({ data: [] });
        await mockTransaction.rollback();
        return {
          result: {
            success: false,
            error: {
              code: ErrorCode.INVALID_PARAMS,
              message: '无效的邀请码'
            }
          }
        };
      }
    } else if (name === 'user-measurement') {
      if (data.measurementId) {
        await mockRemove();
        return {
          result: {
            success: true,
            data: { _id: data.measurementId }
          }
        };
      } else if (data.data) {
        if (data.data.weight === 10) {
          return {
            result: {
              success: false,
              error: {
                code: ErrorCode.INVALID_PARAMS,
                message: '体重数据无效'
              }
            }
          };
        }
        const measurementData = {
          _id: 'new_measurement_id',
          userId: 'test_open_id',
          ...data.data,
          measuredAt: expect.any(Date)
        };
        await mockAdd({ data: measurementData });
        return {
          result: {
            success: true,
            data: measurementData
          }
        };
      }
    }
    return { result: { success: true } };
  }
}));

import { main } from '../index';

describe('用户模块测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('登录功能', () => {
    test('新用户首次登录', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const result = await main({
        action: 'login'
      });
      expect(result.success).toBe(true);
      expect(mockAdd).toHaveBeenCalled();
    });

    test('已存在用户登录', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{
          _id: 'existing_user',
          _openid: 'test_open_id',
          status: 'active'
        }]
      });
      const result = await main({
        action: 'login'
      });
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('个人资料', () => {
    test('获取个人资料', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{
          _id: 'user_1',
          nickname: 'Test User',
          height: 175
        }]
      });
      const result = await main({
        action: 'profile'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('nickname');
      }
    });

    test('更新个人资料 - 有效数据', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{
          _id: 'user_1',
          status: 'active'
        }]
      });
      const result = await main({
        action: 'profile',
        profile: {
          nickname: 'New Name',
          height: 180
        }
      });
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });

    test('更新个人资料 - 无效身高', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{
          _id: 'user_1',
          status: 'active'
        }]
      });
      const result = await main({
        action: 'profile',
        profile: {
          height: 90
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
    });
  });

  describe('测量记录', () => {
    test('获取测量记录列表', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{
          _id: 'user_1',
          status: 'active'
        }]
      });
      const result = await main({
        action: 'measurements',
        query: {
          startDate: new Date(),
          endDate: new Date()
        }
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    test('获取测量记录 - 用户不存在', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const result = await main({
        action: 'measurements'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NOT_FOUND);
      }
    });
  });

  describe('错误处理', () => {
    test('无效的操作类型', async () => {
      const result = await main({
        action: 'invalid' as any
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      }
      }
    });

    test('未授权访问', async () => {
      jest.spyOn(require('wx-server-sdk'), 'getWXContext').mockReturnValueOnce({});
      const result = await main({
        action: 'login'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED);
      }
    });
  });
});