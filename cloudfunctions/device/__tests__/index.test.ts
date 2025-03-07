const mockAdd = jest.fn().mockResolvedValue({ _id: 'new_id' });
const mockUpdate = jest.fn().mockResolvedValue({ updated: 1 });
const mockGet = jest.fn().mockResolvedValue({ data: [] });

const mockDb = {
  collection: () => ({
    where: () => ({
      get: mockGet,
      orderBy: () => ({
        get: mockGet,
        desc: () => ({
          get: mockGet
        })
      })
    }),
    doc: () => ({
      update: mockUpdate
    }),
    add: mockAdd,
    orderBy: () => ({
      desc: () => ({
        get: mockGet
      })
    })
  })
};

jest.mock('wx-server-sdk', () => ({
  init: jest.fn(),
  getWXContext: () => ({
    OPENID: 'test_open_id'
  }),
  database: () => mockDb
}));

import { main } from '../index';
import { ErrorCode } from '../../../common/types/error';

const mockUser = {
  _id: 'user_1',
  _openid: 'test_open_id',
  status: 'active'
};

const mockDevice = {
  _id: 'device_1',
  userId: 'user_1',
  deviceId: 'test_device_id',
  name: '测试设备',
  model: 'Scale-001',
  status: 'active',
  createdAt: new Date('2024-01-01')
};

const mockMeasurements = [
  {
    weight: 65.0,
    bodyFat: 20,
    measuredAt: new Date('2024-01-01')
  },
  {
    weight: 64.5,
    bodyFat: 19,
    measuredAt: new Date('2024-01-02')
  }
];

