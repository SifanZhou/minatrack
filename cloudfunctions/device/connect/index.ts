// 从类型定义文件导入设备相关接口
interface DeviceInfo {
  deviceId: string;
  userId: string;
  name: string;
  lastConnected: Date;
  status: 'connected' | 'disconnected';
}

interface ConnectResult {
  success: boolean;
  device?: DeviceInfo;
  error?: string;
}

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

export const main = async (event: { deviceId: string; name: string }): Promise<ConnectResult> => {
  const { deviceId, name } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 检查设备是否已被绑定
    const existingDevice = await db.collection('devices')
      .where({ deviceId })
      .get();

    if (existingDevice.data.length > 0) {
      throw new Error('设备已被绑定');
    }

    // 创建新的设备记录
    const deviceInfo: DeviceInfo = {
      deviceId,
      userId: OPENID,
      name,
      lastConnected: new Date(),
      status: 'connected'
    };

    await db.collection('devices').add({
      data: deviceInfo
    });

    return {
      success: true,
      device: deviceInfo
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || '设备连接失败'
    };
  }
};