import * as cloud from 'wx-server-sdk';
import { ErrorCode, AppError } from '../../common/types/error';

cloud.init();
const db = cloud.database();

interface DeviceData {
  deviceId: string;
  name?: string;
  model?: string;
  firmware?: string;
  rawData?: ArrayBuffer;
}

interface SyncData {
  deviceId: string;
  measurements: Array<{
    weight: number;
    bodyFat?: number;
    measuredAt: Date;
  }>;
}

export const main = async (event: {
  action: 'bind' | 'unbind' | 'sync' | 'list' | 'connect' | 'process';
  data?: DeviceData;
  syncData?: SyncData;
}): Promise<{
  success: boolean;
  data?: any;
  error?: {
    code: ErrorCode;
    message: string;
  };
}> => {
  try {
    const { OPENID = '' } = cloud.getWXContext();
    const { action } = event;

    switch (action) {
      case 'bind':
        return await handleBind(OPENID, event.data || { deviceId: '' });
      case 'unbind':
        return await handleUnbind(OPENID, event.data?.deviceId || '');
      case 'sync':
        return await handleSync(OPENID, event.syncData || { deviceId: '', measurements: [] });
      case 'list':
        return await handleList(OPENID);
      case 'connect':
        return await handleConnect(OPENID, event.data || { deviceId: '' });
      case 'process':
        return await handleProcess(OPENID, event.data || { deviceId: '', rawData: new ArrayBuffer(0) });
      default:
        throw new AppError(ErrorCode.INVALID_PARAMS, '无效的操作类型');
    }
  } catch (error) {
    const appError = AppError.fromError(error);
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message
      }
    };
  }
};

async function handleBind(openId: string, data?: DeviceData) {
  if (!data?.deviceId) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '设备ID不能为空');
  }

  const { data: users = [] } = (await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  // 检查设备是否已被绑定
  const { data: existingDevices = [] } = (await db.collection('devices')
    .where({
      deviceId: data.deviceId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (existingDevices.length) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '设备已被绑定');
  }

  const device = {
    userId: users[0]._id,
    deviceId: data.deviceId,
    name: data.name || '未命名设备',
    model: data.model,
    firmware: data.firmware,
    status: 'active',
    lastSyncAt: null,
    createdAt: new Date()
  };

  const { _id } = (await db.collection('devices').add({
    data: device
  })) as { _id: string };

  return {
    success: true,
    data: { _id, ...device }
  };
}

async function handleUnbind(openId: string, deviceId?: string) {
  if (!deviceId) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '设备ID不能为空');
  }

  const { data: users = [] } = (await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  const { data: devices = [] } = (await db.collection('devices')
    .where({
      deviceId,
      userId: users[0]._id,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!devices.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '设备不存在');
  }

  await db.collection('devices').doc(devices[0]._id).update({
    data: {
      status: 'inactive',
      updatedAt: new Date()
    }
  });

  return {
    success: true,
    data: { deviceId }
  };
}

async function handleSync(openId: string, syncData?: SyncData) {
  if (!syncData?.deviceId || !syncData.measurements?.length) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '同步数据无效');
  }

  const { data: users = [] } = (await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  const { data: devices = [] } = (await db.collection('devices')
    .where({
      deviceId: syncData.deviceId,
      userId: users[0]._id,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!devices.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '设备不存在');
  }

  // 批量创建测量记录
  const measurements = syncData.measurements.map(m => ({
    userId: users[0]._id,
    deviceId: syncData.deviceId,
    weight: m.weight,
    bodyFat: m.bodyFat,
    measuredAt: m.measuredAt,
    createdAt: new Date()
  }));

  await Promise.all([
    // 创建测量记录
    db.collection('measurements').add({
      data: measurements
    }),
    // 更新设备同步时间
    db.collection('devices').doc(devices[0]._id).update({
      data: {
        lastSyncAt: new Date()
      }
    }),
    // 更新用户最后测量时间
    db.collection('users').doc(users[0]._id).update({
      data: {
        lastMeasuredAt: measurements[measurements.length - 1].measuredAt
      }
    })
  ]);

  return {
    success: true,
    data: {
      syncedCount: measurements.length
    }
  };
}

async function handleConnect(openId: string, data?: DeviceData) {
  if (!data?.deviceId) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '设备ID不能为空');
  }

  // 检查设备是否已被绑定
  const { data: devices = [] } = (await db.collection('devices')
    .where({
      deviceId: data.deviceId,
      status: 'connected'
    })
    .get()) as { data: any[] };

  // 如果设备已被连接，返回错误
  if (devices.length > 0) {
    return {
      success: false,
      error: {
        code: ErrorCode.INVALID_PARAMS,
        message: '设备已被连接'
      }
    };
  }

  // 创建新设备连接
  const device = {
    userId: openId,
    deviceId: data.deviceId,
    name: data.name || '未命名设备',
    model: data.model,
    firmware: data.firmware,
    status: 'connected',
    lastSyncAt: null,
    createdAt: new Date()
  };

  const { _id } = (await db.collection('devices').add({
    data: device
  })) as { _id: string };

  return {
    success: true,
    data: {
      _id,
      deviceId: data.deviceId,
      status: 'connected'
    }
  };
}

async function handleProcess(openId: string, data?: DeviceData) {
  if (!data?.deviceId || !data.rawData) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '设备数据无效');
  }

  const { data: users = [] } = (await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  const { data: devices = [] } = (await db.collection('devices')
    .where({
      deviceId: data.deviceId,
      userId: users[0]._id,
      status: 'connected'
    })
    .get()) as { data: any[] };

  if (!devices.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '设备未连接');
  }

  try {
    if (data.rawData.byteLength < 8) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '数据格式无效');
    }

    const dataView = new DataView(data.rawData);
    const weight = dataView.getFloat32(0, true);
    const bodyFat = dataView.getFloat32(4, true);

    // 验证数据范围
    if (weight <= 0 || weight > 500 || bodyFat < 0 || bodyFat > 100) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '数据超出有效范围');
    }

    const measurement = {
      userId: users[0]._id,
      deviceId: data.deviceId,
      weight,
      bodyFat,
      measuredAt: new Date(),
      createdAt: new Date()
    };

    await db.collection('measurements').add({
      data: measurement
    });

    return {
      success: true,
      data: {
        measurement
      }
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.INVALID_PARAMS, '数据处理失败');
  }
}

async function handleList(openId: string) {
  const { data: users = [] } = (await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()) as { data: any[] };

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  const { data: devices = [] } = (await db.collection('devices')
    .where({
      userId: users[0]._id,
      status: 'active'
    })
    .orderBy('createdAt', 'desc')
    .get()) as { data: any[] };

  return {
    success: true,
    data: devices
  };
}