// 先导入外部依赖
import { jest } from '@jest/globals';

// 再导入内部类型定义
import { ApiResponse } from '../../../../common/types/api';
import { ErrorCode } from '../../../../common/types/error';
import { IAddResult, IQueryResult } from '../../../../common/types/wx-server-sdk';

// 定义测试用的接口
interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  specialistId?: string;
  deviceId?: string;
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  status: 'success' | 'failed';
}

interface QueryResult {
  data: AuditLog[];
}

// 初始化mock对象
const mockAdd = jest.fn<() => Promise<IAddResult>>().mockResolvedValue({ _id: 'test_log_id' });
const mockWhere = jest.fn();
const mockGet = jest.fn<() => Promise<IQueryResult>>().mockResolvedValue({
  data: [
    {
      _id: 'test_log_id_1',
      action: 'login',
      userId: 'test-user',
      specialistId: 'test-specialist',
      details: {
        ip: '127.0.0.1',
        device: 'iPhone',
        location: 'Shanghai',
        browser: 'Safari',
        os: 'iOS 15.0'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      status: 'success'
    },
    {
      _id: 'test_log_id_2',
      action: 'measurement',
      userId: 'test-user',
      deviceId: 'test-device',
      details: {
        ip: '192.168.1.1',
        device: 'Scale',
        weight: 65.5,
        bodyFat: 20.1
      },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      status: 'success'
    }
  ]
});

mockWhere.mockReturnValue({
  get: mockGet,
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis()
});

const mockCollection = jest.fn().mockReturnValue({
  where: mockWhere,
  add: mockAdd
});

const mockDb = {
  collection: mockCollection,
  command: {
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis()
  }
};

const mockWxServerSdk = {
  init: jest.fn(),
  database: () => mockDb,
  getWXContext: () => ({
    OPENID: 'test_user_id',
    CLIENTIP: '127.0.0.1'
  })
};

// 设置mock
jest.mock('wx-server-sdk', () => mockWxServerSdk);

// 导入测试目标
import { createLog, getLogs } from '../index';

describe('审计日志测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('创建有效的审计日志', async () => {
    const result = await createLog({
      action: 'login',
      userId: 'test-user',
      details: {
        ip: '127.0.0.1',
        device: 'iPhone',
        location: 'Shanghai'
      }
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('logId');
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'login',
          userId: 'test-user'
        })
      });
    }
  });

  // 修复创建测量记录审计日志的测试用例中的语法错误
  test('创建测量记录审计日志', async () => {
    const result = await createLog({
      action: 'measurement',
      userId: 'test-user',
      details: {
        deviceId: 'test-device',
        weight: 65.5,
        bodyFat: 20.1
      }
    }) as ApiResponse;
  
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('logId');
      expect(mockAdd).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'measurement',
          userId: 'test-user'
        })
      });
    }
  });

  test('查询审计日志 - 按时间范围', async () => {
    const result = await getLogs({
      userId: 'test-user',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      page: 1,
      pageSize: 20
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(2);
    }
  });

  // 修复查询审计日志的参数
  test('查询审计日志 - 按操作类型', async () => {
    const result = await getLogs({
      userId: 'test-user',
      action: 'login', // 将 type 改为 action
      page: 1,
      pageSize: 20
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'login' })
      );
    }
  });

  test('创建无效的审计日志 - 缺少必要字段', async () => {
    const result = await createLog({
      action: 'login',
      userId: '',
      details: {}
    }) as ApiResponse;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      expect(mockAdd).not.toHaveBeenCalled();
    }
  });

  test('查询审计日志 - 有效参数', async () => {
    const result = await getLogs({
      userId: 'test-user',
      page: 1,
      pageSize: 20
    }) as ApiResponse;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(mockWhere).toHaveBeenCalledTimes(1);
    }
  });

  test('查询审计日志 - 无效的用户ID', async () => {
    const result = await getLogs({
      userId: '',
      page: 1,
      pageSize: 20
    }) as ApiResponse;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      expect(mockWhere).not.toHaveBeenCalled();
    }
  });

  test('查询审计日志 - 无效的分页参数', async () => {
    const result = await getLogs({
      userId: 'test-user',
      page: 0,
      pageSize: 0
    }) as ApiResponse;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.INVALID_PARAMS);
      expect(mockWhere).not.toHaveBeenCalled();
    }
  });
});