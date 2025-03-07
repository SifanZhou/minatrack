import { RawMeasurement, ProcessedMeasurement } from '../../../common/types/measurement';
import * as cloud from 'wx-server-sdk';

cloud.init();
const db = cloud.database();

interface DeviceDataResult {
  success: boolean;
  measurement?: ProcessedMeasurement;
  error?: string;
}

// 添加数据库查询结果接口
interface IQueryResult<T> {
  data: T[];
  errMsg?: string;
}

interface Device {
  deviceId: string;
  userId: string;
  status: string;
}

export const main = async (event: {
  deviceId: string;
  rawData: ArrayBuffer;
}): Promise<DeviceDataResult> => {
  const { deviceId, rawData } = event;
  const { OPENID } = cloud.getWXContext();

  if (!OPENID) {
    return {
      success: false,
      error: '未授权的访问'
    };
  }

  try {
    // 验证设备绑定状态
    const device = await db.collection('devices')
      .where({
        deviceId,
        userId: OPENID,
        status: 'connected'
      })
      .get() as IQueryResult<Device>;

    if (!device.data?.length) {
      return {
        success: false,
        error: '设备未绑定或未连接'
      };
    }

    // 解析原始数据
    let measurement: ProcessedMeasurement;
    try {
      const rawMeasurement = parseDeviceData(rawData);
      measurement = {
        ...rawMeasurement,
        userId: OPENID,
        deviceId,
        measuredAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据解析失败'
      };
    }

    // 保存测量数据
    await db.collection('measurements').add({
      data: measurement
    });

    return {
      success: true,
      measurement
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '数据处理失败'
    };
  }
};

function parseDeviceData(rawData: ArrayBuffer): RawMeasurement {
  if (!rawData || rawData.byteLength === 0) {
    throw new Error('无效的数据格式');
  }

  try {
    const dataView = new DataView(rawData);
    
    // 验证数据长度
    if (dataView.byteLength < 20) {
      throw new Error('数据长度不足');
    }

    // 读取数据
    const weight = dataView.getFloat32(0, true);
    const bodyFat = dataView.getFloat32(4, true);
    const muscleMass = dataView.getFloat32(8, true);
    const bmi = dataView.getFloat32(12, true);
    const healthScore = dataView.getFloat32(16, true);

    // 验证数值范围
    if (!isValidMeasurement(weight, bodyFat, muscleMass, bmi, healthScore)) {
      throw new Error('数据超出有效范围');
    }

    return {
      weight,
      bodyFat,
      muscleMass,
      bmi,
      healthScore,
      measuredAt: new Date()
    };
  } catch (error) {
    throw new Error('数据解析失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
}

function isValidMeasurement(
  weight: number,
  bodyFat: number,
  muscleMass: number,
  bmi: number,
  healthScore: number
): boolean {
  return (
    weight > 0 && weight <= 500 &&
    bodyFat >= 0 && bodyFat <= 100 &&
    muscleMass >= 0 && muscleMass <= 100 &&
    bmi > 0 && bmi <= 100 &&
    healthScore >= 0 && healthScore <= 100
  );
}