describe('设备管理测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockGet.mockResolvedValue({ data: [mockUser] });
  });

  describe('设备绑定', () => {
    test('成功绑定设备', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [] });

      const deviceData = {
        deviceId: 'new_device_id',
        name: '新设备',
        model: 'Scale-002'
      };

      const result = await main({
        action: 'bind',
        data: deviceData
      });

      expect(result.success).toBe(true);
      expect(result.data.deviceId).toBe(deviceData.deviceId);
      expect(mockAdd).toHaveBeenCalled();
    });

    test('设备已被绑定', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [mockDevice] });

      const result = await main({
        action: 'bind',
        data: {
          deviceId: mockDevice.deviceId
        }
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
    });
  });

  describe('设备解绑', () => {
    test('成功解绑设备', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [mockDevice] });

      const result = await main({
        action: 'unbind',
        data: {
          deviceId: mockDevice.deviceId
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.deviceId).toBe(mockDevice.deviceId);
      expect(mockUpdate).toHaveBeenCalled();
    });

    test('设备不存在', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [] });

      const result = await main({
        action: 'unbind',
        data: {
          deviceId: 'nonexistent_device'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ErrorCode.NOT_FOUND);
    });
  });

  describe('数据同步', () => {
    beforeEach(() => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [mockDevice] });
    });

    test('成功同步数据', async () => {
      const result = await main({
        action: 'sync',
        syncData: {
          deviceId: mockDevice.deviceId,
          measurements: mockMeasurements
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.syncedCount).toBe(mockMeasurements.length);
      expect(mockAdd).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });

    test('同步数据验证', async () => {
      const result = await main({
        action: 'sync',
        syncData: {
          deviceId: mockDevice.deviceId,
          measurements: []
        }
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
    });
  });

  describe('设备列表', () => {
    test('获取设备列表', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [mockDevice] });

      const result = await main({
        action: 'list'
      });

      expect(result.success).toBe(true);
      expect(result.data).toContainEqual(mockDevice);
    });

    test('用户无设备', async () => {
      mockGet
        .mockResolvedValueOnce({ data: [mockUser] })
        .mockResolvedValueOnce({ data: [] });

      const result = await main({
        action: 'list'
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('设备管理测试', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('设备绑定', () => {
      test('成功绑定设备', async () => {
        mockGet
          .mockResolvedValueOnce({ data: [mockUser] })
          .mockResolvedValueOnce({ data: [] });

        const deviceData = {
          deviceId: 'new_device_id',
          name: '新设备',
          model: 'Scale-002'
        };

        const result = await main({
          action: 'bind',
          data: deviceData
        });

        expect(result.success).toBe(true);
        expect(result.data.deviceId).toBe(deviceData.deviceId);
        expect(mockAdd).toHaveBeenCalled();
      });

      test('设备已被绑定', async () => {
        mockGet
          .mockResolvedValueOnce({ data: [mockUser] })
          .mockResolvedValueOnce({ data: [mockDevice] });

        const result = await main({
          action: 'bind',
          data: {
            deviceId: mockDevice.deviceId
          }
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      });
    });

    describe('设备解绑', () => {
      test('成功解绑设备', async () => {
        mockGet
          .mockResolvedValueOnce({ data: [mockUser] })
          .mockResolvedValueOnce({ data: [mockDevice] });

        const result = await main({
          action: 'unbind',
          data: {
            deviceId: mockDevice.deviceId
          }
        });

        expect(result.success).toBe(true);
        expect(result.data.deviceId).toBe(mockDevice.deviceId);
        expect(mockUpdate).toHaveBeenCalled();
      });

      test('设备不存在', async () => {
        mockGet
          .mockResolvedValueOnce({ data: [mockUser] })
          .mockResolvedValueOnce({ data: [] });

        const result = await main({
          action: 'unbind',
          data: {
            deviceId: 'nonexistent_device'
          }
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.NOT_FOUND);
      });
    });

    describe('设备管理测试', () => {
      test('成功连接新设备', async () => {
        mockGet.mockResolvedValueOnce({ data: [] });
    
        const result = await main({
          action: 'connect',
          data: {
            deviceId: 'test_ble_device',
            name: '测试体脂秤'
          }
        });
    
        expect(result.success).toBe(true);
        expect(result.data.deviceId).toBe('test_ble_device');
        expect(result.data.status).toBe('connected');
        expect(mockAdd).toHaveBeenCalled();
      });
    
      test('设备已被连接', async () => {
        mockGet.mockResolvedValueOnce({ data: [mockDevice] });
    
        const result = await main({
          action: 'connect',
          data: {
            deviceId: mockDevice.deviceId,
            name: '测试设备'
          }
        });
    
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      });
    });
    
    describe('数据处理', () => {
      const createMockBuffer = () => {
        const buffer = new ArrayBuffer(20);
        const view = new DataView(buffer);
        view.setFloat32(0, 65.5, true);  // 体重
        view.setFloat32(4, 20.5, true);  // 体脂率
        view.setFloat32(8, 45.2, true);  // 肌肉量
        view.setFloat32(12, 22.1, true); // BMI
        view.setFloat32(16, 85.0, true); // 健康得分
        return buffer;
      };
    
      beforeEach(() => {
        mockGet
          .mockResolvedValueOnce({ data: [mockUser] })
          .mockResolvedValueOnce({ data: [mockDevice] });
      });
    
      test('成功解析并保存数据', async () => {
        const result = await main({
          action: 'process',
          data: {
            deviceId: mockDevice.deviceId,
            rawData: createMockBuffer()
          }
        });
    
        expect(result.success).toBe(true);
        expect(result.data.measurement).toHaveProperty('weight', 65.5);
        expect(result.data.measurement).toHaveProperty('bodyFat', 20.5);
        expect(mockAdd).toHaveBeenCalled();
      });
    
      test('无效的数据格式', async () => {
        const result = await main({
          action: 'process',
          data: {
            deviceId: mockDevice.deviceId,
            rawData: new ArrayBuffer(0)
          }
        });
    
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      });
    
      test('数据超出范围', async () => {
        const buffer = new ArrayBuffer(20);
        const view = new DataView(buffer);
        view.setFloat32(0, 1000, true); // 无效体重
    
        const result = await main({
          action: 'process',
          data: {
            deviceId: mockDevice.deviceId,
            rawData: buffer
          }
        });
    
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      });
    });
  });
});